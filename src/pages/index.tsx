import { Navigate } from 'react-router-dom'

/** 根路径重定向到主搜索页。鉴权是死的，写在 authSlice 的 initialState。 */
export default function HomePage() {
  return <Navigate to="/mainSearch" replace />
}
