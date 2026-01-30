'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSessionSummary } from '@/app/src/actions/session-actions'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CHART_REFRESH_INTERVAL_MS = 5000
const CHART_HEIGHT = 300
const X_AXIS_ROTATION_ANGLE = -45
const X_AXIS_HEIGHT = 100
const MAX_TIMELINE_POINTS = 20
const GRID_DASH_PATTERN = '3 3'

const COLORS = {
  ADAPTIVE: 'hsl(142.8 64.2% 24.1%)',
  MALADAPTIVE: 'hsl(0 84.2% 60.2%)',
  PRIMARY: 'hsl(var(--primary))',
} as const

const BEHAVIOR_TYPES = {
  ADAPTIVE: 'adaptive',
  MALADAPTIVE: 'maladaptive',
} as const

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

interface SessionChartsProps {
  sessionId: number
  isPostSession?: boolean
}

interface SessionData {
  summary: BehaviorSummary[]
  logs: SessionLog[]
}

interface ChartDataPoint {
  name: string
  count?: number
  duration?: number
}

interface TimelineDataPoint {
  time: string
  events: number
}

const filterByBehaviorType = (
  behaviors: BehaviorSummary[],
  type: string
): BehaviorSummary[] => {
  return behaviors.filter((behavior) => behavior.behaviorType === type)
}

const hasFrequencyData = (behavior: BehaviorSummary): boolean => {
  return behavior.totalCount > 0
}

const hasDurationData = (behavior: BehaviorSummary): boolean => {
  return behavior.totalDuration > 0
}

const mapToFrequencyChartData = (
  behaviors: BehaviorSummary[]
): ChartDataPoint[] => {
  return behaviors.filter(hasFrequencyData).map((behavior) => ({
    name: behavior.name,
    count: behavior.totalCount,
  }))
}

const mapToDurationChartData = (
  behaviors: BehaviorSummary[]
): ChartDataPoint[] => {
  return behaviors.filter(hasDurationData).map((behavior) => ({
    name: behavior.name,
    duration: behavior.totalDuration,
  }))
}

const formatTimeFromDate = (date: Date): string => {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const aggregateTimelineData = (logs: SessionLog[]): TimelineDataPoint[] => {
  const aggregated = logs.reduce(
    (accumulated: TimelineDataPoint[], log: SessionLog) => {
      const time = formatTimeFromDate(log.timestamp)
      const existingPoint = accumulated.find((item) => item.time === time)

      if (existingPoint) {
        existingPoint.events += 1
      } else {
        accumulated.push({ time, events: 1 })
      }

      return accumulated
    },
    []
  )

  return aggregated.slice(-MAX_TIMELINE_POINTS)
}

export function SessionCharts({
  sessionId,
  isPostSession = false,
}: SessionChartsProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const fetchChartData = useCallback(async () => {
    const result = await getSessionSummary(sessionId)
    if (result.success && result.data) {
      setSessionData(result.data)
      setIsLoadingData(false)
    }
  }, [sessionId])

  useEffect(() => {
    const initialLoadTimeout = setTimeout(() => {
      fetchChartData().catch(console.error)
    }, 0)

    let refreshInterval: NodeJS.Timeout | undefined
    if (!isPostSession) {
      refreshInterval = setInterval(() => {
        fetchChartData().catch(console.error)
      }, CHART_REFRESH_INTERVAL_MS)
    }

    return () => {
      clearTimeout(initialLoadTimeout)
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [fetchChartData, isPostSession])

  if (isLoadingData || !sessionData) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Carregando dados do gráfico...
      </div>
    )
  }

  if (sessionData.summary.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum dado para exibir. Comece a monitorar comportamentos para ver os
        gráficos.
      </div>
    )
  }

  const adaptiveBehaviors = filterByBehaviorType(
    sessionData.summary,
    BEHAVIOR_TYPES.ADAPTIVE
  )
  const maladaptiveBehaviors = filterByBehaviorType(
    sessionData.summary,
    BEHAVIOR_TYPES.MALADAPTIVE
  )

  const adaptiveFrequencyData = mapToFrequencyChartData(adaptiveBehaviors)
  const maladaptiveFrequencyData = mapToFrequencyChartData(maladaptiveBehaviors)
  const adaptiveDurationData = mapToDurationChartData(adaptiveBehaviors)
  const maladaptiveDurationData = mapToDurationChartData(maladaptiveBehaviors)
  const timelineData = aggregateTimelineData(sessionData.logs)

  const hasAdaptiveFrequencyData = adaptiveFrequencyData.length > 0
  const hasMaladaptiveFrequencyData = maladaptiveFrequencyData.length > 0
  const hasAdaptiveDurationData = adaptiveDurationData.length > 0
  const hasMaladaptiveDurationData = maladaptiveDurationData.length > 0
  const hasTimelineData = timelineData.length > 0

  return (
    <div className="space-y-6">
      {hasAdaptiveFrequencyData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Frequência - Comportamentos Adaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={adaptiveFrequencyData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="name"
                  angle={X_AXIS_ROTATION_ANGLE}
                  textAnchor="end"
                  height={X_AXIS_HEIGHT}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={COLORS.ADAPTIVE} name="Contagem" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasMaladaptiveFrequencyData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Frequência - Comportamentos Desadaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={maladaptiveFrequencyData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="name"
                  angle={X_AXIS_ROTATION_ANGLE}
                  textAnchor="end"
                  height={X_AXIS_HEIGHT}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill={COLORS.MALADAPTIVE}
                  name="Contagem"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasAdaptiveDurationData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Duração - Comportamentos Adaptativos (Segundos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={adaptiveDurationData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="name"
                  angle={X_AXIS_ROTATION_ANGLE}
                  textAnchor="end"
                  height={X_AXIS_HEIGHT}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="duration"
                  fill={COLORS.ADAPTIVE}
                  name="Duração (seg)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasMaladaptiveDurationData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Duração - Comportamentos Desadaptativos (Segundos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={maladaptiveDurationData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis
                  dataKey="name"
                  angle={X_AXIS_ROTATION_ANGLE}
                  textAnchor="end"
                  height={X_AXIS_HEIGHT}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="duration"
                  fill={COLORS.MALADAPTIVE}
                  name="Duração (seg)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hasTimelineData && (
        <Card>
          <CardHeader>
            <CardTitle>Linha do Tempo de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray={GRID_DASH_PATTERN} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke={COLORS.PRIMARY}
                  strokeWidth={2}
                  name="Eventos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
