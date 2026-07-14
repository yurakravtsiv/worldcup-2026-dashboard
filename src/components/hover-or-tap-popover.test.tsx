import { act, render, screen } from '@testing-library/react'
import { HoverOrTapPopover } from '@/components/hover-or-tap-popover'

vi.mock('@/hooks/useHoverCapability', () => ({
  useHoverCapability: () => true,
}))

describe('HoverOrTapPopover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens on keyboard focus and closes on blur on hover-capable devices', () => {
    render(
      <HoverOrTapPopover trigger="Trigger text">
        <p>Popover content</p>
      </HoverOrTapPopover>,
    )

    const trigger = screen.getByRole('button', { name: 'Trigger text' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument()

    act(() => {
      trigger.focus()
    })

    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Popover content')).toBeInTheDocument()

    act(() => {
      trigger.blur()
    })

    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
  })
})
