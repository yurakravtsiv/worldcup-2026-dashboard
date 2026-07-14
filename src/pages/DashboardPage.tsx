import { lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary, SectionErrorFallback } from '@/components/error-boundary'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InsightsSkeleton } from '@/features/insights/InsightsSkeleton'
import { TeamTableSection } from '@/features/team-table/TeamTableSection'

const InsightsSection = lazy(() =>
  import('@/features/insights/InsightsSection').then((module) => ({
    default: module.InsightsSection,
  })),
)

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

function getActiveTab(pathname: string): DashboardTab {
  return pathname.endsWith('/insights') ? 'insights' : 'table'
}

export function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = getActiveTab(location.pathname)

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => navigate(`/${value}`)}>
        <TabsList aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} id={tab.tabId}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div
        role="tabpanel"
        id={tabs.find((tab) => tab.value === activeTab)?.panelId}
        aria-labelledby={tabs.find((tab) => tab.value === activeTab)?.tabId}
      >
        {activeTab === 'insights' ? (
          <ErrorBoundary
            fallback={(error, reset) => (
              <SectionErrorFallback
                title="Something went wrong loading tournament insights"
                error={error}
                reset={reset}
              />
            )}
          >
            <Suspense fallback={<InsightsSkeleton />}>
              <InsightsSection />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <ErrorBoundary
            fallback={(error, reset) => (
              <SectionErrorFallback
                title="Something went wrong loading the rankings table"
                error={error}
                reset={reset}
              />
            )}
          >
            <TeamTableSection />
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}
