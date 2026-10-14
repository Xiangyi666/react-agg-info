/** 描述/正文：HTML 字符串直接渲染，纯文本按换行渲染。EntryView 与 SectionView 共用。 */
export function RichText({ value }: { value: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(value)
  if (isHtml) {
    return (
      <div
        className="text-[0.95em] leading-relaxed [&_ul]:list-disc [&_ul]:pl-4"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    )
  }
  return <p className="text-[0.95em] leading-relaxed whitespace-pre-line">{value}</p>
}
