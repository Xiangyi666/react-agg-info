import { useRetrySave, useSaveStatus } from '../hooks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CloudOff, Loader2, RefreshCw } from 'lucide-react'

/**
 * 保存状态条，语义与 reactive-resume editor/save-status.tsx 一致：
 * saving 转圈、saved 短暂显示已保存、offline 提示离线暂存、error 提供重试。
 */
export function SaveStatus() {
  const status = useSaveStatus()
  const retrySave = useRetrySave()

  if (status === 'idle') return null

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <span className="flex items-center gap-1.5">
          <Loader2 className="size-3.5 animate-spin" />
          保存中…
        </span>
      )}
      {status === 'saved' && (
        <span className="flex items-center gap-1.5">
          <span className={cn('bg-primary size-2 rounded-full')} />
          已保存
        </span>
      )}
      {status === 'offline' && (
        <span className="flex items-center gap-1.5">
          <CloudOff className="size-3.5" />
          离线 · 改动已暂存在本机
        </span>
      )}
      {status === 'error' && (
        <span className="text-destructive flex items-center gap-2">
          未保存
          <Button variant="outline" size="sm" onClick={retrySave}>
            <RefreshCw className="size-3.5" />
            重试
          </Button>
        </span>
      )}
    </div>
  )
}
