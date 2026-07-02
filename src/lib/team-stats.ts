import { isPlayedMatch } from '@/lib/standings'
import {
  getMatchKey,
  getMatchesForStage,
  getPreviousStageId,
  isGroupStage,
  KNOCKOUT_STAGE_ORDER,
  type StageId,
} from '@/lib/tournament-stages'
import type { Match, MatchScore, ScoreTuple, TeamRanking } from '@/types/football'
import type { TeamGroupStats, TeamProbability } from '@/types/stats'

type MutableTeamStats = {
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
}

type MatchOutcome = {
  winner: string
  loser: string
}

function createEmptyStats(): MutableTeamStats {
  return {
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }
}

function applyMatchToTeam(
  stats: MutableTeamStats,
  goalsFor: number,
  goalsAgainst: number,
  result: 'won' | 'drawn' | 'lost',
): MutableTeamStats {
  return {
    played: stats.played + 1,
    goalsFor: stats.goalsFor + goalsFor,
    goalsAgainst: stats.goalsAgainst + goalsAgainst,
    won: stats.won + (result === 'won' ? 1 : 0),
    drawn: stats.drawn + (result === 'drawn' ? 1 : 0),
    lost: stats.lost + (result === 'lost' ? 1 : 0),
  }
}

function isKnockoutRound(round: string): round is (typeof KNOCKOUT_STAGE_ORDER)[number] {
  return (KNOCKOUT_STAGE_ORDER as readonly string[]).includes(round)
}

function getScoreLine(match: Match & { score: MatchScore }): ScoreTuple {
  const { score } = match

  if (score.p) {
    return score.p
  }

  if (score.et) {
    return score.et
  }

  return score.ft
}

function getMatchWinner(match: Match): MatchOutcome | null {
  if (!isPlayedMatch(match)) {
    return null
  }

  const { team1, team2 } = match
  const line = getScoreLine(match)

  if (line[0] > line[1]) {
    return { winner: team1, loser: team2 }
  }

  if (line[1] > line[0]) {
    return { winner: team2, loser: team1 }
  }

  return null
}

function getTeamResults(
  match: Match & { score: MatchScore },
): { team1: 'won' | 'drawn' | 'lost'; team2: 'won' | 'drawn' | 'lost' } {
  const outcome = getMatchWinner(match)

  if (!outcome) {
    return { team1: 'drawn', team2: 'drawn' }
  }

  if (outcome.winner === match.team1) {
    return { team1: 'won', team2: 'lost' }
  }

  return { team1: 'lost', team2: 'won' }
}

