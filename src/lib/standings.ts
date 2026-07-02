import type { Match, MatchScore, Standing } from '@/types/football'

export function isPlayedMatch(match: Match): match is Match & { score: MatchScore } {
  return match.score !== undefined
}

function isGroupMatch(match: Match, groupTeams: string[]): boolean {
  const teamSet = new Set(groupTeams)
  return teamSet.has(match.team1) && teamSet.has(match.team2)
}

type TeamStats = {
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
}

function createEmptyStats(): TeamStats {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }
}

function applyResult(stats: TeamStats, goalsFor: number, goalsAgainst: number): TeamStats {
  const next = {
    ...stats,
    played: stats.played + 1,
    goalsFor: stats.goalsFor + goalsFor,
    goalsAgainst: stats.goalsAgainst + goalsAgainst,
  }

  if (goalsFor > goalsAgainst) {
    return { ...next, won: stats.won + 1 }
  }

  if (goalsFor < goalsAgainst) {
    return { ...next, lost: stats.lost + 1 }
  }

  return { ...next, drawn: stats.drawn + 1 }
}

export function computeStandings(matches: Match[], groupTeams: string[]): Standing[] {
  const statsByTeam = new Map<string, TeamStats>(
    groupTeams.map((teamName) => [teamName, createEmptyStats()]),
  )

  for (const match of matches) {
    if (!isPlayedMatch(match) || !isGroupMatch(match, groupTeams)) {
      continue
    }

    const [team1Goals, team2Goals] = match.score.ft
    const team1Stats = statsByTeam.get(match.team1)
    const team2Stats = statsByTeam.get(match.team2)

    if (!team1Stats || !team2Stats) {
      continue
    }

    statsByTeam.set(match.team1, applyResult(team1Stats, team1Goals, team2Goals))
    statsByTeam.set(match.team2, applyResult(team2Stats, team2Goals, team1Goals))
  }

  const standings = groupTeams.map((teamName) => {
    const stats = statsByTeam.get(teamName) ?? createEmptyStats()
    const goalDifference = stats.goalsFor - stats.goalsAgainst
    const points = stats.won * 3 + stats.drawn

    return {
      position: 0,
      teamName,
      played: stats.played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      goalDifference,
      points,
    }
  })

  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points
    }

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference
    }

    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor
    }

    return a.teamName.localeCompare(b.teamName)
  })

  return standings.map((standing, index) => ({
    ...standing,
    position: index + 1,
  }))
}
