'use server'

import { db } from '@/db'
import { patients } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getPatients() {
  try {
    const allPatients = await db.query.patients.findMany({
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
    const newPatient = await db
      .insert(patients)
      .values({
        name,
      })
      .returning()

    revalidatePath('/patients')
    return { success: true, data: newPatient[0] }
  } catch (error) {
    console.error('Error creating patient:', error)
    return { success: false, error: 'Failed to create patient' }
  }
}

export async function getPatient(patientId: number) {
  try {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId),
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
