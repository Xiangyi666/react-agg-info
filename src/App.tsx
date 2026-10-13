import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
