import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { GroupDifficultyResult } from '@/types/stats'

type GroupDifficultyListProps = {
  groups: GroupDifficultyResult[]
}

export function GroupDifficultyList({ groups }: GroupDifficultyListProps) {
  const maxPointsSpread = useMemo(
    () => Math.max(...groups.map((group) => group.pointsSpread), 1),
    [groups],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group difficulty</CardTitle>
        <CardDescription>
          Most competitive groups first (small points spread), most predictable last.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No group data available yet.</p>
        ) : (
          <ul className="space-y-4" aria-label="Group difficulty by points spread">
            {groups.map((group) => {
              const spreadPercent = (group.pointsSpread / maxPointsSpread) * 100

              return (
                <li key={group.groupName} className="space-y-2">
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="font-medium">{group.groupName}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {group.pointsSpread} pts · GD spread {group.goalDifferenceSpread}
                    </span>
                  </div>
                  <Progress
                    value={spreadPercent}
                    aria-label={`${group.groupName}: ${group.pointsSpread} point spread`}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
