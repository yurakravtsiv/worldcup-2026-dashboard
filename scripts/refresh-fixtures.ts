import { writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SOURCE_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
const OUTPUT_PATH = resolve(process.cwd(), 'src/mocks/fixtures/matches.json')

type RawMatch = {
  round: string
  date: string
  time?: string
  team1: string
  team2: string
  score?: { ft: [number, number]; ht?: [number, number]; et?: [number, number]; p?: [number, number] }
  goals1?: { name: string; minute: string }[]
  goals2?: { name: string; minute: string }[]
  group?: string
  ground?: string
}

type RawWorldCupData = {
  name: string
  matches: RawMatch[]
}

function validateShape(data: unknown): asserts data is RawWorldCupData {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Fetched data is not an object — upstream format may have changed.')
  }
  const candidate = data as Partial<RawWorldCupData>
  if (!Array.isArray(candidate.matches)) {
    throw new Error('Fetched data has no "matches" array — upstream format may have changed.')
  }
  const first = candidate.matches[0]
  if (!first || typeof first.team1 !== 'string' || typeof first.team2 !== 'string' || typeof first.round !== 'string') {
    throw new Error('Match objects are missing expected fields (team1/team2/round) — upstream format may have changed.')
  }
}

function countFinished(matches: RawMatch[]): number {
  return matches.filter((m) => m.score !== undefined).length
}

async function main() {
  console.log(`Fetching latest data from ${SOURCE_URL} ...`)

  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  const data: unknown = await response.json()
  validateShape(data)

  const newFinishedCount = countFinished(data.matches)

  let previousFinishedCount = 0
  try {
    const previous = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8')) as RawWorldCupData
    previousFinishedCount = countFinished(previous.matches)
  } catch {
    console.log('No existing fixture found to compare against (first run).')
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8')

  console.log(`Done. Total matches: ${data.matches.length}.`)
  console.log(`Finished matches: ${previousFinishedCount} -> ${newFinishedCount}.`)
  console.log(`Written to ${OUTPUT_PATH}`)
  console.log('Review the diff (git diff src/mocks/fixtures/matches.json) before committing.')
}

main().catch((error) => {
  console.error('Failed to refresh fixtures:')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
