'use server'

import { db } from '@/db'
import { sessions, sessionLogs, behaviors, patients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  PreSessionData,
  ManualSessionData,
  BehaviorLogInput,
} from '@/app/types'

export async function startSessionAction(
  patientId: number,
  preSessionData: PreSessionData
) {
  try {
    const newSession = await db
      .insert(sessions)
      .values({
        patientId,
        startedAt: new Date(),
        sleepHours: preSessionData.sleepHours,
        hasEaten: preSessionData.hasEaten,
        hasTakenMedication: preSessionData.hasTakenMedication,
        companion: preSessionData.companion,
        companionOther: preSessionData.companionOther,
      })
      .returning({ id: sessions.id })

    return { success: true, sessionId: newSession[0].id }
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error)
    return { success: false, error: 'Falha ao criar sessão' }
  }
}

export async function logBehaviorAction(
  sessionId: number,
  behaviorId: number,
  count: number = 0,
  duration: number = 0
) {
  try {
    const logData = {
      sessionId,
      behaviorId,
      count,
      duration,
    }

    await db.insert(sessionLogs).values(logData)

    revalidatePath(`/session/${sessionId}`)

    return { success: true }
  } catch (error) {
    console.error('Erro ao registrar log:', error)
    return { success: false, error: 'Falha ao salvar registro' }
  }
}

