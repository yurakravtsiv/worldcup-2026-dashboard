import { TeamFlag } from '@/components/team-flag'
import { getTeamCode } from '@/lib/team-codes'
import { cn } from '@/lib/utils'
import type { Match, MatchScore, TeamCode } from '@/types/football'

type MatchScoreCardProps = {
  match: Match
  codes: TeamCode[]
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

export function MatchScoreCard({ match, codes, className }: MatchScoreCardProps) {
  const score = match.score
  const team1Code = getTeamCode(match.team1, codes)
  const team2Code = getTeamCode(match.team2, codes)

  return (
    <div className={cn('w-56 max-w-56 space-y-1.5 text-sm', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 font-semibold tracking-wide">
          <TeamFlag teamName={match.team1} />
          <span className="truncate whitespace-nowrap" aria-label={match.team1}>
            {team1Code}
          </span>
        </div>
        <span className="shrink-0 px-1 font-semibold tabular-nums whitespace-nowrap">
          {score ? formatScoreLine(score.ft) : '–'}
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 font-semibold tracking-wide">
          <span className="truncate text-right whitespace-nowrap" aria-label={match.team2}>
            {team2Code}
          </span>
          <TeamFlag teamName={match.team2} />
        </div>
      </div>

      {score && getScoreDetails(score).length > 0 ? (
        <p className="text-center text-xs leading-snug text-muted-foreground whitespace-nowrap">
          {getScoreDetails(score).join(' · ')}
        </p>
      ) : null}

      <p className="text-center text-xs leading-snug text-muted-foreground">
        <span className="block truncate">{formatMatchDate(match.date)}</span>
        <span className="block truncate">{match.round}</span>
      </p>
    </div>
  )
}
