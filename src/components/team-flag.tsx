import { getFlagUrl } from '@/lib/team-flags'
import { cn } from '@/lib/utils'

type TeamFlagProps = {
  teamName: string
  className?: string
}

export function TeamFlag({ teamName, className }: TeamFlagProps) {
  const url = getFlagUrl(teamName)

  if (!url) {
    return null
  }

  return (
    <img
      src={url}
      alt={`${teamName} flag`}
      className={cn('inline-block h-3.5 w-5 shrink-0 rounded-[2px] object-cover', className)}
      loading="lazy"
      width={20}
      height={14}
    />
  )
}