export async function endSessionAction(sessionId: number, notes?: string) {
  try {
    await db
      .update(sessions)
      .set({
        endedAt: new Date(),
        notes: notes || '',
      })
      .where(eq(sessions.id, sessionId))

    revalidatePath(`/session/${sessionId}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Erro ao finalizar sessão:', error)
    return { success: false, error: 'Erro ao finalizar sessão' }
  }
}

export async function getSessionData(sessionId: number) {
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        patient: {
          with: {
            behaviors: {
              where: eq(behaviors.isActive, true),
            },
          },
        },
        sessionLogs: {
          orderBy: (sessionLogs, { desc }) => [desc(sessionLogs.timestamp)],
        },
      },
    })

    if (!session) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    return { success: true, data: session }
  } catch (error) {
    console.error('Error fetching session data:', error)
    return { success: false, error: 'Failed to fetch session data' }
  }
}

export async function getSessionSummary(sessionId: number) {
  try {
    const logs = await db.query.sessionLogs.findMany({
      where: eq(sessionLogs.sessionId, sessionId),
      with: {
        behavior: true,
      },
      orderBy: (sessionLogs, { asc }) => [asc(sessionLogs.timestamp)],
    })

    const behaviorStats = new Map<
      number,
      {
        name: string
        totalCount: number
        totalDuration: number
        events: number
        behaviorType: string
      }
    >()

    logs.forEach((log) => {
      const behaviorId = log.behaviorId
      const existing = behaviorStats.get(behaviorId) || {
        name: log.behavior.name,
        totalCount: 0,
        totalDuration: 0,
        events: 0,
        behaviorType: log.behavior.behaviorType,
      }

      existing.totalCount += log.count
      existing.totalDuration += log.duration
      existing.events += 1

      behaviorStats.set(behaviorId, existing)
    })

    const summary = Array.from(behaviorStats.values())

    return { success: true, data: { summary, logs } }
  } catch (error) {
    console.error('Error fetching session summary:', error)
    return { success: false, error: 'Failed to fetch session summary' }
  }
}

export async function getPostSessionData(sessionId: number) {
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
      with: {
        patient: true,
      },
    })

    if (!session) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    const logs = await db.query.sessionLogs.findMany({
      where: eq(sessionLogs.sessionId, sessionId),
      with: {
        behavior: true,
      },
      orderBy: (sessionLogs, { asc }) => [asc(sessionLogs.timestamp)],
    })

    const behaviorStatsMap = new Map<
      number,
      {
        behaviorId: number
        name: string
        behaviorType: string
        totalCount: number
        totalDuration: number
        durations: number[]
      }
    >()

    logs.forEach((log) => {
      const behaviorId = log.behaviorId
      const existing = behaviorStatsMap.get(behaviorId) || {
        behaviorId,
        name: log.behavior.name,
        behaviorType: log.behavior.behaviorType,
        totalCount: 0,
        totalDuration: 0,
        durations: [],
      }

      existing.totalCount += log.count
      existing.totalDuration += log.duration
      if (log.duration > 0) {
        existing.durations.push(log.duration)
      }

      behaviorStatsMap.set(behaviorId, existing)
    })

    const behaviorStats = Array.from(behaviorStatsMap.values())

    return {
      success: true,
      data: {
        session,
        behaviorStats,
        logs,
      },
    }
  } catch (error) {
    console.error('Error fetching post-session data:', error)
    return { success: false, error: 'Failed to fetch post-session data' }
  }
}

export async function createManualSessionAction(
  patientId: number,
  sessionData: ManualSessionData,
  behaviorLogs: BehaviorLogInput[]
) {
  try {
    if (sessionData.endedAt <= sessionData.startedAt) {
      return {
        success: false,
        error: 'A data de término deve ser posterior à data de início',
      }
    }

    if (behaviorLogs.length === 0) {
      return {
        success: false,
        error: 'Adicione pelo menos um registro de comportamento',
      }
    }

    const newSession = await db
      .insert(sessions)
      .values({
        patientId,
        startedAt: sessionData.startedAt,
        endedAt: sessionData.endedAt,
        sleepHours: sessionData.sleepHours,
        hasEaten: sessionData.hasEaten,
        hasTakenMedication: sessionData.hasTakenMedication,
        companion: sessionData.companion,
        companionOther: sessionData.companionOther,
      })
      .returning({ id: sessions.id })

    const sessionId = newSession[0].id

    const logsToInsert = behaviorLogs.map((log) => ({
      sessionId,
      behaviorId: log.behaviorId,
      count: log.count,
      duration: log.duration,
      timestamp: log.timestamp || sessionData.startedAt,
    }))

    await db.insert(sessionLogs).values(logsToInsert)

    revalidatePath(`/patients/${patientId}`)
    revalidatePath(`/session/${sessionId}`)

    return { success: true, sessionId }
  } catch (error) {
    console.error('Erro ao criar sessão manual:', error)
    return { success: false, error: 'Falha ao criar sessão manual' }
  }
}

export interface DateRangeFilter {
  startDate?: Date
  endDate?: Date
  preset?: '7d' | '30d' | '90d' | 'all'
}

export interface BehaviorAggregate {
  behaviorId: number
  name: string
  behaviorType: 'adaptive' | 'maladaptive'
  totalCount: number
  totalDuration: number
  avgCountPerSession: number
  avgDurationPerSession: number
  sessionsWithBehavior: number
}

export interface TimeSeriesDataPoint {
  date: Date
  sessionId: number
  behaviors: {
    behaviorId: number
    count: number
    duration: number
  }[]
}

export interface PeriodStats {
  totalCount: number
  totalDuration: number
  sessionCount: number
  avgCountPerSession: number
  avgDurationPerSession: number
}

export interface PeriodComparison {
  behaviorId: number
  name: string
  behaviorType: 'adaptive' | 'maladaptive'
  firstPeriod: PeriodStats
  lastPeriod: PeriodStats
  countChange: number
  durationChange: number
  trend: 'improving' | 'declining' | 'stable'
}

interface SessionWithLogs {
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

interface BehaviorMapData {
  behaviorId: number
  name: string
  behaviorType: 'adaptive' | 'maladaptive'
  totalCount: number
  totalDuration: number
  sessions: Set<number>
}

export interface WeeklyAverage {
  week: string
  weekStart: Date
  behaviors: {
    behaviorId: number
    name: string
    avgCount: number
    avgDuration: number
  }[]
}

export interface MonthlyAverage {
  month: string
  monthStart: Date
  behaviors: {
    behaviorId: number
    name: string
    avgCount: number
    avgDuration: number
  }[]
}

export interface PatientFullSummary {
  patient: {
    id: number
    name: string
  }
  totalSessions: number
  dateRange: { start: Date; end: Date }
  behaviorAggregates: BehaviorAggregate[]
  timeSeriesData: TimeSeriesDataPoint[]
  periodComparison: PeriodComparison[]
  weeklyAverages: WeeklyAverage[]
  monthlyAverages: MonthlyAverage[]
}

export async function getPatientFullSummary(
  patientId: number,
  dateRange?: DateRangeFilter
) {
  try {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
    })

    if (!patient) {
      return { success: false, error: 'Paciente não encontrado' }
    }

    let startDate: Date
    let endDate = new Date()

    if (dateRange?.preset) {
      const now = new Date()
      switch (dateRange.preset) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'all':
        default:
          startDate = new Date(0)
          break
      }
    } else if (dateRange?.startDate && dateRange?.endDate) {
      startDate = dateRange.startDate
      endDate = dateRange.endDate
    } else {
      startDate = new Date(0)
    }

    const patientSessions = await db.query.sessions.findMany({
      where: eq(sessions.patientId, patientId),
      with: {
        sessionLogs: {
          with: {
            behavior: true,
          },
        },
      },
      orderBy: (sessions, { asc }) => [asc(sessions.startedAt)],
    })

    const filteredSessions = patientSessions.filter((session) => {
      const sessionDate = new Date(session.startedAt)
      return sessionDate >= startDate && sessionDate <= endDate
    })

    if (filteredSessions.length === 0) {
      return {
        success: true,
        data: {
          patient: { id: patient.id, name: patient.name },
          totalSessions: 0,
          dateRange: { start: startDate, end: endDate },
          behaviorAggregates: [],
          timeSeriesData: [],
          periodComparison: [],
          weeklyAverages: [],
          monthlyAverages: [],
        } as PatientFullSummary,
      }
    }

    const actualStartDate =
      startDate.getTime() === new Date(0).getTime() &&
      filteredSessions.length > 0
        ? new Date(filteredSessions[0].startedAt)
        : startDate

    const behaviorMap = new Map<
      number,
      {
        behaviorId: number
        name: string
        behaviorType: 'adaptive' | 'maladaptive'
        totalCount: number
        totalDuration: number
        sessions: Set<number>
      }
    >()

    const timeSeriesData: TimeSeriesDataPoint[] = []

    filteredSessions.forEach((session) => {
      const sessionBehaviors: {
        behaviorId: number
        count: number
        duration: number
      }[] = []

      session.sessionLogs.forEach((log) => {
        const behaviorId = log.behaviorId
        const behavior = log.behavior

        if (!behaviorMap.has(behaviorId)) {
          behaviorMap.set(behaviorId, {
            behaviorId,
            name: behavior.name,
            behaviorType: behavior.behaviorType as 'adaptive' | 'maladaptive',
            totalCount: 0,
            totalDuration: 0,
            sessions: new Set(),
          })
        }

        const behaviorData = behaviorMap.get(behaviorId)!
        behaviorData.totalCount += log.count
        behaviorData.totalDuration += log.duration
        behaviorData.sessions.add(session.id)

        const existingBehavior = sessionBehaviors.find(
          (b) => b.behaviorId === behaviorId
        )
        if (existingBehavior) {
          existingBehavior.count += log.count
          existingBehavior.duration += log.duration
        } else {
          sessionBehaviors.push({
            behaviorId,
            count: log.count,
            duration: log.duration,
          })
        }
      })

      timeSeriesData.push({
        date: new Date(session.startedAt),
        sessionId: session.id,
        behaviors: sessionBehaviors,
      })
    })

    const behaviorAggregates: BehaviorAggregate[] = Array.from(
      behaviorMap.values()
    ).map((behavior) => ({
      behaviorId: behavior.behaviorId,
      name: behavior.name,
      behaviorType: behavior.behaviorType,
      totalCount: behavior.totalCount,
      totalDuration: behavior.totalDuration,
      avgCountPerSession: behavior.totalCount / filteredSessions.length,
      avgDurationPerSession: behavior.totalDuration / filteredSessions.length,
      sessionsWithBehavior: behavior.sessions.size,
    }))

    const periodComparison = calculatePeriodComparisonInternal(
      filteredSessions,
      behaviorMap
    )
    const weeklyAverages = groupByWeekInternal(filteredSessions)
    const monthlyAverages = groupByMonthInternal(filteredSessions)

    const summary: PatientFullSummary = {
      patient: { id: patient.id, name: patient.name },
      totalSessions: filteredSessions.length,
      dateRange: { start: actualStartDate, end: endDate },
      behaviorAggregates,
      timeSeriesData,
      periodComparison,
      weeklyAverages,
      monthlyAverages,
    }

    return { success: true, data: summary }
  } catch (error) {
    console.error('Error fetching patient full summary:', error)
    return { success: false, error: 'Falha ao buscar resumo completo' }
  }
}

function calculateTrendInternal(
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

  const changePercent =
    avgFirst === 0
      ? avgLast > 0
        ? 100
        : 0
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

function calculateAverageInternal(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

function getPeriodStatsInternal(
  sessions: SessionWithLogs[],
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

function calculatePeriodComparisonInternal(
  sessions: SessionWithLogs[],
  behaviorMap: Map<number, BehaviorMapData>
): PeriodComparison[] {
  if (sessions.length < 4) {
    return []
  }

  const periodSize = Math.max(1, Math.floor(sessions.length * 0.2))
  const firstPeriodSessions = sessions.slice(0, periodSize)
  const lastPeriodSessions = sessions.slice(-periodSize)

  const comparisons: PeriodComparison[] = []

  behaviorMap.forEach((behavior) => {
    const firstPeriod = getPeriodStatsInternal(
      firstPeriodSessions,
      behavior.behaviorId
    )
    const lastPeriod = getPeriodStatsInternal(
      lastPeriodSessions,
      behavior.behaviorId
    )

    const countChange =
      firstPeriod.avgCountPerSession === 0
        ? 0
        : ((lastPeriod.avgCountPerSession - firstPeriod.avgCountPerSession) /
            firstPeriod.avgCountPerSession) *
          100

    const durationChange =
      firstPeriod.avgDurationPerSession === 0
        ? 0
        : ((lastPeriod.avgDurationPerSession -
            firstPeriod.avgDurationPerSession) /
            firstPeriod.avgDurationPerSession) *
          100

    const trend = calculateTrendInternal(
      firstPeriod,
      lastPeriod,
      behavior.behaviorType
    )

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

function getWeekKeyInternal(date: Date): string {
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0]
}

function getMonthKeyInternal(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function groupByWeekInternal(sessions: SessionWithLogs[]): WeeklyAverage[] {
  const weekMap = new Map<
    string,
    {
      weekStart: Date
      behaviors: Map<
        number,
        { name: string; counts: number[]; durations: number[] }
      >
    }
  >()

  sessions.forEach((session) => {
    const sessionDate = new Date(session.startedAt)
    const weekKey = getWeekKeyInternal(sessionDate)

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
      behaviors: Array.from(data.behaviors.entries()).map(
        ([behaviorId, bData]) => ({
          behaviorId,
          name: bData.name,
          avgCount: calculateAverageInternal(bData.counts),
          avgDuration: calculateAverageInternal(bData.durations),
        })
      ),
    }))
}

function groupByMonthInternal(sessions: SessionWithLogs[]): MonthlyAverage[] {
  const monthMap = new Map<
    string,
    {
      monthStart: Date
      behaviors: Map<
        number,
        { name: string; counts: number[]; durations: number[] }
      >
    }
  >()

  sessions.forEach((session) => {
    const sessionDate = new Date(session.startedAt)
    const monthKey = getMonthKeyInternal(sessionDate)

    if (!monthMap.has(monthKey)) {
      const monthStart = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        1
      )
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
      behaviors: Array.from(data.behaviors.entries()).map(
        ([behaviorId, bData]) => ({
          behaviorId,
          name: bData.name,
          avgCount: calculateAverageInternal(bData.counts),
          avgDuration: calculateAverageInternal(bData.durations),
        })
      ),
    }))
}
