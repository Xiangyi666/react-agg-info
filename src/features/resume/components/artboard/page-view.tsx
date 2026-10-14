import type { ResumeData } from '../../types'
import { PageHeader } from './page-header'
import { SectionView } from './section-view'
import { PT_TO_PX } from './units'

interface PageViewProps {
  data: ResumeData
  page: ResumeData['metadata']['layout']['pages'][number]
}

/** 一页：纸张骨架（尺寸/边距/字号）+ 主栏与侧栏两列（fullWidth 或侧栏为空时单列）。 */
export function PageView({ data, page }: PageViewProps) {
  const {
    design: { colors },
    typography,
    page: pageSettings,
  } = data.metadata
  const hasSidebar = !page.fullWidth && page.sidebar.length > 0
  const sidebarWidth = hasSidebar ? data.metadata.layout.sidebarWidth : 0

  return (
    <div
      className="shadow-xl"
      style={{
        width: '1000px',
        minHeight: '1123px',
        backgroundColor: colors.background,
        color: colors.text,
        paddingTop: pageSettings.marginY * PT_TO_PX,
        paddingBottom: pageSettings.marginY * PT_TO_PX,
        paddingLeft: pageSettings.marginX * PT_TO_PX,
        paddingRight: pageSettings.marginX * PT_TO_PX,
        fontFamily: `${typography.body.fontFamily}, serif`,
        fontSize: typography.body.fontSize * PT_TO_PX,
        lineHeight: typography.body.lineHeight,
      }}
    >
      <PageHeader data={data} />

      <div
        className="mt-3 flex gap-4"
        style={{ columnGap: pageSettings.gapX * PT_TO_PX, rowGap: pageSettings.gapY * PT_TO_PX }}
      >
        <div className="min-w-0 flex-1 space-y-4">
          {page.main.map((id) => (
            <SectionView key={id} data={data} sectionId={id} primaryColor={colors.primary} />
          ))}
        </div>
        {hasSidebar && (
          <div className="space-y-4" style={{ width: `${sidebarWidth}%` }}>
            {page.sidebar.map((id) => (
              <SectionView key={id} data={data} sectionId={id} primaryColor={colors.primary} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
