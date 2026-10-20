import { BasicsCard } from './basics-card'
import { Outline } from './outline'
import { useResumeData } from '../../hooks'
import { getOutlineRows } from '../../model'

/**
 * Write 面板：基本信息 + 按打印顺序的分区大纲 + 添加分区。
 * 对应 reactive-resume write/write-panel.tsx（去掉了导入提示/锁定态，
 * 那些依赖导入与锁定服务端接口）。所有字段随打随存。
 */
export function WritePanel() {
  const data = useResumeData()
  const isEmpty = data ? getOutlineRows(data).length === 0 : false

  return (
    <div className="grid gap-4 p-4">
      <BasicsCard />

      <div>
        {/* <p className="text-muted-foreground mb-1.5 flex items-baseline justify-between px-1 text-[11px] font-semibold tracking-[0.08em] uppercase">
          <span>分区 · 按打印顺序</span>
          <span className="font-normal tracking-normal normal-case">上下移动排序</span>
        </p> */}
        {isEmpty ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
           点击下方"添加分区"开始编辑
          </p>
        ) : (
          <Outline />
        )}
      </div>

      <p className="text-muted-foreground px-1 text-xs leading-4">
        隐藏的分区保留内容但不出现在简历上。所有修改自动保存。
      </p>
    </div>
  )
}
