import type { CustomSectionType } from './resume'

/**
 * 分区类型注册表：每种类型的全部知识收敛于此——中文标题、草稿判定主字段、
 * 编辑字段声明、展示标题与展示选项。加新类型 = 加一条注册项，
 * 编辑表单与预览渲染都不再出现类型 switch。
 */

/** 编辑表单字段的控件类型。 */
export type EditorFieldKind = 'text' | 'textarea' | 'website' | 'keywords' | 'level' | 'roles'

/** 单个编辑字段声明：key 指向条目字段，kind 决定控件（默认 text）。 */
export interface EditorFieldSpec {
  key: string
  label?: string
  kind?: EditorFieldKind
  /** 占满两列（外层是两列栅格）。 */
  wide?: boolean
  /** 新草稿展开时自动聚焦（每个类型标记在第一个字段上）。 */
  autoFocus?: boolean
}

/** 展示标题的字段引用：单个字段，或候选列表（依次取第一个非空）。 */
export type FieldRef = string | readonly string[]

/** 展示标题行：[主字段, 副字段?]。 */
export type EntryTitleSpec = readonly [FieldRef, FieldRef?]

/** 每种分区类型的全部知识。 */
export interface SectionTypeDefinition {
  /** 分区中文标题（大纲与预览共用）。 */
  label: string
  /** 草稿判定主字段；没有主字段的类型（summary 等）缺省。 */
  primaryField?: string
  /** 编辑面板字段声明，顺序即表单顺序。 */
  editorFields: readonly EditorFieldSpec[]
  /** 展示标题字段引用；缺省表示不在预览渲染条目（summary / cover-letter）。 */
  entryTitle?: EntryTitleSpec
  /** 展示选项。 */
  display?: {
    /** 关键词分隔符，默认 ", "（skills 用 " · "）。 */
    keywordSeparator?: string
    /** 不渲染水平点（interests）。 */
    hideLevel?: boolean
  }
  /** 无编辑控件的初始化字段（icon 等），createEntry 时并入。 */
  initialFields?: Record<string, unknown>
}

