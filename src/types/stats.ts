import type { Match } from '@/types/football'

export type UpsetResult = {
  match: Match
  winner: string
  loser: string
  winnerRanking: number
  loserRanking: number
  /** Positive when the lower-ranked team (higher FIFA number) beat the higher-ranked team. */
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
