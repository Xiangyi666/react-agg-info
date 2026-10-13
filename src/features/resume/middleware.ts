import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { applyHistoryStep, updateResumeData } from './resumeSlice'
import { scheduleSave } from './save-runtime'

/**
 * 保存调度中间件：编辑/撤销/重做发生后，用 finalize 后的 state 调度自动保存。
 * 不能在 reducer 里做这件事——reducer 里的 resume 是 immer 草稿，
 * reducer 结束后草稿被 revoke，防抖 500ms 后再访问会直接崩溃。
 */
export const resumeSaveMiddleware = createListenerMiddleware()

resumeSaveMiddleware.startListening({
  matcher: isAnyOf(updateResumeData, applyHistoryStep),
  effect: (_action, listenerApi) => {
    const resume = (listenerApi.getState() as RootState).resume.resume
    if (resume) scheduleSave(resume)
  },
})
