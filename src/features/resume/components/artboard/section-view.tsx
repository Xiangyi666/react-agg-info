import { useEffect, useRef } from 'react'
import type { ResumeData } from '../../types'
import {
  isDraftEntry,
  getEntries,
  getSectionObject,
  getSectionType,
  isSummarySection,
  SECTION_LABELS,
} from '../../model'
import { useHoveredSectionId } from '../../hooks'
import { EntryView } from './entry-view'
import { RichText } from './rich-text'
import { cn } from '@/lib/utils'

interface SectionViewProps {
  data: ResumeData
  sectionId: string
  primaryColor: string
}

/** 一个分区的展示：可选标题 + 过滤后的条目（隐藏与未成形的草稿不进入预览）。 */
export function SectionView({ data, sectionId, primaryColor }: SectionViewProps) {
  const sectionType = getSectionType(data, sectionId)
  const hoveredSectionId = useHoveredSectionId()
  const sectionRef = useRef<HTMLElement>(null)
  const isHovered = hoveredSectionId === sectionId

  // 悬停时平滑滚动到视口中央
  useEffect(() => {
    if (isHovered && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isHovered])

  if (!sectionType) return null

  const object = getSectionObject(data, sectionId)
  if (!object || object.hidden) return null

  const heading = object.title || SECTION_LABELS[sectionType]

  const items = getEntries(data, sectionId).filter((entry) => !entry.hidden && !isDraftEntry(sectionType, entry))

  if (isSummarySection(sectionId)) {
    const content = data.summary.content.trim()
    if (!content) return null
    return (
      <section ref={sectionRef} className={cn('rounded transition-colors', isHovered && 'bg-red-50 -mx-2 px-2')}>
        {data.summary.showHeading !== false && <SectionHeading heading={heading} primaryColor={primaryColor} />}
        <RichText value={content} />
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section ref={sectionRef} className={cn('rounded transition-colors', isHovered && 'bg-red-50 -mx-2 px-2')}>
      {object.showHeading !== false && <SectionHeading heading={heading} primaryColor={primaryColor} />}
      {items.map((entry) => (
        <EntryView key={entry.id} type={sectionType} entry={entry} primaryColor={primaryColor} />
      ))}
    </section>
  )
}

function SectionHeading({ heading, primaryColor }: { heading: string; primaryColor: string }) {
  return (
    <h2 className="mb-1.5 border-b pb-0.5 text-[1.1em] font-bold" style={{ borderColor: primaryColor }}>
      {heading}
    </h2>
  )
}
