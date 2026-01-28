import { behaviors, patients, sessions } from '@/db/schema'

export type Patient = typeof patients.$inferSelect
export type Behavior = typeof behaviors.$inferSelect
export type Session = typeof sessions.$inferSelect
