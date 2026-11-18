export type Home = {
  id: string
  name: string
}

export type Member = {
  id: string
  homeId: string
  name: string
}

export type Bill = {
  id: string
  homeId: string
  title: string
  totalCents: number
}

export type Share = {
  id: string
  billId: string
  memberId: string
  amountCents: number
  paidAt: string | null
}

export type BillWithShares = Bill & {
  shares: Share[]
}

export type Balance = {
  memberId: string
  name: string
  outstandingCents: number
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

// ─── Bills ───────────────────────────────────────────────────────────────────

export async function createBill(
  db: D1Database,
  homeId: string,
  title: string,
  totalCents: number,
): Promise<Bill> {
  const row = await db
    .prepare(
      'INSERT INTO bills (home_id, title, total_cents) VALUES (?, ?, ?) RETURNING id, home_id, title, total_cents',
    )
    .bind(homeId, title, totalCents)
    .first<{
      id: string
      home_id: string
      title: string
      total_cents: number
    }>()

  if (!row) throw new Error('Failed to insert bill')
  return {
    id: row.id,
    homeId: row.home_id,
    title: row.title,
    totalCents: row.total_cents,
  }
}

export async function createShares(
  db: D1Database,
  billId: string,
  memberIds: string[],
  amounts: number[],
): Promise<Share[]> {
  const statements = memberIds.map((memberId, i) =>
    db
      .prepare(
        'INSERT INTO shares (bill_id, member_id, amount_cents) VALUES (?, ?, ?) RETURNING id, bill_id, member_id, amount_cents, paid_at',
      )
      .bind(billId, memberId, amounts[i]),
  )

  const results = await db.batch<{
    id: string
    bill_id: string
    member_id: string
    amount_cents: number
    paid_at: string | null
  }>(statements)

  return results.flatMap((r) =>
    r.results.map(
      (row: {
        id: string
        bill_id: string
        member_id: string
        amount_cents: number
        paid_at: string | null
      }) => ({
        id: row.id,
        billId: row.bill_id,
        memberId: row.member_id,
        amountCents: row.amount_cents,
        paidAt: row.paid_at,
      }),
    ),
  )
}

export async function getBillsWithShares(
  db: D1Database,
  homeId: string,
): Promise<BillWithShares[]> {
  const { results: billRows } = await db
    .prepare(
      'SELECT id, home_id, title, total_cents FROM bills WHERE home_id = ? ORDER BY rowid ASC',
    )
    .bind(homeId)
    .all<{ id: string; home_id: string; title: string; total_cents: number }>()

  if (billRows.length === 0) return []

  const billIds = billRows.map((b: { id: string }) => b.id)
  const placeholders = billIds.map(() => '?').join(', ')

  const { results: shareRows } = await db
    .prepare(
      `SELECT id, bill_id, member_id, amount_cents, paid_at FROM shares WHERE bill_id IN (${placeholders}) ORDER BY rowid ASC`,
    )
    .bind(...billIds)
    .all<{
      id: string
      bill_id: string
      member_id: string
      amount_cents: number
      paid_at: string | null
    }>()

  const sharesByBill = new Map<string, Share[]>()
  for (const row of shareRows) {
    const share: Share = {
      id: row.id,
      billId: row.bill_id,
      memberId: row.member_id,
      amountCents: row.amount_cents,
      paidAt: row.paid_at,
    }
    const list = sharesByBill.get(row.bill_id) ?? []
    list.push(share)
    sharesByBill.set(row.bill_id, list)
  }

  return billRows.map((b: { id: string; home_id: string; title: string; total_cents: number }) => ({
    id: b.id,
    homeId: b.home_id,
    title: b.title,
    totalCents: b.total_cents,
    shares: sharesByBill.get(b.id) ?? [],
  }))
}

export async function getBalances(db: D1Database, homeId: string): Promise<Balance[]> {
  const { results } = await db
    .prepare(
      `
      SELECT
        m.id        AS member_id,
        m.name      AS name,
        COALESCE(SUM(CASE WHEN s.paid_at IS NULL AND b.id IS NOT NULL THEN s.amount_cents ELSE 0 END), 0) AS outstanding_cents
      FROM members m
      LEFT JOIN shares s ON s.member_id = m.id
      LEFT JOIN bills  b ON b.id = s.bill_id AND b.home_id = m.home_id
      WHERE m.home_id = ?
      GROUP BY m.id, m.name
      ORDER BY m.joined_at ASC, m.rowid ASC
      `,
    )
    .bind(homeId)
    .all<{
      member_id: string
      name: string
      outstanding_cents: number
    }>()

  return results.map((r: { member_id: string; name: string; outstanding_cents: number }) => ({
    memberId: r.member_id,
    name: r.name,
    outstandingCents: r.outstanding_cents,
  }))
}
