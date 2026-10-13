import type { CustomSection, CustomSectionType, ResumeData, SectionType } from './types'
import { createEntry } from './schema'
import { generateId, stripHtml } from './utils'

/**
 * 编辑模型：分区/条目的定位、大纲顺序与结构操作。
 * 移植自 reactive-resume apps/web/src/features/resume/editor/write/model.ts，
 * 移除了结构化日期与 roles 的编辑辅助（类型仍保留兼容）。
 */

/** 大纲中的一行：summary、内置分区（按类型名索引）或自定义分区（按 id 索引）。 */
export interface WriteSection {
  id: string
  kind: 'summary' | 'builtin' | 'custom'
  type: CustomSectionType
}

/** 内置分区类型（不含 summary 与 cover-letter，它们不是内置 sections 的键）。 */
export const BUILTIN_SECTION_TYPES: readonly SectionType[] = [
  'profiles',
  'experience',
  'education',
  'projects',
  'skills',
  'languages',
  'interests',
  'awards',
  'certifications',
  'publications',
  'volunteer',
  'references',
]

/** 新建自定义分区时可选的条目类型。 */
export const CUSTOM_SECTION_TYPES = [
  'experience',
  'education',
  'projects',
  'skills',
  'languages',
  'interests',
  'awards',
  'certifications',
  'publications',
  'volunteer',
  'references',
  'profiles',
  'summary',
] as const satisfies readonly CustomSectionType[]

/** 分区的中文默认标题：title 为空时大纲与预览用它展示。 */
export const SECTION_LABELS: Record<CustomSectionType, string> = {
  summary: '个人总结',
  profiles: '社交主页',
  experience: '工作经历',
  education: '教育背景',
  projects: '项目经历',
  skills: '专业技能',
  languages: '语言能力',
  interests: '兴趣爱好',
  awards: '荣誉奖项',
  certifications: '专业证书',
  publications: '发表作品',
  volunteer: '志愿活动',
  references: '推荐人',
  'cover-letter': '求职信',
}

const isBuiltinSectionType = (id: string): id is SectionType =>
  (BUILTIN_SECTION_TYPES as readonly string[]).includes(id)

export const getSectionKind = (id: string): WriteSection['kind'] =>
  id === 'summary' ? 'summary' : isBuiltinSectionType(id) ? 'builtin' : 'custom'

/** 分区 id 对应的条目类型：summary 与内置分区即自身 key，自定义分区读取存储的 type。 */
export function getSectionType(data: ResumeData, id: string): CustomSectionType | undefined {
  if (id === 'summary') return 'summary'
  if (isBuiltinSectionType(id)) return id
  return data.customSections.find((section) => section.id === id)?.type
}

export function resolveSection(data: ResumeData, id: string): WriteSection | null {
  const type = getSectionType(data, id)
  return type ? { id, kind: getSectionKind(id), type } : null
}

/** 分区的条目列表（draft 或已保存数据通用），summary 没有条目。 */
export function getEntries(data: ResumeData, section: WriteSection) {
  if (section.kind === 'builtin') return data.sections[section.id as SectionType].items
  if (section.kind === 'custom')
    return data.customSections.find((custom) => custom.id === section.id)?.items ?? []
  return []
}

/** 分区自身的设置（title、columns、hidden 等），三类分区共享同一结构。 */
export function getSectionObject(
  data: ResumeData,
  section: WriteSection,
): ResumeData['summary'] | ResumeData['sections'][SectionType] | CustomSection | undefined {
  if (section.kind === 'summary') return data.summary
  if (section.kind === 'builtin') return data.sections[section.id as SectionType]
  return data.customSections.find((custom) => custom.id === section.id)
}

export function findEntry(data: ResumeData, sectionId: string, entryId: string) {
  const section = resolveSection(data, sectionId)
  return section ? getEntries(data, section).find((entry) => entry.id === entryId) : undefined
}

/** 条目打印前必须有的主字段，与 PDF 渲染过滤一致；其余字段为空也打印。 */
const PRIMARY_FIELD: Partial<Record<CustomSectionType, string>> = {
  profiles: 'network',
  experience: 'company',
  education: 'school',
  projects: 'name',
  skills: 'name',
  languages: 'language',
  interests: 'name',
  awards: 'title',
  certifications: 'title',
  publications: 'title',
  volunteer: 'organization',
  references: 'name',
}

export const getPrimaryField = (type: CustomSectionType) => PRIMARY_FIELD[type]

