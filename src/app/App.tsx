import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">WC 2026</h1>
            <p className="text-sm text-muted-foreground">React + TypeScript + Vite + shadcn/ui</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Theme ready</CardTitle>
              <Badge variant="secondary">light / dark</Badge>
            </div>
            <CardDescription>
              Tailwind CSS and shadcn/ui are configured with CSS variable theming.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use the toggle in the header to switch themes. Preference is saved in localStorage.
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
