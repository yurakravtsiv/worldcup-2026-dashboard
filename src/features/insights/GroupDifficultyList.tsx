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
          groups.map((group) => {
            const spreadPercent = (group.pointsSpread / maxPointsSpread) * 100

            return (
              <div key={group.groupName} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{group.groupName}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {group.pointsSpread} pts · GD spread {group.goalDifferenceSpread}
                  </span>
                </div>
                <Progress value={spreadPercent} aria-label={group.groupName} />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
