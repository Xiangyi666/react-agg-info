import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ChatMessage } from './types'

interface ChatState {
  messages: ChatMessage[]
}

const initialState: ChatState = {
  messages: [],
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    pushMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload)
    },
    refreshMessage: (state, action: PayloadAction<ChatMessage>) => {
      const id = action.payload.id
      const status = action.payload.status
      const existingMessage = state.messages.find((message) => message.id === id)
      if(existingMessage) {
        existingMessage.content = action.payload.content
        existingMessage.status = status
        return
      }
    },
    initChat: (state) => {
      state.messages = []
    },
    fullfillMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload
    },
  },
})

export const { pushMessage, refreshMessage, initChat, fullfillMessages } = chatSlice.actions
export default chatSlice.reducer