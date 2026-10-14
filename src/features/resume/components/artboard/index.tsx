import { useResumeData } from '../../hooks'
import { PageView } from './page-view'

/**
 * 简历预览画板。reactive-resume 的 Artboard 用 packages/pdf 的模板引擎渲染
 * 真实 PDF；本项目用纯 HTML/Tailwind 按 ResumeData 渲染，消费同一份 store JSON，
 * 保证"所见即数据"。A4 按浏览器 96dpi ≈ 794×1123px，pt→px 系数 4/3。
 *
 * 拆分说明：page-view / page-header 是纸张骨架与页眉（模板定制的主要替换点），
 * section-view / entry-view 是分区与条目的渲染，rich-text 为两者共用。
 */

interface ArtboardProps {
  /** 缩放比例，编辑器宽度有限默认缩一点。 */
  scale?: number
}

/** 预览画板：逐页渲染 store 里的 ResumeData。 */
export function Artboard({ scale = 1 }: ArtboardProps) {
  const data = useResumeData()

  if (!data) return null

  function PageIndex({pageNumber, pageLength} : {pageNumber: number, pageLength: number}) {
    if(pageLength == null || pageLength <= 1) return null
    return (
      <div className="text-muted-foreground absolute translate-y-[4px] left-1/2 -translate-x-1/2 text-[10px]">
        第 {pageNumber + 1} / {pageLength} 页
      </div>
    )
  }
  return (
    <div className="grid origin-top place-items-center gap-6" style={{ transform: `scale(${scale})` }}>
      {data.metadata.layout.pages.map((page, index) => (
        <div key={index} className="relative">
          <PageView data={data} page={page} />
          <PageIndex pageNumber={index} pageLength={data.metadata.layout.pages.length} />
        </div>
      ))}
    </div>
  )
}
