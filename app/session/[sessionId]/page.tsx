import { getSessionData } from '@/app/src/actions/session-actions'
import { BehaviorButton } from '@/components/behavior-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { SessionClient } from './session-client'
import { SessionCharts } from '@/components/session-charts'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params
  const sessionIdNum = parseInt(sessionId, 10)

  if (isNaN(sessionIdNum)) {
    redirect('/')
  }

  const result = await getSessionData(sessionIdNum)

  if (!result.success || !result.data) {
    redirect('/')
  }

  const session = result.data
  const behaviors = session.patient.behaviors || []

  // Calculate session duration
  const sessionStartTime = new Date(session.startedAt)
  const now = new Date()
  const sessionDuration = Math.floor(
    (now.getTime() - sessionStartTime.getTime()) / 1000
  )

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-background min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{session.patient.name}</h1>
            <p className="text-muted-foreground text-sm">
              Session started at {sessionStartTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              <span>{formatTime(sessionDuration)}</span>
            </div>
            <SessionClient sessionId={sessionIdNum} />
          </div>
        </div>

        {/* Behavior Grid */}
        {behaviors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No behaviors configured for this patient.
              </p>
              <Link href={`/patients/${session.patientId}/behaviors`}>
                <Button variant="link" className="mt-2">
                  Add behaviors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {behaviors.map((behavior) => (
              <BehaviorButton
                key={behavior.id}
                behaviorId={behavior.id}
                behaviorName={behavior.name}
                sessionId={sessionIdNum}
                tracksFrequency={behavior.tracksFrequency}
                tracksDuration={behavior.tracksDuration}
              />
            ))}
          </div>
        )}

        {/* Summary Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionClient sessionId={sessionIdNum} showSummary />
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="mt-6">
          <SessionCharts sessionId={sessionIdNum} />
        </div>
      </div>
    </div>
  )
}
