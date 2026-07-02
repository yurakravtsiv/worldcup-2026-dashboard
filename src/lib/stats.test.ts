import type { Group, Match, TeamRanking } from '@/types/football'
import {
  computeCleanSheetsAndBiggestWins,
  computeGoalsTimeline,
  computeGroupDifficulty,
  computeUpsetIndex,
} from '@/lib/stats'

const baseMatch = {
  round: 'Matchday 1',
  time: '12:00 UTC',
  ground: 'Stadium',
}

const rankings: TeamRanking[] = [
  { teamName: 'Favorite', ranking: 1 },
  { teamName: 'Underdog', ranking: 20 },
  { teamName: 'Mid', ranking: 10 },
  { teamName: 'Guest', ranking: 15 },
]

describe('computeUpsetIndex', () => {
  it('returns upsets sorted by ranking gap descending', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Mid',
        team2: 'Guest',
        score: { ft: [1, 2] },
      },
      {
        ...baseMatch,
        date: '2026-06-12',
        team1: 'Favorite',
        team2: 'Underdog',
        score: { ft: [0, 1] },
      },
    ]

    const upsets = computeUpsetIndex(matches, rankings)

    expect(upsets).toHaveLength(2)
    expect(upsets[0]).toMatchObject({
      winner: 'Underdog',
      loser: 'Favorite',
      rankingGap: 19,
    })
    expect(upsets[1]).toMatchObject({
      winner: 'Guest',
      loser: 'Mid',
      rankingGap: 5,
    })
  })

  it('excludes matches where the favorite beat the underdog', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Favorite',
        team2: 'Underdog',
        score: { ft: [4, 0] },
      },
    ]

    expect(computeUpsetIndex(matches, rankings)).toEqual([])
  })

  it('ignores draws and uses penalties to determine the winner', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Favorite',
        team2: 'Underdog',
        score: { ft: [1, 1], p: [4, 5] },
      },
      {
        ...baseMatch,
        date: '2026-06-12',
        team1: 'Mid',
        team2: 'Guest',
        score: { ft: [0, 0] },
      },
    ]

    const upsets = computeUpsetIndex(matches, rankings)

    expect(upsets).toHaveLength(1)
    expect(upsets[0]).toMatchObject({
      winner: 'Underdog',
      loser: 'Favorite',
      rankingGap: 19,
    })
  })

  it('uses extra time score when penalties are absent', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Favorite',
        team2: 'Underdog',
        score: { ft: [1, 1], et: [1, 2] },
      },
    ]

    const upsets = computeUpsetIndex(matches, rankings)

    expect(upsets).toHaveLength(1)
    expect(upsets[0]).toMatchObject({
      winner: 'Underdog',
      loser: 'Favorite',
      rankingGap: 19,
    })
  })

  it('returns an empty array for empty input', () => {
    expect(computeUpsetIndex([], rankings)).toEqual([])
  })
})

describe('computeGroupDifficulty', () => {
  it('sorts groups from smallest to largest points spread', () => {
    const groups: Group[] = [
      { name: 'Group A', teams: ['Alpha', 'Beta'] },
      { name: 'Group B', teams: ['Gamma', 'Delta'] },
    ]

    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Alpha',
        team2: 'Beta',
        score: { ft: [1, 1] },
      },
      {
        ...baseMatch,
        date: '2026-06-12',
        team1: 'Gamma',
        team2: 'Delta',
        score: { ft: [3, 0] },
      },
    ]

    const result = computeGroupDifficulty(groups, matches)

    expect(result).toEqual([
      { groupName: 'Group A', pointsSpread: 0, goalDifferenceSpread: 0 },
      { groupName: 'Group B', pointsSpread: 3, goalDifferenceSpread: 6 },
    ])
  })

  it('returns zero spreads for groups with no played matches', () => {
    const groups: Group[] = [{ name: 'Group A', teams: ['Alpha', 'Beta'] }]
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Alpha',
        team2: 'Beta',
      },
    ]

    expect(computeGroupDifficulty(groups, matches)).toEqual([
      { groupName: 'Group A', pointsSpread: 0, goalDifferenceSpread: 0 },
    ])
  })
})

describe('computeCleanSheetsAndBiggestWins', () => {
  it('counts clean sheets and ranks biggest wins', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Alpha',
        team2: 'Beta',
        score: { ft: [2, 0] },
      },
      {
        ...baseMatch,
        date: '2026-06-12',
        team1: 'Gamma',
        team2: 'Delta',
        score: { ft: [4, 1] },
      },
    ]

    const result = computeCleanSheetsAndBiggestWins(matches)

    expect(result.cleanSheets).toEqual([{ teamName: 'Alpha', cleanSheets: 1 }])
    expect(result.biggestWins[0]).toMatchObject({
      winner: 'Gamma',
      loser: 'Delta',
      margin: 3,
    })
  })

  it('awards both teams a clean sheet on 0-0 and skips zero-margin wins', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Alpha',
        team2: 'Beta',
        score: { ft: [0, 0] },
      },
    ]

    const result = computeCleanSheetsAndBiggestWins(matches)

    expect(result.cleanSheets).toEqual([
      { teamName: 'Alpha', cleanSheets: 1 },
      { teamName: 'Beta', cleanSheets: 1 },
    ])
    expect(result.biggestWins).toEqual([])
  })

  it('returns empty results for an empty match list', () => {
    expect(computeCleanSheetsAndBiggestWins([])).toEqual({
      cleanSheets: [],
      biggestWins: [],
    })
  })
})

describe('computeGoalsTimeline', () => {
  it('groups completed matches by date and calculates averages', () => {
    const matches: Match[] = [
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Alpha',
        team2: 'Beta',
        score: { ft: [2, 1] },
      },
      {
        ...baseMatch,
        date: '2026-06-11',
        team1: 'Gamma',
        team2: 'Delta',
        score: { ft: [0, 0] },
      },
      {
        ...baseMatch,
        date: '2026-06-12',
        team1: 'Alpha',
        team2: 'Gamma',
        score: { ft: [3, 2] },
      },
      {
        ...baseMatch,
        date: '2026-06-13',
        team1: 'Alpha',
        team2: 'Beta',
      },
    ]

    expect(computeGoalsTimeline(matches)).toEqual([
      {
        date: '2026-06-11',
        totalGoals: 3,
        matchesPlayed: 2,
        avgGoalsPerMatch: 1.5,
      },
      {
        date: '2026-06-12',
        totalGoals: 5,
        matchesPlayed: 1,
        avgGoalsPerMatch: 5,
      },
    ])
  })

  it('returns an empty timeline for empty input', () => {
    expect(computeGoalsTimeline([])).toEqual([])
  })
})
