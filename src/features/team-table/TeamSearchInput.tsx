import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'

const TEAM_SEARCH_INPUT_ID = 'team-search-input'

type TeamSearchInputProps = {
  value: string
  onChange: (value: string) => void
}

export function TeamSearchInput({ value, onChange }: TeamSearchInputProps) {
  const [draftValue, setDraftValue] = useState(value)
  const debouncedValue = useDebouncedValue(draftValue, 250)

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  return (
    <div className="flex w-full flex-col gap-1.5 sm:flex-1">
      <label htmlFor={TEAM_SEARCH_INPUT_ID} className="text-sm font-medium">
        Search
      </label>
      <input
        id={TEAM_SEARCH_INPUT_ID}
        type="search"
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        placeholder="Search team..."
        autoComplete="off"
        className={cn(
          'flex h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-colors outline-none',
          'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-input/30',
        )}
      />
    </div>
  )
}
