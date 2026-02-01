'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  endSessionAction,
  getSessionSummary,
  logBehaviorAction,
} from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useTimerStore, usePreventBrowserNavigation } from '@/hooks'
import { ROUTES } from '@/constants/routes'
import { formatDuration, calculateDurationInSeconds } from '@/utils'
import {
  type SessionSummaryData,
  calculateTotalBehaviorCount,
  showSessionEndConfirmationToast,
  showSessionExitWithoutTimersToast,
  showSessionEndSuccessToast,
  showSessionEndErrorToast,
  showSessionEndUnexpectedErrorToast,
  showSessionEndFailureToast,
  showSessionNavigationErrorToast,
  hasActiveTimers,
} from '@/utils/session-utils'

const SUMMARY_REFRESH_INTERVAL_MS = 5000
const SESSION_DURATION_UPDATE_INTERVAL_MS = 1000

interface SessionClientProps {
  sessionId: number
  showSummary?: boolean
  sessionStartTime?: Date
}

export function SessionClient({
  sessionId,
  showSummary = false,
  sessionStartTime,
}: SessionClientProps) {
  const router = useRouter()
  const { activeTimers, stopTimer, clearAllTimers } = useTimerStore()

  const [isEndingSession, setIsEndingSession] = useState(false)
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(
    null
  )
  const [elapsedSessionSeconds, setElapsedSessionSeconds] = useState(0)

  const fetchSummary = useCallback(async () => {
    const result = await getSessionSummary(sessionId)
    if (result.success && result.data) {
      setSummaryData(result.data)
    }
  }, [sessionId])

  const stopAllActiveTimers = useCallback(async () => {
    const activeTimerEntries = Array.from(activeTimers.entries())

    for (const [behaviorId, timerState] of activeTimerEntries) {
      if (!timerState.isRunning) continue

      const duration = stopTimer(behaviorId)

      if (duration && duration > 0) {
        try {
          await logBehaviorAction(sessionId, behaviorId, 0, duration)
        } catch (error) {
          console.error(
            `Erro ao registrar duração do comportamento ${behaviorId}:`,
            error
          )
        }
      }
    }

    clearAllTimers()
  }, [activeTimers, sessionId, stopTimer, clearAllTimers])

  const handleSessionFinalization = useCallback(
    async (shouldStopTimers: boolean) => {
      setIsEndingSession(true)

      try {
        if (shouldStopTimers) {
          await stopAllActiveTimers()
        }

        const result = await endSessionAction(sessionId)

        if (result.success) {
          showSessionEndSuccessToast()
          router.push(ROUTES.PATIENTS)
        } else {
          showSessionEndErrorToast()
          setIsEndingSession(false)
        }
      } catch (error) {
        console.error('Erro ao finalizar sessão:', error)
        showSessionEndUnexpectedErrorToast()
        setIsEndingSession(false)
      }
    },
    [sessionId, router, stopAllActiveTimers]
  )

  const handleBrowserBack = useCallback(() => {
    const shouldStopTimers = hasActiveTimers(activeTimers.size)
    showSessionExitWithoutTimersToast(() =>
      handleSessionFinalization(shouldStopTimers)
    )
  }, [activeTimers.size, handleSessionFinalization])

  usePreventBrowserNavigation({
    enabled: !showSummary,
    activeTimersCount: activeTimers.size,
    onBrowserBack: handleBrowserBack,
  })

  useEffect(() => {
    if (!showSummary) return

    const initialLoadTimeout = setTimeout(() => {
      fetchSummary().catch(console.error)
    }, 0)

    const refreshInterval = setInterval(() => {
      fetchSummary().catch(console.error)
    }, SUMMARY_REFRESH_INTERVAL_MS)

    return () => {
      clearTimeout(initialLoadTimeout)
      clearInterval(refreshInterval)
    }
  }, [showSummary, fetchSummary])

  useEffect(() => {
    if (!showSummary || !sessionStartTime) return

    const updateElapsedTime = () => {
      const startTime = new Date(sessionStartTime)
      const durationInSeconds = calculateDurationInSeconds(startTime)
      setElapsedSessionSeconds(durationInSeconds)
    }

    updateElapsedTime()
    const updateInterval = setInterval(
      updateElapsedTime,
      SESSION_DURATION_UPDATE_INTERVAL_MS
    )

    return () => clearInterval(updateInterval)
  }, [showSummary, sessionStartTime])

  const handleEndSession = () => {
    showSessionEndConfirmationToast(async () => {
      setIsEndingSession(true)

      try {
        if (hasActiveTimers(activeTimers.size)) {
          await stopAllActiveTimers()
        }

        const result = await endSessionAction(sessionId)

        if (result.success) {
          const summaryRoute = ROUTES.SESSION_SUMMARY.replace(
            ':sessionId',
            sessionId.toString()
          )
          router.push(summaryRoute)
        } else {
          showSessionEndFailureToast(result.error)
          setIsEndingSession(false)
        }
      } catch (error) {
        console.error('Erro ao finalizar sessão:', error)
        showSessionNavigationErrorToast()
        setIsEndingSession(false)
      }
    })
  }

  const renderSummaryView = () => {
    if (!showSummary || !summaryData) return null

    const totalBehaviorCount = calculateTotalBehaviorCount(summaryData.summary)
    const activeSimultaneousTimers = activeTimers.size

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">
              Total de comportamentos
            </p>
            <p className="text-2xl font-bold">{totalBehaviorCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Duração da sessão</p>
            <p className="text-2xl font-bold">
              {formatDuration(elapsedSessionSeconds)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              Monitoramento simultâneo
            </p>
            <p className="text-2xl font-bold">{activeSimultaneousTimers}</p>
          </div>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return renderSummaryView()
  }

  return (
    <Button
      onClick={handleEndSession}
      disabled={isEndingSession}
      variant="destructive"
      size="sm"
    >
      <X className="size-5" />
      {isEndingSession ? 'Finalizando...' : 'Finalizar sessão'}
    </Button>
  )
}
