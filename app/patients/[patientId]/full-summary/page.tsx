import { getPatientFullSummary } from '@/app/src/actions/session-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, TrendingUp, Activity } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import {
  formatDateRange,
  getTrendIcon,
  getTrendColor,
  getTrendLabel,
} from '@/utils/patient-summary-utils'
import { FilterControls } from './filter-controls'
import { Badge } from '@/components/ui/badge'
import { PatientSummaryCharts } from '@/components/patient-summary-charts'
import { formatDuration } from '@/utils'

const DECIMAL_RADIX = 10

interface FullSummaryPageProps {
  params: Promise<{ patientId: string }>
  searchParams: Promise<{
    preset?: string
    startDate?: string
    endDate?: string
  }>
}

function SummaryStatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  description?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="text-primary">{icon}</div>
          <div className="flex-1">
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-muted-foreground mt-1 text-xs">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function FullSummaryPage({
  params,
  searchParams,
}: FullSummaryPageProps) {
  const { patientId } = await params
  const { preset, startDate, endDate } = await searchParams

  const patientIdNum = parseInt(patientId, DECIMAL_RADIX)

  if (isNaN(patientIdNum)) {
    redirect(ROUTES.HOME)
  }

  const dateRange = preset
    ? { preset: preset as '7d' | '30d' | '90d' | 'all' }
    : startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : { preset: 'all' as const }

  const result = await getPatientFullSummary(patientIdNum, dateRange)

  if (!result.success || !result.data) {
    redirect(ROUTES.PATIENTS.replace(':patientId', patientId))
  }

  const { data: summary } = result
  const patientName = summary.patient.name
  const patientFirstName = patientName.split(' ')[0]

  const improvingBehaviors = summary.periodComparison.filter(
    (b) => b.trend === 'improving'
  ).length
  const decliningBehaviors = summary.periodComparison.filter(
    (b) => b.trend === 'declining'
  ).length

  const overallProgress =
    summary.periodComparison.length > 0
      ? (improvingBehaviors / summary.periodComparison.length) * 100
      : 0

  return (
    <div className="bg-background min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link href={ROUTES.PATIENTS.replace(':patientId', patientId)}>
            <Button variant="link" className="mb-2 pl-0">
              <ArrowLeft className="mr-2 size-4" />
              Voltar para {patientFirstName}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Resumo Completo de Progressão</h1>
          <p className="text-muted-foreground text-sm">{patientName}</p>
        </div>

        <FilterControls patientId={patientIdNum} />

        {summary.totalSessions === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhuma sessão encontrada no período selecionado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryStatCard
                icon={<Activity className="size-8" />}
                label="Total de Sessões"
                value={summary.totalSessions}
                description={formatDateRange(
                  summary.dateRange.start,
                  summary.dateRange.end
                )}
              />
              <SummaryStatCard
                icon={<TrendingUp className="size-8" />}
                label="Comportamentos Monitorados"
                value={summary.behaviorAggregates.length}
              />
              <SummaryStatCard
                icon={<Calendar className="size-8" />}
                label="Progresso Geral"
                value={`${overallProgress.toFixed(0)}%`}
                description={`${improvingBehaviors} melhorando, ${decliningBehaviors} piorando`}
              />
              <SummaryStatCard
                icon={<TrendingUp className="size-8" />}
                label="Taxa de Melhora"
                value={improvingBehaviors}
                description={`de ${summary.periodComparison.length} comportamentos`}
              />
            </div>

            {summary.periodComparison.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Comparação de Períodos</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Primeiras 20% sessões vs Últimas 20% sessões
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.periodComparison.map((comparison) => (
                      <div
                        key={comparison.behaviorId}
                        className="rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{comparison.name}</h3>
                            <Badge
                              variant={
                                comparison.behaviorType === 'adaptive'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {comparison.behaviorType === 'adaptive'
                                ? 'Adaptativo'
                                : 'Desadaptativo'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-2xl ${getTrendColor(comparison.trend)}`}
                            >
                              {getTrendIcon(comparison.trend)}
                            </span>
                            <span
                              className={`text-sm font-medium ${getTrendColor(comparison.trend)}`}
                            >
                              {getTrendLabel(comparison.trend)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Período Inicial
                            </p>
                            <p className="font-semibold">
                              {comparison.firstPeriod.avgCountPerSession.toFixed(
                                1
                              )}{' '}
                              ocorrências/sessão
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Período Recente
                            </p>
                            <p className="font-semibold">
                              {comparison.lastPeriod.avgCountPerSession.toFixed(
                                1
                              )}{' '}
                              ocorrências/sessão
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-muted-foreground text-xs">
                            Mudança: {comparison.countChange > 0 ? '+' : ''}
                            {comparison.countChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6">
              <PatientSummaryCharts summary={summary} />
            </div>

            {summary.behaviorAggregates.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>
                    Estatísticas Detalhadas por Comportamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.behaviorAggregates.map((behavior) => (
                      <div
                        key={behavior.behaviorId}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {behavior.name}
                          </h3>
                          <Badge
                            variant={
                              behavior.behaviorType === 'adaptive'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {behavior.behaviorType === 'adaptive'
                              ? 'Adaptativo'
                              : 'Desadaptativo'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Contagem Total
                            </p>
                            <p className="text-xl font-bold">
                              {behavior.totalCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Média por Sessão
                            </p>
                            <p className="text-xl font-bold">
                              {behavior.avgCountPerSession.toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Duração Total
                            </p>
                            <p className="text-xl font-bold">
                              {formatDuration(behavior.totalDuration)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Sessões com Registro
                            </p>
                            <p className="text-xl font-bold">
                              {behavior.sessionsWithBehavior}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
