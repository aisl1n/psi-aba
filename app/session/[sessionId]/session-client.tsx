'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { endSessionAction } from '@/app/src/actions/session-actions'
import { getSessionSummary } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface SessionClientProps {
  sessionId: number
  showSummary?: boolean
}

export function SessionClient({
  sessionId,
  showSummary = false,
}: SessionClientProps) {
  const router = useRouter()
  const [isEnding, setIsEnding] = useState(false)
  const [summary, setSummary] = useState<{
    summary: any[]
    logs: any[]
  } | null>(null)

  useEffect(() => {
    if (showSummary) {
      loadSummary()
      // Refresh summary every 5 seconds
      const interval = setInterval(loadSummary, 5000)
      return () => clearInterval(interval)
    }
  }, [showSummary, sessionId])

  const loadSummary = async () => {
    const result = await getSessionSummary(sessionId)
    if (result.success && result.data) {
      setSummary(result.data)
    }
  }

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) {
      return
    }

    setIsEnding(true)
    const result = await endSessionAction(sessionId)

    if (result.success) {
      router.push('/')
    } else {
      alert('Failed to end session')
      setIsEnding(false)
    }
  }

  if (showSummary && summary) {
    const totalCount = summary.summary.reduce(
      (acc, item) => acc + item.totalCount,
      0
    )
    const totalDuration = summary.summary.reduce(
      (acc, item) => acc + item.totalDuration,
      0
    )

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Total Events</p>
            <p className="text-2xl font-bold">{summary.logs.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Count</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Duration</p>
            <p className="text-2xl font-bold">
              {Math.floor(totalDuration / 60)}m {totalDuration % 60}s
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Behaviors Tracked</p>
            <p className="text-2xl font-bold">{summary.summary.length}</p>
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
      {isEnding ? 'Ending...' : 'End Session'}
    </Button>
  )
}
