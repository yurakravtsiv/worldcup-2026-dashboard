import type { Match } from '@/types/football'

export type UpsetResult = {
  match: Match
  winner: string
  loser: string
  winnerRanking: number
  loserRanking: number
  /** Positive when the lower-ranked team (higher FIFA number) beat the higher-ranked team. Equals winnerRanking - loserRanking. */
  rankingGap: number
}

export type GroupDifficultyResult = {
  groupName: string
  pointsSpread: number
  goalDifferenceSpread: number
}

export type TeamCleanSheetCount = {
  teamName: string
  cleanSheets: number
}

export type MatchWithMargin = {
  match: Match
  winner: string
  loser: string
  margin: number
}

export type GoalsTimelineEntry = {
  date: string
  totalGoals: number
  matchesPlayed: number
  avgGoalsPerMatch: number
}

export type CleanSheetsAndBiggestWinsResult = {
  cleanSheets: TeamCleanSheetCount[]
  biggestWins: MatchWithMargin[]
}

export type TeamGroupStats = {
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export type TeamProbability = {
  teamName: string
  winProbability: number
  isEliminated: boolean
}
