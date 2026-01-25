'use client'

import { useEffect, useState } from 'react'
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

interface SessionChartsProps {
  sessionId: number
}

export function SessionCharts({ sessionId }: SessionChartsProps) {
  const [data, setData] = useState<{ summary: any[]; logs: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Refresh every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [sessionId])

  const loadData = async () => {
    const result = await getSessionSummary(sessionId)
    if (result.success && result.data) {
      setData(result.data)
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Loading chart data...
      </div>
    )
  }

  if (data.summary.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No data to display yet. Start tracking behaviors to see charts.
      </div>
    )
  }

  // Prepare data for frequency chart
  const frequencyData = data.summary
    .filter((item) => item.totalCount > 0)
    .map((item) => ({
      name: item.name,
      count: item.totalCount,
    }))

  // Prepare data for duration chart
  const durationData = data.summary
    .filter((item) => item.totalDuration > 0)
    .map((item) => ({
      name: item.name,
      duration: Math.floor(item.totalDuration / 60), // Convert to minutes
    }))

  // Prepare timeline data (events over time)
  const timelineData = data.logs
    .reduce((acc: any[], log) => {
      const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
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
    }, [])
    .slice(-20) // Last 20 time points

  return (
    <div className="space-y-6">
      {frequencyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frequency by Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequencyData}>
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
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {durationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Duration by Behavior (Minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationData}>
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
                <Bar dataKey="duration" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {timelineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
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
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
