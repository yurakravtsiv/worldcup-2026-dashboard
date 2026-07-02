import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function GroupDetailPage() {
  const { groupName } = useParams<{ groupName: string }>()
  const decodedGroupName = groupName ? decodeURIComponent(groupName) : ''

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{decodedGroupName || 'Group'}</CardTitle>
          <CardDescription>Standings, matches, and team details for this group.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Group detail content will go here.
        </CardContent>
      </Card>
    </div>
  )
}
