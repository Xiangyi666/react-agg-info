import type { ReactNode } from 'react'
import type { Website } from '../../types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * 面板内的共享表单原语。项目里没有独立 textarea/滑杆/chip 组件，
 * 这里用原生元素 + Tailwind 实现，不引入新依赖。
 * 所有字段都是受控组件，由调用方（EntryWriter/分区级 writer）落库。
 */

interface FieldShellProps {
  label: ReactNode
  /** 跨满两列栅格（父级 grid grid-cols-2）。 */
  wide?: boolean
  children: ReactNode
}

function FieldShell({ label, wide, children }: FieldShellProps) {
  return (
    <div className={wide ? 'col-span-full grid gap-1.5' : 'grid content-start gap-1.5'}>
      <Label className="text-[13px] leading-4 font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

interface TextFieldProps {
  label: ReactNode
  value: string
  onChange: (value: string) => void
  wide?: boolean
  autoFocus?: boolean
  placeholder?: string
  type?: string
}

/** 单行文本字段。 */
export function TextField({ label, value, onChange, wide, autoFocus, placeholder, type }: TextFieldProps) {
  return (
    <FieldShell label={label} wide={wide}>
      <Input
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  )
}

interface TextAreaFieldProps {
  label: ReactNode
  value: string
  onChange: (value: string) => void
  /** 行数。 */
  rows?: number
  placeholder?: string
}

/** 多行文本字段，用于描述/正文。支持换行，预览按 pre-line 渲染。 */
export function TextAreaField({ label, value, onChange, rows = 4, placeholder }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} wide>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      />
    </FieldShell>
  )
}

interface WebsiteFieldProps {
  /** 条目链接支持"显示在标题上"；basics 网站不需要。 */
  value: Website & { inlineLink?: boolean }
  onChange: (value: Website & { inlineLink?: boolean }) => void
  allowInlineLink?: boolean
}

/** 链接字段：url + 显示文本。 */
export function WebsiteField({ value, onChange, allowInlineLink = false }: WebsiteFieldProps) {
  return (
    <div className="col-span-full grid grid-cols-2 gap-2">
      <FieldShell label="链接">
        <Input
          value={value.url}
          placeholder="https://example.com"
          onChange={(event) => onChange({ ...value, url: event.target.value })}
        />
      </FieldShell>
      <FieldShell label="显示文本">
        <Input
          value={value.label}
          placeholder="留空显示链接本身"
          onChange={(event) => onChange({ ...value, label: event.target.value })}
        />
      </FieldShell>
      {allowInlineLink && (
        <label className="col-span-full flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={value.inlineLink ?? false}
            onChange={(event) => onChange({ ...value, inlineLink: event.target.checked })}
            className="accent-brand size-4"
          />
          链接显示在标题上
        </label>
      )}
    </div>
  )
}

interface KeywordsFieldProps {
  label: ReactNode
  value: string[]
  onChange: (keywords: string[]) => void
}

/** 关键词字段：逗号分隔输入，存储为数组。 */
export function KeywordsField({ label, value, onChange }: KeywordsFieldProps) {
  return (
    <FieldShell label={label} wide>
      <Input
        value={value.join(', ')}
        placeholder="用逗号分隔，如：React, Vite"
        onChange={(event) =>
          onChange(
            event.target.value
              .split(/[,，]/)
              .map((keyword) => keyword.trim())
              .filter(Boolean),
          )
        }
      />
    </FieldShell>
  )
}

interface LevelFieldProps {
  value: number
  onChange: (level: number) => void
}

/** 0-5 熟练度，0 表示在简历上隐藏。 */
export function LevelField({ value, onChange }: LevelFieldProps) {
  return (
    <FieldShell label="水平" wide>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="accent-brand flex-1"
        />
        <span className="text-muted-foreground w-14 text-right text-sm">{value === 0 ? '隐藏' : `${value} / 5`}</span>
      </div>
    </FieldShell>
  )
}
