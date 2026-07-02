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

export function GroupSelector() {
  const { data, isLoading } = useGroups()
  const selectedGroupName = useDashboardFilters((state) => state.selectedGroupName)
  const setSelectedGroupName = useDashboardFilters((state) => state.setSelectedGroupName)

  if (isLoading) {
    return <Skeleton className="h-8 w-48" />
  }

  return (
    <Select
      value={selectedGroupName ?? ''}
      onValueChange={(value) => setSelectedGroupName(value || null)}
    >
      <SelectTrigger className="w-48">
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
  )
}
