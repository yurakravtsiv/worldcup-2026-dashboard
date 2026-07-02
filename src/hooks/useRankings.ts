import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { TeamRanking } from '@/types/football'

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: () => apiClient<TeamRanking[]>('/rankings'),
  })
}
