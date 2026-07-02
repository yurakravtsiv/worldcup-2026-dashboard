import { useDashboardFilters } from '@/store/dashboard-filters'

const initialState = {
  selectedGroupName: null,
  sortBy: 'points' as const,
  sortDirection: 'desc' as const,
}

describe('useDashboardFilters', () => {
  beforeEach(() => {
    useDashboardFilters.setState(initialState)
  })

  it('starts with default UI filter values', () => {
    expect(useDashboardFilters.getState()).toMatchObject(initialState)
  })

  it('updates the selected group', () => {
    useDashboardFilters.getState().setSelectedGroupName('Group A')

    expect(useDashboardFilters.getState().selectedGroupName).toBe('Group A')
  })

  it('updates sort column and direction independently', () => {
    const { setSortBy, setSortDirection } = useDashboardFilters.getState()

    setSortBy('goalDiff')
    setSortDirection('asc')

    expect(useDashboardFilters.getState()).toMatchObject({
      sortBy: 'goalDiff',
      sortDirection: 'asc',
    })
  })

  it('allows clearing the selected group', () => {
    const { setSelectedGroupName } = useDashboardFilters.getState()

    setSelectedGroupName('Group B')
    setSelectedGroupName(null)

    expect(useDashboardFilters.getState().selectedGroupName).toBeNull()
  })
})
