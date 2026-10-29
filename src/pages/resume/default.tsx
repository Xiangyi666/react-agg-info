import { ResumeEditor } from '@/features/resume/edit'
import { useAppSelector } from '@/hooks/redux'
/** /resume/:resumeId — 简历编辑器页面，实际逻辑都在 features/resume 里。 */
export default function DefaultResume() {
  const user = useAppSelector(state => state.auth.user)
  if (!user?.id) {
    return <p className="text-muted-foreground py-16 text-center text-sm">MISS ID</p>
  }

  return <ResumeEditor userId={user.id} />
}
