import type { KeyboardEvent } from 'react'

export function activateOnEnterOrSpace(
  event: KeyboardEvent<HTMLElement>,
  action: () => void,
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    action()
  }
}

export const sortButtonClassName =
  'inline-flex items-center gap-1 rounded-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
