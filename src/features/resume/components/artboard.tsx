import type { CustomSectionType, Entry, ResumeData } from '../types'
import { resolveSection, isDraftEntry, getEntries, getSectionObject, SECTION_LABELS } from '../model'
import { useResumeData } from '../hooks'

/**
 * 简历预览画板。reactive-resume 的 Artboard 用 packages/pdf 的模板引擎渲染
 * 真实 PDF；本项目用纯 HTML/Tailwind 按 ResumeData 渲染，消费同一份 store JSON，
 * 保证"所见即数据"。A4 按浏览器 96dpi ≈ 794×1123px，pt→px 系数 4/3。
 */

const PT_TO_PX = 4 / 3

/** 单个条目的展示：标题行 + 时间/地点 + 链接 + 描述 + 水平点 + 关键词。 */
function EntryView({ type, entry, primaryColor }: { type: CustomSectionType; entry: Entry; primaryColor: string }) {
  const values = entry as Record<string, unknown>
  const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  const period = str(values.period) || str(values.date)

  const website = values.website as { url: string; label: string; inlineLink?: boolean } | undefined
  const linkText = website ? website.label || website.url : ''
  const showSeparateLink = website?.url && !website.inlineLink

  // 各类型的标题与副标题组合（展示比编辑宽松，统一在此拼装）
  const titleOf = () => {
    switch (type) {
      case 'experience':
        return [str(values.position), str(values.company)]
      case 'education':
        return [str(values.degree), str(values.school)]
      case 'projects':
      case 'skills':
      case 'interests':
      case 'profiles':
        return [str(values.name) || str(values.network), str(values.username)]
      case 'languages':
        return [str(values.language), str(values.fluency)]
      case 'awards':
      case 'certifications':
      case 'publications':
        return [str(values.title), str(values.awarder) || str(values.issuer) || str(values.publisher)]
      case 'volunteer':
        return [str(values.position) || str(values.roleTitle), str(values.organization)]
      case 'references':
        return [str(values.name), str(values.position)]
      default:
        return [str(values.title) || str(values.name), '']
    }
  }
  const [primary, secondary] = titleOf()

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

      {location && <p className="text-[0.9em] opacity-70">{location}</p>}

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
        <p className="text-[0.9em] opacity-70">{keywords.join(type === 'skills' ? ' · ' : ', ')}</p>
      )}

      {level > 0 && type !== 'interests' && (
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

/** 描述/正文：HTML 字符串直接渲染，纯文本按换行渲染。 */
function RichText({ value }: { value: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(value)
  if (isHtml) {
    return <div className="text-[0.95em] leading-relaxed [&_ul]:list-disc [&_ul]:pl-4" dangerouslySetInnerHTML={{ __html: value }} />
  }
  return <p className="text-[0.95em] leading-relaxed whitespace-pre-line">{value}</p>
}

interface SectionViewProps {
  data: ResumeData
  sectionId: string
  primaryColor: string
}

/** 一个分区的展示：可选标题 + 过滤后的条目。 */
function SectionView({ data, sectionId, primaryColor }: SectionViewProps) {
  const section = resolveSection(data, sectionId)
  if (!section) return null

  const object = getSectionObject(data, section)
  if (!object || object.hidden) return null

  const heading = object.title || SECTION_LABELS[section.type]

  const items = getEntries(data, section).filter(
    (entry) => !entry.hidden && !isDraftEntry(section.type, entry),
  )

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

interface PageViewProps {
  data: ResumeData
  page: ResumeData['metadata']['layout']['pages'][number]
}

/** 一页：主栏 + 侧栏两列（fullWidth 或侧栏为空时单列）。 */
function PageView({ data, page }: PageViewProps) {
  const {
    design: { colors },
    typography,
    page: pageSettings,
  } = data.metadata
  const hasSidebar = !page.fullWidth && page.sidebar.length > 0
  const sidebarWidth = hasSidebar ? data.metadata.layout.sidebarWidth : 0

  return (
    <div
      className="shadow-xl"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: colors.background,
        color: colors.text,
        paddingTop: pageSettings.marginY * PT_TO_PX,
        paddingBottom: pageSettings.marginY * PT_TO_PX,
        paddingLeft: pageSettings.marginX * PT_TO_PX,
        paddingRight: pageSettings.marginX * PT_TO_PX,
        fontFamily: `${typography.body.fontFamily}, serif`,
        fontSize: typography.body.fontSize * PT_TO_PX,
        lineHeight: typography.body.lineHeight,
      }}
    >
      <PageHeader data={data} />

      <div
        className="mt-3 flex gap-4"
        style={{ columnGap: pageSettings.gapX * PT_TO_PX, rowGap: pageSettings.gapY * PT_TO_PX }}
      >
        <div className="min-w-0 flex-1 space-y-4">
          {page.main.map((id) => (
            <SectionView key={id} data={data} sectionId={id} primaryColor={colors.primary} />
          ))}
        </div>
        {hasSidebar && (
          <div className="space-y-4" style={{ width: `${sidebarWidth}%` }}>
            {page.sidebar.map((id) => (
              <SectionView key={id} data={data} sectionId={id} primaryColor={colors.primary} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** 页眉：姓名 + 头衔 + 联系方式一行。 */
function PageHeader({ data }: { data: ResumeData }) {
  const { basics, picture } = data
  const contacts = [basics.email, basics.phone, basics.location, basics.website.label || basics.website.url].filter(
    Boolean,
  )

  return (
    <header className="flex items-center gap-4">
      {!picture.hidden && picture.url && (
        <img
          src={picture.url}
          alt={`${basics.name}的照片`}
          className="object-cover"
          style={{
            width: picture.size * PT_TO_PX,
            height: picture.size * PT_TO_PX,
            borderRadius: `${picture.borderRadius * PT_TO_PX}px`,
            transform: `rotate(${picture.rotation}deg)`,
          }}
        />
      )}
      <div className="min-w-0 flex-1">
        <h1
          className="leading-tight font-bold"
          style={{
            fontFamily: `${data.metadata.typography.heading.fontFamily}, sans-serif`,
            fontSize: `${data.metadata.typography.heading.fontSize * PT_TO_PX}px`,
          }}
        >
          {basics.name}
        </h1>
        {basics.headline && (
          <p className="text-[1.05em] font-medium" style={{ color: data.metadata.design.colors.primary }}>
            {basics.headline}
          </p>
        )}
        {contacts.length > 0 && (
          <p className="text-[0.9em] opacity-80">{contacts.join(' · ')}</p>
        )}
        {basics.customFields.length > 0 && (
          <p className="text-[0.9em] opacity-80">
            {basics.customFields.filter((field) => field.text).map((field) => field.text).join(' · ')}
          </p>
        )}
      </div>
    </header>
  )
}

interface ArtboardProps {
  /** 缩放比例，编辑器宽度有限默认缩一点。 */
  scale?: number
}

/** 预览画板：逐页渲染 store 里的 ResumeData。 */
export function Artboard({ scale = 0.72 }: ArtboardProps) {
  const data = useResumeData()

  if (!data) return null

  return (
    <div className="grid origin-top place-items-center gap-6" style={{ transform: `scale(${scale})` }}>
      {data.metadata.layout.pages.map((page, index) => (
        <div key={index} className="relative">
          <PageView data={data} page={page} />
          {data.metadata.layout.pages.length > 1 && (
            <span className="text-muted-foreground absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px]">
              第 {index + 1} / {data.metadata.layout.pages.length} 页
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
