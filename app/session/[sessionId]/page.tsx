import { getSessionData } from '@/app/src/actions/session-actions'
import { BehaviorButton } from '@/components/behavior-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SessionClient } from './session-client'
import { ROUTES } from '@/constants/routes'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params
  const sessionIdNum = parseInt(sessionId, 10)

  if (isNaN(sessionIdNum)) {
    redirect(ROUTES.HOME)
  }

  const result = await getSessionData(sessionIdNum)

  if (!result.success || !result.data) {
    redirect(ROUTES.HOME)
  }

  const session = result.data
  const behaviors = session.patient.behaviors || []

  const sessionStartTime = new Date(session.startedAt)

  const renderBehaviors = () => {
    const hasBehaviors = behaviors.length > 0

    if (!hasBehaviors) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum comportamento configurado para este paciente.
            </p>
            <Link href={`/patients/${session.patientId}/behaviors`}>
              <Button variant="link" className="mt-2">
                Adicionar comportamentos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {behaviors.map((behavior) => (
          <BehaviorButton
            key={behavior.id}
            behaviorId={behavior.id}
            behaviorName={behavior.name}
            sessionId={sessionIdNum}
            tracksFrequency={behavior.tracksFrequency}
            tracksDuration={behavior.tracksDuration}
            behaviorType={behavior.behaviorType}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{session.patient.name}</h1>
            <p className="text-muted-foreground text-sm">
              Sessão iniciada às {sessionStartTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SessionClient sessionId={sessionIdNum} />
          </div>
        </div>

        {renderBehaviors()}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo da sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionClient
              sessionId={sessionIdNum}
              showSummary
              sessionStartTime={session.startedAt}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
