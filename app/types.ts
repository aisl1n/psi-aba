import { patients } from '@/db/schema'

export type Patient = typeof patients.$inferSelect
