'use server'

import { db } from '@/db'
import { sessions, sessionLogs, behaviors } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { PreSessionData } from '@/app/types'

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
