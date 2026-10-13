import type { ApiResponse } from '@/types/api'

/**
 * 简历数据的 TS 类型定义，移植自 reactive-resume 的 packages/schema/src/resume/data.ts。
 * 顶层结构与字段名和源项目保持一致，服务端返回同形状的 JSON 即可直接填充编辑器。
 *
 * 与源项目的差异（均为有意为之）：
 * - template 放宽为 string（模板渲染引擎未移植，无需枚举约束）
 * - createdAt/updatedAt 使用 ISO 字符串而非 Date（JSON 传输的现实形状）
 * - dates/roles 等高级子结构仅保留类型兼容，编辑器暂不提供专用编辑 UI
 */

/** 条目/自定义字段里挂的链接，label 留空时直接显示 url。 */
export interface Website {
  url: string
  label: string
}

/** 条目级链接：inlineLink 为 true 时渲染在标题上而非单独一行。 */
export interface ItemWebsite extends Website {
  inlineLink: boolean
}

/**
 * 结构化日期（reactive-resume 兼容字段）。编辑器直接编辑 period/date 文本，
 * 此结构由服务端或后续的日期解析功能维护，这里只保证类型不丢。
 */
export interface ResumeDates {
  start?: string
  end?: string
  /** 无法精确解析的原始文本，提示用户回看。 */
  raw?: string
}

/** 简历照片配置。 */
export interface Picture {
  hidden: boolean
  fit: 'cover' | 'contain'
  url: string
  /** 单位为 pt。 */
  size: number
  rotation: number
  aspectRatio: number
  borderRadius: number
  borderColor: string
  borderWidth: number
  shadowColor: string
  shadowWidth: number
}

/** 基本信息下方的自定义字段（如 GitHub 主页）。 */
export interface CustomField {
  id: string
  /** Phosphor 图标名，空字符串隐藏。 */
  icon: string
  text: string
  link: string
}

export interface Basics {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  website: Website
  customFields: CustomField[]
}

/** 所有分区共享的设置字段。 */
export interface SectionCommon {
  title: string
  /** Phosphor 图标名，空字符串用分区默认图标，'none' 隐藏。 */
  icon: string
  /** 1-6 列。 */
  columns: number
  /** 隐藏后内容保留，但预览与导出都不打印。 */
  hidden: boolean
  showHeading?: boolean
  keepTogether: boolean
  startOnNewPage: boolean
}

export interface Summary extends SectionCommon {
  /** HTML 或纯文本内容。 */
  content: string
}

/** 条目公共字段。 */
export interface ItemBase {
  /** UUID。 */
  id: string
  hidden: boolean
}

/**
 * 任意分区的一个条目。字段随分区类型变化，读写都按 Record 宽松处理，
 * 与源项目 Entry = CustomSectionItem 的用法一致。
 */
export type Entry = ItemBase & Record<string, unknown>

/** experience 条目下的多角色子条目（类型保留兼容，编辑器暂不编辑）。 */
export interface RoleItem {
  id: string
  position: string
  period: string
  dates?: ResumeDates
  description: string
}

/** 普通条目分区（除 skills 外的所有内置分区）。 */
export interface ItemSection extends SectionCommon {
  items: Entry[]
}

/** skills 分区额外的展示设置。 */
export interface SkillsSection extends ItemSection {
  keywordLayout: 'inline' | 'list'
  layout: 'default' | 'inline'
}

export interface Sections {
  profiles: ItemSection
  experience: ItemSection
  education: ItemSection
  projects: ItemSection
  skills: SkillsSection
  languages: ItemSection
  interests: ItemSection
  awards: ItemSection
  certifications: ItemSection
  publications: ItemSection
  volunteer: ItemSection
  references: ItemSection
}

export type SectionType = keyof Sections
export type Section = Sections[SectionType]

/** 自定义分区可使用的条目类型（与内置分区共用一套 item 结构）。 */
export type CustomSectionType =
  | 'summary'
  | 'profiles'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'awards'
  | 'certifications'
  | 'publications'
  | 'volunteer'
  | 'references'
  | 'cover-letter'

