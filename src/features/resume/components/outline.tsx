import { useState } from 'react'
import type { CustomSectionType, SectionType } from '../types'
import {
  BUILTIN_SECTION_TYPES,
  NEW_CUSTOM_SECTION_TYPES,
  addBuiltinSection,
  addCustomSection,
  getOutlineRows,
  isSectionInUse,
  moveSection,
  SECTION_LABELS,
} from '../model'
import { useResumeData, useUpdateResumeData } from '../hooks'
import { SectionRow } from './section-card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'

/**
 * 大纲：按打印顺序列出使用中的分区（对应 reactive-resume write/outline.tsx）。
 * "添加分区"列出未在用的内置分区 + 可新建的自定义分区
 * （对应 add-section.tsx；没有 Popover，用受控展开面板代替）。
 */
export function Outline() {
  const data = useResumeData()
  const updateResumeData = useUpdateResumeData()

  if (!data) return null

  const rows = getOutlineRows(data)

  /** 分区行移动：复用 model 的 moveSection，跨页/跨栏跟着走。 */
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const current = rows[index]
    const target = direction === 'up' ? rows[index - 1] : rows[index + 1]
    if (!current || !target) return
    updateResumeData(
      (draft) => {
        moveSection(draft, current.id, target, direction)
      },
      { newStep: true, coalesceKey: `outline:move:${current.id}` },
    )
  }

  return (
    <div className="grid gap-4">
      {rows.map((row, index) => (
        <SectionRow
          key={row.id}
          id={row.id}
          canMoveUp={index > 0}
          canMoveDown={index < rows.length - 1}
          onMove={(direction) => handleMove(index, direction)}
        />
      ))}
      <AddSectionMenu />
    </div>
  )
}

/** 添加分区：未在用的内置分区 + 新建自定义分区。 */
function AddSectionMenu() {
  const data = useResumeData()
  const updateResumeData = useUpdateResumeData()
  const [open, setOpen] = useState(false)

  if (!data) return null

  const unusedBuiltins = BUILTIN_SECTION_TYPES.filter(
    (type: SectionType) => !isSectionInUse(data, type),
  )

  const addBuiltin = (type: 'summary' | SectionType) => {
    updateResumeData(
      (draft) => {
        // 复用 model 的添加逻辑（放置 + 取消隐藏 + 首条草稿）
        addBuiltinSection(draft, type)
      },
      { newStep: true, coalesceKey: `add-section:${type}` },
    )
    setOpen(false)
  }

  const addCustom = (type: CustomSectionType) => {
    updateResumeData(
      (draft) => {
        addCustomSection(draft, type, SECTION_LABELS[type])
      },
      { newStep: true, coalesceKey: `add-custom:${type}` },
    )
    setOpen(false)
  }

  return (
    <div>
      <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen((value) => !value)}>
        <Plus className="size-3.5" />
        添加分区
      </Button>

      {open && (
        <div className="mt-2 grid gap-1 rounded-xl border bg-card p-2">
          {data.summary.hidden && !isSectionInUse(data, 'summary') && (
            <Button variant="ghost" size="sm" className="justify-start" onClick={() => addBuiltin('summary')}>
              {SECTION_LABELS.summary}
            </Button>
          )}
          {unusedBuiltins.map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => addBuiltin(type)}
            >
              {SECTION_LABELS[type]}
            </Button>
          ))}
          <Separator className="my-1" />
          <p className="text-muted-foreground px-2 py-1 text-xs">新建自定义分区</p>
          {NEW_CUSTOM_SECTION_TYPES.map((type) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => addCustom(type)}
            >
              {SECTION_LABELS[type]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
