import { TeamFlag } from '@/components/team-flag'
import { cn } from '@/lib/utils'
import type { Match, MatchScore } from '@/types/football'

type MatchScoreCardProps = {
  match: Match
  className?: string
}

function formatScoreLine([home, away]: [number, number]): string {
  return `${home}–${away}`
}

function formatMatchDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)

  if (!year || !month || !day) {
    return date
  }

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function getScoreDetails(score: MatchScore) {
  const details: string[] = []

  if (score.et) {
    details.push('AET')
  }

  if (score.p) {
    details.push(`Pen: ${formatScoreLine(score.p)}`)
  }

  return details
}

export function MatchScoreCard({ match, className }: MatchScoreCardProps) {
  const score = match.score

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 font-medium">
          <TeamFlag teamName={match.team1} />
          <span className="truncate">{match.team1}</span>
        </div>
        <span className="shrink-0 font-semibold tabular-nums">
          {score ? formatScoreLine(score.ft) : '–'}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 font-medium">
          <span className="truncate text-right">{match.team2}</span>
          <TeamFlag teamName={match.team2} />
        </div>
      </div>

      {score && getScoreDetails(score).length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">{getScoreDetails(score).join(' · ')}</p>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        {formatMatchDate(match.date)} · {match.round}
      </p>
    </div>
  )
}
