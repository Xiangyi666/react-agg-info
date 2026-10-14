import { useParams } from 'react-router-dom'
import { ResumeEditor } from '@/features/resume/edit'

/** /resume/:resumeId — 简历编辑器页面，实际逻辑都在 features/resume 里。 */
export default function ResumeEditPage() {
  const { resumeId } = useParams<{ resumeId: string }>()

  if (!resumeId) {
    return <p className="text-muted-foreground py-16 text-center text-sm">MISS ID</p>
  }

  return <ResumeEditor resumeId={resumeId} />
}
