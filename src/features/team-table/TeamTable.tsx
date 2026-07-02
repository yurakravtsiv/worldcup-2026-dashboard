import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { activateOnEnterOrSpace } from '@/lib/a11y'
import { cn } from '@/lib/utils'
import type { AllTeamsTableRow } from '@/types/stats'

export type TeamTableSortBy =
  'teamName' | 'winProbability' | 'goalsFor' | 'goalsAgainst' | 'goalDifference'

export type TeamTableSortDirection = 'asc' | 'desc'

type TeamTableProps = {
  rows: AllTeamsTableRow[]
  sortBy: TeamTableSortBy
  sortDirection: TeamTableSortDirection
  onSortChange: (column: TeamTableSortBy) => void
}

type SortableColumn = {
  sortBy: TeamTableSortBy
  label: string
  hint?: string
  align?: 'left' | 'right'
}

type StaticColumn = {
  label: string
  align?: 'left' | 'right'
}

type TableColumn = ({ kind: 'sortable' } & SortableColumn) | ({ kind: 'static' } & StaticColumn)

const columns: TableColumn[] = [
  { kind: 'sortable', sortBy: 'teamName', label: 'Team' },
  {
    kind: 'sortable',
    sortBy: 'winProbability',
    label: 'Win Probability',
    hint: 'Heuristic strength score',
    align: 'right',
  },
  { kind: 'static', label: 'Played', align: 'right' },
  { kind: 'static', label: 'Won', align: 'right' },
  { kind: 'static', label: 'Drawn', align: 'right' },
  { kind: 'static', label: 'Lost', align: 'right' },
  { kind: 'sortable', sortBy: 'goalsFor', label: 'Goals For', align: 'right' },
  { kind: 'sortable', sortBy: 'goalsAgainst', label: 'Goals Against', align: 'right' },
  { kind: 'sortable', sortBy: 'goalDifference', label: 'Goal Diff', align: 'right' },
]

function getAriaSortValue(
  column: TeamTableSortBy,
  activeColumn: TeamTableSortBy,
  direction: TeamTableSortDirection,
): 'ascending' | 'descending' | 'none' {
  if (column !== activeColumn) {
    return 'none'
  }

  return direction === 'asc' ? 'ascending' : 'descending'
}

function formatWinProbability(row: AllTeamsTableRow): string {
  if (row.isEliminated) {
    return '0%'
  }

  return `${row.winProbability.toFixed(1)}%`
}

function formatGoalDifference(value: number): string {
  if (value > 0) {
    return `+${value}`
  }

  return String(value)
}

type SortableHeaderProps = {
  column: SortableColumn
  sortBy: TeamTableSortBy
  sortDirection: TeamTableSortDirection
  onSortChange: (column: TeamTableSortBy) => void
}

function SortableHeader({ column, sortBy, sortDirection, onSortChange }: SortableHeaderProps) {
  const isActive = sortBy === column.sortBy
  const ariaSort = getAriaSortValue(column.sortBy, sortBy, sortDirection)

  const handleSort = () => {
    onSortChange(column.sortBy)
  }

  return (
    <TableHead
      scope="col"
      role="button"
      tabIndex={0}
      aria-sort={ariaSort}
      onClick={handleSort}
      onKeyDown={(event) => activateOnEnterOrSpace(event, handleSort)}
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/50 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        column.align === 'right' ? 'text-right' : undefined,
      )}
    >
      <div
        className={cn(
          'flex h-full w-full min-h-10 items-center',
          column.align === 'right' && 'justify-end',
          column.hint && 'flex-col items-end justify-center gap-0.5 py-1',
        )}
      >
        <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
          {column.label}
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUpIcon className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownIcon className="size-3.5" aria-hidden="true" />
            )
          ) : null}
        </span>
        {column.hint ? (
          <span className="text-xs font-normal text-muted-foreground">{column.hint}</span>
        ) : null}
      </div>
    </TableHead>
  )
}

function StaticHeader({ column }: { column: StaticColumn }) {
  return (
    <TableHead
      scope="col"
      className={cn('cursor-default', column.align === 'right' ? 'text-right' : undefined)}
    >
      {column.label}
    </TableHead>
  )
}

export function TeamTable({ rows, sortBy, sortDirection, onSortChange }: TeamTableProps) {
  return (
    <Table className="min-w-[56rem]">
      <TableCaption className="sr-only">Tournament team statistics table</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((column) =>
            column.kind === 'sortable' ? (
              <SortableHeader
                key={column.sortBy}
                column={column}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
              />
            ) : (
              <StaticHeader key={column.label} column={column} />
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
              No teams match your search.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.teamName} className={cn(row.isEliminated && 'opacity-50')}>
              <TableCell className="font-medium">{row.teamName}</TableCell>
              <TableCell className="text-right tabular-nums">{formatWinProbability(row)}</TableCell>
              <TableCell className="text-right tabular-nums">{row.played}</TableCell>
              <TableCell className="text-right tabular-nums">{row.won}</TableCell>
              <TableCell className="text-right tabular-nums">{row.drawn}</TableCell>
              <TableCell className="text-right tabular-nums">{row.lost}</TableCell>
              <TableCell className="text-right tabular-nums">{row.goalsFor}</TableCell>
              <TableCell className="text-right tabular-nums">{row.goalsAgainst}</TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium tabular-nums',
                  row.goalDifference > 0 && 'text-stat-positive',
                  row.goalDifference < 0 && 'text-stat-negative',
                )}
              >
                {formatGoalDifference(row.goalDifference)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
