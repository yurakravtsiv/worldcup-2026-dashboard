import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { StageId } from '@/lib/tournament-stages'

const STAGE_SELECTOR_ID = 'stage-selector'

type StageOption = {
  id: StageId
  label: string
}

type StageSelectorProps = {
  stages: StageOption[]
  value: StageId
  onChange: (stageId: StageId) => void
  isLoading?: boolean
}

export function StageSelector({ stages, value, onChange, isLoading = false }: StageSelectorProps) {
  const selectedOption = stages.find((stage) => stage.id === value)

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-1.5 sm:w-64">
        <span className="text-sm font-medium">Stage</span>
        <Skeleton className="h-8 w-full" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-1.5 sm:w-64">
      <label htmlFor={STAGE_SELECTOR_ID} className="text-sm font-medium">
        Stage
      </label>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue as StageId)}>
        <SelectTrigger
          id={STAGE_SELECTOR_ID}
          className="w-full"
          aria-label="Select a stage"
          aria-describedby={`${STAGE_SELECTOR_ID}-hint`}
        >
          <SelectValue placeholder="Select a stage">{selectedOption?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stages.map((stage) => (
            <SelectItem key={stage.id} value={stage.id}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p id={`${STAGE_SELECTOR_ID}-hint`} className="sr-only">
        Use Tab to focus, Enter or Space to open, arrow keys to choose a stage.
      </p>
    </div>
  )
}
