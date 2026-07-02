import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamTableSection } from '@/features/team-table/TeamTableSection'
import type { StageId } from '@/lib/tournament-stages'
import type { AllTeamsTableRow } from '@/types/stats'

const mockRows: AllTeamsTableRow[] = [
  {
    teamName: 'Zulu',
    winProbability: 80,
    isEliminated: false,
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    goalsFor: 10,
    goalsAgainst: 2,
    goalDifference: 8,
  },
  {
    teamName: 'Alpha',
    winProbability: 60,
    isEliminated: false,
    played: 3,
    won: 1,
    drawn: 1,
    lost: 1,
    goalsFor: 5,
    goalsAgainst: 4,
    goalDifference: 1,
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

const mockMatches = [
  {
    round: 'Matchday 1',
    date: '2026-06-01',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Zulu',
    ground: 'Stadium',
    score: { ft: [1, 0] as [number, number] },
  },
  {
    round: 'Matchday 2',
    date: '2026-06-08',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Zulu',
    ground: 'Stadium',
    score: { ft: [0, 0] as [number, number] },
  },
  {
    round: 'Matchday 3',
    date: '2026-06-15',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Zulu',
    ground: 'Stadium',
    score: { ft: [2, 1] as [number, number] },
  },
]

const useAllTeamsTableMock = vi.fn()

vi.mock('@/hooks/useMatches', () => ({
  useMatches: () => ({
    data: mockMatches,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/hooks/useAllTeamsTable', () => ({
  useAllTeamsTable: (stageId: StageId) => useAllTeamsTableMock(stageId),
}))

function getRenderedTeamNames(): string[] {
  const body = screen.getAllByRole('rowgroup')[1]
  return within(body)
    .getAllByRole('row')
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent ?? '')
}

describe('TeamTableSection', () => {
  beforeEach(() => {
    useAllTeamsTableMock.mockImplementation(() => ({
      rows: mockRows,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    }))
  })

  it('keeps eliminated teams at the bottom when sorting by an allowed column', async () => {
    const user = userEvent.setup()
    render(<TeamTableSection />)

    await user.click(screen.getByRole('button', { name: /^Goals For/i }))
    expect(getRenderedTeamNames()).toEqual(['Zulu', 'Alpha', 'Echo', 'Mike'])

    await user.click(screen.getByRole('button', { name: /^Goals For/i }))
    expect(getRenderedTeamNames()).toEqual(['Alpha', 'Zulu', 'Echo', 'Mike'])
  })

  it('sorts eliminated teams alphabetically regardless of the selected sort column', async () => {
    const user = userEvent.setup()
    render(<TeamTableSection />)

    await user.click(screen.getByRole('button', { name: /^Team/i }))
    expect(getRenderedTeamNames().slice(2)).toEqual(['Echo', 'Mike'])

    await user.click(screen.getByRole('button', { name: /^Team/i }))
    expect(getRenderedTeamNames().slice(2)).toEqual(['Echo', 'Mike'])
  })

  it('uses alphabetical tiebreakers for active teams with equal sort values', async () => {
    const user = userEvent.setup()
    useAllTeamsTableMock.mockImplementation(() => ({
      rows: [
        { ...mockRows[0], teamName: 'Zulu', winProbability: 50 },
        { ...mockRows[1], teamName: 'Alpha', winProbability: 50 },
        mockRows[2],
        mockRows[3],
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    }))

    render(<TeamTableSection />)

    await user.click(screen.getByRole('button', { name: /^Win Probability/i }))
    expect(getRenderedTeamNames().slice(0, 2)).toEqual(['Alpha', 'Zulu'])
  })

  it('calls useAllTeamsTable with the newly selected stage id', async () => {
    const user = userEvent.setup()
    render(<TeamTableSection />)

    expect(useAllTeamsTableMock).toHaveBeenCalledWith('group-3')

    await user.click(screen.getByRole('combobox', { name: 'Select a stage' }))
    await user.click(screen.getByRole('option', { name: 'Group Stage — Round 1' }))

    expect(useAllTeamsTableMock).toHaveBeenCalledWith('group-1')
  })

  it('filters active and eliminated teams by case-insensitive substring search', async () => {
    const user = userEvent.setup()

    render(<TeamTableSection />)

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'alp')

    await waitFor(() => {
      expect(getRenderedTeamNames()).toEqual(['Alpha'])
    })

    await user.clear(screen.getByRole('searchbox', { name: 'Search' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'EC')

    await waitFor(() => {
      expect(getRenderedTeamNames()).toEqual(['Echo'])
    })
  })
})
