const BASE = ''

export type Share = {
  id: string
  memberId: string
  amountCents: number
  paidAt: string | null
}

export type Bill = {
  id: string
  homeId: string
  title: string
  totalCents: number
  shares: Share[]
}

export type Balance = {
  memberId: string
  name: string
  outstandingCents: number
}

export type Home = {
  id: string
  name: string
}

export type Member = {
  id: string
  homeId: string
  name: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'unknown error' }))
    throw new Error((body as { error: string }).error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  createHome: (name: string) =>
    request<Home>('/api/homes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  createMember: (homeId: string, name: string) =>
    request<Member>(`/api/homes/${homeId}/members`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  createBill: (homeId: string, title: string, totalCents: number) =>
    request<Bill>(`/api/homes/${homeId}/bills`, {
      method: 'POST',
      body: JSON.stringify({ title, totalCents }),
    }),

  getBills: (homeId: string) => request<{ bills: Bill[] }>(`/api/homes/${homeId}/bills`),

  getBalances: (homeId: string) =>
    request<{ balances: Balance[] }>(`/api/homes/${homeId}/balances`),

  payShare: (billId: string, shareId: string, idempotencyKey: string) =>
    request<Share>(`/api/bills/${billId}/shares/${shareId}/pay`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
}
