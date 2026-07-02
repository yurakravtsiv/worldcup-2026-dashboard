import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InsightsSection } from '@/features/insights/InsightsSection'
import { StandingsSection } from '@/features/standings/StandingsSection'

type DashboardTab = 'overview' | 'insights'

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
        <TabsList>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="insights">Інсайти</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Keep both sections mounted so React Query hooks stay subscribed and cached data is reused without refetch. */}
      <div className={activeTab === 'overview' ? undefined : 'hidden'}>
        <StandingsSection />
      </div>
      <div className={activeTab === 'insights' ? undefined : 'hidden'}>
        <InsightsSection />
      </div>
    </div>
  )
}
