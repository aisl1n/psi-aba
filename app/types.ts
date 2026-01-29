import { behaviors, patients, sessions } from '@/db/schema'

export type Patient = typeof patients.$inferSelect
export type Behavior = typeof behaviors.$inferSelect
export type Session = typeof sessions.$inferSelect

// Behavior type
export type BehaviorType = 'adaptive' | 'maladaptive'

// Pre-session data
export interface PreSessionData {
  sleepHours: number
  hasEaten: boolean
  hasTakenMedication: boolean
  companion: 'father' | 'mother' | 'other'
  companionOther?: string
}