/** 缺主字段的条目是草稿：保留在数据里，但预览与打印都不显示。 */
export function isDraftEntry(type: CustomSectionType, entry: Record<string, unknown>): boolean {
  const field = PRIMARY_FIELD[type]
  if (!field) return false
  const value = entry[field]
  return typeof value !== 'string' || !value.trim()
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const join = (...parts: unknown[]) => parts.map(text).filter(Boolean).join(' · ')

/** 条目在大纲里的摘要显示：一行标题 + 一行补充信息。 */
export function describeEntry(type: CustomSectionType, entry: Record<string, unknown>) {
  const keywords = Array.isArray(entry.keywords) ? (entry.keywords as string[]).join(', ') : ''
  const website = entry.website as { label?: string } | undefined

  switch (type) {
    case 'experience': {
      const position = text(entry.position)
      return {
        title: position || text(entry.company),
        meta: join(position ? entry.company : '', entry.location, entry.period),
      }
    }
    case 'education':
      return {
        title: text(entry.school),
        meta: join([text(entry.degree), text(entry.area)].filter(Boolean).join(', '), entry.location, entry.period),
      }
    case 'projects':
      return { title: text(entry.name), meta: join(entry.period, website?.label) }
    case 'skills':
      return { title: text(entry.name), meta: join(entry.proficiency, keywords) }
    case 'languages':
      return { title: text(entry.language), meta: join(entry.fluency) }
    case 'interests':
      return { title: text(entry.name), meta: keywords }
    case 'awards':
      return { title: text(entry.title), meta: join(entry.awarder, entry.date) }
    case 'certifications':
      return { title: text(entry.title), meta: join(entry.issuer, entry.date) }
    case 'publications':
      return { title: text(entry.title), meta: join(entry.publisher, entry.date) }
    case 'volunteer':
      return { title: text(entry.organization), meta: join(entry.location, entry.period) }
    case 'references':
      return { title: text(entry.name), meta: join(entry.position) }
    case 'profiles':
      return { title: text(entry.network), meta: join(entry.username) }
    case 'summary':
    case 'cover-letter': {
      const body = stripHtml(String(entry.content ?? '')).trim()
      return { title: body.length > 80 ? `${body.slice(0, 80)}…` : body, meta: '' }
    }
  }
}

/** 分区是否有内容（summary 看正文，内置分区看条目数，自定义分区恒为有）。 */
export function isSectionInUse(data: ResumeData, id: string, recentlyAdded: ReadonlySet<string> = new Set()) {
  if (recentlyAdded.has(id)) return true
  const section = resolveSection(data, id)
  if (!section) return false
  if (section.kind === 'summary') return Boolean(stripHtml(data.summary.content).trim())
  if (section.kind === 'custom') return true
  return getEntries(data, section).length > 0
}

/** 大纲行：位于第几页、哪一栏。 */
export interface OutlineRow {
  id: string
  page: number
  column: 'main' | 'sidebar'
}

/**
 * 按打印顺序列出使用中的分区：逐页先主栏后侧栏；
 * 没被任何页放置的在用分区排在最后一页主栏。
 */
export function getOutlineRows(data: ResumeData, recentlyAdded?: ReadonlySet<string>): OutlineRow[] {
  const rows: OutlineRow[] = []
  const placed = new Set<string>()

  data.metadata.layout.pages.forEach((page, pageIndex) => {
    for (const column of ['main', 'sidebar'] as const) {
      for (const id of page[column]) {
        placed.add(id)
        if (isSectionInUse(data, id, recentlyAdded)) rows.push({ id, page: pageIndex, column })
      }
    }
  })

  const lastPage = Math.max(0, data.metadata.layout.pages.length - 1)
  const candidates = ['summary', ...BUILTIN_SECTION_TYPES, ...data.customSections.map((section) => section.id)]
  for (const id of candidates) {
    if (!placed.has(id) && isSectionInUse(data, id, recentlyAdded)) rows.push({ id, page: lastPage, column: 'main' })
  }

  return rows
}

function removeFromLayout(draft: ResumeData, id: string) {
  for (const page of draft.metadata.layout.pages) {
    page.main = page.main.filter((section) => section !== id)
    page.sidebar = page.sidebar.filter((section) => section !== id)
  }
}

/**
 * 把分区移动到另一行所在位置：向上移动插到目标前面，向下移动插到目标后面；
 * 跨页/跨栏时分区会跟着移动，也就是可以跨过主栏/侧栏分界线。
 */
export function moveSection(draft: ResumeData, id: string, target: OutlineRow, direction: 'up' | 'down') {
  if (id === target.id) return
  removeFromLayout(draft, id)

  const page = draft.metadata.layout.pages[target.page]
  if (!page) return
  const column = page[target.column]
  const index = column.indexOf(target.id)
  const insertAt = index === -1 ? column.length : direction === 'down' ? index + 1 : index
  column.splice(insertAt, 0, id)
}

/** 分区未被任何页放置时，追加到最后一页的主栏。 */
function ensurePlaced(draft: ResumeData, id: string) {
  const pages = draft.metadata.layout.pages
  if (pages.some((page) => page.main.includes(id) || page.sidebar.includes(id))) return
  if (pages.length === 0) pages.push({ fullWidth: false, main: [], sidebar: [] })
  pages[pages.length - 1]?.main.push(id)
}

/**
 * 添加内置分区：显示该分区、确保已被布局放置、并塞入一条待填写的草稿条目。
 * 返回新条目 id（summary 没有条目，返回 null）。
 */
export function addBuiltinSection(draft: ResumeData, type: 'summary' | SectionType): string | null {
  ensurePlaced(draft, type)
  if (type === 'summary') {
    draft.summary.hidden = false
    return null
  }

  const section = draft.sections[type]
  section.hidden = false
  const entry = createEntry(type)
  section.items.push(entry)
  return entry.id
}

/** 添加自定义分区：以类型名命名的全新分区，附带一条草稿条目。 */
export function addCustomSection(draft: ResumeData, type: CustomSectionType, title: string) {
  const entry = createEntry(type)
  const section: CustomSection = {
    id: generateId(),
    title,
    type,
    icon: '',
    columns: 1,
    hidden: false,
    showHeading: true,
    keepTogether: false,
    startOnNewPage: false,
    items: [entry],
  }
  draft.customSections.push(section)
  ensurePlaced(draft, section.id)
  return { sectionId: section.id, entryId: entry.id }
}
