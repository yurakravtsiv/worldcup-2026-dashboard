import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BiggestWinsTable } from '@/features/insights/BiggestWinsTable'
import { CleanSheetsTable } from '@/features/insights/CleanSheetsTable'
import { GoalsTimelineChart } from '@/features/insights/GoalsTimelineChart'
import { GroupDifficultyList } from '@/features/insights/GroupDifficultyList'
import { UpsetIndexCard } from '@/features/insights/UpsetIndexCard'
import { useTournamentStats } from '@/hooks/useTournamentStats'

function InsightsSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl lg:col-span-2" />
    </div>
  )
}

type InsightsErrorStateProps = {
  onRetry: () => void
  isRetrying: boolean
}

function InsightsErrorState({ onRetry, isRetrying }: InsightsErrorStateProps) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4" role="alert">
      <p className="text-sm font-medium text-destructive">Failed to load tournament insights</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong while fetching tournament data. Please try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? 'Retrying…' : 'Retry'}
      </Button>
    </div>
  )
}

export function InsightsSection() {
  const {
    upsets,
    groupDifficulty,
    cleanSheetsAndWins,
    goalsTimeline,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTournamentStats()

  const handleRetry = () => {
    void refetch()
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tournament insights</h2>
        <p className="text-sm text-muted-foreground">
          Upsets, group competitiveness, defensive records, and scoring trends.
        </p>
      </div>

      {isLoading ? <InsightsSkeleton /> : null}

      {isError ? <InsightsErrorState onRetry={handleRetry} isRetrying={isFetching} /> : null}

      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <UpsetIndexCard upsets={upsets} />
            <CleanSheetsTable cleanSheets={cleanSheetsAndWins.cleanSheets} />
          </div>
          <div className="flex flex-col gap-6">
            <GroupDifficultyList groups={groupDifficulty} />
            <BiggestWinsTable biggestWins={cleanSheetsAndWins.biggestWins} />
          </div>
          <div className="lg:col-span-2">
            <GoalsTimelineChart timeline={goalsTimeline} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
