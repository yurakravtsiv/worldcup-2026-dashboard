import type { Match } from '@/types/football'
import {
  ALL_STAGES,
  getAvailableStages,
  getGroupStageMatchesUpToRound,
  getMatchKey,
  getPreviousStageId,
} from '@/lib/tournament-stages'

const baseMatch = {
  time: '12:00 UTC',
  ground: 'Stadium',
}

function groupMatch(
  date: string,
  team1: string,
  team2: string,
  score: [number, number],
  round = 'Matchday 1',
): Match {
  return {
    ...baseMatch,
    round,
    date,
    team1,
    team2,
    score: { ft: score },
  }
}

describe('getGroupStageMatchesUpToRound', () => {
  it('returns only the first chronological match for a team with three played matches when n=1', () => {
    const matches: Match[] = [
      groupMatch('2026-06-01', 'Alpha', 'Beta', [2, 0], 'Matchday 1'),
      groupMatch('2026-06-02', 'Gamma', 'Delta', [1, 0], 'Matchday 1'),
      groupMatch('2026-06-10', 'Alpha', 'Gamma', [1, 0], 'Matchday 2'),
      groupMatch('2026-06-20', 'Alpha', 'Delta', [3, 1], 'Matchday 3'),
      groupMatch('2026-06-21', 'Beta', 'Gamma', [0, 2], 'Matchday 3'),
    ]

    const roundOneMatches = getGroupStageMatchesUpToRound(matches, 1)
    const alphaMatches = roundOneMatches.filter(
      (match) => match.team1 === 'Alpha' || match.team2 === 'Alpha',
    )

    expect(roundOneMatches).toHaveLength(2)
    expect(alphaMatches).toHaveLength(1)
    expect(alphaMatches[0]?.date).toBe('2026-06-01')
  })

  it('handles teams with different numbers of completed group matches correctly for n=2', () => {
    const matches: Match[] = [
      groupMatch('2026-06-01', 'Alpha', 'Beta', [1, 0], 'Matchday 1'),
      groupMatch('2026-06-02', 'Gamma', 'Delta', [2, 1], 'Matchday 1'),
      groupMatch('2026-06-10', 'Alpha', 'Gamma', [2, 2], 'Matchday 2'),
      groupMatch('2026-06-20', 'Alpha', 'Delta', [1, 0], 'Matchday 3'),
    ]

    const roundTwoMatches = getGroupStageMatchesUpToRound(matches, 2)
    const alphaMatches = roundTwoMatches.filter(
      (match) => match.team1 === 'Alpha' || match.team2 === 'Alpha',
    )
    const deltaMatches = roundTwoMatches.filter(
      (match) => match.team1 === 'Delta' || match.team2 === 'Delta',
    )

    expect(alphaMatches).toHaveLength(2)
    expect(deltaMatches).toHaveLength(1)
    expect(deltaMatches[0]?.date).toBe('2026-06-02')
  })
})

describe('getAvailableStages', () => {
  it('excludes knockout rounds without any completed matches', () => {
    const matches: Match[] = [
      groupMatch('2026-06-01', 'Alpha', 'Beta', [1, 0]),
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-28',
        team1: 'Alpha',
        team2: 'Beta',
      },
    ]

    const availableStages = getAvailableStages(matches)

    expect(availableStages.map((stage) => stage.id)).toContain('group-1')
    expect(availableStages.map((stage) => stage.id)).not.toContain('Round of 32')
  })

  it('includes knockout rounds once at least one match in the round is completed', () => {
    const matches: Match[] = [
      groupMatch('2026-06-01', 'Alpha', 'Beta', [1, 0]),
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-28',
        team1: 'Alpha',
        team2: 'Beta',
        score: { ft: [2, 1] },
      },
    ]

    expect(getAvailableStages(matches).map((stage) => stage.id)).toContain('Round of 32')
  })
})

describe('getPreviousStageId', () => {
  it('returns null for the first stage', () => {
    expect(getPreviousStageId('group-1')).toBeNull()
  })

  it('returns the previous stage id for every other stage in ALL_STAGES', () => {
    for (let index = 1; index < ALL_STAGES.length; index += 1) {
      const currentStage = ALL_STAGES[index]
      const previousStage = ALL_STAGES[index - 1]

      expect(getPreviousStageId(currentStage.id)).toBe(previousStage.id)
    }
  })
})

describe('getMatchKey', () => {
  it('returns the same key for identical matches and different keys for different matches', () => {
    const matchA: Match = {
      ...baseMatch,
      round: 'Matchday 1',
      date: '2026-06-01',
      team1: 'Alpha',
      team2: 'Beta',
      score: { ft: [1, 0] },
    }
    const matchADuplicate: Match = {
      ...matchA,
      score: { ft: [3, 2] },
    }
    const matchB: Match = {
      ...matchA,
      date: '2026-06-02',
    }

    expect(getMatchKey(matchA)).toBe(getMatchKey(matchADuplicate))
    expect(getMatchKey(matchA)).not.toBe(getMatchKey(matchB))
  })
})
