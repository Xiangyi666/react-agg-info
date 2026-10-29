import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthResponse } from './authApi'

interface AuthState {
  user: AuthResponse['user'] | null
  token: string | null
}

/**
 * 单机部署：不做真实鉴权，应用启动即视为已登录（死账号）。
 * 接真实后端时改回 { user: null, token: null }，由 LoginForm 走 /auth/login。
 */
const initialState: AuthState = {
  user: { id: 'demo_user_xy', name: 'Demo User_xy', email: 'demo@example.com' },
  token: 'fake-token',
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
