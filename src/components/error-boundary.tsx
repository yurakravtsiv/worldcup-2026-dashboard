import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // В реальному проєкті тут був би виклик сервісу логування помилок (Sentry тощо).
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

type ErrorFallbackProps = {
  title?: string
  error: Error
  reset: () => void
}

export function SectionErrorFallback({
  title = 'Something went wrong',
  error,
  reset,
}: ErrorFallbackProps) {
  return <DefaultErrorFallback title={title} error={error} reset={reset} compact />
}

function DefaultErrorFallback({
  title = 'Something went wrong',
  error,
  reset,
  compact = false,
}: ErrorFallbackProps & { compact?: boolean }) {
  return (
    <div
      role="alert"
      className={
        compact
          ? 'flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-center'
          : 'mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center'
      }
    >
      <p className={compact ? 'text-sm font-semibold' : 'text-lg font-semibold'}>{title}</p>
      <p className="text-sm text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try again, or reload the
        page.
      </p>
      {import.meta.env.DEV ? (
        <pre className="max-w-full overflow-auto rounded bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      ) : null}
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    </div>
  )
}
