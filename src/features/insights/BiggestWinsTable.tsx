import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Loser</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry, index) => (
                <TableRow key={`${entry.match.date}-${entry.winner}-${entry.loser}`}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{entry.winner}</TableCell>
                  <TableCell>{entry.loser}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    +{entry.margin}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
