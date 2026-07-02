import { useMemo } from 'react'
import { useGroups } from '@/hooks/useGroups'
import { useMatches } from '@/hooks/useMatches'
import { computeStandings } from '@/lib/standings'
import type { Standing } from '@/types/football'

export function useGroupStandings(groupName: string | null) {
  const groupsQuery = useGroups()
  const matchesQuery = useMatches(groupName ? { group: groupName } : undefined, {
    enabled: Boolean(groupName),
  })

  const standings = useMemo((): Standing[] => {
    if (!groupName || !groupsQuery.data || !matchesQuery.data) {
      return []
    }

    const group = groupsQuery.data.groups.find((entry) => entry.name === groupName)
    if (!group) {
      return []
    }

    return computeStandings(matchesQuery.data, group.teams)
  }, [groupName, groupsQuery.data, matchesQuery.data])

  return {
    standings,
    isLoading: groupsQuery.isLoading || matchesQuery.isLoading,
    isFetching: groupsQuery.isFetching || matchesQuery.isFetching,
    isError: groupsQuery.isError || matchesQuery.isError,
    refetch: async () => {
      await Promise.all([
        groupsQuery.refetch(),
        groupName ? matchesQuery.refetch() : Promise.resolve(),
      ])
    },
  }
}
