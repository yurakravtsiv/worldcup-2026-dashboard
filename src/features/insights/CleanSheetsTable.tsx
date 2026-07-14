import { TeamFlag } from '@/components/team-flag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TeamCleanSheetCount } from '@/types/stats'

type CleanSheetsTableProps = {
  cleanSheets: TeamCleanSheetCount[]
  limit?: number
}

const DESKTOP_GRID_CLASS = 'grid grid-cols-[2rem_minmax(0,1fr)_7rem] items-center gap-x-2 px-2'

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
                    <span className="inline-flex min-w-0 items-center gap-2 font-medium">
                      <TeamFlag teamName={entry.teamName} />
                      <span className="truncate">{entry.teamName}</span>
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums whitespace-nowrap">
                    {entry.cleanSheets}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="hidden min-w-[20rem] text-sm sm:block"
              aria-label="Clean sheets ranking"
            >
              <div
                className={`${DESKTOP_GRID_CLASS} h-10 border-b font-medium text-foreground`}
                role="row"
              >
                <span role="columnheader">#</span>
                <span role="columnheader">Team</span>
                <span role="columnheader" className="text-right whitespace-nowrap">
                  Clean sheets
                </span>
              </div>
              {rows.map((entry, index) => (
                <div
                  key={entry.teamName}
                  className={`${DESKTOP_GRID_CLASS} border-b py-2 transition-colors last:border-b-0 hover:bg-muted/50`}
                  role="row"
                >
                  <span className="text-muted-foreground">{index + 1}</span>
                  <span className="flex min-w-0 items-center gap-1.5 font-medium">
                    <TeamFlag teamName={entry.teamName} />
                    <span className="truncate">{entry.teamName}</span>
                  </span>
                  <span className="text-right tabular-nums whitespace-nowrap">
                    {entry.cleanSheets}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
