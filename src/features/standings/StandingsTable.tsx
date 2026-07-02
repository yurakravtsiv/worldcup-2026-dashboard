import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { activateOnEnterOrSpace, sortButtonClassName } from '@/lib/a11y'
import { cn } from '@/lib/utils'
import type { SortBy, SortDirection } from '@/store/dashboard-filters'
import type { Standing } from '@/types/football'

type StandingsTableProps = {
  standings: Standing[]
  sortBy: SortBy
  sortDirection: SortDirection
  onSortChange: (sortBy: SortBy) => void
}

type SortableColumn = SortBy | 'played'

const columnLabels: Record<SortableColumn, string> = {
  name: 'Team',
  played: 'P',
  points: 'Pts',
  goalDiff: 'GD',
}

function sortStandings(
  standings: Standing[],
  sortBy: SortBy,
  sortDirection: SortDirection,
): Standing[] {
  const direction = sortDirection === 'asc' ? 1 : -1

  return [...standings].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'points') {
      comparison = a.points - b.points
    } else if (sortBy === 'goalDiff') {
      comparison = a.goalDifference - b.goalDifference
    } else {
      comparison = a.teamName.localeCompare(b.teamName)
    }

    if (comparison === 0) {
      return a.teamName.localeCompare(b.teamName)
    }

    return comparison * direction
  })
}

function getAriaSort(
  column: SortBy,
  sortBy: SortBy,
  sortDirection: SortDirection,
): 'ascending' | 'descending' | 'none' {
  if (sortBy !== column) {
    return 'none'
  }

  return sortDirection === 'asc' ? 'ascending' : 'descending'
}

function SortableHeader({
  column,
  label,
  sortBy,
  sortDirection,
  onSortChange,
  className,
}: {
  column: SortBy
  label: string
  sortBy: SortBy
  sortDirection: SortDirection
  onSortChange: (sortBy: SortBy) => void
  className?: string
}) {
  const isActive = sortBy === column

  return (
    <TableHead
      scope="col"
      aria-sort={getAriaSort(column, sortBy, sortDirection)}
      className={className}
    >
      <button
        type="button"
        onClick={() => onSortChange(column)}
        onKeyDown={(event) => activateOnEnterOrSpace(event, () => onSortChange(column))}
        className={sortButtonClassName}
        aria-label={`Sort by ${label}${isActive ? `, ${sortDirection === 'asc' ? 'ascending' : 'descending'}` : ''}`}
      >
        {label}
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUpIcon className="size-3.5" aria-hidden="true" />
          ) : (
            <ArrowDownIcon className="size-3.5" aria-hidden="true" />
          )
        ) : null}
      </button>
    </TableHead>
  )
}

function goalDifferenceClassName(goalDifference: number): string {
  return cn(goalDifference > 0 && 'text-stat-positive', goalDifference < 0 && 'text-stat-negative')
}

function formatGoalDifference(goalDifference: number): string {
  return goalDifference > 0 ? `+${goalDifference}` : String(goalDifference)
}

function StandingsMobileCards({ standings }: { standings: Standing[] }) {
  return (
    <ul className="space-y-3 md:hidden" aria-label="Group standings">
      {standings.map((standing, index) => (
        <li
          key={standing.teamName}
          className="rounded-lg border border-border bg-card p-3 text-sm shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {standing.teamName}
              </p>
              <p className="mt-1 text-muted-foreground">
                P {standing.played} · W {standing.won} · D {standing.drawn} · L {standing.lost}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">{standing.points} pts</p>
              <p
                className={cn(
                  'mt-1 tabular-nums',
                  goalDifferenceClassName(standing.goalDifference),
                )}
              >
                GD {formatGoalDifference(standing.goalDifference)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground tabular-nums">
            GF {standing.goalsFor} · GA {standing.goalsAgainst}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function StandingsTable({
  standings,
  sortBy,
  sortDirection,
  onSortChange,
}: StandingsTableProps) {
  const sortedStandings = useMemo(
    () => sortStandings(standings, sortBy, sortDirection),
    [standings, sortBy, sortDirection],
  )

  if (sortedStandings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No standings available for this group yet.</p>
    )
  }

  return (
    <>
      <StandingsMobileCards standings={sortedStandings} />

      <div className="hidden md:block">
        <Table className="min-w-[640px]">
          <TableCaption className="sr-only">Group standings table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-10">
                #
              </TableHead>
              <SortableHeader
                column="name"
                label={columnLabels.name}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
              />
              <TableHead scope="col" className="text-right">
                {columnLabels.played}
              </TableHead>
              <TableHead scope="col" className="text-right">
                W
              </TableHead>
              <TableHead scope="col" className="text-right">
                D
              </TableHead>
              <TableHead scope="col" className="text-right">
                L
              </TableHead>
              <TableHead scope="col" className="text-right">
                GF
              </TableHead>
              <TableHead scope="col" className="text-right">
                GA
              </TableHead>
              <SortableHeader
                column="goalDiff"
                label={columnLabels.goalDiff}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                className="text-right"
              />
              <SortableHeader
                column="points"
                label={columnLabels.points}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                className="text-right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStandings.map((standing, index) => (
              <TableRow key={standing.teamName}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{standing.teamName}</TableCell>
                <TableCell className="text-right tabular-nums">{standing.played}</TableCell>
                <TableCell className="text-right tabular-nums">{standing.won}</TableCell>
                <TableCell className="text-right tabular-nums">{standing.drawn}</TableCell>
                <TableCell className="text-right tabular-nums">{standing.lost}</TableCell>
                <TableCell className="text-right tabular-nums">{standing.goalsFor}</TableCell>
                <TableCell className="text-right tabular-nums">{standing.goalsAgainst}</TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums',
                    goalDifferenceClassName(standing.goalDifference),
                  )}
                >
                  {formatGoalDifference(standing.goalDifference)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {standing.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
