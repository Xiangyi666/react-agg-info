import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import MenuTree from './components/layout/MenuTree'
import meun from './config/meun'
export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1">
        <MenuTree items={meun} />
        {/* 内容区：flex-1 吃掉 MenuTree 之外的剩余宽度，min-w-0 允许内部宽内容收缩不撑破布局。
            ErrorBoundary/Outlet 都不产生包裹 DOM，页面根节点直接成为本 div 的块级子元素从而填满宽度。 */}
        <div className="min-w-0 flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  )
}
