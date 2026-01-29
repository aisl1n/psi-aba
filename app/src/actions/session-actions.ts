'use server'

import { db } from '@/db'
import { sessions, sessionLogs, behaviors } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { PreSessionData } from '@/app/types'

// 1. Iniciar uma nova sessão
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

    // Retorna o ID para o front saber qual sessão está ativa
    return { success: true, sessionId: newSession[0].id }
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error)
    return { success: false, error: 'Falha ao criar sessão' }
  }
}

// 2. Registrar um Comportamento (O "One-tap")
// Now handles both frequency and duration simultaneously
export async function logBehaviorAction(
  sessionId: number,
  behaviorId: number,
  count: number = 0, // Frequency count (typically 1 per tap)
  duration: number = 0 // Duration in seconds
) {
  try {
    const logData = {
      sessionId,
      behaviorId,
      count,
      duration,
    }

    await db.insert(sessionLogs).values(logData)

    // Revalida a página para atualizar contadores se necessário,
    // embora usaremos Optimistic UI no front para ser instantâneo.
    revalidatePath(`/session/${sessionId}`)

    return { success: true }
  } catch (error) {
    console.error('Erro ao registrar log:', error)
    return { success: false, error: 'Falha ao salvar registro' }
  }
}

// 3. Finalizar a sessão
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

// 4. Buscar dados iniciais (Para carregar a tela de sessão)
export async function getSessionData(sessionId: number) {
  try {
    // Buscamos a sessão e os comportamentos configurados para aquele paciente
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

// 5. Get session summary for charts
export async function getSessionSummary(sessionId: number) {
  try {
    const logs = await db.query.sessionLogs.findMany({
      where: eq(sessionLogs.sessionId, sessionId),
      with: {
        behavior: true,
      },
      orderBy: (sessionLogs, { asc }) => [asc(sessionLogs.timestamp)],
    })

    // Aggregate data by behavior
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

// 6. Get post-session data for summary page
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

    // Aggregate stats by behavior
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
      // Only add duration to the array if it's greater than 0
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
