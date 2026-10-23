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
    initChat: (state) => {
      state.messages = []
    },
    fullfillMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload
    },
  },
})

export const { pushMessage } = chatSlice.actions
export default chatSlice.reducer