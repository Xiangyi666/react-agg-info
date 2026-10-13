import { useCallback, useEffect } from 'react'
import type { Entry, Resume, ResumeData, SaveStatus, UpdateResumeDataOptions } from './types'
import { mergeResumeMetadata, setSaveStatus, updateResumeData } from './resumeSlice'
import { cleanupSaveRuntime, retrySave, setupSaveRuntime } from './save-runtime'
import { findEntry } from './model'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { store } from '@/store'

/**
 * 编辑器组件用的 React hooks，对应 reactive-resume draft.ts 里导出的
 * useUpdateResumeData / useEntryWriter / useResumeCleanup 一族。
 */

/** 当前简历信封（可能为 null，页面初始化前不该渲染编辑器）。 */
export const useCurrentResume = (): Resume | null => useAppSelector((state) => state.resume.resume)

/** 简历 JSON（data 字段），组件按需做更细的选择以减少重渲染。 */
export const useResumeData = (): ResumeData | undefined =>
  useAppSelector((state) => state.resume.resume?.data)

export const useSaveStatus = (): SaveStatus => useAppSelector((state) => state.resume.saveStatus)

export const useCanUndo = () => useAppSelector((state) => state.resume.canUndo)

export const useCanRedo = () => useAppSelector((state) => state.resume.canRedo)

/**
 * 核心编辑入口的 dispatch 封装。coalesceKey 标识正在编辑的字段，
 * 让一句话的连续输入合并为一次撤销；结构性操作传 newStep: true。
 */
export function useUpdateResumeData() {
  const dispatch = useAppDispatch()

  return useCallback(
    (fn: (draft: ResumeData) => void, options?: UpdateResumeDataOptions) => {
      dispatch(updateResumeData({ fn, ...options }))
    },
    [dispatch],
  )
}

/** 选中某个分区下的一个条目；条目被删除后返回 null。 */
export function useEntry(sectionId: string, entryId: string): Entry | null {
  return useAppSelector((state) => {
    const data = state.resume.resume?.data
    if (!data) return null
    return findEntry(data, sectionId, entryId) ?? null
  })
}

export type EntryWriter = (key: string, mutate: (entry: Record<string, unknown>) => void) => void

/**
 * 写一个条目的某个字段：key 参与撤销合并，同一字段打字一次撤销，
 * 换字段自动开启新步骤。
 */
export function useEntryWriter(sectionId: string, entryId: string): EntryWriter {
  const dispatch = useAppDispatch()

  return useCallback(
    (key, mutate) => {
      dispatch(
        updateResumeData({
          fn: (draft) => {
            const entry = findEntry(draft, sectionId, entryId)
            if (entry) mutate(entry as Record<string, unknown>)
          },
          coalesceKey: `${entryId}:${key}`,
        }),
      )
    },
    [dispatch, sectionId, entryId],
  )
}

/**
 * 编辑器页面的保存运行时生命周期：挂载时注入 Redux 回调，
 * 卸载时清理监听并兜底保存防抖窗口里的改动。
 */
export function useSaveRuntime(resumeId: string) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    setupSaveRuntime(resumeId, {
      // 直接读 store 而不是 hook 闭包，回调执行时永远拿到最新草稿
      getResume: () => store.getState().resume.resume,
      onStatusChange: (status) => dispatch(setSaveStatus(status)),
      onMetadataMerged: (resume) => dispatch(mergeResumeMetadata(resume)),
    })

    return () => {
      cleanupSaveRuntime(resumeId)
    }
  }, [dispatch, resumeId])
}

/** "未保存 · 重试"：带着当前草稿立即重发。 */
export function useRetrySave() {
  const dispatch = useAppDispatch()

  return useCallback(() => {
    const resume = store.getState().resume.resume
    if (!resume) return
    dispatch(setSaveStatus('saving'))
    retrySave(resume)
  }, [dispatch])
}
