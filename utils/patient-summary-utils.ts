import { PeriodComparison, PeriodStats, WeeklyAverage, MonthlyAverage } from '@/app/src/actions/session-actions'

interface Session {
  id: number
  startedAt: Date | string
  sessionLogs: Array<{
    behaviorId: number
    count: number
    duration: number
    behavior: {
      name: string
      behaviorType: string
    }
  }>
}

interface BehaviorData {
  behaviorId: number
  name: string
  behaviorType: 'adaptive' | 'maladaptive'
  totalCount: number
  totalDuration: number
  sessions: Set<number>
}

export function calculateTrend(
  firstPeriod: PeriodStats,
  lastPeriod: PeriodStats,
  behaviorType: 'adaptive' | 'maladaptive'
): 'improving' | 'declining' | 'stable' {
  const STABILITY_THRESHOLD = 10

  const avgFirst = firstPeriod.avgCountPerSession
  const avgLast = lastPeriod.avgCountPerSession

  if (avgFirst === 0 && avgLast === 0) {
    return 'stable'
  }

  const changePercent = avgFirst === 0 
    ? (avgLast > 0 ? 100 : 0)
    : ((avgLast - avgFirst) / avgFirst) * 100

  if (Math.abs(changePercent) < STABILITY_THRESHOLD) {
    return 'stable'
  }

  if (behaviorType === 'adaptive') {
    return changePercent > 0 ? 'improving' : 'declining'
  } else {
    return changePercent < 0 ? 'improving' : 'declining'
  }
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

function getPeriodStats(
  sessions: Session[],
  behaviorId: number
): PeriodStats {
  let totalCount = 0
  let totalDuration = 0
  const sessionCount = sessions.length

  sessions.forEach((session) => {
    session.sessionLogs.forEach((log) => {
      if (log.behaviorId === behaviorId) {
        totalCount += log.count
        totalDuration += log.duration
      }
    })
  })

  return {
    totalCount,
    totalDuration,
    sessionCount,
    avgCountPerSession: sessionCount > 0 ? totalCount / sessionCount : 0,
    avgDurationPerSession: sessionCount > 0 ? totalDuration / sessionCount : 0,
  }
}

export function calculatePeriodComparison(
  sessions: Session[],
  behaviorMap: Map<number, BehaviorData>
): PeriodComparison[] {
  if (sessions.length < 4) {
    return []
  }

  const periodSize = Math.max(1, Math.floor(sessions.length * 0.2))
  const firstPeriodSessions = sessions.slice(0, periodSize)
  const lastPeriodSessions = sessions.slice(-periodSize)

  const comparisons: PeriodComparison[] = []

  behaviorMap.forEach((behavior) => {
    const firstPeriod = getPeriodStats(firstPeriodSessions, behavior.behaviorId)
    const lastPeriod = getPeriodStats(lastPeriodSessions, behavior.behaviorId)

    const countChange = firstPeriod.avgCountPerSession === 0
      ? 0
      : ((lastPeriod.avgCountPerSession - firstPeriod.avgCountPerSession) /
          firstPeriod.avgCountPerSession) * 100

    const durationChange = firstPeriod.avgDurationPerSession === 0
      ? 0
      : ((lastPeriod.avgDurationPerSession - firstPeriod.avgDurationPerSession) /
          firstPeriod.avgDurationPerSession) * 100

    const trend = calculateTrend(firstPeriod, lastPeriod, behavior.behaviorType)

    comparisons.push({
      behaviorId: behavior.behaviorId,
      name: behavior.name,
      behaviorType: behavior.behaviorType,
      firstPeriod,
      lastPeriod,
      countChange,
      durationChange,
      trend,
    })
  })

  return comparisons
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0]
}

