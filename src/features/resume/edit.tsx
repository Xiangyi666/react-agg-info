import { useEffect, useState } from 'react'
import { fetchResume } from './api'
import { clearUnsavedData, queueSave, readUnsavedData } from './save-runtime'
import { applyHistoryStep, initialize, reset } from './resumeSlice'
import { useCanRedo, useCanUndo, useCurrentResume, useSaveRuntime } from './hooks'
import { deepEqual } from './utils'
import { Artboard } from './components/artboard'
import { SaveStatus, WritePanel } from './components/editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { Splitter } from '@mantine/core'
import { Redo2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 简历编辑器外壳，对应 reactive-resume 的 builder/$resumeId 路由 + EditorShell：
 * 装载服务端数据 → 初始化 store（含未保存改动恢复）→ 左编辑面板 + 右预览画板，
 * 顶栏带保存状态与撤销/重做。页面路由在 src/pages/resume/[resumeId].tsx。
 */

interface ResumeEditorProps {
  /** 路由参数，非必需：渲染只依赖登录态的 userId。 */
  resumeId?: string
  /** 可选覆盖，缺省从 auth 分片取当前登录用户。 */
  userId?: string
}

type LoadState = 'loading' | 'error' | 'ready'

export function ResumeEditor({ resumeId, userId: userIdProp }: ResumeEditorProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const resume = useCurrentResume()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const userId = userIdProp ?? user?.id
  // 保存运行时（防抖、离线暂存、重试）与本页面同生命周期
  if (resumeId) useSaveRuntime(resumeId)

  // 装载：按 userId 取服务端渲染数据（resumeId 非必需），叠加本机未保存的改动后初始化 store
  useEffect(() => {
    if (!userId) {
      setLoadState('error')
      return
    }

    let cancelled = false
    setLoadState('loading')
    // 未保存数据的存取 key：有 resumeId 用 resumeId（与保存运行时一致），否则退回 userId
    const storageKey = resumeId ?? userId

    void (async () => {
      try {
        const fetched = await fetchResume(userId)
        if (cancelled) return

        // 上次离线/崩溃没保存成功的数据优先于服务端版本
        const unsaved = readUnsavedData(storageKey)
        let restored = fetched
        if (unsaved && !deepEqual(unsaved, fetched.data)) {
          restored = { ...fetched, data: unsaved }
        } else if (unsaved) {
          // 内容一致说明已保存成功，清掉残留
          clearUnsavedData(storageKey)
        }

        dispatch(initialize(restored))

        if (restored !== fetched) {
          toast.info('已恢复上次未保存的修改，正在重新保存')
          queueSave(restored)
        }

        setLoadState('ready')
      } catch {
        if (!cancelled) setLoadState('error')
      }
    })()

    return () => {
      cancelled = true
      dispatch(reset())
    }
  }, [dispatch, resumeId, userId])

  // 撤销/重做快捷键：输入框内让浏览器原生文本撤销接管
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      dispatch(applyHistoryStep(event.shiftKey ? 'redo' : 'undo'))
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  if (loadState === 'error') {
    return (
      <div className="grid place-items-center py-16">
        <div className="text-center">
          <p className="mb-2 font-medium">简历加载失败</p>
          <p className="text-muted-foreground mb-4 text-sm">请检查网络后重试，或确认简历 ID 是否正确。</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  if (loadState === 'loading' || !resume) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-[800px_1fr] gap-6">
          <div className="grid gap-3">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-[70vh] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="border-border -m-4 flex flex-col rounded-xl border w-full" style={{ height: 'calc(100vh - 11rem)' }}>
      {/* 顶栏：简历名 + 保存状态 + 撤销/重做 */}
      {/* <div className="border-border flex items-center gap-3 border-b px-4 py-2">
        <span className="truncate font-medium">{resume.name}</span>
        <SaveStatus />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="撤销 (⌘Z)"
            disabled={!canUndo}
            onClick={() => dispatch(applyHistoryStep('undo'))}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="重做 (⇧⌘Z)"
            disabled={!canRedo}
            onClick={() => dispatch(applyHistoryStep('redo'))}
          >
            <Redo2 className="size-4" />
          </Button>
        </div>
      </div> */}

      {/* 主体：左编辑面板 + 右预览画板，分隔条可拖拽调宽（双击重置默认比例） */}
      <Splitter className="min-h-0 w-full" lineSize={1} handleColor="gray.3">
        <Splitter.Pane defaultSize={30} >
          <aside className="h-full overflow-y-auto">
            <WritePanel />
          </aside>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={70}>
          <section className="bg-muted/40 h-full overflow-y-auto p-8">
            <Artboard />
          </section>
        </Splitter.Pane>
      </Splitter>
    </div>
  )
}
