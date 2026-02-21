'use server'

import { ROUTES } from '@/constants/routes'
import { db } from '@/db'
import { patients } from '@/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getPatients() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const allPatients = await db.query.patients.findMany({
      where: eq(patients.userId, user.id),
      orderBy: (patients, { desc }) => [desc(patients.createdAt)],
    })
    return { success: true, data: allPatients }
  } catch (error) {
    console.error('Error fetching patients:', error)
    return { success: false, error: 'Failed to fetch patients' }
  }
}

export async function createPatient(name: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const newPatient = await db
      .insert(patients)
      .values({
        name,
        userId: user.id,
      })
      .returning()

    revalidatePath(ROUTES.PATIENTS)
    return { success: true, data: newPatient[0] }
  } catch (error) {
    console.error('Error creating patient:', error)
    return { success: false, error: 'Failed to create patient' }
  }
}

export async function getPatient(patientId: number) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const patient = await db.query.patients.findFirst({
      where: (patients, { eq, and }) =>
        and(eq(patients.id, patientId), eq(patients.userId, user.id)),
      with: {
        behaviors: true,
        sessions: {
          orderBy: (sessions, { desc }) => [desc(sessions.startedAt)],
          limit: 10,
        },
      },
    })

    if (!patient) {
      return { success: false, error: 'Patient not found' }
    }

    return { success: true, data: patient }
  } catch (error) {
    console.error('Error fetching patient:', error)
    return { success: false, error: 'Failed to fetch patient' }
  }
}
