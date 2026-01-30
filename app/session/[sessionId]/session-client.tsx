'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  endSessionAction,
  getSessionSummary,
} from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useTimerStore } from '@/lib/stores/timer-store'
import { ROUTES } from '@/constants/routes'
import { formatDuration, calculateDurationInSeconds } from '@/utils'

const SUMMARY_REFRESH_INTERVAL_MS = 5000
const SESSION_DURATION_UPDATE_INTERVAL_MS = 1000

interface SessionClientProps {
  sessionId: number
  showSummary?: boolean
  sessionStartTime?: Date
}

interface BehaviorSummary {
  name: string
  totalCount: number
  totalDuration: number
  events: number
  behaviorType: string
}

interface SessionLog {
  id: number
  sessionId: number
  behaviorId: number
  count: number
  duration: number
  timestamp: Date
}

interface SessionSummaryData {
  summary: BehaviorSummary[]
  logs: SessionLog[]
}

const calculateTotalBehaviorCount = (
  behaviorSummaries: BehaviorSummary[]
): number => {
  return behaviorSummaries.reduce(
    (total, behavior) => total + behavior.totalCount,
    0
  )
}

const confirmSessionEnd = (): boolean => {
  return confirm('Tem certeza que deseja finalizar esta sessão?')
}

export function SessionClient({
  sessionId,
  showSummary = false,
  sessionStartTime,
}: SessionClientProps) {
  const router = useRouter()
  const { activeTimers } = useTimerStore()

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

  const handleEndSession = async () => {
    if (!confirmSessionEnd()) return

    setIsEndingSession(true)

    try {
      const result = await endSessionAction(sessionId)

      if (result.success) {
        const summaryRoute = ROUTES.SESSION_SUMMARY.replace(
          ':sessionId',
          sessionId.toString()
        )
        router.push(summaryRoute)
      } else {
        alert(
          `Falha ao finalizar sessão: ${result.error || 'Erro desconhecido'}`
        )
        setIsEndingSession(false)
      }
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error)
      alert('Erro inesperado ao finalizar sessão')
      setIsEndingSession(false)
    }
  }

  if (showSummary && summaryData) {
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
