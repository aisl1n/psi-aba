import { getPatient } from '@/app/src/actions/patient-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Pencil, Plus } from 'lucide-react'
import { StartSessionSheet } from './start-session-sheet'
import { AddManualSessionSheet } from './add-manual-session-sheet'
import { ROUTES } from '@/constants/routes'
import { createdAtText, formatDate } from '@/utils'
import { Behavior, Session } from '@/app/types'

const MAX_SESSIONS_OR_BEHAVIORS_DISPLAY = 5

interface PatientPageProps {
  params: Promise<{ patientId: string }>
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { patientId } = await params
  const patientIdNum = parseInt(patientId, 10)

  if (isNaN(patientIdNum)) {
    redirect(ROUTES.PATIENTS)
  }

  const result = await getPatient(patientIdNum)

  if (!result.success || !result.data) {
    redirect(ROUTES.PATIENTS)
  }

  const patient = result.data

  const { name, createdAt, behaviors, sessions } = patient

  const hasBehaviors = behaviors?.length > 0

  function renderBehaviorsLength(behaviors: Behavior[]) {
    const hasOneBehavior = behaviors.length === 1
    const behaviorsQuantity = behaviors.length

    if (!hasBehaviors) {
      return 'Nenhum comportamento adicionado'
    }
    if (hasOneBehavior) {
      return '1 comportamento'
    }

    return `${behaviorsQuantity} comportamentos`
  }

  function renderSessionsLength(sessions: Session[]) {
    const hasOneSession = sessions.length === 1
    const hasSessions = sessions.length > 0
    const sessionsQuantity = sessions.length

    if (!hasSessions) {
      return 'Nenhuma sessão iniciada'
    }
    if (hasOneSession) {
      return '1 sessão'
    }

    return `${sessionsQuantity} sessões`
  }

  function renderBehaviorsContent(behaviors: Behavior[]) {
    if (!hasBehaviors) {
      return (
        <p className="text-muted-foreground text-sm">
          Adicione comportamentos para começar a monitorar.
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {behaviors
          .slice(0, MAX_SESSIONS_OR_BEHAVIORS_DISPLAY)
          .map((behavior) => (
            <div
              key={behavior.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <span className="text-sm font-medium">{behavior.name}</span>
              <div className="text-muted-foreground flex gap-2 text-xs">
                {behavior.tracksFrequency && <span>Contagem</span>}
                {behavior.tracksDuration && <span>Cronômetro</span>}
              </div>
            </div>
          ))}
        {behaviors.length > MAX_SESSIONS_OR_BEHAVIORS_DISPLAY && (
          <p className="text-muted-foreground text-xs">
            +{behaviors.length - MAX_SESSIONS_OR_BEHAVIORS_DISPLAY} mais
          </p>
        )}
      </div>
    )
  }

  function renderSessionStatus(session: Session) {
    const hasEnded = session.endedAt

    if (!hasEnded) return null

    return (
      <Link
        href={ROUTES.SESSION_SUMMARY.replace(
          ':sessionId',
          session.id.toString()
        )}
      >
        <Button variant="link" size="sm">
          Ver resumo
        </Button>
      </Link>
    )
  }

  function renderBehaviorsIcon() {
    if (hasBehaviors) {
      return <Pencil className="size-4" />
    }

    return <Plus className="size-4" />
  }

  function renderSessionsContent(sessions: Session[]) {
    const hasSessions = sessions.length > 0
    if (!hasSessions) {
      return (
        <p className="text-muted-foreground text-sm">
          Nenhuma sessão iniciada. Inicie uma sessão para começar a monitorar.
        </p>
      )
    }
    return (
      <div className="space-y-2">
        {sessions.slice(0, MAX_SESSIONS_OR_BEHAVIORS_DISPLAY).map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <div className="flex items-center gap-2">
              <Calendar className="text-primary size-4" />
              <span className="text-sm">{formatDate(session.startedAt)}</span>
            </div>
            {renderSessionStatus(session)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link href={ROUTES.PATIENTS}>
          <Button variant="link" className="mb-2">
            <ArrowLeft className="size-4" />
            Voltar para pacientes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-sm">
          {createdAtText(createdAt)}
        </p>
      </div>

      <div className="mb-6 flex w-full flex-col gap-2">
        <StartSessionSheet
          patientId={patientIdNum}
          hasBehaviors={hasBehaviors}
        />
        <AddManualSessionSheet patientId={patientIdNum} behaviors={behaviors} />
        <Link
          href={`${ROUTES.PATIENT_BEHAVIORS.replace(':patientId', patientId)}`}
        >
          <Button variant="outline" size="sm" className="w-full">
            {renderBehaviorsIcon()}
            Comportamentos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle>Comportamentos</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {renderBehaviorsLength(behaviors)}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderBehaviorsContent(behaviors)}</CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle>Sessões recentes</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              {renderSessionsLength(sessions)}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderSessionsContent(sessions)}</CardContent>
        </Card>
      </div>
    </div>
  )
}
