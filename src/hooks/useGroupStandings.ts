import { useMemo } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMatches } from '@/hooks/useMatches'
import { computeStandings } from '@/lib/standings'
import type { Standing } from '@/types/football'

export function useGroupStandings(groupName: string) {
  const groupsQuery = useGroups()
  const matchesQuery = useMatches()

  const group = groupsQuery.data?.groups.find((entry) => entry.name === groupName)

  const standings = useMemo((): Standing[] | undefined => {
    if (!group || !matchesQuery.data) {
      return undefined
    }

    return computeStandings(matchesQuery.data, group.teams)
  }, [group, matchesQuery.data])

  return {
    standings,
    isLoading: groupsQuery.isLoading || matchesQuery.isLoading,
    isError: groupsQuery.isError || matchesQuery.isError,
    refetch: async () => {
      await Promise.all([groupsQuery.refetch(), matchesQuery.refetch()])
    },
  }
}
