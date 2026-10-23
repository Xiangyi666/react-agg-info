import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '@/features/counter/counterSlice'
import authReducer from '@/features/auth/authSlice'
import resumeReducer from '@/features/resume/resumeSlice'
import chatReducer from '@/features/chat/chatSlice'
import { resumeSaveMiddleware } from '@/features/resume/middleware'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    resume: resumeReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(resumeSaveMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
