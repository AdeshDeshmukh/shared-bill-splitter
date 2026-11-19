import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { api } from '../api/client'
import { BalancesPanel } from '../components/BalancesPanel'
import { BillList } from '../components/BillList'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const C = {
  bg: '#fbf9f6',
  card: '#ffffff',
  bgSubtle: '#faf7f3',
  border: '#e8e2d8',
  borderInput: '#ded6ca',
  accent: '#e11d48',
  accentSoft: 'rgba(225, 29, 72, 0.08)',
  textPrimary: '#1c1917',
  textMuted: '#78716c',
  green: '#059669',
  greenBg: 'rgba(5, 150, 105, 0.08)',
  red: '#dc2626',
}

function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: C.textMuted,
        margin: '0 0 16px 0',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </h2>
  )
}

function HomePage() {
  const [homeId, setHomeId] = useState<string>('')
  const [inputHomeId, setInputHomeId] = useState<string>('')
  const [billTitle, setBillTitle] = useState('')
  const [billTotalCents, setBillTotalCents] = useState('')
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Fetch balances for name lookup map and summary metrics
  const { data: balanceData } = useQuery({
    queryKey: ['balances', homeId],
    queryFn: () => api.getBalances(homeId),
    enabled: Boolean(homeId),
  })

  const { data: billData } = useQuery({
    queryKey: ['bills', homeId],
    queryFn: () => api.getBills(homeId),
    enabled: Boolean(homeId),
  })

  const memberMap = balanceData?.balances.reduce<Record<string, string>>((acc, b) => {
    acc[b.memberId] = b.name
    return acc
  }, {})

  // Compute top-level metrics
  const totalBills = billData?.bills.length ?? 0
  const totalCents = billData?.bills.reduce((s, b) => s + b.totalCents, 0) ?? 0
  const paidShares = billData?.bills.flatMap((b) => b.shares).filter((s) => s.paidAt).length ?? 0
  const totalShares = billData?.bills.flatMap((b) => b.shares).length ?? 0

  async function handleCreateDemoHome() {
    setIsCreatingDemo(true)
    setCreateError(null)
    try {
      // 1. Create a home
      const home = await api.createHome('Sunrise Apartment 4B')
      // 2. Add 3 members
      await api.createMember(home.id, 'Asha')
      await api.createMember(home.id, 'Ben')
      await api.createMember(home.id, 'Chitra')
      // 3. Create a starter bill
      await api.createBill(home.id, 'Electricity & Internet', 3000)
      await api.createBill(home.id, 'Groceries & Supplies', 1000)

      setHomeId(home.id)
      setInputHomeId(home.id)
    } catch (err) {
      setCreateError((err as Error).message)
    } finally {
      setIsCreatingDemo(false)
    }
  }

  async function handleAddBill(e: React.FormEvent) {
    e.preventDefault()
    if (!homeId || !billTitle.trim() || !billTotalCents) return
    setCreateError(null)
    try {
      const cents = Math.round(Number(billTotalCents))
      await api.createBill(homeId, billTitle.trim(), cents)
      setBillTitle('')
      setBillTotalCents('')
      // Force refresh of balances and bills
      window.location.reload()
    } catch (err) {
      setCreateError((err as Error).message)
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: '1 1 200px',
    padding: '10px 14px',
    borderRadius: 8,
    border: `1px solid ${C.borderInput}`,
    background: '#ffffff',
    color: C.textPrimary,
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: C.textPrimary,
      }}
    >
      {/* Top nav bar */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: '#ffffff',
          padding: '0 32px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.accent,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: '#ffffff',
            }}
          >
            ✦
          </span>
          <span style={{ fontWeight: 700, fontSize: 17, color: C.textPrimary }}>
            Shared Bill Splitter
          </span>
        </div>
        {homeId && (
          <span
            style={{
              fontSize: 12,
              color: C.accent,
              background: C.accentSoft,
              padding: '4px 10px',
              borderRadius: 6,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            HOME: {homeId.slice(0, 8)}…
          </span>
        )}
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px' }}>
        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 6px 0', color: C.textPrimary }}>
            Household <span style={{ color: C.accent }}>Expenses</span>
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
            Integer-cent splits · Atomic payments · Idempotency-safe settlement
          </p>
        </div>

        {/* Home selector */}
        <SectionCard style={{ marginBottom: 24 }}>
          <SectionHeading>Active Household</SectionHeading>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              id="home-id-input"
              type="text"
              value={inputHomeId}
              onChange={(e) => setInputHomeId(e.target.value)}
              placeholder="Paste or enter a home ID"
              style={{ ...inputStyle, flex: '1 1 280px' }}
            />
            <button
              type="button"
              onClick={() => setHomeId(inputHomeId.trim())}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: `1px solid ${C.borderInput}`,
                background: '#ffffff',
                color: C.textPrimary,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              LOAD HOME
            </button>
            <button
              type="button"
              onClick={handleCreateDemoHome}
              disabled={isCreatingDemo}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: isCreatingDemo ? '#e8e2d8' : C.accent,
                color: isCreatingDemo ? C.textMuted : '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: isCreatingDemo ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: isCreatingDemo ? 'none' : '0 2px 4px rgba(225, 29, 72, 0.25)',
              }}
            >
              {isCreatingDemo ? 'CREATING…' : '✦ SEED DEMO HOME'}
            </button>
          </div>
          {createError && (
            <div style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{createError}</div>
          )}
        </SectionCard>

        {homeId ? (
          <>
            {/* Summary metric cards */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'TOTAL BILLS', value: totalBills, color: C.textPrimary },
                {
                  label: 'TOTAL VALUE',
                  value: new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(totalCents / 100),
                  color: C.accent,
                },
                {
                  label: 'SHARES SETTLED',
                  value: `${paidShares} / ${totalShares}`,
                  color: paidShares === totalShares && totalShares > 0 ? C.green : C.textPrimary,
                },
                {
                  label: 'MEMBERS',
                  value: balanceData?.balances.length ?? '—',
                  color: C.textPrimary,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    flex: '1 1 140px',
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      marginBottom: 8,
                    }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Balances */}
            <SectionCard style={{ marginBottom: 24 }}>
              <SectionHeading>Member Balances</SectionHeading>
              <BalancesPanel homeId={homeId} />
            </SectionCard>

            {/* Add bill form */}
            <SectionCard style={{ marginBottom: 24 }}>
              <SectionHeading>Add New Bill</SectionHeading>
              <form onSubmit={handleAddBill} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Bill title (e.g. Wi-Fi Bill)"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  required
                  style={{ ...inputStyle, flex: '2 1 200px' }}
                />
                <input
                  type="number"
                  placeholder="Total cents (e.g. 3000)"
                  value={billTotalCents}
                  onChange={(e) => setBillTotalCents(e.target.value)}
                  min="1"
                  step="1"
                  required
                  style={{ ...inputStyle, flex: '1 1 140px' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.accent,
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    boxShadow: '0 2px 4px rgba(225, 29, 72, 0.25)',
                  }}
                >
                  SPLIT & ADD
                </button>
              </form>
            </SectionCard>

            {/* Bills list */}
            <div>
              <SectionHeading>Bills & Shares</SectionHeading>
              <BillList homeId={homeId} memberMap={memberMap} />
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              borderRadius: 12,
              border: `1px dashed ${C.border}`,
              background: C.card,
              color: C.textMuted,
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 16 }}>✦</div>
            <p
              style={{
                fontSize: 17,
                margin: '0 0 10px 0',
                color: C.textPrimary,
                fontWeight: 700,
              }}
            >
              No household loaded yet
            </p>
            <p style={{ fontSize: 14, margin: 0, color: C.textMuted }}>
              Enter an existing Home ID above, or click{' '}
              <strong style={{ color: C.accent }}>✦ SEED DEMO HOME</strong> to auto-populate sample
              bills and members.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
