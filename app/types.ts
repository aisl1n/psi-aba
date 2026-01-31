import { behaviors, patients, sessions } from '@/db/schema'

export type Patient = typeof patients.$inferSelect
export type Behavior = typeof behaviors.$inferSelect
export type Session = typeof sessions.$inferSelect

export type BehaviorType = 'adaptive' | 'maladaptive'

export interface PreSessionData {
  sleepHours: number
  hasEaten: boolean
  hasTakenMedication: boolean
  companion: 'father' | 'mother' | 'other'
  companionOther?: string
}

export interface ManualSessionData {
  startedAt: Date
  endedAt: Date
  sleepHours: number
  hasEaten: boolean
  hasTakenMedication: boolean
  companion: 'father' | 'mother' | 'other'
  companionOther?: string
}

export interface BehaviorLogInput {
  behaviorId: number
  count: number
  duration: number
  timestamp?: Date
}
