import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { TeamCode } from '@/types/football'

export function useTeamCodes() {
  return useQuery({
    queryKey: ['team-codes'],
    queryFn: () => apiClient<TeamCode[]>('/team-codes'),
  })
}
