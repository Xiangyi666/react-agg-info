import type { ChatMessage } from '../types'
import { http } from '@/services/api'

const getMessageHistory = async (userId: string, signal?: AbortSignal): Promise<ChatMessage[]> => {
  const res = await http.get<ChatMessage[]>(`/chat-history/${userId}`, {
    signal,
  })
  // 后端返回结构不符合预期时兜底为空数组，避免 undefined 流入渲染导致整树崩溃
  return res
}

export { getMessageHistory }
