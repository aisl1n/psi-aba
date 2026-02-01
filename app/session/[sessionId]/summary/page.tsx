import { getPostSessionData } from '@/app/src/actions/session-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Moon, Utensils, Pill } from 'lucide-react'
import { SessionCharts } from '@/components/session-charts'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDuration, calculateDurationInSeconds } from '@/utils'
import {
  getCompanionDisplayText,
  calculateTotalBehaviorCount,
  BEHAVIOR_TYPE_ADAPTIVE,
  BEHAVIOR_TYPE_LABELS,
} from '@/utils/session-summary-utils'
import { ROUTES } from '@/constants/routes'

const DECIMAL_RADIX = 10

interface SessionSummaryPageProps {
  params: Promise<{ sessionId: string }>
}

interface PreSessionDataItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

interface BehaviorStat {
  behaviorId: number
  name: string
  behaviorType: string
  totalCount: number
  totalDuration: number
  durations?: number[]
}

function PreSessionDataItem({ icon, label, value }: PreSessionDataItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary size-5">{icon}</span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}

function getBehaviorTypeVariant(behaviorType: string) {
  return behaviorType === BEHAVIOR_TYPE_ADAPTIVE ? 'default' : 'destructive'
}

function getBehaviorTypeBadgeClass(behaviorType: string) {
  return behaviorType === BEHAVIOR_TYPE_ADAPTIVE
    ? 'bg-primary hover:bg-primary/90'
    : 'bg-destructive hover:bg-destructive/90'
}

export default async function SessionSummaryPage({
  params,
}: SessionSummaryPageProps) {
  const { sessionId } = await params
  const sessionIdNum = parseInt(sessionId, DECIMAL_RADIX)

  if (isNaN(sessionIdNum)) {
    redirect(ROUTES.HOME)
  }

  const result = await getPostSessionData(sessionIdNum)

  if (!result.success || !result.data) {
    redirect(ROUTES.HOME)
  }

  const { session, behaviorStats } = result.data

  const sessionStartTime = new Date(session.startedAt)
  const sessionEndTime = session.endedAt
    ? new Date(session.endedAt)
    : new Date()
  const durationInSeconds = calculateDurationInSeconds(
    sessionStartTime,
    sessionEndTime
  )
  const totalBehaviorCount = calculateTotalBehaviorCount(behaviorStats)

  const renderHeader = () => (
    <div className="mb-6">
      <Link href={ROUTES.HOME}>
        <Button variant="link" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao início
        </Button>
      </Link>
      <h1 className="text-3xl font-bold">Resumo da Sessão</h1>
      <p className="text-muted-foreground text-sm">
        {session.patient.name} - {formatDate(session.startedAt)}
      </p>
    </div>
  )

  const renderPreSessionCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Dados Pré-Sessão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <PreSessionDataItem
            icon={<Moon className="size-5" />}
            label="Horas de sono"
            value={`${session.sleepHours ?? 'N/A'} horas`}
          />
          <PreSessionDataItem
            icon={<Utensils className="size-5" />}
            label="Alimentação"
            value={session.hasEaten ? 'Sim' : 'Não'}
          />
          <PreSessionDataItem
            icon={<Pill className="size-5" />}
            label="Medicação"
            value={session.hasTakenMedication ? 'Sim' : 'Não'}
          />
          <PreSessionDataItem
            icon={<User className="size-5" />}
            label="Acompanhante"
            value={getCompanionDisplayText(
              session.companion,
              session.companionOther
            )}
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderGeneralSummaryCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resumo Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryStat
            label="Duração total da sessão"
            value={formatDuration(durationInSeconds)}
          />
          <SummaryStat
            label="Total de ocorrência de comportamentos"
            value={String(totalBehaviorCount)}
          />
          <SummaryStat
            label="Comportamentos monitorados"
            value={String(behaviorStats.length)}
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderBehaviorStatItem = (stat: BehaviorStat) => {
    const hasDurations = stat.durations && stat.durations.length > 0

    return (
      <div key={stat.behaviorId} className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{stat.name}</h3>
            <Badge
              variant={getBehaviorTypeVariant(stat.behaviorType)}
              className={getBehaviorTypeBadgeClass(stat.behaviorType)}
            >
              {stat.behaviorType === BEHAVIOR_TYPE_ADAPTIVE
                ? BEHAVIOR_TYPE_LABELS.adaptive
                : BEHAVIOR_TYPE_LABELS.maladaptive}
            </Badge>
          </div>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-4">
          <SummaryStat label="Contagem total" value={String(stat.totalCount)} />
          <SummaryStat
            label="Duração total"
            value={formatDuration(stat.totalDuration)}
          />
        </div>
        {hasDurations && (
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Durações individuais:
            </p>
            <div className="flex flex-wrap gap-2">
              {stat.durations?.map((duration, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <Clock className="mr-1 size-3" />
                  {formatDuration(duration)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBehaviorDetailsCard = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Detalhes por Comportamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {behaviorStats.map(renderBehaviorStatItem)}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="bg-background min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {renderHeader()}
        {renderPreSessionCard()}
        {renderGeneralSummaryCard()}
        {renderBehaviorDetailsCard()}
        <div className="mb-6">
          <SessionCharts sessionId={sessionIdNum} isPostSession={true} />
        </div>
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
