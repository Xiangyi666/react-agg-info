import type { ResumeData } from '../../types'
import { PT_TO_PX } from './units'

/** 页眉：姓名 + 头衔 + 联系方式一行。 */
export function PageHeader({ data }: { data: ResumeData }) {
  const { basics, picture } = data
  const contacts = [basics.email, basics.phone, basics.location, basics.website.label || basics.website.url].filter(
    Boolean,
  )

  return (
    <header className="flex items-center gap-4">
      {!picture.hidden && picture.url && (
        <img
          src={picture.url}
          alt={`${basics.name}的照片`}
          className="object-cover"
          style={{
            width: picture.size * PT_TO_PX,
            height: picture.size * PT_TO_PX,
            borderRadius: `${picture.borderRadius * PT_TO_PX}px`,
            transform: `rotate(${picture.rotation}deg)`,
          }}
        />
      )}
      <div className="min-w-0 flex-1">
        <h1
          className="leading-tight font-bold"
          style={{
            fontFamily: `${data.metadata.typography.heading.fontFamily}, sans-serif`,
            fontSize: `${data.metadata.typography.heading.fontSize * PT_TO_PX}px`,
          }}
        >
          {basics.name}
        </h1>
        {basics.headline && (
          <p className="text-[1.05em] font-medium" style={{ color: data.metadata.design.colors.primary }}>
            {basics.headline}
          </p>
        )}
        {contacts.length > 0 && <p className="text-[0.9em] opacity-80">{contacts.join(' · ')}</p>}
        {basics.customFields.length > 0 && (
          <p className="text-[0.9em] opacity-80">
            {basics.customFields
              .filter((field) => field.text)
              .map((field) => field.text)
              .join(' · ')}
          </p>
        )}
      </div>
    </header>
  )
}
