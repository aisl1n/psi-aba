'use client'

import { useState, useEffect } from 'react'
import { useTimerStore } from '@/lib/stores/timer-store'
import { logBehaviorAction } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BehaviorButtonProps {
  behaviorId: number
  behaviorName: string
  sessionId: number
  tracksFrequency: boolean
  tracksDuration: boolean
  initialCount?: number
}

export function BehaviorButton({
  behaviorId,
  behaviorName,
  sessionId,
  tracksFrequency,
  tracksDuration,
  initialCount = 0,
}: BehaviorButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [isProcessing, setIsProcessing] = useState(false)
  const [elapsedTimeDisplay, setElapsedTimeDisplay] = useState(0)

  const { startTimer, stopTimer, getElapsedTime, isTimerRunning } =
    useTimerStore()

  const timerRunning = isTimerRunning(behaviorId)

  // Update elapsed time display every second
  useEffect(() => {
    if (!timerRunning) {
      setElapsedTimeDisplay(0)
      return
    }

    const interval = setInterval(() => {
      const elapsed = getElapsedTime(behaviorId)
      setElapsedTimeDisplay(elapsed)
    }, 1000)

    // Initial update
    setElapsedTimeDisplay(getElapsedTime(behaviorId))

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, behaviorId])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTap = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    let newCount = count
    let duration = 0

    // Handle frequency increment
    if (tracksFrequency) {
      newCount = count + 1
      setCount(newCount) // Optimistic update
    }

    // Handle duration timer toggle
    if (tracksDuration) {
      if (timerRunning) {
        // Stop timer and get duration
        duration = stopTimer(behaviorId) || 0
      } else {
        // Start timer
        startTimer(behaviorId)
      }
    }

    // If we stopped a timer, save the log immediately
    if (tracksDuration && duration > 0) {
      try {
        await logBehaviorAction(sessionId, behaviorId, 0, duration)
      } catch (error) {
        console.error('Error logging duration:', error)
      }
    }

    // If we incremented count, save the log
    if (tracksFrequency && newCount > count) {
      try {
        await logBehaviorAction(sessionId, behaviorId, 1, 0)
      } catch (error) {
        console.error('Error logging frequency:', error)
        // Rollback on error
        setCount(count)
      }
    }

    setIsProcessing(false)
  }

  return (
    <Button
      onClick={handleTap}
      disabled={isProcessing}
      className={cn(
        'relative h-24 min-h-[80px] w-full flex-col gap-2 text-base font-semibold transition-all',
        timerRunning && 'ring-primary animate-pulse ring-4 ring-offset-2',
        'hover:scale-105 active:scale-95'
      )}
      variant={timerRunning ? 'default' : 'outline'}
      size="lg"
    >
      <span className="text-lg">{behaviorName}</span>

      <div className="flex items-center gap-3">
        {tracksFrequency && (
          <Badge variant="secondary" className="px-2 py-1 text-sm">
            {count > 0 && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {count}
          </Badge>
        )}

        {tracksDuration && timerRunning && (
          <Badge
            variant="default"
            className="flex items-center gap-1 px-2 py-1 text-sm"
          >
            <Clock className="h-3 w-3" />
            {formatTime(elapsedTimeDisplay)}
          </Badge>
        )}
      </div>
    </Button>
  )
}
