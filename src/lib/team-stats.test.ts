import type { Match, TeamRanking } from '@/types/football'
import {
  computeAllTeamsStats,
  computeTournamentWinProbability,
  getEliminatedTeamsForStage,
  getQualifiedTeams,
} from '@/lib/team-stats'

const baseMatch = {
  time: '12:00 UTC',
  ground: 'Stadium',
}

const allTeams = ['Qualified', 'Opponent', 'EliminatedFromGroups']

const rankings: TeamRanking[] = [
  { teamName: 'Qualified', ranking: 5 },
  { teamName: 'Opponent', ranking: 10 },
  { teamName: 'EliminatedFromGroups', ranking: 30 },
]

const groupStageMatches: Match[] = [
  {
    ...baseMatch,
    round: 'Matchday 1',
    date: '2026-06-01',
    team1: 'Qualified',
    team2: 'EliminatedFromGroups',
    score: { ft: [2, 0] },
  },
  {
    ...baseMatch,
    round: 'Matchday 2',
    date: '2026-06-02',
    team1: 'Opponent',
    team2: 'EliminatedFromGroups',
    score: { ft: [1, 0] },
  },
  {
    ...baseMatch,
    round: 'Matchday 3',
    date: '2026-06-03',
    team1: 'Qualified',
    team2: 'Opponent',
    score: { ft: [1, 1] },
  },
]

const unplayedRoundOf32Match: Match = {
  ...baseMatch,
  round: 'Round of 32',
  date: '2026-06-28',
  team1: 'Qualified',
  team2: 'Opponent',
}

describe('computeAllTeamsStats', () => {
  it('counts all provided matches including knockout rounds and resolves wins via penalties', () => {
    const statsTeams = ['Qualified', 'Opponent']
    const stageMatches: Match[] = [
      {
        ...baseMatch,
        round: 'Matchday 1',
        date: '2026-06-01',
        team1: 'Qualified',
        team2: 'Opponent',
        score: { ft: [2, 1] },
      },
      {
        ...baseMatch,
        round: 'Matchday 2',
        date: '2026-06-02',
        team1: 'Qualified',
        team2: 'Opponent',
        score: { ft: [1, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 3',
        date: '2026-06-03',
        team1: 'Qualified',
        team2: 'Opponent',
        score: { ft: [2, 2] },
      },
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-28',
        team1: 'Qualified',
        team2: 'Opponent',
        score: { ft: [1, 1], p: [4, 3] },
      },
    ]

    const qualifiedStats = computeAllTeamsStats(stageMatches, statsTeams).find(
      (entry) => entry.teamName === 'Qualified',
    )
    const opponentStats = computeAllTeamsStats(stageMatches, statsTeams).find(
      (entry) => entry.teamName === 'Opponent',
    )

    expect(qualifiedStats).toMatchObject({
      played: 4,
      won: 3,
      drawn: 1,
      lost: 0,
      goalsFor: 6,
      goalsAgainst: 4,
      goalDifference: 2,
      points: 10,
    })
    expect(opponentStats).toMatchObject({
      played: 4,
      won: 0,
      drawn: 1,
      lost: 3,
    })
  })
})

describe('getQualifiedTeams', () => {
  it('includes teams from unplayed Round of 32 fixtures in the full match list', () => {
    const matches = [...groupStageMatches, unplayedRoundOf32Match]

    expect(getQualifiedTeams(matches)).toEqual(new Set(['Qualified', 'Opponent']))
  })
})

describe('getEliminatedTeamsForStage', () => {
  it('returns an empty set on group stages', () => {
    const matches = [...groupStageMatches, unplayedRoundOf32Match]

    expect(getEliminatedTeamsForStage('group-3', matches, allTeams, matches)).toEqual(new Set())
  })

  it('eliminates teams missing from the full Round of 32 bracket', () => {
    const matches = [...groupStageMatches, unplayedRoundOf32Match]

    expect(getEliminatedTeamsForStage('Round of 32', matches, allTeams, matches)).toEqual(
      new Set(['EliminatedFromGroups']),
    )
  })

  it('eliminates knockout losers only from completed matches within stageMatches', () => {
    const fullMatches = [...groupStageMatches, unplayedRoundOf32Match]
    const lostRoundOf32Match: Match = {
      ...unplayedRoundOf32Match,
      score: { ft: [0, 1] },
    }
    const stageMatches: Match[] = [...groupStageMatches, lostRoundOf32Match]

    expect(getEliminatedTeamsForStage('Round of 32', stageMatches, allTeams, fullMatches)).toEqual(
      new Set(['EliminatedFromGroups', 'Qualified']),
    )
  })

  it('does not eliminate a qualified team whose Round of 32 match is still unplayed', () => {
    const matches = [...groupStageMatches, unplayedRoundOf32Match]

    const eliminated = getEliminatedTeamsForStage('Round of 32', matches, allTeams, matches)

    expect(eliminated.has('Qualified')).toBe(false)
    expect(eliminated.has('Opponent')).toBe(false)
    expect(eliminated.has('EliminatedFromGroups')).toBe(true)
  })
})

describe('computeTournamentWinProbability', () => {
  it('keeps a qualified team live with frozen winProbability when Round of 32 is unplayed', () => {
    const matches = [...groupStageMatches, unplayedRoundOf32Match]

    const groupStageProbabilities = computeTournamentWinProbability(
      'group-3',
      matches,
      rankings,
      allTeams,
    )
    const roundOf32Probabilities = computeTournamentWinProbability(
      'Round of 32',
      matches,
      rankings,
      allTeams,
    )

    const qualifiedAtGroupStage = groupStageProbabilities.find(
      (entry) => entry.teamName === 'Qualified',
    )
    const qualifiedAtRoundOf32 = roundOf32Probabilities.find(
      (entry) => entry.teamName === 'Qualified',
    )

    expect(qualifiedAtRoundOf32?.isEliminated).toBe(false)
    expect(qualifiedAtRoundOf32?.winProbability).toBe(qualifiedAtGroupStage?.winProbability)
  })
})
