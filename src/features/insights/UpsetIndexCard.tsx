import { HoverOrTapPopover } from '@/components/hover-or-tap-popover'
import { MatchScoreCard } from '@/components/match-score-card'
import { TeamFlag } from '@/components/team-flag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TeamCode } from '@/types/football'
import type { UpsetResult } from '@/types/stats'

type UpsetIndexCardProps = {
  upsets: UpsetResult[]
  teamCodes: TeamCode[]
}

export function UpsetIndexCard({ upsets, teamCodes }: UpsetIndexCardProps) {
  const topUpsets = upsets.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upset index</CardTitle>
        <CardDescription>Top ranking-gap surprises in completed matches.</CardDescription>
      </CardHeader>
      <CardContent>
        {topUpsets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upsets recorded yet.</p>
        ) : (
          <ol className="space-y-1" aria-label="Top 5 upsets by ranking gap">
            {topUpsets.map((upset, index) => (
              <li
                key={`${upset.match.date}-${upset.winner}-${upset.loser}`}
                className="text-sm [&_button]:-mx-2 [&_button]:flex [&_button]:w-full [&_button]:min-w-0 [&_button]:cursor-pointer [&_button]:rounded [&_button]:px-2 [&_button]:py-1.5 [&_button]:hover:bg-muted/50 [&_button]:hover:no-underline"
              >
                <HoverOrTapPopover
                  trigger={
                    <span className="flex w-full flex-wrap items-center gap-x-1.5 gap-y-1">
                      <span className="font-medium text-muted-foreground">{index + 1}.</span>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <TeamFlag teamName={upset.winner} />
                        {upset.winner}
                      </span>
                      <span className="text-muted-foreground">beat</span>
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <TeamFlag teamName={upset.loser} />
                        {upset.loser}
                      </span>
                      <span className="text-muted-foreground">— ranking gap</span>
                      <span className="font-semibold tabular-nums">{upset.rankingGap}</span>
                    </span>
                  }
                >
                  <MatchScoreCard match={upset.match} codes={teamCodes} />
                </HoverOrTapPopover>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