/** 自定义分区：按 id 索引，条目结构由 type 决定。 */
export interface CustomSection extends SectionCommon {
  id: string
  type: CustomSectionType
  items: Entry[]
  keywordLayout?: 'inline' | 'list'
}

export interface PageLayout {
  fullWidth: boolean
  /** 主栏内的分区 id 顺序（内置分区用类型名，自定义分区用 UUID）。 */
  main: string[]
  sidebar: string[]
}

export interface Layout {
  /** 侧栏宽度，页面宽度的百分比。 */
  sidebarWidth: number
  sidebarSide?: 'left' | 'right'
  pages: PageLayout[]
}

export interface Page {
  /** 分区之间的间距，单位 pt。 */
  gapX: number
  gapY: number
  /** 页边距，单位 pt。 */
  marginX: number
  marginY: number
  format: 'a4' | 'letter' | 'free-form'
  locale: string
  dateFormat?: 'short' | 'long' | 'numeric' | 'iso'
  hideLinkUnderline: boolean
  hideIcons: boolean
  hideSectionIcons: boolean
}

export interface LevelDesign {
  icon: string
  type: 'hidden' | 'circle' | 'square' | 'rectangle' | 'rectangle-full' | 'progress-bar' | 'icon'
}

export interface ColorDesign {
  /** 主色，rgba 字符串。 */
  primary: string
  text: string
  background: string
}

export interface Design {
  level: LevelDesign
  colors: ColorDesign
}

export interface TypographyItem {
  fontFamily: string
  fontWeights: string[]
  /** 单位 pt。 */
  fontSize: number
  lineHeight: number
}

export interface Typography {
  body: TypographyItem
  heading: TypographyItem
  hyphenation?: boolean
}

/** 自定义样式规则（PDF 渲染用，类型保留兼容）。 */
export interface StyleRule {
  id: string
  label: string
  enabled: boolean
  target:
    | { scope: 'global' }
    | { scope: 'sectionType'; sectionType: CustomSectionType }
    | { scope: 'sectionId'; sectionId: string }
  slots: Record<string, Record<string, unknown>>
}

export interface Metadata {
  template: string
  layout: Layout
  page: Page
  design: Design
  typography: Typography
  /** 仅作者可见的备注，不打印。 */
  notes: string
  styleRules: StyleRule[]
  stylesheet?: Record<string, unknown>
  check?: {
    ignored: string[]
    hiddenTerms: string[]
  }
}

/** 简历正文 JSON，服务端 data 字段的形状。 */
export interface ResumeData {
  picture: Picture
  basics: Basics
  summary: Summary
  sections: Sections
  customSections: CustomSection[]
  metadata: Metadata
}

/**
 * 服务端返回的完整简历对象（信封 + data），接口约定：
 * GET  /api/resume/:id   → ApiResponse<Resume>
 * PUT  /api/resume/:id   body: { data: ResumeData } → ApiResponse<Resume>
 */
export interface Resume {
  id: string
  name: string
  slug: string
  tags: string[]
  data: ResumeData
  isLocked: boolean
  /** ISO 8601 字符串。 */
  createdAt: string
  updatedAt: string
  hasPassword?: boolean
  isPublic?: boolean
  showDownloadButtons?: boolean
  applicationId?: string | null
}

export type ResumeResponse = ApiResponse<Resume>

/**
 * 保存状态机：
 * - offline：浏览器离线，改动暂存本地，联网后自动补发
 * - error：服务端拒绝或不可达，改动保留并提供重试
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error'

/** updateResumeData 的撤销合并选项，语义与 reactive-resume 一致。 */
export interface UpdateResumeDataOptions {
  /**
   * 标识正在编辑的字段。同一字段一秒内的连续编辑合并为一个撤销步骤，
   * 输入一整句话可以一次撤销。
   */
  coalesceKey?: string
  /** 强制开启新步骤（增删条目等结构性操作）。 */
  newStep?: boolean
  /** 只要上一步同 key 就并入当前步骤，无论间隔多久。 */
  sameStep?: boolean
}
