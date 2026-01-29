'use client'

import React, { useEffect, useState } from 'react'
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

export function SessionCharts({
  sessionId,
  isPostSession = false,
}: SessionChartsProps) {
  const [data, setData] = useState<{
    summary: BehaviorSummary[]
    logs: SessionLog[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = React.useCallback(async () => {
    const result = await getSessionSummary(sessionId)
    if (result.success && result.data) {
      setData(result.data)
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    // Initial load of chart data
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    void loadData()
    // Only refresh in active session (not post-session)
    if (!isPostSession) {
      const interval = setInterval(loadData, 5000)
      return () => clearInterval(interval)
    }
  }, [loadData, isPostSession])

  if (loading || !data) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Carregando dados do gráfico...
      </div>
    )
  }

  if (data.summary.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum dado para exibir. Comece a monitorar comportamentos para ver os
        gráficos.
      </div>
    )
  }

  // Separate data by behavior type
  const adaptiveData = data.summary.filter(
    (item) => item.behaviorType === 'adaptive'
  )
  const maladaptiveData = data.summary.filter(
    (item) => item.behaviorType === 'maladaptive'
  )

  // Prepare data for frequency chart (separated by type)
  const frequencyAdaptive = adaptiveData
    .filter((item) => item.totalCount > 0)
    .map((item) => ({
      name: item.name,
      count: item.totalCount,
    }))

  const frequencyMaladaptive = maladaptiveData
    .filter((item) => item.totalCount > 0)
    .map((item) => ({
      name: item.name,
      count: item.totalCount,
    }))

  // Prepare data for duration chart (separated by type)
  const durationAdaptive = adaptiveData
    .filter((item) => item.totalDuration > 0)
    .map((item) => ({
      name: item.name,
      duration: item.totalDuration, // Keep in seconds
    }))

  const durationMaladaptive = maladaptiveData
    .filter((item) => item.totalDuration > 0)
    .map((item) => ({
      name: item.name,
      duration: item.totalDuration, // Keep in seconds
    }))

  // Prepare timeline data (events over time)
  const timelineData = data.logs
    .reduce(
      (
        acc: Array<{ time: string; events: number }>,
        log: SessionLog
      ) => {
        const time = new Date(log.timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const existing = acc.find((item) => item.time === time)
        if (existing) {
          existing.events += 1
        } else {
          acc.push({ time, events: 1 })
        }
        return acc
      },
      []
    )
    .slice(-20) // Last 20 time points

  return (
    <div className="space-y-6">
      {/* Frequency Charts by Type */}
      {frequencyAdaptive.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Frequência - Comportamentos Adaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequencyAdaptive}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(142.8 64.2% 24.1%)" name="Contagem" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {frequencyMaladaptive.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Frequência - Comportamentos Desadaptativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequencyMaladaptive}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(0 84.2% 60.2%)" name="Contagem" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Duration Charts by Type */}
      {durationAdaptive.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              Duração - Comportamentos Adaptativos (Segundos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationAdaptive}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="hsl(142.8 64.2% 24.1%)" name="Duração (seg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {durationMaladaptive.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Duração - Comportamentos Desadaptativos (Segundos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationMaladaptive}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="hsl(0 84.2% 60.2%)" name="Duração (seg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {timelineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linha do Tempo de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="hsl(var(--primary))"
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
