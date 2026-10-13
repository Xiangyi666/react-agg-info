import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-foreground hover:text-foreground/80 font-semibold transition-colors"
        >
          react-info-agg
        </Link>
        <nav className="text-muted-foreground flex items-center gap-4 text-sm">
          <Link
            to="/mainSearch"
            className="hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  )
}
