import type { ReactNode } from 'react'
import type { CustomSectionType, RoleItem } from '../types'
import { generateId } from '../utils'
import { KeywordsField, LevelField, TextAreaField, TextField, WebsiteField } from './fields'
import { Button } from '@/components/ui/button'

/**
 * 每种条目类型对应的字段集，移植自 reactive-resume write/entries.tsx 的 EntryFields。
 * 字段顺序即表单顺序；首字段 autoFocus 让新草稿直接可以打字。
 * 与源项目的差异：描述用多行文本（项目没有富文本编辑器），
 * roles 保留最简编辑（增删 + 职位/时间/描述）。
 */

/** 条目读写基础 props：type 只由 EntryFields 自己消费。 */
interface EntryWriteProps {
  entry: Record<string, unknown>
  /** 写入器：key 参与撤销合并。 */
  write: (key: string, mutate: (entry: Record<string, unknown>) => void) => void
}

export interface EntryFieldSetProps extends EntryWriteProps {
  type: CustomSectionType
  autoFocus?: boolean
}

const str = (value: unknown) => (typeof value === 'string' ? value : '')

/** 绑定到单个字符串字段的小写器。 */
function text(props: EntryWriteProps, field: string, label: ReactNode, wide?: boolean, autoFocus?: boolean) {
  const { entry, write } = props
  return (
    <TextField
      key={field}
      label={label}
      wide={wide}
      autoFocus={autoFocus}
      value={str(entry[field])}
      onChange={(value) =>
        write(field, (target) => {
          target[field] = value
        })
      }
    />
  )
}

