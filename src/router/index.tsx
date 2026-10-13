import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import App from '@/App'
import generatedRoutes from '~react-pages'

// 将自动生成的页面路由嵌套在 App 布局下
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: generatedRoutes,
  },
]

export const router = createBrowserRouter(routes)
