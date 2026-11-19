import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

type Props = { homeId: string }

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

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: C.accent,
        color: '#1c0a00',
        fontSize: 12,
        fontWeight: 700,
        marginRight: 10,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}

export function BalancesPanel({ homeId }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['balances', homeId],
    queryFn: () => api.getBalances(homeId),
    enabled: Boolean(homeId),
  })

  if (isLoading) {
    return <p style={{ color: C.textMuted, fontSize: 14 }}>Loading balances…</p>
  }

  if (isError) {
    return (
      <div
        style={{
          padding: 12,
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 6,
          color: C.red,
          fontSize: 14,
        }}
      >
        Failed to load balances: {(error as Error).message}
      </div>
    )
  }

  if (!data || data.balances.length === 0) {
    return <p style={{ color: C.textMuted, fontSize: 14 }}>No members enrolled in this home yet.</p>
  }

  const totalOwed = data.balances.reduce((s, b) => s + b.outstandingCents, 0)
  const settled = data.balances.filter((b) => b.outstandingCents === 0).length

  return (
    <div>
      {/* Summary row */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {[
          {
            label: 'MEMBERS',
            value: data.balances.length,
            color: C.accent,
          },
          {
            label: 'TOTAL OWED',
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              totalOwed / 100,
            ),
            color: totalOwed > 0 ? C.red : C.green,
          },
          {
            label: 'SETTLED',
            value: `${settled} / ${data.balances.length}`,
            color: C.green,
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              flex: '1 1 100px',
              background: C.bg2,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: C.textMuted,
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: 6,
              }}
            >
              {m.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Member rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.balances.map((b) => {
          const settled = b.outstandingCents === 0
          return (
            <div
              key={b.memberId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 8,
                background: settled ? 'rgba(74,222,128,0.05)' : C.bg2,
                border: `1px solid ${settled ? 'rgba(74,222,128,0.2)' : C.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar name={b.name} />
                <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                  {b.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {settled && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.green,
                      background: 'rgba(74,222,128,0.12)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      letterSpacing: '0.06em',
                    }}
                  >
                    ALL CLEAR
                  </span>
                )}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: b.outstandingCents > 0 ? C.red : C.green,
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(b.outstandingCents / 100)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
