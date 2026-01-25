import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Patients table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Behaviors table
export const behaviors = pgTable('behaviors', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  tracksFrequency: boolean('tracks_frequency').default(true).notNull(),
  tracksDuration: boolean('tracks_duration').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Sessions table
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Session logs table
export const sessionLogs = pgTable('session_logs', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  behaviorId: integer('behavior_id')
    .references(() => behaviors.id, { onDelete: 'cascade' })
    .notNull(),
  count: integer('count').default(0).notNull(),
  duration: integer('duration').default(0).notNull(), // Duration in seconds
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  behaviors: many(behaviors),
  sessions: many(sessions),
}))

export const behaviorsRelations = relations(behaviors, ({ one, many }) => ({
  patient: one(patients, {
    fields: [behaviors.patientId],
    references: [patients.id],
  }),
  sessionLogs: many(sessionLogs),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  patient: one(patients, {
    fields: [sessions.patientId],
    references: [patients.id],
  }),
  sessionLogs: many(sessionLogs),
}))

export const sessionLogsRelations = relations(sessionLogs, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionLogs.sessionId],
    references: [sessions.id],
  }),
  behavior: one(behaviors, {
    fields: [sessionLogs.behaviorId],
    references: [behaviors.id],
  }),
}))
