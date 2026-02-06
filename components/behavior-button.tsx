'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTimerStore } from '@/hooks'
import { logBehaviorAction } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatTimeMMSS } from '@/utils'

const TIMER_UPDATE_INTERVAL_MS = 1000
const FREQUENCY_COUNT_INCREMENT = 1
const NO_COUNT = 0
const NO_DURATION = 0
const BUTTON_HEIGHT_CLASS = 'h-28'

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

interface TrackingResult {
  duration: number
  shouldCount: boolean
}

interface BehaviorColors {
  border: string
  bg: string
  ring: string
  textColor: string
  badgeColor: string
}

const isAdaptiveBehavior = (type: BehaviorType): boolean => type === 'adaptive'

const getBehaviorColors = (
  type: BehaviorType,
  isActive: boolean
): BehaviorColors => {
  const isAdaptive = isAdaptiveBehavior(type)

  const border = isAdaptive ? 'border-primary' : 'border-destructive'
  const ring = isAdaptive ? 'ring-primary/50' : 'ring-destructive/50'

  const bg = isActive
    ? isAdaptive
      ? 'bg-primary hover:bg-primary/90'
      : 'bg-destructive hover:bg-destructive/90'
    : 'bg-background hover:bg-accent'

  const textColor = isActive ? 'text-primary-foreground' : 'text-foreground'

  const badgeColor = isActive
    ? 'text-primary-foreground border-primary-foreground/30'
    : 'text-foreground border-foreground/20'

  return { border, bg, ring, textColor, badgeColor }
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
  const [frequencyCount, setFrequencyCount] = useState(initialCount)
  const [isProcessingTap, setIsProcessingTap] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [lastRecordedDuration, setLastRecordedDuration] = useState(0)

  const { startTimer, stopTimer, getElapsedTime, isTimerRunning } =
    useTimerStore()
  const isTimerActive = isTimerRunning(behaviorId)

  useEffect(() => {
    const updateElapsedTime = () => {
      if (isTimerActive) {
        const elapsed = getElapsedTime(behaviorId)
        setElapsedSeconds(elapsed)
      } else {
        setElapsedSeconds(0)
      }
    }

    const initialUpdateTimeout = setTimeout(updateElapsedTime, 0)

    const updateInterval = setInterval(
      updateElapsedTime,
      TIMER_UPDATE_INTERVAL_MS
    )

    return () => {
      clearTimeout(initialUpdateTimeout)
      clearInterval(updateInterval)
    }
  }, [isTimerActive, behaviorId, getElapsedTime])

  const handleDurationTracking = (): TrackingResult => {
    if (isTimerActive) {
      const duration = stopTimer(behaviorId) || NO_DURATION
      setLastRecordedDuration(duration)
      return { duration, shouldCount: false }
    } else {
      startTimer(behaviorId)
      return { duration: NO_DURATION, shouldCount: tracksFrequency }
    }
  }

  const handleFrequencyTracking = (): TrackingResult => {
    return { duration: NO_DURATION, shouldCount: true }
  }

  const logBehaviorData = async (
    shouldCount: boolean,
    duration: number
  ): Promise<void> => {
    try {
      if (duration > NO_DURATION) {
        await logBehaviorAction(sessionId, behaviorId, NO_COUNT, duration)
      }

      if (shouldCount) {
        await logBehaviorAction(
          sessionId,
          behaviorId,
          FREQUENCY_COUNT_INCREMENT,
          NO_DURATION
        )
      }
    } catch (error) {
      console.error('Error logging behavior:', error)
      if (shouldCount) {
        setFrequencyCount((prev) => prev - FREQUENCY_COUNT_INCREMENT)
      }
    }
  }

  const handleTap = async (): Promise<void> => {
    if (isProcessingTap) return

    setIsProcessingTap(true)

    const trackingResult = tracksDuration
      ? handleDurationTracking()
      : handleFrequencyTracking()

    if (trackingResult.shouldCount) {
      setFrequencyCount((prev) => prev + FREQUENCY_COUNT_INCREMENT)
    }

    await logBehaviorData(trackingResult.shouldCount, trackingResult.duration)

    setIsProcessingTap(false)
  }

  const renderFrequencyBadge = () => {
    const shouldShow = tracksFrequency && frequencyCount > 0
    if (!shouldShow) return null

    const colors = getBehaviorColors(behaviorType, isTimerActive)

    return (
      <Badge
        variant="outline"
        className={cn('px-2 text-xs', colors.badgeColor)}
      >
        <CheckCircle2 className="mr-1 size-3" />
        {frequencyCount}
      </Badge>
    )
  }

  const renderActiveTimerBadge = () => {
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
        {formatTimeMMSS(elapsedSeconds)}
      </Badge>
    )
  }

  const renderLastDurationBadge = () => {
    const shouldShow =
      tracksDuration && !isTimerActive && lastRecordedDuration > 0
    if (!shouldShow) return null

    return (
      <Badge
        variant="outline"
        className="text-foreground border-foreground/20 flex items-center gap-1 px-2 text-xs"
      >
        Último: {formatTimeMMSS(lastRecordedDuration)}
      </Badge>
    )
  }

  const colors = getBehaviorColors(behaviorType, isTimerActive)
  const buttonClassName = cn(
    'relative w-full flex-col gap-2 py-4 text-sm font-semibold transition-all border-2',
    'hover:scale-105 active:scale-95',
    BUTTON_HEIGHT_CLASS,
    colors.border,
    colors.bg,
    isTimerActive && `animate-pulse ring-2 ring-offset-1 ${colors.ring}`
  )

  return (
    <Button
      onClick={handleTap}
      disabled={isProcessingTap}
      className={buttonClassName}
      variant="ghost"
      size="default"
    >
      <p className={cn('flex-wrap text-sm text-wrap', colors.textColor)}>
        {behaviorName}
      </p>

      <div className="flex items-center gap-3">
        {renderFrequencyBadge()}
        {renderActiveTimerBadge()}
        {renderLastDurationBadge()}
      </div>
    </Button>
  )
}
