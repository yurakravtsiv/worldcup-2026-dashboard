import { NavLink, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xl font-semibold tracking-tight">WC 2026</p>
            <p className="text-sm text-muted-foreground">World Cup dashboard</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-5xl gap-1 px-4 py-2">
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
