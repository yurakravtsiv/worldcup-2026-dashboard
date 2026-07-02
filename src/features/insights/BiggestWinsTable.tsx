import { TeamFlag } from '@/components/team-flag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MatchWithMargin } from '@/types/stats'

type BiggestWinsTableProps = {
  biggestWins: MatchWithMargin[]
  limit?: number
}

export function BiggestWinsTable({ biggestWins, limit = 10 }: BiggestWinsTableProps) {
  const rows = biggestWins.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biggest wins</CardTitle>
        <CardDescription>Largest full-time margins in completed matches.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No decisive wins recorded yet.</p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden" aria-label="Biggest wins ranking">
              {rows.map((entry, index) => (
                <li
                  key={`${entry.match.date}-${entry.winner}-${entry.loser}`}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-2 font-medium">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <TeamFlag teamName={entry.winner} />
                        {entry.winner}
                      </p>
                      <p className="mt-1 inline-flex min-w-0 items-center gap-2 truncate text-muted-foreground">
                        <span>vs</span>
                        <TeamFlag teamName={entry.loser} />
                        {entry.loser}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-stat-positive">
                      +{entry.margin}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden md:block">
              <Table className="min-w-[28rem]">
                <TableCaption className="sr-only">Biggest wins ranking</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-10">
                      #
                    </TableHead>
                    <TableHead scope="col">Winner</TableHead>
                    <TableHead scope="col">Loser</TableHead>
                    <TableHead scope="col" className="text-right">
                      Margin
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((entry, index) => (
                    <TableRow key={`${entry.match.date}-${entry.winner}-${entry.loser}`}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2">
                          <TeamFlag teamName={entry.winner} />
                          {entry.winner}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <TeamFlag teamName={entry.loser} />
                          {entry.loser}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-stat-positive">
                        +{entry.margin}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
