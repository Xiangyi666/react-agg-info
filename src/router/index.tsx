import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import App from '@/App'
import generatedRoutes from '~react-pages'

// 路由级最后兜底：App 布局自身出错、或 loader/action 抛错时渲染，不白屏
function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : String(error)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
      <p className="text-base font-medium text-gray-800">页面出错了</p>
      <p className="max-w-md text-sm text-gray-500">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
      >
        刷新页面
      </button>
    </div>
  )
}

// 将自动生成的页面路由嵌套在 App 布局下
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: generatedRoutes,
  },
]

export const router = createBrowserRouter(routes)