/** experience 的多角色子列表：展示职业晋升轨迹。 */
function Roles({ entry, write }: EntryWriteProps) {
  const roles = (Array.isArray(entry.roles) ? entry.roles : []) as RoleItem[]

  const writeRoles = (key: string, mutate: (roles: RoleItem[]) => void) =>
    write(`roles:${key}`, (target) => {
      mutate(target.roles as RoleItem[])
    })

  return (
    <div className="col-span-full grid gap-3">
      {roles.map((role, index) => (
        <div key={role.id} className="rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground">角色 {index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                writeRoles(`remove-${role.id}`, (list) => {
                  list.splice(index, 1)
                })
              }
            >
              删除
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="职位"
              value={role.position}
              onChange={(value) =>
                writeRoles(`${role.id}:position`, (list) => {
                  const target = list[index]
                  if (target) target.position = value
                })
              }
            />
            <TextField
              label="时间"
              value={role.period}
              placeholder="如 2023.01 - 2024.06"
              onChange={(value) =>
                writeRoles(`${role.id}:period`, (list) => {
                  const target = list[index]
                  if (target) target.period = value
                })
              }
            />
            <TextAreaField
              label="描述"
              rows={3}
              value={role.description}
              onChange={(value) =>
                writeRoles(`${role.id}:description`, (list) => {
                  const target = list[index]
                  if (target) target.description = value
                })
              }
            />
          </div>
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        className="w-fit"
        onClick={() =>
          writeRoles('add', (list) => {
            list.push({ id: generateId(), position: '', period: '', description: '' })
          })
        }
      >
        添加角色
      </Button>
    </div>
  )
}

/** 按条目类型渲染全部编辑字段，外层是两列栅格。 */
export function EntryFields({ type, autoFocus = false, ...props }: EntryFieldSetProps) {
  switch (type) {
    case 'experience':
      return (
        <>
          {text(props, 'position', '职位', false, autoFocus)}
          {text(props, 'company', '公司')}
          {text(props, 'location', '地点', true)}
          {text(props, 'period', '时间', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
          <Roles {...props} />
        </>
      )
    case 'education':
      return (
        <>
          {text(props, 'school', '学校', true, autoFocus)}
          {text(props, 'degree', '学位')}
          {text(props, 'area', '专业')}
          {text(props, 'grade', '成绩')}
          {text(props, 'location', '地点')}
          {text(props, 'period', '时间', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'projects':
      return (
        <>
          {text(props, 'name', '项目名', true, autoFocus)}
          {text(props, 'period', '时间', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'skills':
      return (
        <>
          {text(props, 'name', '名称', false, autoFocus)}
          {text(props, 'proficiency', '熟练度')}
          <Keywords
            {...props}
            onChange={(keywords) =>
              props.write('keywords', (target) => {
                target.keywords = keywords
              })
            }
          />
          <Level
            {...props}
            onChange={(level) =>
              props.write('level', (target) => {
                target.level = level
              })
            }
          />
        </>
      )
    case 'languages':
      return (
        <>
          {text(props, 'language', '语言', false, autoFocus)}
          {text(props, 'fluency', '流利程度')}
          <Level
            {...props}
            onChange={(level) =>
              props.write('level', (target) => {
                target.level = level
              })
            }
          />
        </>
      )
    case 'interests':
      return (
        <>
          {text(props, 'name', '名称', true, autoFocus)}
          <Keywords
            {...props}
            onChange={(keywords) =>
              props.write('keywords', (target) => {
                target.keywords = keywords
              })
            }
          />
        </>
      )
    case 'awards':
      return (
        <>
          {text(props, 'title', '奖项名', false, autoFocus)}
          {text(props, 'awarder', '颁发机构')}
          {text(props, 'date', '日期', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'certifications':
      return (
        <>
          {text(props, 'title', '证书名', false, autoFocus)}
          {text(props, 'issuer', '颁发机构')}
          {text(props, 'date', '日期', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'publications':
      return (
        <>
          {text(props, 'title', '作品名', false, autoFocus)}
          {text(props, 'publisher', '发布平台')}
          {text(props, 'date', '日期', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'volunteer':
      return (
        <>
          {text(props, 'organization', '组织', false, autoFocus)}
          {text(props, 'location', '地点')}
          {text(props, 'period', '时间', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'references':
      return (
        <>
          {text(props, 'name', '姓名 / 备注', false, autoFocus)}
          {text(props, 'position', '职位')}
          {text(props, 'phone', '电话', true)}
          <WebsiteFieldWrapper {...props} allowInlineLink />
          <Description {...props} />
        </>
      )
    case 'profiles':
      return (
        <>
          {text(props, 'network', '平台', false, autoFocus)}
          {text(props, 'username', '用户名')}
          <WebsiteFieldWrapper {...props} allowInlineLink />
        </>
      )
    case 'summary':
      return <Description {...props} field="content" label="正文" />
    // cover-letter 不在简历编辑器里编辑（它是独立文档），留空
    case 'cover-letter':
      return null
  }
}

/** 链接字段包装：读写 entry.website。 */
function WebsiteFieldWrapper({ entry, write, allowInlineLink }: EntryWriteProps & { allowInlineLink?: boolean }) {
  const website = (entry.website ?? { url: '', label: '' }) as { url: string; label: string; inlineLink?: boolean }
  return (
    <WebsiteField
      value={website}
      allowInlineLink={allowInlineLink}
      onChange={(value) =>
        write('website', (target) => {
          target.website = value
        })
      }
    />
  )
}

/** 描述字段：多行文本。 */
function Description({ entry, write, field = 'description', label = '描述' }: EntryWriteProps & { field?: string; label?: string }) {
  return (
    <TextAreaField
      label={label}
      rows={4}
      value={str(entry[field])}
      onChange={(value) =>
        write(field, (target) => {
          target[field] = value
        })
      }
    />
  )
}

/** 关键词字段包装。 */
function Keywords({ entry, onChange }: EntryWriteProps & { onChange: (keywords: string[]) => void }) {
  const keywords = Array.isArray(entry.keywords) ? (entry.keywords as string[]) : []
  return <KeywordsField label="关键词" value={keywords} onChange={onChange} />
}

/** 熟练度字段包装。 */
function Level({ entry, onChange }: EntryWriteProps & { onChange: (level: number) => void }) {
  const level = Number(entry.level ?? 0)
  return <LevelField value={level} onChange={onChange} />
}