function getMonthKey(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function groupByWeek(sessions: Session[]): WeeklyAverage[] {
  const weekMap = new Map<
    string,
    {
      weekStart: Date
      behaviors: Map<number, { name: string; counts: number[]; durations: number[] }>
    }
  >()

  sessions.forEach((session) => {
    const sessionDate = new Date(session.startedAt)
    const weekKey = getWeekKey(sessionDate)

    if (!weekMap.has(weekKey)) {
      const d = new Date(sessionDate)
      const dayOfWeek = d.getDay()
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff))
      monday.setHours(0, 0, 0, 0)

      weekMap.set(weekKey, {
        weekStart: monday,
        behaviors: new Map(),
      })
    }

    const weekData = weekMap.get(weekKey)!

    session.sessionLogs.forEach((log) => {
      if (!weekData.behaviors.has(log.behaviorId)) {
        weekData.behaviors.set(log.behaviorId, {
          name: log.behavior.name,
          counts: [],
          durations: [],
        })
      }

      const behaviorData = weekData.behaviors.get(log.behaviorId)!
      behaviorData.counts.push(log.count)
      behaviorData.durations.push(log.duration)
    })
  })

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      weekStart: data.weekStart,
      behaviors: Array.from(data.behaviors.entries()).map(([behaviorId, bData]) => ({
        behaviorId,
        name: bData.name,
        avgCount: calculateAverage(bData.counts),
        avgDuration: calculateAverage(bData.durations),
      })),
    }))
}

export function groupByMonth(sessions: Session[]): MonthlyAverage[] {
  const monthMap = new Map<
    string,
    {
      monthStart: Date
      behaviors: Map<number, { name: string; counts: number[]; durations: number[] }>
    }
  >()

  sessions.forEach((session) => {
    const sessionDate = new Date(session.startedAt)
    const monthKey = getMonthKey(sessionDate)

    if (!monthMap.has(monthKey)) {
      const monthStart = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), 1)
      monthMap.set(monthKey, {
        monthStart,
        behaviors: new Map(),
      })
    }

    const monthData = monthMap.get(monthKey)!

    session.sessionLogs.forEach((log) => {
      if (!monthData.behaviors.has(log.behaviorId)) {
        monthData.behaviors.set(log.behaviorId, {
          name: log.behavior.name,
          counts: [],
          durations: [],
        })
      }

      const behaviorData = monthData.behaviors.get(log.behaviorId)!
      behaviorData.counts.push(log.count)
      behaviorData.durations.push(log.duration)
    })
  })

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      monthStart: data.monthStart,
      behaviors: Array.from(data.behaviors.entries()).map(([behaviorId, bData]) => ({
        behaviorId,
        name: bData.name,
        avgCount: calculateAverage(bData.counts),
        avgDuration: calculateAverage(bData.durations),
      })),
    }))
}

export function detectBehaviorChanges(
  timeSeriesData: Array<{
    date: Date
    behaviors: Array<{ behaviorId: number; count: number; duration: number }>
  }>
): {
  appeared: Map<number, Date>
  disappeared: Map<number, Date>
} {
  const appeared = new Map<number, Date>()
  const disappeared = new Map<number, Date>()
  const lastSeen = new Map<number, Date>()

  timeSeriesData.forEach((point) => {
    const currentBehaviors = new Set(point.behaviors.map((b) => b.behaviorId))

    currentBehaviors.forEach((behaviorId) => {
      if (!lastSeen.has(behaviorId)) {
        appeared.set(behaviorId, point.date)
      }
      lastSeen.set(behaviorId, point.date)
    })
  })

  return { appeared, disappeared }
}

export function formatDateRange(start: Date, end: Date): string {
  const startStr = new Date(start).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const endStr = new Date(end).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return `${startStr} - ${endStr}`
}

export function getTrendIcon(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving':
      return '↗'
    case 'declining':
      return '↘'
    case 'stable':
      return '→'
  }
}

export function getTrendColor(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving':
      return 'text-primary'
    case 'declining':
      return 'text-destructive'
    case 'stable':
      return 'text-muted-foreground'
  }
}

export function getTrendLabel(trend: 'improving' | 'declining' | 'stable'): string {
  switch (trend) {
    case 'improving':
      return 'Melhorando'
    case 'declining':
      return 'Piorando'
    case 'stable':
      return 'Estável'
  }
}
