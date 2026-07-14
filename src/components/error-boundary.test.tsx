import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/components/error-boundary'

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows fallback UI when a child throws and recovers after Try again', async () => {
    let shouldThrow = true

    function MaybeThrow() {
      if (shouldThrow) {
        throw new Error('test error')
      }

      return <p>Recovered content</p>
    }

    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText('Recovered content')).not.toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByText('Recovered content')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})
