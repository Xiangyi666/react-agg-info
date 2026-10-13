import type { Resume, SaveStatus } from './types'
import { saveResume } from './api'
import { clone, debounce, deepEqual, isPlainObject } from './utils'

/**
 * 自动保存运行时，移植自 reactive-resume builder/draft.ts 的保存部分：
 * - 编辑后 500ms 防抖批量保存（scheduleSave）
 * - 排队即把未保存数据写入 localStorage，保存成功后清除 —— 刷新/关页不丢改动
 * - 保存失败区分离线（offline）与错误（error），联网后自动补发，也可手动重试
 * - 保存期间用户继续编辑时，保存完成后自动带着最新草稿再存一轮
 *
 * 运行时是模块级的（非响应式），通过 attachSaveHooks 注入 Redux 侧的
 * 读状态/改状态回调，避免与 slice 形成循环依赖。
 */

const SAVE_DEBOUNCE_MS = 500
const UNSAVED_STORAGE_PREFIX = 'react-info-agg:resume:unsaved:'

/** Redux 侧注入的回调：读当前草稿、更新保存状态、合并服务端元数据。 */
export interface SaveHooks {
  getResume: () => Resume | null
  onStatusChange: (status: SaveStatus) => void
  onMetadataMerged: (resume: Resume) => void
}

interface Runtime {
  hooks?: SaveHooks
  /** 防抖窗口内最新一份草稿。 */
  queuedResume?: Resume
  /** 已出队、正在保存或等待保存的草稿。 */
  pendingResume?: Resume
  isSaving: boolean
  saveFailed: boolean
  hasPendingLocalChanges: boolean
  schedule: ReturnType<typeof debounce>
  beforeUnloadHandler?: () => void
  onlineHandler?: () => void
}

const runtimes = new Map<string, Runtime>()

function getRuntime(id: string): Runtime {
  const existing = runtimes.get(id)
  if (existing) return existing

  const runtime: Runtime = {
    isSaving: false,
    saveFailed: false,
    hasPendingLocalChanges: false,
    schedule: undefined as unknown as ReturnType<typeof debounce>,
  }
  runtime.schedule = debounce(() => {
    if (runtime.queuedResume) {
      const resume = runtime.queuedResume
      runtime.queuedResume = undefined
      queueSave(resume)
    }
  }, SAVE_DEBOUNCE_MS)
  runtimes.set(id, runtime)
  return runtime
}

function isBrowserOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

// --- localStorage 未保存数据 ---

function storeUnsavedData(resume: Resume) {
  try {
    window.localStorage.setItem(`${UNSAVED_STORAGE_PREFIX}${resume.id}`, JSON.stringify(resume.data))
  } catch {
    // 存储满或被禁用时忽略，内存里的副本仍会重试
  }
}

export function clearUnsavedData(id: string) {
  try {
    window.localStorage.removeItem(`${UNSAVED_STORAGE_PREFIX}${id}`)
  } catch {
    // 无需清理
  }
}

/** 读取上次没保存成功的数据（离线、刷新、关页），交给 initialize 恢复。 */
export function readUnsavedData(id: string): Resume['data'] | undefined {
  try {
    const raw = window.localStorage.getItem(`${UNSAVED_STORAGE_PREFIX}${id}`)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isPlainObject(parsed) ? (parsed as unknown as Resume['data']) : undefined
  } catch {
    return undefined
  }
}

// --- 保存队列 ---

/** 立即排队保存（跳过防抖）：恢复未保存数据、重试、离开页面前都走这里。 */
export function queueSave(resume: Resume) {
  const runtime = getRuntime(resume.id)
  runtime.pendingResume = clone(resume)
  runtime.hasPendingLocalChanges = true
  runtime.saveFailed = false
  // 排队即落盘：即使进程突然终止，下次进入也能恢复
  storeUnsavedData(resume)
  void flushSave(resume.id)
}

/** 编辑后调用：500ms 内的连续编辑合并成一次保存。 */
export function scheduleSave(resume: Resume) {
  const runtime = getRuntime(resume.id)
  runtime.queuedResume = resume
  runtime.schedule()
}

async function flushSave(id: string) {
  const runtime = getRuntime(id)
  const hooks = runtime.hooks
  if (!hooks || runtime.isSaving || !runtime.pendingResume) return

  const submitted = runtime.pendingResume
  const submittedData = submitted.data
  runtime.pendingResume = undefined
  runtime.isSaving = true

  try {
    const updated = await saveResume(id, submittedData)

    const current = hooks.getResume()
    // 本地草稿与刚提交的一致：只需合并服务端元数据（updatedAt 等）
    const currentStillMatchesSubmission = current?.id === id && deepEqual(current.data, submittedData)

    hooks.onMetadataMerged(updated)

    if (currentStillMatchesSubmission && !runtime.pendingResume) {
      runtime.hasPendingLocalChanges = false
      hooks.onStatusChange('saved')
      clearUnsavedData(id)
    } else {
      runtime.hasPendingLocalChanges = true
      // 保存期间用户又改了：带着最新草稿再存一轮
      if (!runtime.pendingResume && current?.id === id) {
        runtime.pendingResume = clone(current)
      }
    }

    runtime.saveFailed = false
  } catch {
    // 提交被保留，等待重试；改动已在 localStorage 里
    runtime.pendingResume ??= submitted
    runtime.hasPendingLocalChanges = true
    runtime.saveFailed = true
    storeUnsavedData(hooks.getResume() ?? submitted)
    hooks.onStatusChange(isBrowserOffline() ? 'offline' : 'error')
  } finally {
    runtime.isSaving = false
    if (runtime.pendingResume && !runtime.saveFailed) void flushSave(id)
  }
}

/** 从 "未保存 · 重试" 手动重发。 */
export function retrySave(resume: Resume) {
  queueSave(resume)
}

// --- 生命周期 ---

/**
 * 进入编辑器时绑定：注入 Redux 回调，并挂 window 监听
 * （beforeunload 兜底保存、online 自动补发离线期间改动）。
 */
export function setupSaveRuntime(id: string, hooks: SaveHooks) {
  const runtime = getRuntime(id)
  runtime.hooks = hooks

  if (!runtime.beforeUnloadHandler) {
    runtime.beforeUnloadHandler = () => runtime.schedule.flush()
    window.addEventListener('beforeunload', runtime.beforeUnloadHandler)
  }

  if (!runtime.onlineHandler) {
    runtime.onlineHandler = () => {
      const current = runtime.hooks?.getResume()
      if (current?.id === id && runtime.hasPendingLocalChanges) queueSave(current)
    }
    window.addEventListener('online', runtime.onlineHandler)
  }
}

/** 离开编辑器时清理监听；已出队的保存继续在后台完成。 */
export function cleanupSaveRuntime(id: string) {
  const runtime = runtimes.get(id)
  if (!runtime) return

  // 防抖窗口里的改动立即排队，不让它们丢在计时器里
  runtime.schedule.flush()
  runtime.schedule.cancel()

  if (runtime.beforeUnloadHandler) {
    window.removeEventListener('beforeunload', runtime.beforeUnloadHandler)
    runtime.beforeUnloadHandler = undefined
  }
  if (runtime.onlineHandler) {
    window.removeEventListener('online', runtime.onlineHandler)
    runtime.onlineHandler = undefined
  }

  runtime.hooks = undefined
  runtimes.delete(id)
}
