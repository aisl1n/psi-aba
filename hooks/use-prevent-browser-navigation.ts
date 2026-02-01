import { useEffect } from 'react'
import {
  preventBrowserBackNavigation,
  hasActiveTimers,
} from '@/utils/session-utils'

interface UsePreventBrowserNavigationOptions {
  /**
   * Whether the hook should be active
   */
  enabled: boolean
  /**
   * Number of active timers to check
   */
  activeTimersCount: number
  /**
   * Callback to execute when browser back button is pressed
   */
  onBrowserBack: () => void
}

/**
 * Hook to prevent browser navigation when there are active timers
 * and handle back button navigation with custom logic
 */
export function usePreventBrowserNavigation({
  enabled,
  activeTimersCount,
  onBrowserBack,
}: UsePreventBrowserNavigationOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasActiveTimers(activeTimersCount)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      preventBrowserBackNavigation()
      onBrowserBack()
    }

    preventBrowserBackNavigation()
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [enabled, activeTimersCount, onBrowserBack])
}
