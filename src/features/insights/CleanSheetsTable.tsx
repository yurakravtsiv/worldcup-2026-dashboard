import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TeamCleanSheetCount } from '@/types/stats'

type CleanSheetsTableProps = {
  cleanSheets: TeamCleanSheetCount[]
  limit?: number
}

export function CleanSheetsTable({ cleanSheets, limit = 10 }: CleanSheetsTableProps) {
  const rows = cleanSheets.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clean sheets</CardTitle>
        <CardDescription>Teams that did not concede in completed matches.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clean sheets recorded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Clean sheets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry, index) => (
                <TableRow key={entry.teamName}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{entry.teamName}</TableCell>
                  <TableCell className="text-right tabular-nums">{entry.cleanSheets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
