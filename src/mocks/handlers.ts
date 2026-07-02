import { http, HttpResponse } from 'msw'
import type { Match, TeamRanking, TournamentGroups } from '@/types/football'
import groupsFixture from '@/mocks/fixtures/groups.json'
import matchesFixture from '@/mocks/fixtures/matches.json'
import rankingsFixture from '@/mocks/fixtures/fifa-rankings.json'

const groupsData = groupsFixture as TournamentGroups
const matchesData = matchesFixture as { name: string; matches: Match[] }
const rankingsData = rankingsFixture as TeamRanking[]

function randomDelay(): Promise<void> {
  const ms = 300 + Math.floor(Math.random() * 301)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const handlers = [
  http.get('/api/groups', async () => {
    await randomDelay()
    return HttpResponse.json(groupsData)
  }),

  http.get('/api/matches', async ({ request }) => {
    await randomDelay()

    const url = new URL(request.url)
    const group = url.searchParams.get('group')
    const round = url.searchParams.get('round')

    let matches = matchesData.matches

    if (group) {
      matches = matches.filter((match) => match.group === group)
    }

    if (round) {
      matches = matches.filter((match) => match.round === round)
    }

    return HttpResponse.json(matches)
  }),

  http.get('/api/rankings', async () => {
    await randomDelay()
    return HttpResponse.json(rankingsData)
  }),
]
