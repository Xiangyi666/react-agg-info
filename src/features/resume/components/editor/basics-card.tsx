import type { Basics } from '../../types'
import { useResumeData, useUpdateResumeData } from '../../hooks'
import { TextField, WebsiteField } from './fields'
import { cn } from '@/lib/utils'

/**
 * 基本信息卡片：姓名、一句话头衔、联系方式、个人网站。
 * 对应 reactive-resume write/basics-card.tsx（照片上传与自定义字段
 * 依赖服务端能力，这里暂不提供编辑 UI，类型已保留兼容）。
 */
export function BasicsCard() {
  const data = useResumeData()
  const updateResumeData = useUpdateResumeData()

  if (!data) return null

  const basics: Basics = data.basics

  /** basics 字段写入，字段名参与撤销合并。 */
  const write = (field: keyof Basics, value: unknown) => {
    updateResumeData(
      (draft) => {
        ;(draft.basics[field] as unknown) = value
      },
      { coalesceKey: `basics:${field}` },
    )
  }

  return (
    <section className={cn('rounded-xl border bg-card p-3')}>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">基本信息</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        <TextField
          label="姓名"
          value={basics.name}
          placeholder="张三"
          onChange={(value) => write('name', value)}
        />
        <TextField
          label="头衔"
          value={basics.headline}
          placeholder="前端工程师 · React"
          onChange={(value) => write('headline', value)}
        />
        <TextField
          label="邮箱"
          type="email"
          value={basics.email}
          placeholder="name@example.com"
          onChange={(value) => write('email', value)}
        />
        <TextField
          label="电话"
          value={basics.phone}
          placeholder="+86 138 0000 0000"
          onChange={(value) => write('phone', value)}
        />
        <TextField
          label="所在地"
          value={basics.location}
          placeholder="上海"
          wide
          onChange={(value) => write('location', value)}
        />
        <WebsiteField
          value={basics.website}
          onChange={(value) => write('website', value)}
        />
      </div>
    </section>
  )
}
