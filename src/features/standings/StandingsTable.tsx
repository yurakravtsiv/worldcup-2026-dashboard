import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSortChange(column)}
        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
      >
        {label}
        {isActive ? (
          sortDirection === 'asc' ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : null}
      </button>
    </TableHead>
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <SortableHeader
            column="name"
            label={columnLabels.name}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
          />
          <TableHead className="text-right">{columnLabels.played}</TableHead>
          <TableHead className="text-right">W</TableHead>
          <TableHead className="text-right">D</TableHead>
          <TableHead className="text-right">L</TableHead>
          <TableHead className="text-right">GF</TableHead>
          <TableHead className="text-right">GA</TableHead>
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
            <TableCell className="text-right">{standing.played}</TableCell>
            <TableCell className="text-right">{standing.won}</TableCell>
            <TableCell className="text-right">{standing.drawn}</TableCell>
            <TableCell className="text-right">{standing.lost}</TableCell>
            <TableCell className="text-right">{standing.goalsFor}</TableCell>
            <TableCell className="text-right">{standing.goalsAgainst}</TableCell>
            <TableCell
              className={cn(
                'text-right',
                standing.goalDifference > 0 && 'text-emerald-600 dark:text-emerald-400',
                standing.goalDifference < 0 && 'text-red-600 dark:text-red-400',
              )}
            >
              {standing.goalDifference > 0
                ? `+${standing.goalDifference}`
                : standing.goalDifference}
            </TableCell>
            <TableCell className="text-right font-semibold">{standing.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
