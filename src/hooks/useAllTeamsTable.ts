import { useMemo } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMatches } from '@/hooks/useMatches'
import { useRankings } from '@/hooks/useRankings'
import { computeAllTeamsStats, computeTournamentWinProbability } from '@/lib/team-stats'
import { getMatchesForStage, type StageId } from '@/lib/tournament-stages'
import type { AllTeamsTableRow } from '@/types/stats'

const emptyGroupStats = {
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
}

export function useAllTeamsTable(stageId: StageId) {
  const groupsQuery = useGroups()
  const matchesQuery = useMatches()
  const rankingsQuery = useRankings()

  const rows = useMemo((): AllTeamsTableRow[] => {
    if (!groupsQuery.data || !matchesQuery.data || !rankingsQuery.data) {
      return []
    }

    const allTeams = groupsQuery.data.groups.flatMap((group) => group.teams)
    const matches = matchesQuery.data
    const rankings = rankingsQuery.data
    const stageMatches = getMatchesForStage(stageId, matches)
    const teamStats = computeAllTeamsStats(stageMatches, allTeams)
    const probabilities = computeTournamentWinProbability(stageId, matches, rankings, allTeams)
    const statsByTeam = new Map(teamStats.map((stats) => [stats.teamName, stats]))

    return probabilities.map((probability) => {
      const stats = statsByTeam.get(probability.teamName) ?? emptyGroupStats

      return {
        teamName: probability.teamName,
        winProbability: probability.winProbability,
        isEliminated: probability.isEliminated,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference: stats.goalDifference,
      }
    })
  }, [stageId, groupsQuery.data, matchesQuery.data, rankingsQuery.data])

  return {
    rows,
    isLoading: groupsQuery.isLoading || matchesQuery.isLoading || rankingsQuery.isLoading,
    isFetching: groupsQuery.isFetching || matchesQuery.isFetching || rankingsQuery.isFetching,
    isError: groupsQuery.isError || matchesQuery.isError || rankingsQuery.isError,
    refetch: async () => {
      await Promise.all([groupsQuery.refetch(), matchesQuery.refetch(), rankingsQuery.refetch()])
    },
  }
}
