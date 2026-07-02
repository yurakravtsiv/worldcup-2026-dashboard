import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'

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

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
