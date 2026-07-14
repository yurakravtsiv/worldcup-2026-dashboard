import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StageSelector } from '@/features/team-table/StageSelector'
import { getAvailableStages, type StageId } from '@/lib/tournament-stages'

const mockMatches = [
  {
    round: 'Matchday 1',
    date: '2026-06-01',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Beta',
    ground: 'Stadium',
    score: { ft: [1, 0] as [number, number] },
  },
  {
    round: 'Matchday 2',
    date: '2026-06-08',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Beta',
    ground: 'Stadium',
    score: { ft: [2, 1] as [number, number] },
  },
  {
    round: 'Matchday 3',
    date: '2026-06-15',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Beta',
    ground: 'Stadium',
    score: { ft: [0, 0] as [number, number] },
  },
  {
    round: 'Round of 32',
    date: '2026-06-28',
    time: '12:00 UTC',
    team1: 'Alpha',
    team2: 'Beta',
    ground: 'Stadium',
  },
]

const availableStages = getAvailableStages(mockMatches)

describe('StageSelector', () => {
  it('shows the selected stage label instead of the raw stage id', () => {
    render(<StageSelector stages={availableStages} value="group-3" onChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: 'Select a stage' })).toHaveTextContent(
      'Group Stage — Round 3',
    )
    expect(screen.getByRole('combobox', { name: 'Select a stage' })).not.toHaveTextContent(
      'group-3',
    )
  })

  it('lists exactly the stages returned by getAvailableStages', async () => {
    const user = userEvent.setup()

    render(<StageSelector stages={availableStages} value="group-3" onChange={vi.fn()} />)

    await user.click(screen.getByRole('combobox', { name: 'Select a stage' }))

    for (const stage of availableStages) {
      expect(screen.getByRole('option', { name: stage.label })).toBeInTheDocument()
    }

    expect(screen.queryByRole('option', { name: 'Round of 32' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(availableStages.length)
  })

  it('calls onChange with the selected stage id', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<StageSelector stages={availableStages} value="group-3" onChange={onChange} />)

    await user.click(screen.getByRole('combobox', { name: 'Select a stage' }))
    await user.click(screen.getByRole('option', { name: 'Group Stage — Round 1' }))

    expect(onChange).toHaveBeenCalledWith('group-1' satisfies StageId)
  })
})
