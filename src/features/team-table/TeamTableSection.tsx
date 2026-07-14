import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StageSelector } from '@/features/team-table/StageSelector'
import { TeamSearchInput } from '@/features/team-table/TeamSearchInput'
import {
  TeamTable,
  type TeamTableSortBy,
  type TeamTableSortDirection,
} from '@/features/team-table/TeamTable'
import { useAllTeamsTable } from '@/hooks/useAllTeamsTable'
import { useMatches } from '@/hooks/useMatches'
import { getAvailableStages, type StageId } from '@/lib/tournament-stages'
import type { AllTeamsTableRow } from '@/types/stats'

const DEFAULT_SORT_BY: TeamTableSortBy = 'winProbability'
const DEFAULT_SORT_DIRECTION: TeamTableSortDirection = 'desc'

function TeamTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

type TeamTableErrorStateProps = {
  onRetry: () => void
  isRetrying: boolean
}

function TeamTableErrorState({ onRetry, isRetrying }: TeamTableErrorStateProps) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4" role="alert">
      <p className="text-sm font-medium text-destructive">Failed to load power rankings</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong while fetching tournament data. Please try again.
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

function compareActiveRows(
  a: AllTeamsTableRow,
  b: AllTeamsTableRow,
  sortBy: TeamTableSortBy,
  sortDirection: TeamTableSortDirection,
): number {
  let comparison = 0

  switch (sortBy) {
    case 'teamName':
      comparison = a.teamName.localeCompare(b.teamName)
      break
    case 'winProbability':
      comparison = a.winProbability - b.winProbability
      break
    case 'goalsFor':
      comparison = a.goalsFor - b.goalsFor
      break
    case 'goalsAgainst':
      comparison = a.goalsAgainst - b.goalsAgainst
      break
    case 'goalDifference':
      comparison = a.goalDifference - b.goalDifference
      break
  }

  if (comparison === 0) {
    comparison = a.teamName.localeCompare(b.teamName)
  }

  return sortDirection === 'asc' ? comparison : -comparison
}

function isValidStageId(
  stageId: string,
  availableStages: { id: StageId; label: string }[],
): stageId is StageId {
  return availableStages.some((stage) => stage.id === stageId)
}

export function TeamTableSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const matchesQuery = useMatches()
  const availableStages = useMemo(
    () => (matchesQuery.data ? getAvailableStages(matchesQuery.data) : []),
    [matchesQuery.data],
  )

  const stageParam = searchParams.get('stage')
  const selectedStageId = useMemo(() => {
    if (stageParam && isValidStageId(stageParam, availableStages)) {
      return stageParam
    }

    return availableStages.at(-1)?.id ?? 'group-1'
  }, [availableStages, stageParam])

  const searchQuery = searchParams.get('search') ?? ''
  const [sortBy, setSortBy] = useState<TeamTableSortBy>(DEFAULT_SORT_BY)
  const [sortDirection, setSortDirection] = useState<TeamTableSortDirection>(DEFAULT_SORT_DIRECTION)

  const { rows, isLoading, isFetching, isError, refetch } = useAllTeamsTable(selectedStageId)

  const handleStageChange = useCallback(
    (newStageId: StageId) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          next.set('stage', newStageId)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          const trimmedValue = value.trim()

          if (trimmedValue) {
            next.set('search', trimmedValue)
          } else {
            next.delete('search')
          }

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const handleSortChange = useCallback(
    (column: TeamTableSortBy) => {
      if (sortBy === column) {
        setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'))
        return
      }

      setSortBy(column)
      setSortDirection('desc')
    },
    [sortBy],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return rows
    }

    return rows.filter((row) => row.teamName.toLowerCase().includes(normalizedQuery))
  }, [rows, searchQuery])

  const sortedRows = useMemo(() => {
    const activeTeams = filteredRows.filter((row) => !row.isEliminated)
    const eliminatedTeams = filteredRows.filter((row) => row.isEliminated)

    const sortedActiveTeams = [...activeTeams].sort((a, b) =>
      compareActiveRows(a, b, sortBy, sortDirection),
    )
    const sortedEliminatedTeams = [...eliminatedTeams].sort((a, b) =>
      a.teamName.localeCompare(b.teamName),
    )

    return [...sortedActiveTeams, ...sortedEliminatedTeams]
  }, [filteredRows, sortBy, sortDirection])

  const handleRetry = () => {
    void refetch()
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Power Rankings</h2>
        <p className="text-sm text-muted-foreground">
          Team strength rankings and stats, snapshot by tournament stage.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <StageSelector
          stages={availableStages}
          value={selectedStageId}
          onChange={handleStageChange}
          isLoading={matchesQuery.isLoading}
        />
        <TeamSearchInput value={searchQuery} onChange={handleSearchChange} />
      </div>

      {isLoading ? <TeamTableSkeleton /> : null}

      {isError ? <TeamTableErrorState onRetry={handleRetry} isRetrying={isFetching} /> : null}

      {!isLoading && !isError ? (
        <TeamTable
          rows={sortedRows}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      ) : null}
    </section>
  )
}
