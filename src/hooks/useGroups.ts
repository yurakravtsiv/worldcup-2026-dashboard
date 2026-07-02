import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { TournamentGroups } from '@/types/football'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiClient<TournamentGroups>('/groups'),
  })
}
