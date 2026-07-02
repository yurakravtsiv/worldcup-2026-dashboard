import { computeStandings, isPlayedMatch } from '@/lib/standings'
import type { Group, Match, MatchScore, ScoreTuple, TeamRanking } from '@/types/football'
import type {
  CleanSheetsAndBiggestWinsResult,
  GoalsTimelineEntry,
  GroupDifficultyResult,
  MatchWithMargin,
  TeamCleanSheetCount,
  UpsetResult,
} from '@/types/stats'

type MatchWinner = {
  winner: string
  loser: string
}

function getScoreLine(match: Match & { score: MatchScore }): ScoreTuple | null {
  const { score } = match

  if (score.p) {
    return score.p
  }

  if (score.et) {
    return score.et
  }

  return score.ft
}

function getMatchWinner(match: Match): MatchWinner | null {
  if (!isPlayedMatch(match)) {
    return null
  }

  const { team1, team2 } = match
  const line = getScoreLine(match)

  if (!line) {
    return null
  }

  if (line[0] > line[1]) {
    return { winner: team1, loser: team2 }
  }

  if (line[1] > line[0]) {
    return { winner: team2, loser: team1 }
  }

  return null
}

function buildRankingMap(rankings: TeamRanking[]): Map<string, number> {
  return new Map(rankings.map(({ teamName, ranking }) => [teamName, ranking]))
}

export function computeUpsetIndex(matches: Match[], rankings: TeamRanking[]): UpsetResult[] {
  const rankingByTeam = buildRankingMap(rankings)
  const upsets: UpsetResult[] = []

  for (const match of matches) {
    const outcome = getMatchWinner(match)
    if (!outcome) {
      continue
    }

    const winnerRanking = rankingByTeam.get(outcome.winner)
    const loserRanking = rankingByTeam.get(outcome.loser)

    if (winnerRanking === undefined || loserRanking === undefined) {
      continue
    }

    // Upset: winner is lower-ranked (higher FIFA ranking number) than the loser.
    if (winnerRanking <= loserRanking) {
      continue
    }

    const rankingGap = winnerRanking - loserRanking

    upsets.push({
      match,
      winner: outcome.winner,
      loser: outcome.loser,
      winnerRanking,
      loserRanking,
      rankingGap,
    })
  }

  return upsets.sort((a, b) => {
    if (b.rankingGap !== a.rankingGap) {
      return b.rankingGap - a.rankingGap
    }

    return a.match.date.localeCompare(b.match.date)
  })
}

export function computeGroupDifficulty(groups: Group[], matches: Match[]): GroupDifficultyResult[] {
  const results = groups.map((group) => {
    const standings = computeStandings(matches, group.teams)
    const points = standings.map((standing) => standing.points)
    const goalDifferences = standings.map((standing) => standing.goalDifference)

    return {
      groupName: group.name,
      pointsSpread: Math.max(...points) - Math.min(...points),
      goalDifferenceSpread: Math.max(...goalDifferences) - Math.min(...goalDifferences),
    }
  })

  return results.sort((a, b) => {
    if (a.pointsSpread !== b.pointsSpread) {
      return a.pointsSpread - b.pointsSpread
    }

    if (a.goalDifferenceSpread !== b.goalDifferenceSpread) {
      return a.goalDifferenceSpread - b.goalDifferenceSpread
    }

    return a.groupName.localeCompare(b.groupName)
  })
}

export function computeCleanSheetsAndBiggestWins(
  matches: Match[],
): CleanSheetsAndBiggestWinsResult {
  const cleanSheetCounts = new Map<string, number>()
  const biggestWins: MatchWithMargin[] = []

  for (const match of matches) {
    if (!isPlayedMatch(match)) {
      continue
    }

    const [team1Goals, team2Goals] = match.score.ft
    const margin = Math.abs(team1Goals - team2Goals)

    if (margin > 0) {
      const winner = team1Goals > team2Goals ? match.team1 : match.team2
      const loser = team1Goals > team2Goals ? match.team2 : match.team1

      biggestWins.push({
        match,
        winner,
        loser,
        margin,
      })
    }

    if (team2Goals === 0) {
      cleanSheetCounts.set(match.team1, (cleanSheetCounts.get(match.team1) ?? 0) + 1)
    }

    if (team1Goals === 0) {
      cleanSheetCounts.set(match.team2, (cleanSheetCounts.get(match.team2) ?? 0) + 1)
    }
  }

  const cleanSheets: TeamCleanSheetCount[] = [...cleanSheetCounts.entries()]
    .map(([teamName, cleanSheetsCount]) => ({
      teamName,
      cleanSheets: cleanSheetsCount,
    }))
    .sort((a, b) => {
      if (b.cleanSheets !== a.cleanSheets) {
        return b.cleanSheets - a.cleanSheets
      }

      return a.teamName.localeCompare(b.teamName)
    })

  biggestWins.sort((a, b) => {
    if (b.margin !== a.margin) {
      return b.margin - a.margin
    }

    return a.match.date.localeCompare(b.match.date)
  })

  return { cleanSheets, biggestWins }
}

export function computeGoalsTimeline(matches: Match[]): GoalsTimelineEntry[] {
  const timeline = new Map<string, { totalGoals: number; matchesPlayed: number }>()

  for (const match of matches) {
    if (!isPlayedMatch(match)) {
      continue
    }

    const [team1Goals, team2Goals] = match.score.ft
    const day = timeline.get(match.date) ?? { totalGoals: 0, matchesPlayed: 0 }

    timeline.set(match.date, {
      totalGoals: day.totalGoals + team1Goals + team2Goals,
      matchesPlayed: day.matchesPlayed + 1,
    })
  }

  return [...timeline.entries()]
    .map(([date, { totalGoals, matchesPlayed }]) => ({
      date,
      totalGoals,
      matchesPlayed,
      avgGoalsPerMatch: totalGoals / matchesPlayed,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
