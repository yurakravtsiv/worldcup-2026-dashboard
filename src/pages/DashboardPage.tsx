import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Overview of groups, standings, and matches.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Select a group to view standings and fixtures.
      </CardContent>
    </Card>
  )
}
