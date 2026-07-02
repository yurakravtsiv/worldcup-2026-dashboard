import { useMemo } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMatches } from '@/hooks/useMatches'
import { useRankings } from '@/hooks/useRankings'
import {
  computeCleanSheetsAndBiggestWins,
  computeGoalsTimeline,
  computeGroupDifficulty,
  computeUpsetIndex,
} from '@/lib/stats'
import type {
  CleanSheetsAndBiggestWinsResult,
  GoalsTimelineEntry,
  GroupDifficultyResult,
  UpsetResult,
} from '@/types/stats'

const emptyCleanSheetsAndWins: CleanSheetsAndBiggestWinsResult = {
  cleanSheets: [],
  biggestWins: [],
}

export function useTournamentStats() {
  const groupsQuery = useGroups()
  const matchesQuery = useMatches()
  const rankingsQuery = useRankings()

  const upsets = useMemo((): UpsetResult[] => {
    if (!matchesQuery.data || !rankingsQuery.data) {
      return []
    }

    return computeUpsetIndex(matchesQuery.data, rankingsQuery.data)
  }, [matchesQuery.data, rankingsQuery.data])

  const groupDifficulty = useMemo((): GroupDifficultyResult[] => {
    if (!groupsQuery.data || !matchesQuery.data) {
      return []
    }

    return computeGroupDifficulty(groupsQuery.data.groups, matchesQuery.data)
  }, [groupsQuery.data, matchesQuery.data])

  const cleanSheetsAndWins = useMemo((): CleanSheetsAndBiggestWinsResult => {
    if (!matchesQuery.data) {
      return emptyCleanSheetsAndWins
    }

    return computeCleanSheetsAndBiggestWins(matchesQuery.data)
  }, [matchesQuery.data])

  const goalsTimeline = useMemo((): GoalsTimelineEntry[] => {
    if (!matchesQuery.data) {
      return []
    }

    return computeGoalsTimeline(matchesQuery.data)
  }, [matchesQuery.data])

  return {
    upsets,
    groupDifficulty,
    cleanSheetsAndWins,
    goalsTimeline,
    isLoading: groupsQuery.isLoading || matchesQuery.isLoading || rankingsQuery.isLoading,
    isError: groupsQuery.isError || matchesQuery.isError || rankingsQuery.isError,
  }
}
