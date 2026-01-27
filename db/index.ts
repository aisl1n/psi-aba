import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

/**
 * Use a global singleton in development to avoid creating new connections on
 * every Next.js hot reload. Each reload would otherwise open a new connection
 * while old ones linger (TCP timeout ~5–10 min), exhausting Supabase's pool.
 */
const globalForDb = globalThis as unknown as { conn: ReturnType<typeof postgres> | undefined }

// Supabase pooler (host contains "pooler", e.g. port 6543) requires prepare: false
const isPooler = process.env.DATABASE_URL.includes('pooler')
const client =
  globalForDb.conn ??
  postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    prepare: !isPooler,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = client
}

export const db = drizzle(client, { schema })
