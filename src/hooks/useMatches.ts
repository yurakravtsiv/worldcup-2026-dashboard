import { useQuery } from '@tanstack/react-query'
import { apiClient, buildQueryString } from '@/lib/api-client'
import type { Match, TeamRanking, TournamentGroups } from '@/types/football'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient<TournamentGroups>('/groups'),
  })
}

export type MatchFilters = {
  group?: string
  round?: string
}

export function useMatches(filters?: MatchFilters) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () =>
      apiClient<Match[]>(
        `/matches${buildQueryString({
          group: filters?.group,
          round: filters?.round,
        })}`,
      ),
  })
}

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: () => apiClient<TeamRanking[]>('/rankings'),
  })
}
