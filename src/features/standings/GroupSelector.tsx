import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useGroups } from '@/hooks/useGroups'
import { useDashboardFilters } from '@/store/dashboard-filters'

const GROUP_SELECTOR_ID = 'group-selector'

export function GroupSelector() {
  const { data, isLoading } = useGroups()
  const selectedGroupName = useDashboardFilters((state) => state.selectedGroupName)
  const setSelectedGroupName = useDashboardFilters((state) => state.setSelectedGroupName)

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-1.5 sm:w-48">
        <span className="text-sm font-medium">Group</span>
        <Skeleton className="h-8 w-full" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-1.5 sm:w-48">
      <label htmlFor={GROUP_SELECTOR_ID} className="text-sm font-medium">
        Group
      </label>
      <Select
        value={selectedGroupName ?? ''}
        onValueChange={(value) => setSelectedGroupName(value || null)}
      >
        <SelectTrigger
          id={GROUP_SELECTOR_ID}
          className="w-full"
          aria-label="Select a group"
          aria-describedby={`${GROUP_SELECTOR_ID}-hint`}
        >
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {data?.groups.map((group) => (
            <SelectItem key={group.name} value={group.name}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p id={`${GROUP_SELECTOR_ID}-hint`} className="sr-only">
        Use Tab to focus, Enter or Space to open, arrow keys to choose a group.
      </p>
    </div>
  )
}
