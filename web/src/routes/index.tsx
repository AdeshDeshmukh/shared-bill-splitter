import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { api } from '../api/client'
import { BalancesPanel } from '../components/BalancesPanel'
import { BillList } from '../components/BillList'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [homeId, setHomeId] = useState<string>('')
  const [inputHomeId, setInputHomeId] = useState<string>('')
  const [billTitle, setBillTitle] = useState('')
  const [billTotalCents, setBillTotalCents] = useState('')
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Fetch balances for name lookup map
  const { data: balanceData } = useQuery({
    queryKey: ['balances', homeId],
    queryFn: () => api.getBalances(homeId),
    enabled: Boolean(homeId),
  })

  const memberMap = balanceData?.balances.reduce<Record<string, string>>((acc, b) => {
    acc[b.memberId] = b.name
    return acc
  }, {})

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

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#111827',
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Shared Bill Splitter</h1>
        <p style={{ color: '#4b5563', fontSize: 15, margin: 0 }}>
          Manage shared household expenses, calculate integer-cent remainder splits, and settle
          member shares with idempotency guarantees.
        </p>
      </header>

      {/* Home Selector Card */}
      <section
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          marginBottom: 32,
        }}
      >
        <label
          htmlFor="home-id-input"
          style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}
        >
          Active Home ID
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            id="home-id-input"
            type="text"
            value={inputHomeId}
            onChange={(e) => setInputHomeId(e.target.value)}
            placeholder="Paste or enter a home ID"
            style={{
              flex: '1 1 280px',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={() => setHomeId(inputHomeId.trim())}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #2563eb',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Load Home
          </button>
          <button
            type="button"
            onClick={handleCreateDemoHome}
            disabled={isCreatingDemo}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#374151',
              fontSize: 14,
              fontWeight: 500,
              cursor: isCreatingDemo ? 'not-allowed' : 'pointer',
            }}
          >
            {isCreatingDemo ? 'Creating…' : 'Seed Demo Home'}
          </button>
        </div>

        {createError && (
          <div style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{createError}</div>
        )}
      </section>

      {homeId ? (
        <>
          {/* Outstanding Balances Section */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              Outstanding Balances
            </h2>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 20,
              }}
            >
              <BalancesPanel homeId={homeId} />
            </div>
          </section>

          {/* Create New Bill Form */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Add a New Bill</h2>
            <form
              onSubmit={handleAddBill}
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                background: '#f9fafb',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
              }}
            >
              <input
                type="text"
                placeholder="Bill Title (e.g. Wi-Fi Bill)"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                required
                style={{
                  flex: '2 1 200px',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                }}
              />
              <input
                type="number"
                placeholder="Total Cents (e.g. 3000)"
                value={billTotalCents}
                onChange={(e) => setBillTotalCents(e.target.value)}
                min="1"
                step="1"
                required
                style={{
                  flex: '1 1 140px',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #059669',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Split & Add Bill
              </button>
            </form>
          </section>

          {/* Bills List Section */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Bills & Shares</h2>
            <BillList homeId={homeId} memberMap={memberMap} />
          </section>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px dashed #d1d5db',
            color: '#6b7280',
          }}
        >
          <p style={{ fontSize: 16, margin: '0 0 12px 0' }}>No home loaded yet.</p>
          <p style={{ fontSize: 14, margin: 0 }}>
            Enter an existing Home ID above or click <strong>Seed Demo Home</strong> to
            automatically populate sample data and explore bill settlement.
          </p>
        </div>
      )}
    </div>
  )
}
