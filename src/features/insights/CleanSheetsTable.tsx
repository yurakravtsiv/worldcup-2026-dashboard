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
          <>
            <ul className="space-y-2 sm:hidden" aria-label="Clean sheets ranking">
              {rows.map((entry, index) => (
                <li
                  key={entry.teamName}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="inline-flex items-center gap-2 font-medium">
                      <TeamFlag teamName={entry.teamName} />
                      {entry.teamName}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{entry.cleanSheets}</span>
                </li>
              ))}
            </ul>

            <div className="hidden sm:block">
              <Table className="min-w-[20rem]">
                <TableCaption className="sr-only">Clean sheets ranking</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-10">
                      #
                    </TableHead>
                    <TableHead scope="col">Team</TableHead>
                    <TableHead scope="col" className="text-right">
                      Clean sheets
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((entry, index) => (
                    <TableRow key={entry.teamName}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2">
                          <TeamFlag teamName={entry.teamName} />
                          {entry.teamName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{entry.cleanSheets}</TableCell>
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
