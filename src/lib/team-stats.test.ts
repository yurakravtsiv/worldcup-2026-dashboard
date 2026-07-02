import type { Match, TeamRanking } from '@/types/football'
import {
  computeAllTeamsStats,
  computeTournamentWinProbability,
  computeUpsetBonus,
  getEliminatedTeams,
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
  it('counts statistics from every completed match in the provided list without filtering by round', () => {
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

    expect(qualifiedStats).toMatchObject({
      played: 4,
      won: 3,
      drawn: 1,
      lost: 0,
    })
  })

  it('records a penalty shootout win as won rather than drawn when ft is level', () => {
    const statsTeams = ['Germany', 'Paraguay']
    const stageMatches: Match[] = [
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-28',
        team1: 'Germany',
        team2: 'Paraguay',
        score: { ft: [1, 1], p: [3, 4] },
      },
    ]

    const stats = computeAllTeamsStats(stageMatches, statsTeams)

    expect(stats.find((entry) => entry.teamName === 'Germany')).toMatchObject({
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
    })
    expect(stats.find((entry) => entry.teamName === 'Paraguay')).toMatchObject({
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
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

describe('getEliminatedTeams', () => {
  it('marks teams eliminated in the group stage and knockout losers as eliminated', () => {
    const fullMatches = [...groupStageMatches, unplayedRoundOf32Match]
    const lostRoundOf32Match: Match = {
      ...unplayedRoundOf32Match,
      score: { ft: [0, 1] },
    }

    const groupStageEliminated = getEliminatedTeams(fullMatches, allTeams)
    const knockoutEliminated = getEliminatedTeams(
      [...groupStageMatches, lostRoundOf32Match],
      allTeams,
    )

    expect(groupStageEliminated.has('EliminatedFromGroups')).toBe(true)
    expect(groupStageEliminated.has('Qualified')).toBe(false)
    expect(knockoutEliminated.has('Qualified')).toBe(true)
    expect(knockoutEliminated.has('Opponent')).toBe(false)
  })
})

describe('computeUpsetBonus', () => {
  const upsetRankings: TeamRanking[] = [
    { teamName: 'Underdog', ranking: 20 },
    { teamName: 'Favorite', ranking: 1 },
    { teamName: 'Mid', ranking: 10 },
  ]

  it('adds bonus only for wins against better-ranked opponents and sums across matches', () => {
    const upsetRankingsExtended: TeamRanking[] = [
      ...upsetRankings,
      { teamName: 'Weakest', ranking: 25 },
    ]
    const stageMatches: Match[] = [
      {
        ...baseMatch,
        round: 'Matchday 1',
        date: '2026-06-01',
        team1: 'Underdog',
        team2: 'Favorite',
        score: { ft: [1, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 2',
        date: '2026-06-02',
        team1: 'Underdog',
        team2: 'Weakest',
        score: { ft: [2, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 3',
        date: '2026-06-03',
        team1: 'Mid',
        team2: 'Underdog',
        score: { ft: [3, 0] },
      },
    ]

    expect(computeUpsetBonus('Underdog', stageMatches, upsetRankingsExtended)).toBe(19)
    expect(computeUpsetBonus('Favorite', stageMatches, upsetRankingsExtended)).toBe(0)
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

  it('marks a Round of 32 loser as eliminated when the knockout match is completed in stageMatches', () => {
    const lostRoundOf32Match: Match = {
      ...unplayedRoundOf32Match,
      score: { ft: [0, 1] },
    }
    const fullMatches = [...groupStageMatches, lostRoundOf32Match]

    const probabilities = computeTournamentWinProbability(
      'Round of 32',
      fullMatches,
      rankings,
      allTeams,
    )

    expect(probabilities.find((entry) => entry.teamName === 'Qualified')?.isEliminated).toBe(true)
    expect(probabilities.find((entry) => entry.teamName === 'Opponent')?.isEliminated).toBe(false)
  })

  it('does not eliminate any team on group-1 even if the full dataset later shows elimination', () => {
    const matches = [...groupStageMatches, unplayedRoundOf32Match]

    const probabilities = computeTournamentWinProbability('group-1', matches, rankings, allTeams)

    expect(probabilities.every((entry) => entry.isEliminated === false)).toBe(true)
  })

  it('returns independent strength scores that do not sum to roughly 100', () => {
    const topTeams = ['Favorite', 'SecondFavorite', 'Weak1', 'Weak2']
    const topRankings: TeamRanking[] = [
      { teamName: 'Favorite', ranking: 1 },
      { teamName: 'SecondFavorite', ranking: 2 },
      { teamName: 'Weak1', ranking: 30 },
      { teamName: 'Weak2', ranking: 31 },
    ]
    const matches: Match[] = [
      {
        ...baseMatch,
        round: 'Matchday 1',
        date: '2026-06-01',
        team1: 'Favorite',
        team2: 'Weak1',
        score: { ft: [3, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 1',
        date: '2026-06-01',
        team1: 'SecondFavorite',
        team2: 'Weak2',
        score: { ft: [2, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 2',
        date: '2026-06-08',
        team1: 'Favorite',
        team2: 'Weak2',
        score: { ft: [2, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 2',
        date: '2026-06-08',
        team1: 'SecondFavorite',
        team2: 'Weak1',
        score: { ft: [1, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 3',
        date: '2026-06-15',
        team1: 'Favorite',
        team2: 'SecondFavorite',
        score: { ft: [1, 1] },
      },
      {
        ...baseMatch,
        round: 'Matchday 3',
        date: '2026-06-15',
        team1: 'Weak1',
        team2: 'Weak2',
        score: { ft: [0, 0] },
      },
    ]

    const probabilities = computeTournamentWinProbability(
      'group-3',
      matches,
      topRankings,
      topTeams,
    )
    const favorite = probabilities.find((entry) => entry.teamName === 'Favorite')
    const secondFavorite = probabilities.find((entry) => entry.teamName === 'SecondFavorite')
    const total = (favorite?.winProbability ?? 0) + (secondFavorite?.winProbability ?? 0)

    expect(favorite?.winProbability).toBeGreaterThan(70)
    expect(secondFavorite?.winProbability).toBeGreaterThan(70)
    expect(total).toBeGreaterThan(100)
  })

  it('freezes winProbability for teams without a new match on a partially completed Round of 16', () => {
    const bracketTeams = ['W1', 'W2', 'W3', 'W4', 'L1', 'L2', 'L3', 'L4']
    const bracketRankings: TeamRanking[] = bracketTeams.map((teamName, index) => ({
      teamName,
      ranking: index + 1,
    }))

    const groupMatches: Match[] = [
      {
        ...baseMatch,
        round: 'Matchday 1',
        date: '2026-06-01',
        team1: 'W1',
        team2: 'W2',
        score: { ft: [2, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 1',
        date: '2026-06-01',
        team1: 'W3',
        team2: 'W4',
        score: { ft: [1, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 2',
        date: '2026-06-08',
        team1: 'W1',
        team2: 'W3',
        score: { ft: [1, 1] },
      },
      {
        ...baseMatch,
        round: 'Matchday 2',
        date: '2026-06-08',
        team1: 'W2',
        team2: 'W4',
        score: { ft: [2, 1] },
      },
      {
        ...baseMatch,
        round: 'Matchday 3',
        date: '2026-06-15',
        team1: 'W1',
        team2: 'W4',
        score: { ft: [3, 0] },
      },
      {
        ...baseMatch,
        round: 'Matchday 3',
        date: '2026-06-15',
        team1: 'W2',
        team2: 'W3',
        score: { ft: [0, 1] },
      },
    ]

    const roundOf32Matches: Match[] = [
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-28',
        team1: 'W1',
        team2: 'L1',
        score: { ft: [2, 0] },
      },
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-28',
        team1: 'W2',
        team2: 'L2',
        score: { ft: [1, 0] },
      },
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-29',
        team1: 'W3',
        team2: 'L3',
        score: { ft: [2, 1] },
      },
      {
        ...baseMatch,
        round: 'Round of 32',
        date: '2026-06-29',
        team1: 'W4',
        team2: 'L4',
        score: { ft: [3, 1] },
      },
    ]

    const roundOf16Matches: Match[] = [
      {
        ...baseMatch,
        round: 'Round of 16',
        date: '2026-07-04',
        team1: 'W1',
        team2: 'W2',
        score: { ft: [2, 1] },
      },
      {
        ...baseMatch,
        round: 'Round of 16',
        date: '2026-07-05',
        team1: 'W3',
        team2: 'W4',
      },
    ]

    const matches = [...groupMatches, ...roundOf32Matches, ...roundOf16Matches]
    const roundOf32Probabilities = computeTournamentWinProbability(
      'Round of 32',
      matches,
      bracketRankings,
      bracketTeams,
    )
    const roundOf16Probabilities = computeTournamentWinProbability(
      'Round of 16',
      matches,
      bracketRankings,
      bracketTeams,
    )

    const w3AtRoundOf32 = roundOf32Probabilities.find((entry) => entry.teamName === 'W3')
    const w3AtRoundOf16 = roundOf16Probabilities.find((entry) => entry.teamName === 'W3')
    const w1AtRoundOf32 = roundOf32Probabilities.find((entry) => entry.teamName === 'W1')
    const w1AtRoundOf16 = roundOf16Probabilities.find((entry) => entry.teamName === 'W1')

    expect(w3AtRoundOf16?.winProbability).toBe(w3AtRoundOf32?.winProbability)
    expect(w1AtRoundOf16?.winProbability).not.toBe(w1AtRoundOf32?.winProbability)
  })
})