function buildRankingMap(rankings: TeamRanking[]): Map<string, number> {
  return new Map(rankings.map(({ teamName, ranking }) => [teamName, ranking]))
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function hasNewMatchForTeam(
  teamName: string,
  stageMatches: Match[],
  previousMatchKeys: Set<string>,
): boolean {
  return stageMatches.some(
    (match) =>
      (match.team1 === teamName || match.team2 === teamName) &&
      !previousMatchKeys.has(getMatchKey(match)),
  )
}

export function computeAllTeamsStats(matches: Match[], allTeams: string[]): TeamGroupStats[] {
  const allTeamSet = new Set(allTeams)
  const statsByTeam = new Map<string, MutableTeamStats>(
    allTeams.map((teamName) => [teamName, createEmptyStats()]),
  )

  for (const match of matches) {
    if (!isPlayedMatch(match)) {
      continue
    }

    if (!allTeamSet.has(match.team1) || !allTeamSet.has(match.team2)) {
      continue
    }

    const [team1Goals, team2Goals] = match.score.ft
    const team1Stats = statsByTeam.get(match.team1)
    const team2Stats = statsByTeam.get(match.team2)

    if (!team1Stats || !team2Stats) {
      continue
    }

    const results = getTeamResults(match)

    statsByTeam.set(
      match.team1,
      applyMatchToTeam(team1Stats, team1Goals, team2Goals, results.team1),
    )
    statsByTeam.set(
      match.team2,
      applyMatchToTeam(team2Stats, team2Goals, team1Goals, results.team2),
    )
  }

  return allTeams.map((teamName) => {
    const stats = statsByTeam.get(teamName) ?? createEmptyStats()
    const goalDifference = stats.goalsFor - stats.goalsAgainst

    return {
      teamName,
      played: stats.played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      goalDifference,
      points: stats.won * 3 + stats.drawn,
    }
  })
}

export function getQualifiedTeams(matches: Match[]): Set<string> {
  const qualifiedTeams = new Set<string>()

  for (const match of matches) {
    if (match.round !== 'Round of 32') {
      continue
    }

    qualifiedTeams.add(match.team1)
    qualifiedTeams.add(match.team2)
  }

  return qualifiedTeams
}

export function getEliminatedTeams(matches: Match[], allTeams: string[]): Set<string> {
  const qualifiedTeams = getQualifiedTeams(matches)
  const eliminatedTeams = new Set<string>()

  for (const teamName of allTeams) {
    if (!qualifiedTeams.has(teamName)) {
      eliminatedTeams.add(teamName)
    }
  }

  for (const match of matches) {
    if (!isKnockoutRound(match.round) || !isPlayedMatch(match)) {
      continue
    }

    const outcome = getMatchWinner(match)
    if (outcome) {
      eliminatedTeams.add(outcome.loser)
    }
  }

  return eliminatedTeams
}

export function getEliminatedTeamsForStage(
  stageId: StageId,
  stageMatches: Match[],
  allTeams: string[],
  fullMatches: Match[],
): Set<string> {
  if (isGroupStage(stageId)) {
    return new Set<string>()
  }

  const qualifiedTeams = getQualifiedTeams(fullMatches)
  const eliminatedTeams = new Set<string>()

  for (const teamName of allTeams) {
    if (!qualifiedTeams.has(teamName)) {
      eliminatedTeams.add(teamName)
    }
  }

  for (const match of stageMatches) {
    if (!isKnockoutRound(match.round) || !isPlayedMatch(match)) {
      continue
    }

    const outcome = getMatchWinner(match)
    if (outcome) {
      eliminatedTeams.add(outcome.loser)
    }
  }

  return eliminatedTeams
}

export function computeUpsetBonus(
  teamName: string,
  stageMatches: Match[],
  rankings: TeamRanking[],
): number {
  const rankingByTeam = buildRankingMap(rankings)
  const teamRanking = rankingByTeam.get(teamName)

  if (teamRanking === undefined) {
    return 0
  }

  let bonus = 0

  for (const match of stageMatches) {
    if (!isPlayedMatch(match)) {
      continue
    }

    if (match.team1 !== teamName && match.team2 !== teamName) {
      continue
    }

    const outcome = getMatchWinner(match)
    if (!outcome || outcome.winner !== teamName) {
      continue
    }

    const opponent = outcome.loser
    const opponentRanking = rankingByTeam.get(opponent)

    if (opponentRanking === undefined || opponentRanking >= teamRanking) {
      continue
    }

    bonus += teamRanking - opponentRanking
  }

  return bonus
}

export function computeTournamentWinProbability(
  stageId: StageId,
  matches: Match[],
  rankings: TeamRanking[],
  allTeams: string[],
): TeamProbability[] {
  const stageMatches = getMatchesForStage(stageId, matches)
  const eliminated = getEliminatedTeamsForStage(stageId, stageMatches, allTeams, matches)
  const teamStats = computeAllTeamsStats(stageMatches, allTeams)
  const rankingByTeam = buildRankingMap(rankings)
  const statsByTeam = new Map(teamStats.map((stats) => [stats.teamName, stats]))

  const liveTeams = allTeams.filter((teamName) => !eliminated.has(teamName))

  const pointsPerGameByTeam = liveTeams.map((teamName) => {
    const stats = statsByTeam.get(teamName)
    return stats && stats.played > 0 ? stats.points / stats.played : 0
  })
  const maxPointsPerGameAmongLive = Math.max(...pointsPerGameByTeam, 0)

  const maxGoalsForAmongLive = Math.max(
    ...liveTeams.map((teamName) => statsByTeam.get(teamName)?.goalsFor ?? 0),
    0,
  )
  const maxGoalsAgainstAmongLive = Math.max(
    ...liveTeams.map((teamName) => statsByTeam.get(teamName)?.goalsAgainst ?? 0),
    0,
  )
  const upsetBonusByTeam = new Map(
    liveTeams.map((teamName) => [teamName, computeUpsetBonus(teamName, stageMatches, rankings)]),
  )
  const maxUpsetBonusAmongLive = Math.max(...upsetBonusByTeam.values(), 0)

  const currentProbabilities = allTeams.map((teamName) => {
    if (eliminated.has(teamName)) {
      return {
        teamName,
        winProbability: 0,
        isEliminated: true,
      }
    }

    const stats = statsByTeam.get(teamName) ?? {
      played: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    }
    const ranking = rankingByTeam.get(teamName) ?? 49
    const rankingScore = (49 - ranking) / 48
    const formScore =
      stats.played > 0 && maxPointsPerGameAmongLive > 0
        ? stats.points / stats.played / maxPointsPerGameAmongLive
        : 0
    const attackScore = maxGoalsForAmongLive > 0 ? stats.goalsFor / maxGoalsForAmongLive : 0
    const defenseScore =
      maxGoalsAgainstAmongLive > 0 ? 1 - stats.goalsAgainst / maxGoalsAgainstAmongLive : 1
    const upsetBonus = upsetBonusByTeam.get(teamName) ?? 0
    const upsetBonusScore = maxUpsetBonusAmongLive > 0 ? upsetBonus / maxUpsetBonusAmongLive : 0

    const composite =
      0.35 * rankingScore +
      0.25 * formScore +
      0.15 * attackScore +
      0.15 * defenseScore +
      0.1 * upsetBonusScore

    return {
      teamName,
      winProbability: roundToOneDecimal(composite * 100),
      isEliminated: false,
    }
  })

  const previousStageId = getPreviousStageId(stageId)
  if (previousStageId === null) {
    return currentProbabilities
  }

  const previousProbabilities = computeTournamentWinProbability(
    previousStageId,
    matches,
    rankings,
    allTeams,
  )
  const previousProbabilityByTeam = new Map(
    previousProbabilities.map((entry) => [entry.teamName, entry.winProbability]),
  )
  const previousStageMatches = getMatchesForStage(previousStageId, matches)
  const previousMatchKeys = new Set(previousStageMatches.map(getMatchKey))

  // Через "заморожування" значення непорівнянні між командами як частки одного цілого —
  // це незалежні оцінки сили, а не ймовірнісний розподіл.
  return currentProbabilities.map((entry) => {
    if (entry.isEliminated) {
      return entry
    }

    if (hasNewMatchForTeam(entry.teamName, stageMatches, previousMatchKeys)) {
      return entry
    }

    return {
      ...entry,
      winProbability: previousProbabilityByTeam.get(entry.teamName) ?? entry.winProbability,
    }
  })
}
