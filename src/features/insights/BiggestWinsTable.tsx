import { HoverOrTapPopover } from '@/components/hover-or-tap-popover'
import { MatchScoreCard } from '@/components/match-score-card'
import { TeamFlag } from '@/components/team-flag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TeamCode } from '@/types/football'
import type { MatchWithMargin } from '@/types/stats'

type BiggestWinsTableProps = {
  biggestWins: MatchWithMargin[]
  teamCodes: TeamCode[]
  limit?: number
}

const DESKTOP_GRID_CLASS =
  'grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_4rem] items-center gap-x-2 px-2'

function TeamCell({ teamName, emphasized = false }: { teamName: string; emphasized?: boolean }) {
  return (
    <span
      className={
        emphasized
          ? 'flex min-w-0 items-center gap-1.5 font-medium'
          : 'flex min-w-0 items-center gap-1.5'
      }
    >
      <TeamFlag teamName={teamName} />
      <span className="truncate">{teamName}</span>
    </span>
  )
}

function BiggestWinRowContent({
  entry,
  index,
  layout,
}: {
  entry: MatchWithMargin
  index: number
  layout: 'mobile' | 'desktop'
}) {
  if (layout === 'mobile') {
    return (
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
        <span className="shrink-0 font-semibold tabular-nums whitespace-nowrap text-stat-positive">
          +{entry.margin}
        </span>
      </div>
    )
  }

  return (
    <>
      <span className="text-muted-foreground">{index + 1}</span>
      <TeamCell teamName={entry.winner} emphasized />
      <TeamCell teamName={entry.loser} />
      <span className="text-right font-semibold tabular-nums whitespace-nowrap text-stat-positive">
        +{entry.margin}
      </span>
    </>
  )
}

export function BiggestWinsTable({ biggestWins, teamCodes, limit = 10 }: BiggestWinsTableProps) {
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
                  <HoverOrTapPopover
                    trigger={
                      <span className="block w-full no-underline hover:no-underline">
                        <BiggestWinRowContent entry={entry} index={index} layout="mobile" />
                      </span>
                    }
                  >
                    <MatchScoreCard match={entry.match} codes={teamCodes} />
                  </HoverOrTapPopover>
                </li>
              ))}
            </ul>

            <div
              className="hidden md:block min-w-[28rem] text-sm"
              aria-label="Biggest wins ranking"
            >
              <div
                className={`${DESKTOP_GRID_CLASS} h-10 border-b font-medium text-foreground`}
                role="row"
              >
                <span role="columnheader">#</span>
                <span role="columnheader">Winner</span>
                <span role="columnheader">Loser</span>
                <span role="columnheader" className="text-right">
                  Margin
                </span>
              </div>
              {rows.map((entry, index) => (
                <div
                  key={`${entry.match.date}-${entry.winner}-${entry.loser}`}
                  className="border-b transition-colors last:border-b-0 hover:bg-muted/50 [&_button]:flex [&_button]:w-full [&_button]:min-w-0"
                  role="row"
                >
                  <HoverOrTapPopover
                    trigger={
                      <span
                        className={`${DESKTOP_GRID_CLASS} block w-full py-2 no-underline hover:bg-muted/50 hover:no-underline`}
                      >
                        <BiggestWinRowContent entry={entry} index={index} layout="desktop" />
                      </span>
                    }
                  >
                    <MatchScoreCard match={entry.match} codes={teamCodes} />
                  </HoverOrTapPopover>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
