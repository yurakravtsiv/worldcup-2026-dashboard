import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useHoverCapability } from '@/hooks/useHoverCapability'
import { cn } from '@/lib/utils'

const OPEN_DELAY_MS = 150
const CLOSE_DELAY_MS = 150

type HoverOrTapPopoverProps = {
  trigger: ReactNode
  children: ReactNode
  className?: string
}

export function HoverOrTapPopover({
  trigger,
  children,
  className,
}: HoverOrTapPopoverProps) {
  const canHover = useHoverCapability()
  const [open, setOpen] = useState(false)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const scheduleOpen = () => {
    clearTimers()
    openTimeoutRef.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
  }

  const scheduleClose = () => {
    clearTimers()
    closeTimeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleTriggerClick = () => {
    if (!canHover) {
      setOpen((previous) => !previous)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!canHover || !nextOpen) {
      setOpen(nextOpen)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            'inline-flex max-w-full cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 text-left text-inherit',
            'underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          )}
          onClick={handleTriggerClick}
          onMouseEnter={canHover ? scheduleOpen : undefined}
          onMouseLeave={canHover ? scheduleClose : undefined}
        >
          {trigger}
        </button>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        collisionPadding={8}
        className={className}
        onMouseEnter={canHover ? cancelClose : undefined}
        onMouseLeave={canHover ? scheduleClose : undefined}
        onOpenAutoFocus={(event) => {
          if (canHover) {
            event.preventDefault()
          }
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
