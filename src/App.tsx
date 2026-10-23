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
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
