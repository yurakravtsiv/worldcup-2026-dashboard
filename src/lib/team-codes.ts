import type { TeamCode } from '@/types/football'

export function getTeamCode(teamName: string, codes: TeamCode[]): string {
  return (
    codes.find((entry) => entry.teamName === teamName)?.fifaCode ??
    teamName.slice(0, 3).toUpperCase()
  )
}
