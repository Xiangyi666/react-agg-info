import type { ResumeData } from '../../types'
import { resolveWriteSection, isDraftEntry, getEntries, getSectionObject, SECTION_LABELS } from '../../model'
import { EntryView } from './entry-view'
import { RichText } from './rich-text'

interface SectionViewProps {
  data: ResumeData
  sectionId: string
  primaryColor: string
}

/** 一个分区的展示：可选标题 + 过滤后的条目（隐藏与未成形的草稿不进入预览）。 */
export function SectionView({ data, sectionId, primaryColor }: SectionViewProps) {
  const section = resolveWriteSection(data, sectionId)
  if (!section) return null

  const object = getSectionObject(data, section)
  if (!object || object.hidden) return null

  const heading = object.title || SECTION_LABELS[section.type]

  const items = getEntries(data, section).filter((entry) => !entry.hidden && !isDraftEntry(section.type, entry))

  if (section.kind === 'summary') {
    const content = data.summary.content.trim()
    if (!content) return null
    return (
      <section>
        {data.summary.showHeading !== false && <SectionHeading heading={heading} primaryColor={primaryColor} />}
        <RichText value={content} />
      </section>
    )
  }

  if (items.length === 0) return null

  return (
    <section>
      {object.showHeading !== false && <SectionHeading heading={heading} primaryColor={primaryColor} />}
      {items.map((entry) => (
        <EntryView key={entry.id} type={section.type} entry={entry} primaryColor={primaryColor} />
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
