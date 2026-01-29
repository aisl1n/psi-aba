import { getPostSessionData } from '@/app/src/actions/session-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Moon, Utensils, Pill } from 'lucide-react'
import { SessionCharts } from '@/components/session-charts'
import { Badge } from '@/components/ui/badge'

interface SessionSummaryPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionSummaryPage({
  params,
}: SessionSummaryPageProps) {
  const { sessionId } = await params
  const sessionIdNum = parseInt(sessionId, 10)

  if (isNaN(sessionIdNum)) {
    redirect('/')
  }

  const result = await getPostSessionData(sessionIdNum)

  if (!result.success || !result.data) {
    redirect('/')
  }

  const { session, behaviorStats, logs } = result.data

  // Calculate session duration
  const sessionStartTime = new Date(session.startedAt)
  const sessionEndTime = session.endedAt
    ? new Date(session.endedAt)
    : new Date()
  const durationInSeconds = Math.floor(
    (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000
  )

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getCompanionText = (companion: string, other?: string | null) => {
    if (companion === 'father') return 'Pai'
    if (companion === 'mother') return 'Mãe'
    return other || 'Outro'
  }

  const totalBehaviorCount = behaviorStats.reduce(
    (acc, stat) => acc + stat.totalCount,
    0
  )

  return (
    <div className="bg-background min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
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

        {/* Pre-session Data Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dados Pré-Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Moon className="text-primary h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Horas de sono</p>
                  <p className="font-semibold">
                    {session.sleepHours || 'N/A'} horas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Utensils className="text-primary h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Alimentação</p>
                  <p className="font-semibold">
                    {session.hasEaten ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="text-primary h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Medicação</p>
                  <p className="font-semibold">
                    {session.hasTakenMedication ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="text-primary h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Acompanhante</p>
                  <p className="font-semibold">
                    {getCompanionText(
                      session.companion || 'other',
                      session.companionOther
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">
                  Duração total da sessão
                </p>
                <p className="text-2xl font-bold">
                  {formatDuration(durationInSeconds)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Total de ocorrência de comportamentos
                </p>
                <p className="text-2xl font-bold">{totalBehaviorCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Comportamentos monitorados
                </p>
                <p className="text-2xl font-bold">{behaviorStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalhes por Comportamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behaviorStats.map((stat) => (
                <div
                  key={stat.behaviorId}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{stat.name}</h3>
                      <Badge
                        variant={
                          stat.behaviorType === 'adaptive'
                            ? 'default'
                            : 'destructive'
                        }
                        className={
                          stat.behaviorType === 'adaptive'
                            ? 'bg-primary hover:bg-primary/90'
                            : 'bg-destructive hover:bg-destructive/90'
                        }
                      >
                        {stat.behaviorType === 'adaptive'
                          ? 'Adaptativo'
                          : 'Desadaptativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Contagem total
                      </p>
                      <p className="text-xl font-bold">{stat.totalCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Duração total
                      </p>
                      <p className="text-xl font-bold">
                        {formatDuration(stat.totalDuration)}
                      </p>
                    </div>
                  </div>
                  {/* Individual durations */}
                  {stat.durations && stat.durations.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-sm font-medium">
                        Durações individuais:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stat.durations.map((duration, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDuration(duration)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="mb-6">
          <SessionCharts sessionId={sessionIdNum} isPostSession={true} />
        </div>
      </div>
    </div>
  )
}
