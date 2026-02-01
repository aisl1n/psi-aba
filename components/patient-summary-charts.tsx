'use client'

import { PatientFullSummary } from '@/app/src/actions/session-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

const CHART_HEIGHT = 350
const GRID_DASH_PATTERN = '3 3'
const X_AXIS_HEIGHT = 60

const COLORS = {
  ADAPTIVE: 'hsl(142.8 64.2% 24.1%)',
  MALADAPTIVE: 'hsl(0 84.2% 60.2%)',
  PRIMARY: 'hsl(var(--primary))',
  SECONDARY: 'hsl(var(--secondary))',
} as const

interface PatientSummaryChartsProps {
  summary: PatientFullSummary
}

function formatChartDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatWeekLabel(weekStart: Date | string): string {
  const d = new Date(weekStart)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatMonthLabel(monthStart: Date | string): string {
  const d = new Date(monthStart)
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

interface ChartDataPoint {
  [key: string]: string | Date | number
}

export function PatientSummaryCharts({ summary }: PatientSummaryChartsProps) {
  if (summary.totalSessions === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum dado para exibir gráficos.
      </div>
    )
  }

  const adaptiveBehaviors = summary.behaviorAggregates.filter(
    (b) => b.behaviorType === 'adaptive'
  )
  const maladaptiveBehaviors = summary.behaviorAggregates.filter(
    (b) => b.behaviorType === 'maladaptive'
  )

  const timeSeriesChartData = summary.timeSeriesData.map((point) => {
    const dataPoint: ChartDataPoint = {
      date: formatChartDate(point.date),
      fullDate: point.date,
    }

    point.behaviors.forEach((behavior) => {
      const behaviorInfo = summary.behaviorAggregates.find(
        (b) => b.behaviorId === behavior.behaviorId
      )
      if (behaviorInfo) {
        dataPoint[`count_${behavior.behaviorId}`] = behavior.count
        dataPoint[`duration_${behavior.behaviorId}`] = behavior.duration
      }
    })

    return dataPoint
  })

  const weeklyChartData = summary.weeklyAverages.map((week) => {
    const dataPoint: ChartDataPoint = {
      week: formatWeekLabel(week.weekStart),
      weekStart: week.weekStart,
    }

    week.behaviors.forEach((behavior) => {
      dataPoint[`avgCount_${behavior.behaviorId}`] = behavior.avgCount
      dataPoint[`avgDuration_${behavior.behaviorId}`] = behavior.avgDuration
    })

    return dataPoint
  })

  const monthlyChartData = summary.monthlyAverages.map((month) => {
    const dataPoint: ChartDataPoint = {
      month: formatMonthLabel(month.monthStart),
      monthStart: month.monthStart,
    }

    month.behaviors.forEach((behavior) => {
      dataPoint[`avgCount_${behavior.behaviorId}`] = behavior.avgCount
      dataPoint[`avgDuration_${behavior.behaviorId}`] = behavior.avgDuration
    })

    return dataPoint
  })

  const comparisonChartData = summary.periodComparison.map((comparison) => ({
    name: comparison.name,
    primeiro: comparison.firstPeriod.avgCountPerSession,
    último: comparison.lastPeriod.avgCountPerSession,
    behaviorType: comparison.behaviorType,
  }))

  const adaptiveComparisonData = comparisonChartData.filter(
    (d) => d.behaviorType === 'adaptive'
  )
  const maladaptiveComparisonData = comparisonChartData.filter(
    (d) => d.behaviorType === 'maladaptive'
  )

  return (
    <div className="space-y-6">
      {timeSeriesChartData.length > 0 && adaptiveBehaviors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Evolução Temporal - Comportamentos Adaptativos (Frequência)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <LineChart data={timeSeriesChartData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="date"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {adaptiveBehaviors.map((behavior) => (
                  <Line
                    key={behavior.behaviorId}
                    type="monotone"
                    dataKey={`count_${behavior.behaviorId}`}
                    stroke={COLORS.ADAPTIVE}
                    strokeWidth={2}
                    name={behavior.name}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {timeSeriesChartData.length > 0 && maladaptiveBehaviors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Evolução Temporal - Comportamentos Desadaptativos (Frequência)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <LineChart data={timeSeriesChartData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="date"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {maladaptiveBehaviors.map((behavior) => (
                  <Line
                    key={behavior.behaviorId}
                    type="monotone"
                    dataKey={`count_${behavior.behaviorId}`}
                    stroke={COLORS.MALADAPTIVE}
                    strokeWidth={2}
                    name={behavior.name}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {adaptiveComparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Comparação de Períodos - Comportamentos Adaptativos
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Média de ocorrências por sessão (Primeiras 20% vs Últimas 20%)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={adaptiveComparisonData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="name"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="primeiro" fill="#94a3b8" name="Período Inicial" />
                <Bar
                  dataKey="último"
                  fill={COLORS.ADAPTIVE}
                  name="Período Recente"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {maladaptiveComparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Comparação de Períodos - Comportamentos Desadaptativos
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Média de ocorrências por sessão (Primeiras 20% vs Últimas 20%)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={maladaptiveComparisonData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="name"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="primeiro" fill="#94a3b8" name="Período Inicial" />
                <Bar
                  dataKey="último"
                  fill={COLORS.MALADAPTIVE}
                  name="Período Recente"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {weeklyChartData.length > 1 && adaptiveBehaviors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Médias Semanais - Comportamentos Adaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <AreaChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="week"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {adaptiveBehaviors.map((behavior) => (
                  <Area
                    key={behavior.behaviorId}
                    type="monotone"
                    dataKey={`avgCount_${behavior.behaviorId}`}
                    stroke={COLORS.ADAPTIVE}
                    fill={COLORS.ADAPTIVE}
                    fillOpacity={0.3}
                    name={behavior.name}
                    connectNulls
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {weeklyChartData.length > 1 && maladaptiveBehaviors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Médias Semanais - Comportamentos Desadaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <AreaChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="week"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {maladaptiveBehaviors.map((behavior) => (
                  <Area
                    key={behavior.behaviorId}
                    type="monotone"
                    dataKey={`avgCount_${behavior.behaviorId}`}
                    stroke={COLORS.MALADAPTIVE}
                    fill={COLORS.MALADAPTIVE}
                    fillOpacity={0.3}
                    name={behavior.name}
                    connectNulls
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {monthlyChartData.length > 1 && summary.behaviorAggregates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Médias Mensais - Todos os Comportamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <ComposedChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="month"
                  height={X_AXIS_HEIGHT}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {summary.behaviorAggregates.map((behavior) => (
                  <Bar
                    key={behavior.behaviorId}
                    dataKey={`avgCount_${behavior.behaviorId}`}
                    fill={
                      behavior.behaviorType === 'adaptive'
                        ? COLORS.ADAPTIVE
                        : COLORS.MALADAPTIVE
                    }
                    name={behavior.name}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
