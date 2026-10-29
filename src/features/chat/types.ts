export interface ChatMessage {
  id: string
  content: string
  role: string
  status: 'success' | 'pending' | 'error'
}
