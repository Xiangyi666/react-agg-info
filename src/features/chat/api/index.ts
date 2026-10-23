import type { resultData, ApiResponse } from '@/types'
import type { ChatMessage } from '../types'
import { http } from '@/services/api'

const getMessageHistory = async (userId: string, signal?: AbortSignal) => {
  const res = await http.get<ApiResponse<ChatMessage[]>>(`/chat-history/${userId}`, {
    signal,
  })
  return res
}

export { getMessageHistory }
