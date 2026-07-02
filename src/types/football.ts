export type ScoreTuple = [number, number]

export type MatchScore = {
  ft: ScoreTuple
  ht?: ScoreTuple
  et?: ScoreTuple
  p?: ScoreTuple
}

export type Goal = {
  name: string
  minute: string
}

/** Raw match from fixtures. Absence of `score` means the match has not been played yet. */
export type Match = {
  round: string
  num?: number
  date: string
  time: string
  team1: string
  team2: string
  score?: MatchScore
  goals1?: Goal[]
  goals2?: Goal[]
  group?: string
  ground: string
}

export type Group = {
  name: string
  teams: string[]
}

export type TournamentGroups = {
  name: string
  groups: Group[]
}

export type TeamRanking = {
  teamName: string
  ranking: number
}

/** Computed group-table row; not present in raw fixture data. */
export type Standing = {
  position: number
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
