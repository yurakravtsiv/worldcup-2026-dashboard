import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StandingsTable } from '@/features/standings/StandingsTable'
import type { Standing } from '@/types/football'

const standings: Standing[] = [
  {
    position: 1,
    teamName: 'Alpha',
    played: 2,
    won: 2,
    drawn: 0,
    lost: 0,
    goalsFor: 5,
    goalsAgainst: 1,
    goalDifference: 4,
    points: 6,
  },
  {
    position: 2,
    teamName: 'Beta',
    played: 2,
    won: 1,
    drawn: 0,
    lost: 1,
    goalsFor: 3,
    goalsAgainst: 3,
    goalDifference: 0,
    points: 3,
  },
  {
    position: 3,
    teamName: 'Gamma',
    played: 2,
    won: 0,
    drawn: 0,
    lost: 2,
    goalsFor: 1,
    goalsAgainst: 5,
    goalDifference: -4,
    points: 0,
  },
]

describe('StandingsTable', () => {
  it('renders standings data', () => {
    render(
      <StandingsTable
        standings={standings}
        sortBy="points"
        sortDirection="desc"
        onSortChange={() => undefined}
      />,
    )

    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Beta').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Gamma').length).toBeGreaterThan(0)
    expect(screen.getAllByText('6').length).toBeGreaterThan(0)
  })

  it('calls onSortChange when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    render(
      <StandingsTable
        standings={standings}
        sortBy="points"
        sortDirection="desc"
        onSortChange={onSortChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /sort by team/i }))

    expect(onSortChange).toHaveBeenCalledTimes(1)
    expect(onSortChange).toHaveBeenCalledWith('name')
  })

  it('sorts rows by the active column when sort props change', () => {
    const { rerender } = render(
      <StandingsTable
        standings={standings}
        sortBy="points"
        sortDirection="desc"
        onSortChange={() => undefined}
      />,
    )

    let rows = screen.getAllByText('Alpha')
    expect(rows.length).toBeGreaterThan(0)

    rerender(
      <StandingsTable
        standings={standings}
        sortBy="name"
        sortDirection="asc"
        onSortChange={() => undefined}
      />,
    )

    const desktopRows = screen.getAllByRole('row').slice(1)
    expect(desktopRows[0]).toHaveTextContent('Alpha')
    expect(desktopRows.at(-1)).toHaveTextContent('Gamma')
  })
})
