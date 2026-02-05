'use server'

import { ROUTES } from '@/constants/routes'
import { db } from '@/db'
import { behaviors } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getPatientBehaviors(patientId: number) {
  try {
    const patientBehaviors = await db.query.behaviors.findMany({
      where: and(eq(behaviors.patientId, patientId)),
      orderBy: (behaviors, { asc }) => [asc(behaviors.name)],
    })

    return { success: true, data: patientBehaviors }
  } catch (error) {
    console.error('Error fetching behaviors:', error)
    return { success: false, error: 'Failed to fetch behaviors' }
  }
}

export async function createBehavior(
  patientId: number,
  name: string,
  tracksFrequency: boolean = true,
  tracksDuration: boolean = true,
  behaviorType: 'adaptive' | 'maladaptive' = 'maladaptive'
) {
  try {
    const newBehavior = await db
      .insert(behaviors)
      .values({
        patientId,
        name,
        tracksFrequency,
        tracksDuration,
        behaviorType,
      })
      .returning()

    revalidatePath(
      ROUTES.PATIENT_BEHAVIORS.replace(':patientId', patientId.toString())
    )
    return { success: true, data: newBehavior[0] }
  } catch (error) {
    console.error('Error creating behavior:', error)
    return { success: false, error: 'Failed to create behavior' }
  }
}

export async function updateBehavior(
  behaviorId: number,
  data: {
    name?: string
    isActive?: boolean
    tracksFrequency?: boolean
    tracksDuration?: boolean
    behaviorType?: 'adaptive' | 'maladaptive'
  }
) {
  try {
    const updated = await db
      .update(behaviors)
      .set(data)
      .where(eq(behaviors.id, behaviorId))
      .returning()

    if (updated.length === 0) {
      return { success: false, error: 'Behavior not found' }
    }

    revalidatePath(ROUTES.PATIENTS)
    return { success: true, data: updated[0] }
  } catch (error) {
    console.error('Error updating behavior:', error)
    return { success: false, error: 'Failed to update behavior' }
  }
}

export async function deleteBehavior(behaviorId: number) {
  try {
    await db.delete(behaviors).where(eq(behaviors.id, behaviorId))

    revalidatePath(ROUTES.PATIENTS)
    return { success: true }
  } catch (error) {
    console.error('Error deleting behavior:', error)
    return { success: false, error: 'Failed to delete behavior' }
  }
}
