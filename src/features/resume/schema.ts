import type { CustomSectionType, Entry, ResumeData } from './types'
import { clone, generateId, isPlainObject } from './utils'

/** 空白条目的公共底座。 */
const emptyWebsite = () => ({ url: '', label: '', inlineLink: false })

/** 内置分区的默认骨架（12 个分区共用），移植自 reactive-resume default.ts。 */
const section = () => ({
  title: '',
  icon: '',
  columns: 1,
  hidden: false,
  showHeading: true,
  keepTogether: false,
  startOnNewPage: false,
  items: [] as never[],
})

/**
 * 新简历的完整默认数据。所有字段都在，保证编辑器和预览
 * 在服务端只返回部分数据时也不会拿到 undefined。
 */
export const defaultResumeData: ResumeData = {
  picture: {
    hidden: false,
    fit: 'cover',
    url: '',
    size: 80,
    rotation: 0,
    aspectRatio: 1,
    borderRadius: 0,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 0,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowWidth: 0,
  },
  basics: {
    name: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: { url: '', label: '' },
    customFields: [],
  },
  summary: {
    title: '',
    icon: 'article',
    columns: 1,
    hidden: false,
    showHeading: true,
    keepTogether: false,
    startOnNewPage: false,
    content: '',
  },
  sections: {
    profiles: section(),
    experience: section(),
    education: section(),
    projects: section(),
    skills: { ...section(), layout: 'default', keywordLayout: 'inline' },
    languages: section(),
    interests: section(),
    awards: section(),
    certifications: section(),
    publications: section(),
    volunteer: section(),
    references: section(),
  },
  customSections: [],
  metadata: {
    template: 'onyx',
    layout: {
      sidebarWidth: 35,
      pages: [
        {
          fullWidth: false,
          main: ['profiles', 'summary', 'education', 'experience', 'projects', 'volunteer', 'references'],
          sidebar: ['skills', 'certifications', 'awards', 'languages', 'interests', 'publications'],
        },
      ],
    },
    page: {
      gapX: 4,
      gapY: 6,
      marginX: 14,
      marginY: 12,
      format: 'a4',
      locale: 'en-US',
      dateFormat: 'short',
      hideLinkUnderline: false,
      hideIcons: false,
      hideSectionIcons: true,
    },
    design: {
      colors: {
        primary: 'rgba(220, 38, 38, 1)',
        text: 'rgba(0, 0, 0, 1)',
        background: 'rgba(255, 255, 255, 1)',
      },
      level: {
        icon: 'star',
        type: 'circle',
      },
    },
    typography: {
      body: {
        fontFamily: 'IBM Plex Serif',
        fontWeights: ['400', '500'],
        fontSize: 10,
        lineHeight: 1.5,
      },
      heading: {
        fontFamily: 'IBM Plex Serif',
        fontWeights: ['600'],
        fontSize: 14,
        lineHeight: 1.5,
      },
    },
    notes: '',
    styleRules: [],
  },
}

/**
 * 深合并：patch 的值覆盖 target，双方都是普通对象时递归；
 * 数组与原始值整体替换；patch 独有的字段直接拷贝（保留服务端的前向扩展字段）。
 */
function deepMerge(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }

  for (const [key, value] of Object.entries(patch)) {
    const existing = result[key]
    if (isPlainObject(value) && isPlainObject(existing)) {
      result[key] = deepMerge(existing, value)
    } else if (value !== undefined) {
      result[key] = value
    }
  }

  return result
}

/**
 * 归一化服务端返回的 resume.data：
 * 以默认数据为底座深合并，缺失字段补默认值，未知字段保留；
 * summary/sections/customSections 的 showHeading 补 true。
 * 任何非法输入都安全退回完整默认数据，编辑器永远拿到结构完整的 ResumeData。
 */
export function parseResumeData(input: unknown): ResumeData {
  const merged = isPlainObject(input)
    ? (deepMerge(clone(defaultResumeData) as unknown as Record<string, unknown>, input) as unknown as ResumeData)
    : clone(defaultResumeData)

  merged.summary.showHeading ??= true
  for (const section of Object.values(merged.sections)) section.showHeading ??= true
  for (const section of merged.customSections) section.showHeading ??= true

  return merged
}

/**
 * 按分区类型创建一个空白条目，"+ 添加条目"和新分区的首个草稿都用它。
 * 移植自 reactive-resume write/model.ts 的 createEntry（去掉结构化 dates）。
 */
export function createEntry(type: CustomSectionType): Entry {
  const base = { id: generateId(), hidden: false }

  const fields: Record<CustomSectionType, Record<string, unknown>> = {
    profiles: { icon: '', iconColor: '', network: '', username: '', website: emptyWebsite() },
    experience: {
      company: '',
      position: '',
      location: '',
      period: '',
      website: emptyWebsite(),
      description: '',
      roles: [],
    },
    education: {
      school: '',
      degree: '',
      area: '',
      grade: '',
      location: '',
      period: '',
      website: emptyWebsite(),
      description: '',
    },
    projects: { name: '', period: '', website: emptyWebsite(), description: '' },
    skills: { icon: '', iconColor: '', name: '', proficiency: '', level: 0, keywords: [] },
    languages: { language: '', fluency: '', level: 0 },
    interests: { icon: '', iconColor: '', name: '', keywords: [] },
    awards: { title: '', awarder: '', date: '', website: emptyWebsite(), description: '' },
    certifications: { title: '', issuer: '', date: '', website: emptyWebsite(), description: '' },
    publications: { title: '', publisher: '', date: '', website: emptyWebsite(), description: '' },
    volunteer: { organization: '', location: '', period: '', website: emptyWebsite(), description: '' },
    references: { name: '', position: '', website: emptyWebsite(), phone: '', description: '' },
    summary: { content: '' },
    'cover-letter': { recipient: '', content: '' },
  }

  return { ...base, ...fields[type] } as Entry
}
