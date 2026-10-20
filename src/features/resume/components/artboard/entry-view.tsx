import type { CustomSectionType, Entry } from '../../types'
import { getSectionTypeDefinition, readEntryTitle } from '../../types'
import { RichText } from './rich-text'

interface EntryViewProps {
  type: CustomSectionType
  entry: Entry
  primaryColor: string
}

/**
 * 单个条目的展示：标题行 + 时间/地点 + 链接 + 描述 + 水平点 + 关键词。
 * 标题字段与展示选项来自类型注册表（types/section.ts）；未注册的类型降级为占位提示。
 */
export function EntryView({ type, entry, primaryColor }: EntryViewProps) {
  const definition = getSectionTypeDefinition(type)

  if (!definition) {
    console.warn(`[resume] 未实现渲染方法的条目类型: ${type}`)
    return <p className="text-muted-foreground mb-2 text-[0.9em]">该类型「{type}」未实现渲染方法</p>
  }

  const values = entry as Record<string, unknown>
  const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  const period = str(values.period) || str(values.date)

  const website = values.website as { url: string; label: string; inlineLink?: boolean } | undefined
  const linkText = website ? website.label || website.url : ''
  const showSeparateLink = website?.url && !website.inlineLink

  const [primary, secondary] = readEntryTitle(values, definition.entryTitle)

  const location = str(values.location)
  const description = str(values.description)
  const keywords = Array.isArray(values.keywords) ? (values.keywords as string[]) : []
  const level = Number(values.level ?? 0)

  return (
    <div className="mb-2 break-inside-avoid">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[1em] leading-snug font-semibold">
          {primary || <span className="opacity-40">未命名</span>}
          {secondary && <span className="font-normal"> · {secondary}</span>}
          {location && <span className="ml-4 opacity-70">{location}</span>}
          {website?.url && website.inlineLink && (
            <a
              href={website.url}
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-normal underline"
              style={{ color: primaryColor }}
            >
              {linkText}
            </a>
          )}
        </p>
        {period && <p className="shrink-0 text-[0.9em] opacity-70">{period}</p>}
      </div>


      {showSeparateLink && (
        <a
          href={website?.url}
          target="_blank"
          rel="noreferrer"
          className="block text-[0.9em] underline"
          style={{ color: primaryColor }}
        >
          {linkText}
        </a>
      )}

      {description && <RichText value={description} />}

      {keywords.length > 0 && (
        <p className="text-[0.9em] opacity-70">{keywords.join(definition.display?.keywordSeparator ?? ', ')}</p>
      )}

      {level > 0 && !definition.display?.hideLevel && (
        <div className="mt-0.5 flex gap-1" aria-label={`水平 ${level} / 5`}>
          {[1, 2, 3, 4, 5].map((dot) => (
            <span
              key={dot}
              className="size-[0.55em] rounded-full"
              style={{ backgroundColor: dot <= level ? primaryColor : 'transparent', border: `1px solid ${primaryColor}` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
