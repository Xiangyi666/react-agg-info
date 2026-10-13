import { createSlice, original } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Resume, ResumeData, SaveStatus, UpdateResumeDataOptions } from './types'
import { deepEqual } from './utils'

/**
 * 简历编辑器的 Redux slice，对应 reactive-resume 的 useResumeStore（zustand + immer）。
 * Redux Toolkit 内置 immer，草稿函数直接改 state。
 *
 * 两个关键点：
 * - 撤销栈的快照必须用 original() 取编辑前的原始引用，直接 push 草稿会被
 *   fn 的修改污染（immer 经典坑）；
 * - reducer 里不调用任何运行时/副作用，保存调度由 middleware 用 finalize 后的
 *   state 完成（immer 草稿在 reducer 结束后会被 revoke，异步访问会崩溃）。
 */

/** 撤销合并的记账（非响应式，只决定下一次编辑是否开启新步骤）。 */
interface CoalesceBookkeeping {
  lastEditAt: number
  lastKey: string | undefined
  canCoalesce: boolean
}

const coalesce: CoalesceBookkeeping = { lastEditAt: 0, lastKey: undefined, canCoalesce: false }

function resetCoalesce() {
  coalesce.lastEditAt = 0
  coalesce.lastKey = undefined
  coalesce.canCoalesce = false
}

// 无 key 的编辑（拖拽等）在 500ms 窗口内合并；同 key 的编辑（同一字段打字）在 1s 内合并
const HISTORY_COALESCE_MS = 500
const FIELD_COALESCE_MS = 1000
// 栈有上限；条目是结构共享引用，200 步也很便宜
const MAX_HISTORY_ENTRIES = 200

function shouldCoalesceEdit(
  previous: CoalesceBookkeeping,
  next: { at: number; key: string | undefined; newStep: boolean },
): boolean {
  if (next.newStep || !previous.canCoalesce || previous.lastKey !== next.key) return false
  const window = next.key === undefined ? HISTORY_COALESCE_MS : FIELD_COALESCE_MS
  return next.at - previous.lastEditAt < window
}

export interface ResumeState {
  resume: Resume | null
  resumeId: string | undefined
  isReady: boolean
  saveStatus: SaveStatus
  /** ResumeData 引用的撤销/重做栈。 */
  undoStack: ResumeData[]
  redoStack: ResumeData[]
  canUndo: boolean
  canRedo: boolean
}

const initialState: ResumeState = {
  resume: null,
  resumeId: undefined,
  isReady: false,
  saveStatus: 'idle',
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
}

/** updateResumeData 的 payload：草稿函数 + 撤销合并选项。 */
export interface UpdateResumeDataPayload extends UpdateResumeDataOptions {
  fn: (draft: ResumeData) => void
}

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    /**
     * 进入编辑器时初始化。未保存改动的恢复在页面层完成（页面算好 restored resume
     * 后直接传进来），slice 保持纯函数。
     */
    initialize(state, action: PayloadAction<Resume | null>) {
      const resume = action.payload
      resetCoalesce()

      state.resume = resume
      state.resumeId = resume?.id
      state.isReady = resume !== null
      state.saveStatus = 'idle'
      state.undoStack = []
      state.redoStack = []
      state.canUndo = false
      state.canRedo = false
    },

    /** 离开编辑器时清空。 */
    reset(state) {
      resetCoalesce()
      Object.assign(state, initialState)
    },

    /**
     * 核心编辑入口：在 immer 草稿上改 data，管理撤销栈。
     * 打字（带 coalesceKey）一整句合并为一次撤销；结构性操作传 newStep。
     * 触发的自动保存由 middleware 在 reducer 外调度。
     */
    updateResumeData(state, action: PayloadAction<UpdateResumeDataPayload>) {
      const current = state.resume
      if (!current) return

      const { fn, coalesceKey, newStep = false, sameStep = false } = action.payload
      const now = Date.now()
      const canMerge =
        (sameStep && coalesceKey !== undefined && coalesce.lastKey === coalesceKey) ||
        shouldCoalesceEdit(coalesce, { at: now, key: coalesceKey, newStep })
      // original() 拿到编辑前的原始引用；直接 push current.data 会被 fn 污染
      const snapshotBefore = canMerge ? undefined : original(current.data)

      coalesce.lastEditAt = now
      coalesce.lastKey = coalesceKey
      coalesce.canCoalesce = !newStep

      if (snapshotBefore) {
        state.undoStack.push(snapshotBefore)
        if (state.undoStack.length > MAX_HISTORY_ENTRIES) state.undoStack.shift()
        // 新编辑让 redo 分支失效
        state.redoStack = []
      }

      fn(current.data)
      state.saveStatus = 'saving'
      state.canUndo = state.undoStack.length > 0
      state.canRedo = state.redoStack.length > 0
    },

    /** 撤销/重做共用的历史步骤移动：弹出快照、当前数据进对侧栈。 */
    applyHistoryStep(state, action: PayloadAction<'undo' | 'redo'>) {
      const current = state.resume
      if (!current) return

      const direction = action.payload
      const from = direction === 'undo' ? state.undoStack : state.redoStack
      const to = direction === 'undo' ? state.redoStack : state.undoStack
      const snapshot = from.pop()
      if (snapshot === undefined) return

      // 撤销/重做后的下一次编辑必须开启全新步骤
      resetCoalesce()
      to.push(original(current.data) ?? current.data)
      if (to.length > MAX_HISTORY_ENTRIES) to.shift()

      current.data = snapshot
      state.saveStatus = 'saving'
      state.canUndo = state.undoStack.length > 0
      state.canRedo = state.redoStack.length > 0
    },

    /** 更新保存状态（保存运行时回写）。 */
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.saveStatus = action.payload
    },

    /**
     * 只合并服务端拥有的元数据（name/slug/updatedAt 等），不动 data：
     * 保存回显走这里，避免整份替换把所有 data 引用换掉导致整棵树重挂载。
     */
    mergeResumeMetadata(state, action: PayloadAction<Resume>) {
      const incoming = action.payload
      if (!state.resume || state.resume.id !== incoming.id) return

      state.resume.name = incoming.name
      state.resume.slug = incoming.slug
      state.resume.tags = incoming.tags
      state.resume.isLocked = incoming.isLocked
      state.resume.updatedAt = incoming.updatedAt
      state.resume.hasPassword = incoming.hasPassword
      state.resume.isPublic = incoming.isPublic
      state.resume.showDownloadButtons = incoming.showDownloadButtons
    },

    /** 从服务端整体替换（外部修改）。数据不同则本地撤销历史失效。 */
    replaceResumeFromServer(state, action: PayloadAction<Resume>) {
      const incoming = action.payload
      const current = state.resume
      const isRebase = !current || !deepEqual(current.data, incoming.data)
      if (isRebase) resetCoalesce()

      state.resume = incoming
      state.resumeId = incoming.id
      state.isReady = true
      if (isRebase) {
        state.undoStack = []
        state.redoStack = []
        state.canUndo = false
        state.canRedo = false
      }
    },
  },
})

export const {
  initialize,
  reset,
  updateResumeData,
  applyHistoryStep,
  setSaveStatus,
  mergeResumeMetadata,
  replaceResumeFromServer,
} = resumeSlice.actions

export default resumeSlice.reducer
