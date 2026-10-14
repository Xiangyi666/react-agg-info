import { useState } from 'react'
import type { ResumeData } from '../types'
import type { WriteSection } from '../model'
import { getEntries, getSectionObject, resolveWriteSection, SECTION_LABELS } from '../model'
import { createEntry } from '../schema'
import { useResumeData, useUpdateResumeData } from '../hooks'
import { EntryCard } from './entry-card'
import { TextAreaField, TextField } from './fields'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

/**
 * 大纲里的一个分区卡片：标题（留空用类型默认名）、隐藏开关、条目列表、添加条目。
 * summary 是单富文本，没有条目列表。对应 reactive-resume write/section-row.tsx
 * + entry 列表的组合（无 dnd，上下移动按钮代替拖拽）。
 */

interface SectionCardProps {
  section: WriteSection
}

export function SectionCard({ section }: SectionCardProps) {
  const data = useResumeData()
  const updateResumeData = useUpdateResumeData()
  // 刚添加的条目自动展开；清空后恢复全部收起
  const [openEntryId, setOpenEntryId] = useState<string | null>(null)

  if (!data) return null

  const sectionObject = getSectionObject(data, section)
  if (!sectionObject) return null

  const hidden = sectionObject.hidden
  const label = SECTION_LABELS[section.type]

  /** 分区级写入：标题等字段的 coalesceKey 让连续改名合并为一次撤销。 */
  const writeSection = (key: string, mutate: (object: NonNullable<ReturnType<typeof getSectionObject>>) => void) => {
    updateResumeData(
      (draft) => {
        const object = getSectionObject(draft, section)
        if (object) mutate(object)
      },
      { coalesceKey: `${section.id}:${key}` },
    )
  }

  /** 结构操作（删除分区等）独立成撤销步骤。 */
  const mutateStructure = (fn: (draft: ResumeData) => void, key: string) => {
    updateResumeData(fn, { newStep: true, coalesceKey: `${section.id}:${key}` })
  }

  const entries = getEntries(data, section)

  const addEntry = () => {
    // 草稿函数在 dispatch 内同步执行，返回后就能拿到新条目 id
    let newEntryId = ''
    updateResumeData(
      (draft) => {
        const entry = createEntry(section.type)
        getEntries(draft, section).push(entry)
        newEntryId = entry.id
      },
      { newStep: true, coalesceKey: `${section.id}:add-entry` },
    )
    setOpenEntryId(newEntryId)
  }

  const removeCustomSection = () => {
    mutateStructure((draft) => {
      draft.customSections = draft.customSections.filter((custom) => custom.id !== section.id)
      for (const page of draft.metadata.layout.pages) {
        page.main = page.main.filter((id) => id !== section.id)
        page.sidebar = page.sidebar.filter((id) => id !== section.id)
      }
    }, 'remove-section')
  }

  return (
    <div className={cn('rounded-xl border bg-card p-3', hidden && 'opacity-60')}>
      <div className="grid grid-cols-[1fr_auto] items-start gap-2">
        <TextField
          label="分区标题"
          placeholder={label}
          value={sectionObject.title}
          onChange={(value) =>
            writeSection('title', (object) => {
              object.title = value
            })
          }
        />

        <div className="flex items-center gap-1 pt-6">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title={hidden ? '在简历上显示' : '在简历上隐藏'}
            onClick={() =>
              writeSection('hidden', (object) => {
                object.hidden = !object.hidden
              })
            }
          >
            {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
          {section.kind === 'custom' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive size-7 hover:text-destructive"
              title="删除分区"
              onClick={removeCustomSection}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {section.kind === 'summary' ? (
        <div className="mt-1 grid grid-cols-1 gap-2">
          <TextAreaField
            label="正文"
            rows={6}
            value={data.summary.content}
            onChange={(value) =>
              updateResumeData(
                (draft) => {
                  draft.summary.content = value
                },
                { coalesceKey: `${section.id}:content` },
              )
            }
          />
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {entries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              section={section}
              entryId={entry.id}
              index={index}
              count={entries.length}
              defaultOpen={entry.id === openEntryId}
            />
          ))}
          <Button variant="secondary" size="sm" className="w-fit" onClick={addEntry}>
            <Plus className="size-3.5" />
            添加条目
          </Button>
        </div>
      )}
    </div>
  )
}

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
  if (!data) return null

  const section = resolveWriteSection(data, id)
  if (!section) return null

  return (
    <div className="grid gap-1">
      <SectionCard section={section} />
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