export const SECTION_TYPES: Record<CustomSectionType, SectionTypeDefinition> = {
  summary: {
    label: '个人总结',
    editorFields: [{ key: 'content', label: '正文', kind: 'textarea' }],
  },
  profiles: {
    label: '社交主页',
    primaryField: 'network',
    editorFields: [
      { key: 'network', label: '平台', autoFocus: true },
      { key: 'username', label: '用户名' },
      { key: 'website', label: '链接', kind: 'website' },
    ],
    entryTitle: [['name', 'network'], 'username'],
    initialFields: { icon: '', iconColor: '' },
  },
  experience: {
    label: '工作经历',
    primaryField: 'company',
    editorFields: [
      { key: 'position', label: '职位', autoFocus: true },
      { key: 'company', label: '公司' },
      { key: 'location', label: '地点', wide: true },
      { key: 'period', label: '时间', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
      { key: 'roles', kind: 'roles' },
    ],
    entryTitle: ['position', 'company'],
  },
  education: {
    label: '教育背景',
    primaryField: 'school',
    editorFields: [
      { key: 'school', label: '学校', wide: true, autoFocus: true },
      { key: 'degree', label: '学位' },
      { key: 'area', label: '专业' },
      { key: 'grade', label: '成绩' },
      { key: 'location', label: '地点' },
      { key: 'period', label: '时间', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: ['degree', 'school'],
  },
  projects: {
    label: '项目经历',
    primaryField: 'name',
    editorFields: [
      { key: 'name', label: '项目名', wide: true, autoFocus: true },
      { key: 'period', label: '时间', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: [['name', 'network'], 'username'],
  },
  skills: {
    label: '专业技能',
    primaryField: 'name',
    editorFields: [
      { key: 'name', label: '名称', autoFocus: true },
      { key: 'proficiency', label: '熟练度' },
      { key: 'keywords', kind: 'keywords' },
      { key: 'level', kind: 'level' },
    ],
    entryTitle: [['name', 'network'], 'username'],
    display: { keywordSeparator: ' · ' },
    initialFields: { icon: '', iconColor: '' },
  },
  languages: {
    label: '语言能力',
    primaryField: 'language',
    editorFields: [
      { key: 'language', label: '语言', autoFocus: true },
      { key: 'fluency', label: '流利程度' },
      { key: 'level', kind: 'level' },
    ],
    entryTitle: ['language', 'fluency'],
  },
  interests: {
    label: '兴趣爱好',
    primaryField: 'name',
    editorFields: [
      { key: 'name', label: '名称', wide: true, autoFocus: true },
      { key: 'keywords', kind: 'keywords' },
    ],
    entryTitle: [['name', 'network'], 'username'],
    display: { hideLevel: true },
    initialFields: { icon: '', iconColor: '' },
  },
  awards: {
    label: '荣誉奖项',
    primaryField: 'title',
    editorFields: [
      { key: 'title', label: '奖项名', autoFocus: true },
      { key: 'awarder', label: '颁发机构' },
      { key: 'date', label: '日期', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: ['title', ['awarder', 'issuer', 'publisher']],
  },
  certifications: {
    label: '专业证书',
    primaryField: 'title',
    editorFields: [
      { key: 'title', label: '证书名', autoFocus: true },
      { key: 'issuer', label: '颁发机构' },
      { key: 'date', label: '日期', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: ['title', ['awarder', 'issuer', 'publisher']],
  },
  publications: {
    label: '发表作品',
    primaryField: 'title',
    editorFields: [
      { key: 'title', label: '作品名', autoFocus: true },
      { key: 'publisher', label: '发布平台' },
      { key: 'date', label: '日期', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: ['title', ['awarder', 'issuer', 'publisher']],
  },
  volunteer: {
    label: '志愿活动',
    primaryField: 'organization',
    editorFields: [
      { key: 'organization', label: '组织', autoFocus: true },
      { key: 'location', label: '地点' },
      { key: 'period', label: '时间', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: [['position', 'roleTitle'], 'organization'],
  },
  references: {
    label: '推荐人',
    primaryField: 'name',
    editorFields: [
      { key: 'name', label: '姓名 / 备注', autoFocus: true },
      { key: 'position', label: '职位' },
      { key: 'phone', label: '电话', wide: true },
      { key: 'website', label: '链接', kind: 'website' },
      { key: 'description', label: '描述', kind: 'textarea' },
    ],
    entryTitle: ['name', 'position'],
  },
  'cover-letter': {
    label: '求职信',
    editorFields: [],
    initialFields: { recipient: '', content: '' },
  },
}

/** 按类型查注册项；运行时数据可能带未知 type，此时返回 undefined。 */
export function getSectionTypeDefinition(type: string): SectionTypeDefinition | undefined {
  return (SECTION_TYPES as Record<string, SectionTypeDefinition | undefined>)[type]
}

/** 编辑字段的空白初始值，createEntry 按 kind 生成。 */
export function initialEntryValue(spec: EditorFieldSpec): unknown {
  switch (spec.kind) {
    case 'website':
      return { url: '', label: '', inlineLink: false }
    case 'keywords':
    case 'roles':
      return []
    case 'level':
      return 0
    default:
      return ''
  }
}

/** 按字段引用读值：候选列表依次取第一个非空字符串。 */
function readFieldRef(values: Record<string, unknown>, ref: FieldRef | undefined): string {
  if (!ref) return ''
  for (const key of typeof ref === 'string' ? [ref] : ref) {
    const value = values[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

/** 展示标题行：[主标题, 副标题]；缺省 spec 时两者皆空。 */
export function readEntryTitle(
  values: Record<string, unknown>,
  spec: EntryTitleSpec | undefined,
): [string, string] {
  return [readFieldRef(values, spec?.[0]), readFieldRef(values, spec?.[1])]
}
