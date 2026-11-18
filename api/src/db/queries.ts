export type Home = {
  id: string
  name: string
}

export type Member = {
  id: string
  homeId: string
  name: string
}

// ─── Homes ───────────────────────────────────────────────────────────────────

export async function createHome(db: D1Database, name: string): Promise<Home> {
  const row = await db
    .prepare('INSERT INTO homes (name) VALUES (?) RETURNING id, name')
    .bind(name)
    .first<{ id: string; name: string }>()

  if (!row) throw new Error('Failed to insert home')
  return { id: row.id, name: row.name }
}

export async function findHome(db: D1Database, homeId: string): Promise<Home | null> {
  const row = await db
    .prepare('SELECT id, name FROM homes WHERE id = ?')
    .bind(homeId)
    .first<{ id: string; name: string }>()

  return row ? { id: row.id, name: row.name } : null
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function createMember(db: D1Database, homeId: string, name: string): Promise<Member> {
  const row = await db
    .prepare('INSERT INTO members (home_id, name) VALUES (?, ?) RETURNING id, home_id, name')
    .bind(homeId, name)
    .first<{ id: string; home_id: string; name: string }>()

  if (!row) throw new Error('Failed to insert member')
  return { id: row.id, homeId: row.home_id, name: row.name }
}

export async function getMembersOrdered(db: D1Database, homeId: string): Promise<Member[]> {
  const { results } = await db
    .prepare(
      'SELECT id, home_id, name FROM members WHERE home_id = ? ORDER BY joined_at ASC, rowid ASC',
    )
    .bind(homeId)
    .all<{ id: string; home_id: string; name: string }>()

  return results.map((r: { id: string; home_id: string; name: string }) => ({
    id: r.id,
    homeId: r.home_id,
    name: r.name,
  }))
}
