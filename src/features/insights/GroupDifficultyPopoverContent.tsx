import { TeamFlag } from '@/components/team-flag'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useGroupStandings } from '@/hooks/useGroupStandings'

type GroupDifficultyPopoverContentProps = {
  groupName: string
}

export function GroupDifficultyPopoverContent({ groupName }: GroupDifficultyPopoverContentProps) {
  const { standings, isLoading, isError } = useGroupStandings(groupName)

  if (isLoading) {
    return (
      <div className="space-y-2" aria-live="polite">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-destructive">Could not load standings.</p>
  }

  if (!standings || standings.length === 0) {
    return <p className="text-sm text-muted-foreground">No standings available.</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{groupName}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Team</TableHead>
            <TableHead scope="col" className="text-right">
              P
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
              Pts
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing) => (
            <TableRow key={standing.teamName}>
              <TableCell className="font-medium">
                <span className="inline-flex items-center gap-2">
                  <TeamFlag teamName={standing.teamName} />
                  {standing.teamName}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">{standing.played}</TableCell>
              <TableCell className="text-right tabular-nums">{standing.won}</TableCell>
              <TableCell className="text-right tabular-nums">{standing.drawn}</TableCell>
              <TableCell className="text-right tabular-nums">{standing.lost}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{standing.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
