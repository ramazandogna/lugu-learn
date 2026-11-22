/**
 * PGlite harness: a Supabase-compatible stub (auth schema, auth.uid()/auth.jwt(), the anon /
 * authenticated / service_role roles), every migration applied in order, and helpers that run
 * statements as a given user the way PostgREST does (role + request.jwt.claims, per transaction).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite, type Transaction } from '@electric-sql/pglite'

const root = fileURLToPath(new URL('../..', import.meta.url))
export const migrationsDir = join(root, 'supabase/migrations')
export const seedPath = join(root, 'supabase/seed.sql')

const SUPABASE_STUB = /* sql */ `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    encrypted_password text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    raw_app_meta_data jsonb not null default '{}'::jsonb,
    banned_until timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
  $$;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(auth.jwt() ->> 'sub', '')::uuid
  $$;
  create function auth.role() returns text language sql stable as $$
    select auth.jwt() ->> 'role'
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;
`

/** RPC arguments declared `jsonb`: always sent JSON-encoded, so a string response stays a JSON string. */
const JSONB_ARGS = new Set(['response', 'answers', 'state', 'data'])

export function migrationFiles(): string[] {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
}

export type Db = PGlite
export type Tx = Transaction

export interface Harness {
  db: Db
  /** Runs `fn` in one transaction as the given user (null = anon). Commits on success, rolls back on throw. */
  as<T>(userId: string | null, fn: (tx: Tx) => Promise<T>): Promise<T>
  /** Calls `lugu.<name>(named args)` as the user and returns the single result value. */
  rpc<T = unknown>(userId: string | null, name: string, args?: Record<string, unknown>): Promise<T>
  /** Calls a set-returning `lugu.<name>` and returns its rows. */
  rpcRows<T = unknown>(userId: string | null, name: string, args?: Record<string, unknown>): Promise<T[]>
  createAdmin(): Promise<string>
  createStudent(opts?: { status?: 'active' | 'paused' | 'disabled' }): Promise<{ id: string; code: string }>
}

export async function createHarness(opts: { seed?: boolean } = {}): Promise<Harness> {
  const db = new PGlite()
  await db.exec(SUPABASE_STUB)
  for (const file of migrationFiles()) {
    try {
      await db.exec(readFileSync(join(migrationsDir, file), 'utf8'))
    } catch (e) {
      throw new Error(`migration ${file} failed: ${(e as Error).message}`)
    }
  }
  if (opts.seed) await db.exec(readFileSync(seedPath, 'utf8'))

  const as = <T>(userId: string | null, fn: (tx: Tx) => Promise<T>): Promise<T> =>
    db.transaction(async (tx) => {
      const role = userId ? 'authenticated' : 'anon'
      await tx.exec(`set local role ${role}`)
      const claims = userId ? { sub: userId, role } : { role }
      await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)])
      return fn(tx)
    })

  const call = async (userId: string | null, name: string, args: Record<string, unknown>) => {
    if (!/^[a-z_]+$/.test(name)) throw new Error(`bad rpc name ${name}`)
    const keys = Object.keys(args)
    keys.forEach((k) => {
      if (!/^[a-z_]+$/.test(k)) throw new Error(`bad arg name ${k}`)
    })
    const params = keys.map((k, i) => `${k} => $${i + 1}`).join(', ')
    const values = keys.map((k) => {
      const v = args[k]
      return JSONB_ARGS.has(k) || (v !== null && typeof v === 'object') ? JSON.stringify(v) : v
    })
    return as(userId, (tx) => tx.query<Record<string, unknown>>(`select * from lugu.${name}(${params})`, values))
  }

  // Like PostgREST: a scalar result comes back as the value, a composite one as the row object.
  const rpc = async <T>(userId: string | null, name: string, args: Record<string, unknown> = {}): Promise<T> => {
    const res = await call(userId, name, args)
    const scalar = res.fields.length === 1 && res.fields[0]!.name === name
    return (scalar ? res.rows[0]?.[name] : res.rows[0]) as T
  }

  const rpcRows = async <T>(userId: string | null, name: string, args: Record<string, unknown> = {}): Promise<T[]> =>
    (await call(userId, name, args)).rows as T[]

  const createUser = async (email: string): Promise<string> => {
    const res = await db.query<{ id: string }>(`insert into auth.users (email) values ($1) returning id`, [email])
    return res.rows[0]!.id
  }

  const createAdmin = async (): Promise<string> => {
    const id = await createUser(`admin-${crypto.randomUUID()}@example.test`)
    await db.query(`insert into lugu.profiles (user_id, role) values ($1, 'admin')`, [id])
    return id
  }

  const createStudent = async (o: { status?: 'active' | 'paused' | 'disabled' } = {}) => {
    const code = (await db.query<{ code: string }>(`select lugu.next_student_code() as code`)).rows[0]!.code
    const id = await createUser(`${code.toLowerCase()}@students.lugu.invalid`)
    await db.query(`insert into lugu.profiles (user_id, role, status, must_change_password) values ($1, 'student', $2, true)`, [
      id,
      o.status ?? 'active',
    ])
    await db.query(`insert into lugu.student_profiles (user_id, student_code) values ($1, $2)`, [id, code])
    return { id, code }
  }

  return { db, as, rpc, rpcRows, createAdmin, createStudent }
}

/** Resolves to the Postgres error message (our stable LUGU_* codes) or throws if the promise succeeded. */
export async function errorOf(p: Promise<unknown>): Promise<string> {
  try {
    await p
  } catch (e) {
    return (e as Error).message
  }
  throw new Error('expected an error, but the call succeeded')
}
