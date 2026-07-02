import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupSelector } from '@/features/standings/GroupSelector'
import { StandingsTable } from '@/features/standings/StandingsTable'
import { useGroupStandings } from '@/hooks/useGroupStandings'
import { useDashboardFilters, type SortBy } from '@/store/dashboard-filters'

function StandingsTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

type StandingsErrorStateProps = {
  onRetry: () => void
  isRetrying: boolean
}

function StandingsErrorState({ onRetry, isRetrying }: StandingsErrorStateProps) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4" role="alert">
      <p className="text-sm font-medium text-destructive">Failed to load standings</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong while fetching group data. Please try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? 'Retrying…' : 'Retry'}
      </Button>
    </div>
  )
}

export function StandingsSection() {
  const selectedGroupName = useDashboardFilters((state) => state.selectedGroupName)
  const sortBy = useDashboardFilters((state) => state.sortBy)
  const sortDirection = useDashboardFilters((state) => state.sortDirection)
  const setSortBy = useDashboardFilters((state) => state.setSortBy)
  const setSortDirection = useDashboardFilters((state) => state.setSortDirection)

  const { standings, isLoading, isFetching, isError, refetch } =
    useGroupStandings(selectedGroupName)

  const handleSortChange = (column: SortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortBy(column)
    setSortDirection(column === 'name' ? 'asc' : 'desc')
  }

  const handleRetry = () => {
    void refetch()
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Group standings</h2>
          <p className="text-sm text-muted-foreground">Points table for the selected group.</p>
        </div>
        <GroupSelector />
      </div>

      {!selectedGroupName ? (
        <p className="text-sm text-muted-foreground">Select a group to view the standings table.</p>
      ) : null}

      {selectedGroupName && isLoading ? <StandingsTableSkeleton /> : null}

      {selectedGroupName && isError ? (
        <StandingsErrorState onRetry={handleRetry} isRetrying={isFetching} />
      ) : null}

      {selectedGroupName && !isLoading && !isError ? (
        <StandingsTable
          standings={standings}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      ) : null}
    </section>
  )
}
