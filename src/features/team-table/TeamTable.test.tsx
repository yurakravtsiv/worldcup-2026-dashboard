import { useMemo, useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamTable, type TeamTableSortBy, type TeamTableSortDirection } from '@/features/team-table/TeamTable'
import type { AllTeamsTableRow } from '@/types/stats'

const sampleRows: AllTeamsTableRow[] = [
  {
    teamName: 'Zulu',
    winProbability: 80,
    isEliminated: false,
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    goalsFor: 8,
    goalsAgainst: 2,
    goalDifference: 6,
  },
  {
    teamName: 'Alpha',
    winProbability: 60,
    isEliminated: false,
    played: 3,
    won: 1,
    drawn: 1,
    lost: 1,
    goalsFor: 4,
    goalsAgainst: 4,
    goalDifference: 0,
  },
  {
    teamName: 'Mike',
    winProbability: 0,
    isEliminated: true,
    played: 3,
    won: 0,
    drawn: 0,
    lost: 3,
    goalsFor: 1,
    goalsAgainst: 7,
    goalDifference: -6,
  },
  {
    teamName: 'Echo',
    winProbability: 0,
    isEliminated: true,
    played: 3,
    won: 0,
    drawn: 1,
    lost: 2,
    goalsFor: 2,
    goalsAgainst: 5,
    goalDifference: -3,
  },
]

function sortRows(
  rows: AllTeamsTableRow[],
  sortBy: TeamTableSortBy,
  sortDirection: TeamTableSortDirection,
): AllTeamsTableRow[] {
  return [...rows].sort((left, right) => {
    let comparison = 0

    switch (sortBy) {
      case 'teamName':
        comparison = left.teamName.localeCompare(right.teamName)
        break
      case 'winProbability':
        comparison = left.winProbability - right.winProbability
        break
      default:
        comparison = 0
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })
}

function InteractiveTeamTable({ rows = sampleRows }: { rows?: AllTeamsTableRow[] }) {
  const [sortBy, setSortBy] = useState<TeamTableSortBy>('winProbability')
  const [sortDirection, setSortDirection] = useState<TeamTableSortDirection>('desc')

  const sortedRows = useMemo(
    () => sortRows(rows, sortBy, sortDirection),
    [rows, sortBy, sortDirection],
  )

  const handleSortChange = (column: TeamTableSortBy) => {
    if (sortBy === column) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(column)
    setSortDirection('desc')
  }

  return (
    <TeamTable
      rows={sortedRows}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSortChange={handleSortChange}
    />
  )
}

describe('TeamTable', () => {
  it('does not call onSortChange when clicking non-sortable headers', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    render(
      <TeamTable
        rows={sampleRows}
        sortBy="winProbability"
        sortDirection="desc"
        onSortChange={onSortChange}
      />,
    )

    for (const label of ['Played', 'Won', 'Drawn', 'Lost'] as const) {
      await user.click(screen.getByRole('columnheader', { name: label }))
    }

    expect(onSortChange).not.toHaveBeenCalled()
  })

  it('sorts by Team and Cup Win Probability in both directions when headers are clicked', async () => {
    const user = userEvent.setup()

    render(<InteractiveTeamTable />)

    const getBodyTeamNames = () =>
      within(screen.getAllByRole('rowgroup')[1])
        .getAllByRole('row')
        .map((row) => within(row).getAllByRole('cell')[0]?.textContent)

    expect(getBodyTeamNames()).toEqual(['Zulu', 'Alpha', 'Mike', 'Echo'])

    await user.click(screen.getByRole('button', { name: /^Team/i }))
    expect(getBodyTeamNames()).toEqual(['Zulu', 'Mike', 'Echo', 'Alpha'])

    await user.click(screen.getByRole('button', { name: /^Team/i }))
    expect(getBodyTeamNames()).toEqual(['Alpha', 'Echo', 'Mike', 'Zulu'])

    await user.click(screen.getByRole('button', { name: /^Cup Win Probability/i }))
    expect(getBodyTeamNames()).toEqual(['Zulu', 'Alpha', 'Mike', 'Echo'])

    await user.click(screen.getByRole('button', { name: /^Cup Win Probability/i }))
    expect(getBodyTeamNames()).toEqual(['Mike', 'Echo', 'Alpha', 'Zulu'])
  })

  it('calls onSortChange when clicking anywhere on a sortable header cell', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    render(
      <TeamTable
        rows={sampleRows}
        sortBy="winProbability"
        sortDirection="desc"
        onSortChange={onSortChange}
      />,
    )

    const teamHeader = screen.getByRole('button', { name: /^Team/i })
    await user.click(teamHeader)

    expect(onSortChange).toHaveBeenCalledWith('teamName')
  })

  it('marks sortable headers as interactive and keeps static headers non-interactive', () => {
    render(
      <TeamTable
        rows={sampleRows}
        sortBy="winProbability"
        sortDirection="desc"
        onSortChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /^Team/i })).toHaveClass('cursor-pointer')
    expect(screen.getByRole('button', { name: /^Goals For/i })).toHaveClass('cursor-pointer')
    expect(screen.getByRole('columnheader', { name: 'Played' })).toHaveClass('cursor-default')
    expect(screen.getByRole('columnheader', { name: 'Won' })).not.toHaveAttribute('role', 'button')
  })

  it('triggers the same sort action on Enter and Space as on click', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    render(
      <TeamTable
        rows={sampleRows}
        sortBy="winProbability"
        sortDirection="desc"
        onSortChange={onSortChange}
      />,
    )

    const teamHeader = screen.getByRole('button', { name: /^Team/i })
    teamHeader.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')

    expect(onSortChange).toHaveBeenCalledTimes(2)
    expect(onSortChange).toHaveBeenNthCalledWith(1, 'teamName')
    expect(onSortChange).toHaveBeenNthCalledWith(2, 'teamName')
  })
})
