import { useState } from 'react'
import { describeEntry, getEntries, isDraftEntry } from '../../model'
import { useEntry, useEntryWriter, useUpdateResumeData } from '../../hooks'
import type { CustomSectionType, Entry } from '../../types'
import { EntryFields } from './entry-fields'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Eye, EyeOff, Trash2 } from 'lucide-react'

interface EntryCardProps {
  sectionId: string
  sectionType: CustomSectionType
  entryId: string
  index: number
  count: number
  /** 新增草稿自动展开。 */
  defaultOpen?: boolean
}

/**
 * 一条条目的卡片：折叠头（标题摘要 + 结构操作）+ 展开的字段集。
 * 对应 reactive-resume write/entry-card.tsx（无 dnd，改为上下移动按钮）。
 */
export function EntryCard({ sectionId, sectionType, entryId, index, count, defaultOpen = false }: EntryCardProps) {
  const entry = useEntry(sectionId, entryId)
  const write = useEntryWriter(sectionId, entryId)
  const updateResumeData = useUpdateResumeData()
  const [open, setOpen] = useState(defaultOpen)

  // 条目已被删除（父级还没来得及重渲染）时安全跳过
  if (!entry) return null

  const hidden = Boolean(entry.hidden)
  const draft = isDraftEntry(sectionType, entry)
  const { title, meta } = describeEntry(sectionType, entry)

  /** 条目在分区内的结构操作：移动/删除/隐藏都是独立撤销步骤。 */
  const mutateEntries = (mutate: (entries: Entry[]) => void, key: string) => {
    updateResumeData(
      (draftData) => {
        const entries = getEntries(draftData, sectionId)
        mutate(entries)
      },
      { newStep: true, coalesceKey: `${sectionId}:${key}` },
    )
  }

  return (
    <div className={cn('rounded-lg border', hidden && 'opacity-50')}>
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {open ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
          <span className="min-w-0 flex-1 truncate text-sm">
            {draft && <span className="text-muted-foreground">草稿 · </span>}
            {title || <span className="text-muted-foreground">未填写</span>}
          </span>
          {meta && <span className="text-muted-foreground hidden max-w-1/3 truncate text-xs sm:block">{meta}</span>}
        </button>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title={hidden ? '在简历上显示' : '在简历上隐藏'}
            onClick={() =>
              write('hidden', (target) => {
                target.hidden = !hidden
              })
            }
          >
            {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="上移"
            disabled={index === 0}
            onClick={() =>
              mutateEntries((entries) => {
                entries.splice(index - 1, 0, ...entries.splice(index, 1))
              }, 'move-up')
            }
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title="下移"
            disabled={index === count - 1}
            onClick={() =>
              mutateEntries((entries) => {
                entries.splice(index + 1, 0, ...entries.splice(index, 1))
              }, 'move-down')
            }
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive size-7 hover:text-destructive"
            title="删除条目"
            onClick={() =>
              mutateEntries((entries) => {
                entries.splice(index, 1)
              }, 'remove')
            }
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t p-3">
          <EntryFields type={sectionType} entry={entry} write={write} />
        </div>
      )}
    </div>
  )
}
