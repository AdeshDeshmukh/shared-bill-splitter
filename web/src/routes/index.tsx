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
  bg: '#1c0a00',
  bg2: '#2a1200',
  border: '#3d1f00',
  accent: '#f97316',
  textPrimary: '#f5e6d8',
  textMuted: '#a07850',
  green: '#4ade80',
  red: '#f87171',
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
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 20,
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
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
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
    padding: '9px 13px',
    borderRadius: 6,
    border: `1px solid ${C.border}`,
    background: C.bg,
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
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: C.accent,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
            }}
          >
            ⚡
          </span>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
            Shared Bill Splitter
          </span>
        </div>
        {homeId && (
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'monospace' }}>
            HOME {homeId.slice(0, 8)}…
          </span>
        )}
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: '0 0 6px 0', color: C.textPrimary }}>
            Expense <span style={{ color: C.accent }}>Dashboard</span>
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
            Integer-cent splits · Atomic payments · Idempotency-safe settlement
          </p>
        </div>

        {/* Home selector */}
        <SectionCard style={{ marginBottom: 24 }}>
          <SectionHeading>Active Home</SectionHeading>
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
                padding: '9px 18px',
                borderRadius: 6,
                border: `1px solid ${C.accent}`,
                background: 'transparent',
                color: C.accent,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              LOAD HOME
            </button>
            <button
              type="button"
              onClick={handleCreateDemoHome}
              disabled={isCreatingDemo}
              style={{
                padding: '9px 18px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: isCreatingDemo ? C.border : C.accent,
                color: isCreatingDemo ? C.textMuted : '#1c0a00',
                fontSize: 13,
                fontWeight: 700,
                cursor: isCreatingDemo ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              {isCreatingDemo ? 'CREATING…' : '⚡ SEED DEMO HOME'}
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
                { label: 'TOTAL BILLS', value: totalBills, color: C.accent },
                {
                  label: 'TOTAL VALUE',
                  value: new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(totalCents / 100),
                  color: C.textPrimary,
                },
                {
                  label: 'SHARES SETTLED',
                  value: `${paidShares} / ${totalShares}`,
                  color: paidShares === totalShares && totalShares > 0 ? C.green : C.accent,
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
                    background: C.bg2,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: '16px 20px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.textMuted,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}
                  >
                    {m.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.value}</div>
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
                    padding: '9px 20px',
                    borderRadius: 6,
                    border: 'none',
                    background: C.accent,
                    color: '#1c0a00',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
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
              borderRadius: 10,
              border: `1px dashed ${C.border}`,
              color: C.textMuted,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <p
              style={{
                fontSize: 16,
                margin: '0 0 10px 0',
                color: C.textPrimary,
                fontWeight: 600,
              }}
            >
              No home loaded yet
            </p>
            <p style={{ fontSize: 14, margin: 0, color: C.textMuted }}>
              Enter an existing Home ID above, or click{' '}
              <strong style={{ color: C.accent }}>⚡ SEED DEMO HOME</strong> to auto-populate sample
              data.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
