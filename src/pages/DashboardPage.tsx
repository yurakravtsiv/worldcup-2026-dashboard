import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InsightsSection } from '@/features/insights/InsightsSection'
import { StandingsSection } from '@/features/standings/StandingsSection'

type DashboardTab = 'overview' | 'insights'

const tabs: { value: DashboardTab; label: string; panelId: string; tabId: string }[] = [
  {
    value: 'overview',
    label: 'Огляд',
    panelId: 'dashboard-panel-overview',
    tabId: 'dashboard-tab-overview',
  },
  {
    value: 'insights',
    label: 'Інсайти',
    panelId: 'dashboard-panel-insights',
    tabId: 'dashboard-tab-insights',
  },
]

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
        <TabsList aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} id={tab.tabId}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={tab.panelId}
          aria-labelledby={tab.tabId}
          hidden={activeTab !== tab.value}
        >
          {tab.value === 'overview' ? <StandingsSection /> : <InsightsSection />}
        </div>
      ))}
    </div>
  )
}
