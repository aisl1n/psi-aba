'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTimerStore } from '@/lib/stores/timer-store'
import { logBehaviorAction } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Constants
const TIMER_UPDATE_INTERVAL = 1000 // 1 second

// Types
type BehaviorType = 'adaptive' | 'maladaptive'

interface BehaviorButtonProps {
  behaviorId: number
  behaviorName: string
  sessionId: number
  tracksFrequency: boolean
  tracksDuration: boolean
  behaviorType: BehaviorType
  initialCount?: number
}

export function BehaviorButton({
  behaviorId,
  behaviorName,
  sessionId,
  tracksFrequency,
  tracksDuration,
  behaviorType,
  initialCount = 0,
}: BehaviorButtonProps) {
  // State
  const [count, setCount] = useState(initialCount)
  const [isProcessing, setIsProcessing] = useState(false)
  const [elapsedTimeDisplay, setElapsedTimeDisplay] = useState(0)
  const [lastDuration, setLastDuration] = useState(0)

  // Store hooks
  const { startTimer, stopTimer, getElapsedTime, isTimerRunning } =
    useTimerStore()

  const isTimerActive = isTimerRunning(behaviorId)

  // Effects
  // Update elapsed time display every second when timer is running
  useEffect(() => {
    if (!isTimerActive) {
      // Reset display when timer stops - this is an intentional state sync
      setElapsedTimeDisplay(0)
      return
    }

    const updateElapsedTime = () => {
      const elapsed = getElapsedTime(behaviorId)
      setElapsedTimeDisplay(elapsed)
    }

    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, TIMER_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [isTimerActive, behaviorId, getElapsedTime])

  // Helper functions
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function handleDurationTracking() {
    if (isTimerActive) {
      // Stop timer and return duration
      const duration = stopTimer(behaviorId) || 0
      setLastDuration(duration)
      return { duration, shouldCount: false }
    } else {
      // Start timer
      startTimer(behaviorId)
      return { duration: 0, shouldCount: tracksFrequency }
    }
  }

  function handleFrequencyTracking() {
    return { duration: 0, shouldCount: true }
  }

  async function logBehaviorData(
    shouldCount: boolean,
    duration: number
  ): Promise<void> {
    try {
      // Log duration if stopped timer
      if (duration > 0) {
        await logBehaviorAction(sessionId, behaviorId, 0, duration)
      }

      // Log frequency count
      if (shouldCount) {
        await logBehaviorAction(sessionId, behaviorId, 1, 0)
      }
    } catch (error) {
      console.error('Error logging behavior:', error)
      // Rollback count on error
      if (shouldCount) {
        setCount((prev) => prev - 1)
      }
    }
  }

  async function handleTap(): Promise<void> {
    if (isProcessing) return

    setIsProcessing(true)

    // Determine tracking behavior
    const trackingResult = tracksDuration
      ? handleDurationTracking()
      : handleFrequencyTracking()

    // Update count optimistically if needed
    if (trackingResult.shouldCount) {
      setCount((prev) => prev + 1)
    }

    // Log to backend
    await logBehaviorData(trackingResult.shouldCount, trackingResult.duration)

    setIsProcessing(false)
  }

  // Helper function for colors
  function getBehaviorColors(type: BehaviorType, isActive: boolean) {
    const isAdaptive = type === 'adaptive'

    return {
      border: isAdaptive ? 'border-primary' : 'border-destructive',
      bg: isActive
        ? isAdaptive
          ? 'bg-primary hover:bg-primary/90'
          : 'bg-destructive hover:bg-destructive/90'
        : 'bg-background hover:bg-accent',
      ring: isAdaptive ? 'ring-primary/50' : 'ring-destructive/50',
      textColor: isActive ? 'text-primary-foreground' : 'text-foreground',
      badgeColor: isActive
        ? 'text-primary-foreground border-primary-foreground/30'
        : 'text-foreground border-foreground/20',
    }
  }

  // Render helpers
  function renderFrequencyBadge() {
    if (!tracksFrequency) return null
    const colors = getBehaviorColors(behaviorType, isTimerActive)

    return (
      <Badge
        variant="outline"
        className={cn('px-2 text-xs', colors.badgeColor)}
      >
        {count > 0 && <CheckCircle2 className="mr-1 size-3" />}
        {count}
      </Badge>
    )
  }

  function renderActiveTimerBadge() {
    if (!tracksDuration || !isTimerActive) return null
    const colors = getBehaviorColors(behaviorType, isTimerActive)

    return (
      <Badge
        variant="outline"
        className={cn(
          'flex items-center gap-1 px-2 text-xs',
          colors.badgeColor
        )}
      >
        <Clock className="size-3" />
        {formatTime(elapsedTimeDisplay)}
      </Badge>
    )
  }

  function renderLastDurationBadge() {
    const shouldShow = tracksDuration && !isTimerActive && lastDuration > 0
    if (!shouldShow) return null

    return (
      <Badge
        variant="outline"
        className="text-foreground border-foreground/20 flex items-center gap-1 px-2 text-xs"
      >
        Último: {formatTime(lastDuration)}
      </Badge>
    )
  }

  // Styling
  const colors = getBehaviorColors(behaviorType, isTimerActive)
  const buttonClassName = cn(
    'relative h-28 w-full flex-col gap-2 py-4 text-sm font-semibold transition-all border-2',
    'hover:scale-105 active:scale-95',
    colors.border,
    colors.bg,
    isTimerActive && `animate-pulse ring-2 ring-offset-1 ${colors.ring}`
  )

  return (
    <Button
      onClick={handleTap}
      disabled={isProcessing}
      className={buttonClassName}
      variant="ghost"
      size="default"
    >
      <span className={cn('text-base', colors.textColor)}>{behaviorName}</span>

      <div className="flex items-center gap-3">
        {renderFrequencyBadge()}
        {renderActiveTimerBadge()}
        {renderLastDurationBadge()}
      </div>
    </Button>
  )
}
