import { useMemo } from 'react'
import { HoverOrTapPopover } from '@/components/hover-or-tap-popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GroupDifficultyPopoverContent } from '@/features/insights/GroupDifficultyPopoverContent'
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
          <ul className="space-y-2" aria-label="Group difficulty by points spread">
            {groups.map((group) => {
              const spreadPercent = (group.pointsSpread / maxPointsSpread) * 100

              return (
                <li
                  key={group.groupName}
                  className="[&_button]:-mx-2 [&_button]:flex [&_button]:w-full [&_button]:min-w-0 [&_button]:cursor-pointer [&_button]:rounded [&_button]:px-2 [&_button]:py-2 [&_button]:hover:bg-muted/50 [&_button]:hover:no-underline"
                >
                  <HoverOrTapPopover
                    className="w-80 p-3"
                    trigger={
                      <span className="flex w-full flex-col gap-2">
                        <span className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <span className="font-medium">{group.groupName}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {group.pointsSpread} pts
                          </span>
                        </span>
                        <Progress
                          value={spreadPercent}
                          aria-label={`${group.groupName}: ${group.pointsSpread} point spread`}
                        />
                      </span>
                    }
                  >
                    <GroupDifficultyPopoverContent groupName={group.groupName} />
                  </HoverOrTapPopover>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
