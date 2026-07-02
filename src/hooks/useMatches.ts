import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { apiClient, buildQueryString } from '@/lib/api-client'
import type { Match } from '@/types/football'

export type MatchFilters = {
  group?: string
  round?: string
}

type UseMatchesOptions = Pick<UseQueryOptions<Match[]>, 'enabled'>

export function useMatches(filters?: MatchFilters, options?: UseMatchesOptions) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () =>
      apiClient<Match[]>(
        `/matches${buildQueryString({
          group: filters?.group,
          round: filters?.round,
        })}`,
      ),
    enabled: options?.enabled ?? true,
  })
}
