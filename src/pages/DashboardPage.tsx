import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InsightsSection } from '@/features/insights/InsightsSection'
import { TeamTableSection } from '@/features/team-table/TeamTableSection'

type DashboardTab = 'table' | 'insights'

const tabs: { value: DashboardTab; label: string; panelId: string; tabId: string }[] = [
  {
    value: 'table',
    label: 'Power Rankings',
    panelId: 'dashboard-panel-table',
    tabId: 'dashboard-tab-table',
  },
  {
    value: 'insights',
    label: 'Insights',
    panelId: 'dashboard-panel-insights',
    tabId: 'dashboard-tab-insights',
  },
]

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('table')

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
          {tab.value === 'insights' ? <InsightsSection /> : <TeamTableSection />}
        </div>
      ))}
    </div>
  )
}
