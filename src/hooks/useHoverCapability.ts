import { useEffect, useState } from 'react'

function getHoverCapability(): boolean {
  if (typeof window === 'undefined') {
    return true
  }

  return window.matchMedia('(hover: hover)').matches
}

export function useHoverCapability(): boolean {
  const [canHover, setCanHover] = useState(getHoverCapability)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover)')
    const handleChange = (event: MediaQueryListEvent) => {
      setCanHover(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return canHover
}
