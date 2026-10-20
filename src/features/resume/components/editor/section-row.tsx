import { getSectionType } from '../../model'
import { useHoveredSectionId, useResumeData } from '../../hooks'
import { setHoveredSection } from '../../resumeSlice'
import { SectionCard } from './section-card'
import { useAppDispatch } from '@/hooks/redux'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SectionRowProps {
  /** 大纲行 id（分区 id）。 */
  id: string
  /** 上下移动分区（跨页/跨栏由 moveSection 处理）。 */
  onMove: (direction: 'up' | 'down') => void
  canMoveUp: boolean
  canMoveDown: boolean
}

/** 大纲行包装：分区卡片 + 行级移动按钮。 */
export function SectionRow({ id, onMove, canMoveUp, canMoveDown }: SectionRowProps) {
  const data = useResumeData()
  const dispatch = useAppDispatch()
  const hoveredSectionId = useHoveredSectionId()
  if (!data) return null

  // id 无法解析为合法分区时跳过
  if (!getSectionType(data, id)) return null

  const isHovered = hoveredSectionId === id

  return (
    <div
      className={cn(
        'grid gap-1 rounded-lg p-2 -mx-2 transition-colors',
        isHovered && 'bg-red-50 ring-1 ring-red-400',
      )}
      onMouseEnter={() => dispatch(setHoveredSection(id))}
      onMouseLeave={() => dispatch(setHoveredSection(null))}
    >
      <SectionCard sectionId={id} />
      <div className="flex justify-center gap-1">
        <Button variant="ghost" size="sm" disabled={!canMoveUp} onClick={() => onMove('up')} title="分区上移">
          ↑ 上移
        </Button>
        <Button variant="ghost" size="sm" disabled={!canMoveDown} onClick={() => onMove('down')} title="分区下移">
          ↓ 下移
        </Button>
      </div>
    </div>
  )
}
