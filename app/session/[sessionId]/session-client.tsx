'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { endSessionAction } from '@/app/src/actions/session-actions'
import { getSessionSummary } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useTimerStore } from '@/lib/stores/timer-store'

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

export function SessionClient({
  sessionId,
  showSummary = false,
  sessionStartTime,
}: SessionClientProps) {
  const router = useRouter()
  const [isEnding, setIsEnding] = useState(false)
  const [summary, setSummary] = useState<{
    summary: BehaviorSummary[]
    logs: SessionLog[]
  } | null>(null)
  const [sessionDuration, setSessionDuration] = useState(0)
  const { activeTimers } = useTimerStore()

  const loadSummary = React.useCallback(async () => {
    const result = await getSessionSummary(sessionId)
    if (result.success && result.data) {
      setSummary(result.data)
    }
  }, [sessionId])

  useEffect(() => {
    if (showSummary) {
      // Initial load of summary data
      void loadSummary()
      // Refresh summary every 5 seconds
      const interval = setInterval(loadSummary, 5000)
      return () => clearInterval(interval)
    }
  }, [showSummary, loadSummary])

  // Update session duration every second
  useEffect(() => {
    if (showSummary && sessionStartTime) {
      const updateDuration = () => {
        const now = new Date()
        const startTime = new Date(sessionStartTime)
        const durationInSeconds = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000
        )
        setSessionDuration(durationInSeconds)
      }

      updateDuration()
      const interval = setInterval(updateDuration, 1000)
      return () => clearInterval(interval)
    }
  }, [showSummary, sessionStartTime])

  const handleEndSession = async () => {
    if (!confirm('Tem certeza que deseja finalizar esta sessão?')) {
      return
    }

    setIsEnding(true)
    
    try {
      const result = await endSessionAction(sessionId)

      if (result.success) {
        router.push(`/session/${sessionId}/summary`)
      } else {
        alert(`Falha ao finalizar sessão: ${result.error || 'Erro desconhecido'}`)
        setIsEnding(false)
      }
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error)
      alert('Erro inesperado ao finalizar sessão')
      setIsEnding(false)
    }
  }

  if (showSummary && summary) {
    const totalCount = summary.summary.reduce(
      (acc, item) => acc + item.totalCount,
      0
    )
    const activeSimultaneousCount = activeTimers.size

    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      if (hours > 0) {
        return `${hours}h ${mins}m ${secs}s`
      }
      return `${mins}m ${secs}s`
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">
              Total de comportamentos
            </p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Duração da sessão</p>
            <p className="text-2xl font-bold">{formatDuration(sessionDuration)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              Monitoramento simultâneo
            </p>
            <p className="text-2xl font-bold">{activeSimultaneousCount}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={handleEndSession}
      disabled={isEnding}
      variant="destructive"
      size="sm"
    >
      <X className="mr-2 h-4 w-4" />
      {isEnding ? 'Finalizando...' : 'Finalizar sessão'}
    </Button>
  )
}
