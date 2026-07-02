import { isPlayedMatch } from '@/lib/standings'
import type { Match } from '@/types/football'

export const KNOCKOUT_STAGE_ORDER = [
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Final',
] as const

export type StageId = 'group-1' | 'group-2' | 'group-3' | (typeof KNOCKOUT_STAGE_ORDER)[number]

export const ALL_STAGES: { id: StageId; label: string }[] = [
  { id: 'group-1', label: 'Group Stage — Round 1' },
  { id: 'group-2', label: 'Group Stage — Round 2' },
  { id: 'group-3', label: 'Group Stage — Round 3' },
  { id: 'Round of 32', label: 'Round of 32' },
  { id: 'Round of 16', label: 'Round of 16' },
  { id: 'Quarter-final', label: 'Quarter-final' },
  { id: 'Semi-final', label: 'Semi-final' },
  { id: 'Final', label: 'Final' },
]

function isGroupStageMatch(match: Match): boolean {
  return match.round.startsWith('Matchday')
}

function getCompletedGroupStageMatches(matches: Match[]): Match[] {
  return matches
    .filter((match) => isPlayedMatch(match) && isGroupStageMatch(match))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function hasTeamWithAtLeastNGroupMatches(matches: Match[], n: number): boolean {
  const teamMatchCounts = new Map<string, number>()

  for (const match of getCompletedGroupStageMatches(matches)) {
    teamMatchCounts.set(match.team1, (teamMatchCounts.get(match.team1) ?? 0) + 1)
    teamMatchCounts.set(match.team2, (teamMatchCounts.get(match.team2) ?? 0) + 1)
  }

  return [...teamMatchCounts.values()].some((count) => count >= n)
}

function hasCompletedKnockoutRound(
  matches: Match[],
  round: (typeof KNOCKOUT_STAGE_ORDER)[number],
): boolean {
  return matches.some((match) => match.round === round && isPlayedMatch(match))
}

export function getGroupStageMatchesUpToRound(matches: Match[], n: 1 | 2 | 3): Match[] {
  const teamMatchCounts = new Map<string, number>()
  const result: Match[] = []

  for (const match of getCompletedGroupStageMatches(matches)) {
    const team1Count = teamMatchCounts.get(match.team1) ?? 0
    const team2Count = teamMatchCounts.get(match.team2) ?? 0

    if (team1Count >= n || team2Count >= n) {
      continue
    }

    result.push(match)
    teamMatchCounts.set(match.team1, team1Count + 1)
    teamMatchCounts.set(match.team2, team2Count + 1)
  }

  return result
}

export function getAvailableStages(matches: Match[]): { id: StageId; label: string }[] {
  return ALL_STAGES.filter((stage) => {
    if (stage.id.startsWith('group-')) {
      const roundNumber = Number(stage.id.replace('group-', '')) as 1 | 2 | 3
      return hasTeamWithAtLeastNGroupMatches(matches, roundNumber)
    }

    return hasCompletedKnockoutRound(matches, stage.id as (typeof KNOCKOUT_STAGE_ORDER)[number])
  })
}

export function getMatchesForStage(stageId: StageId, matches: Match[]): Match[] {
  if (stageId.startsWith('group-')) {
    const roundNumber = Number(stageId.replace('group-', '')) as 1 | 2 | 3
    return getGroupStageMatchesUpToRound(matches, roundNumber)
  }

  const knockoutStageId = stageId as (typeof KNOCKOUT_STAGE_ORDER)[number]
  const selectedKnockoutIndex = KNOCKOUT_STAGE_ORDER.indexOf(knockoutStageId)
  const allowedKnockoutRounds = new Set(KNOCKOUT_STAGE_ORDER.slice(0, selectedKnockoutIndex + 1))

  const groupMatches = getGroupStageMatchesUpToRound(matches, 3)
  const knockoutMatches = matches.filter(
    (match) =>
      isPlayedMatch(match) &&
      allowedKnockoutRounds.has(match.round as (typeof KNOCKOUT_STAGE_ORDER)[number]),
  )

  return [...groupMatches, ...knockoutMatches]
}

export function isGroupStage(stageId: StageId): boolean {
  return stageId.startsWith('group-')
}

export function getPreviousStageId(stageId: StageId): StageId | null {
  const stageIndex = ALL_STAGES.findIndex((stage) => stage.id === stageId)

  if (stageIndex <= 0) {
    return null
  }

  return ALL_STAGES[stageIndex - 1].id
}

export function getMatchKey(match: Match): string {
  return `${match.round}|${match.date}|${match.team1}|${match.team2}`
}
