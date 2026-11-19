import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

type Props = { homeId: string }

const C = {
  bg: '#fbf9f6',
  card: '#ffffff',
  bgSubtle: '#faf7f3',
  border: '#e8e2d8',
  accent: '#e11d48',
  accentSoft: 'rgba(225, 29, 72, 0.08)',
  textPrimary: '#1c1917',
  textMuted: '#78716c',
  green: '#059669',
  greenBg: 'rgba(5, 150, 105, 0.08)',
  red: '#dc2626',
  redBg: 'rgba(220, 38, 38, 0.08)',
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
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: C.accentSoft,
        color: C.accent,
        fontSize: 12,
        fontWeight: 700,
        marginRight: 12,
        flexShrink: 0,
        border: '1px solid rgba(225, 29, 72, 0.2)',
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
          background: C.redBg,
          border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: 8,
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
            color: C.textPrimary,
          },
          {
            label: 'TOTAL OUTSTANDING',
            value: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalOwed / 100),
            color: totalOwed > 0 ? C.accent : C.green,
          },
          {
            label: 'FULLY SETTLED',
            value: `${settled} / ${data.balances.length}`,
            color: C.green,
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              flex: '1 1 100px',
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: C.textMuted,
                fontWeight: 700,
                letterSpacing: '0.06em',
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
          const isSettled = b.outstandingCents === 0
          return (
            <div
              key={b.memberId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 8,
                background: isSettled ? C.greenBg : C.bgSubtle,
                border: `1px solid ${isSettled ? 'rgba(5, 150, 105, 0.2)' : C.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar name={b.name} />
                <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
                  {b.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isSettled && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.green,
                      background: '#ffffff',
                      border: '1px solid rgba(5, 150, 105, 0.25)',
                      padding: '2px 8px',
                      borderRadius: 9999,
                      letterSpacing: '0.04em',
                    }}
                  >
                    ALL CLEAR
                  </span>
                )}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: b.outstandingCents > 0 ? C.accent : C.green,
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
