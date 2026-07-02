import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GoalsTimelineEntry } from '@/types/stats'

type GoalsTimelineChartProps = {
  timeline: GoalsTimelineEntry[]
}

function formatChartDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${month}/${day}`
}

export function GoalsTimelineChart({ timeline }: GoalsTimelineChartProps) {
  const chartData = timeline.map((entry) => ({
    ...entry,
    label: formatChartDate(entry.date),
    avgGoals: Number(entry.avgGoalsPerMatch.toFixed(2)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals timeline</CardTitle>
        <CardDescription>Average goals per match by match day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed matches to chart yet.</p>
        ) : (
          <>
            <div
              role="img"
              aria-labelledby="goals-timeline-title goals-timeline-desc"
              className="h-64 w-full"
            >
              <span id="goals-timeline-title" className="sr-only">
                Goals timeline chart
              </span>
              <span id="goals-timeline-desc" className="sr-only">
                Line chart of average goals per match by date.
              </span>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--popover-foreground)',
                    }}
                    labelFormatter={(_, payload) => {
                      const entry = payload?.[0]?.payload as GoalsTimelineEntry | undefined
                      return entry?.date ?? ''
                    }}
                    formatter={(value) => [
                      `${Number(value ?? 0).toFixed(2)} goals`,
                      'Avg per match',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgGoals"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Table className="sr-only">
              <caption>Goals timeline data table</caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Date</TableHead>
                  <TableHead scope="col">Matches played</TableHead>
                  <TableHead scope="col">Total goals</TableHead>
                  <TableHead scope="col">Average goals per match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.map((entry) => (
                  <TableRow key={entry.date}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.matchesPlayed}</TableCell>
                    <TableCell>{entry.totalGoals}</TableCell>
                    <TableCell>{entry.avgGoalsPerMatch.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
