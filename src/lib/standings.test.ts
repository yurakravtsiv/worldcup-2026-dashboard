import type { Match } from '@/types/football'
import { computeStandings } from '@/lib/standings'

const baseMatch = {
  round: 'Matchday 1',
  time: '12:00 UTC',
  ground: 'Stadium',
}

const groupTeams = ['Alpha', 'Beta', 'Gamma', 'Delta']

const fixtureMatches: Match[] = [
  {
    ...baseMatch,
    date: '2026-06-11',
    team1: 'Alpha',
    team2: 'Beta',
    score: { ft: [2, 0] },
    group: 'Group A',
  },
  {
    ...baseMatch,
    date: '2026-06-12',
    team1: 'Beta',
    team2: 'Gamma',
    score: { ft: [1, 1] },
    group: 'Group A',
  },
  {
    ...baseMatch,
    date: '2026-06-13',
    team1: 'Gamma',
    team2: 'Alpha',
    score: { ft: [0, 3] },
    group: 'Group A',
  },
  {
    ...baseMatch,
    date: '2026-06-14',
    team1: 'Alpha',
    team2: 'Other',
    score: { ft: [5, 0] },
    group: 'Group B',
  },
  {
    ...baseMatch,
    date: '2026-06-15',
    team1: 'Alpha',
    team2: 'Beta',
    ground: 'Stadium',
  },
]

describe('computeStandings', () => {
  it('calculates points, goal difference, and default sort order', () => {
    const standings = computeStandings(fixtureMatches, groupTeams)

    expect(standings).toHaveLength(4)
    expect(standings[0]).toMatchObject({
      position: 1,
      teamName: 'Alpha',
      played: 2,
      won: 2,
      drawn: 0,
      lost: 0,
      goalsFor: 5,
      goalsAgainst: 0,
      goalDifference: 5,
      points: 6,
    })
    expect(standings[1]).toMatchObject({
      position: 2,
      teamName: 'Beta',
      points: 1,
      goalDifference: -2,
    })
    expect(standings[2]).toMatchObject({
      position: 3,
      teamName: 'Gamma',
      points: 1,
      goalDifference: -3,
    })
  })

  it('includes a team with zero played matches at the bottom', () => {
    const standings = computeStandings(fixtureMatches, groupTeams)
    const delta = standings.find((standing) => standing.teamName === 'Delta')

    expect(delta).toMatchObject({
      position: 4,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  })

  it('ignores unplayed matches and matches outside the group', () => {
    const standings = computeStandings(fixtureMatches, groupTeams)
    const alpha = standings.find((standing) => standing.teamName === 'Alpha')

    expect(alpha?.played).toBe(2)
    expect(alpha?.goalsFor).toBe(5)
  })

  it('returns empty stats for every team when no matches are played', () => {
    const unplayedMatches: Match[] = groupTeams.flatMap((team, index) => [
      {
        ...baseMatch,
        date: `2026-06-1${index}`,
        team1: team,
        team2: groupTeams[(index + 1) % groupTeams.length],
        group: 'Group A',
      },
    ])

    const standings = computeStandings(unplayedMatches, groupTeams)

    expect(standings.every((standing) => standing.played === 0 && standing.points === 0)).toBe(true)
  })
})
