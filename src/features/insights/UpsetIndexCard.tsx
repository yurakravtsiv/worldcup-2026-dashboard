import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { UpsetResult } from '@/types/stats'

type UpsetIndexCardProps = {
  upsets: UpsetResult[]
}

export function UpsetIndexCard({ upsets }: UpsetIndexCardProps) {
  const topUpsets = upsets.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upset index</CardTitle>
        <CardDescription>Top ranking-gap surprises in completed matches.</CardDescription>
      </CardHeader>
      <CardContent>
        {topUpsets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upsets recorded yet.</p>
        ) : (
          <ol className="space-y-3">
            {topUpsets.map((upset, index) => (
              <li key={`${upset.match.date}-${upset.winner}-${upset.loser}`} className="text-sm">
                <span className="mr-2 font-medium text-muted-foreground">{index + 1}.</span>
                <span className="font-medium">{upset.winner}</span>
                <span className="text-muted-foreground"> beat </span>
                <span className="font-medium">{upset.loser}</span>
                <span className="text-muted-foreground"> — ranking gap </span>
                <span className="font-semibold tabular-nums">{upset.rankingGap}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
