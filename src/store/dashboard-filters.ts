/**
 * Client-side UI state for the dashboard (filters, sort order).
 * Server data (groups, matches, rankings) lives in React Query — fetch, cache,
 * and refetch there; this store only drives how that data is viewed.
 */
import { create } from 'zustand'

export type SortBy = 'points' | 'goalDiff' | 'name'
export type SortDirection = 'asc' | 'desc'

type DashboardFiltersState = {
  selectedGroupName: string | null
  sortBy: SortBy
  sortDirection: SortDirection
  setSelectedGroupName: (groupName: string | null) => void
  setSortBy: (sortBy: SortBy) => void
  setSortDirection: (sortDirection: SortDirection) => void
}

export const useDashboardFilters = create<DashboardFiltersState>((set) => ({
  selectedGroupName: null,
  sortBy: 'points',
  sortDirection: 'desc',
  setSelectedGroupName: (selectedGroupName) => set({ selectedGroupName }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
}))
