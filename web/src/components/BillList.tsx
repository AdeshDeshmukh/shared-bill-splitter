import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { ShareRow } from './ShareRow'

type Props = {
  homeId: string
  memberMap?: Record<string, string>
}

const C = {
  card: '#ffffff',
  bgSubtle: '#faf7f3',
  border: '#e8e2d8',
  accent: '#e11d48',
  textPrimary: '#1c1917',
  textMuted: '#78716c',
  green: '#059669',
  greenBg: 'rgba(5, 150, 105, 0.08)',
  red: '#dc2626',
  redBg: 'rgba(220, 38, 38, 0.08)',
}

export function BillList({ homeId, memberMap }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bills', homeId],
    queryFn: () => api.getBills(homeId),
    enabled: Boolean(homeId),
  })

  if (isLoading) {
    return <p style={{ color: C.textMuted, fontSize: 14 }}>Loading bills…</p>
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
        Failed to load bills: {(error as Error).message}
      </div>
    )
  }

  if (!data || data.bills.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '36px 20px',
          borderRadius: 10,
          border: `1px dashed ${C.border}`,
          background: C.card,
          color: C.textMuted,
          fontSize: 14,
        }}
      >
        No bills created for this home yet. Add one above.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.bills.map((bill) => {
        const paidCount = bill.shares.filter((s) => s.paidAt).length
        const totalCount = bill.shares.length
        const pct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0
        const allPaid = paidCount === totalCount && totalCount > 0

        return (
          <div
            key={bill.id}
            style={{
              borderRadius: 12,
              border: `1px solid ${allPaid ? 'rgba(5, 150, 105, 0.25)' : C.border}`,
              background: C.card,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
              overflow: 'hidden',
            }}
          >
            {/* Bill header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '18px 20px 14px',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <strong style={{ fontSize: 16, color: C.textPrimary }}>{bill.title}</strong>
                  {allPaid && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.green,
                        background: C.greenBg,
                        border: '1px solid rgba(5, 150, 105, 0.25)',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        letterSpacing: '0.04em',
                      }}
                    >
                      FULLY SETTLED
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'monospace' }}>
                  ID: {bill.id.slice(0, 8)}…
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(bill.totalCents / 100)}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                  {paidCount} of {totalCount} settled
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: `1px solid ${C.border}`,
                background: C.bgSubtle,
              }}
            >
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: '#e8e2d8',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: allPaid ? C.green : C.accent,
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>Settlement progress</span>
                <span
                  style={{
                    fontSize: 11,
                    color: allPaid ? C.green : C.accent,
                    fontWeight: 700,
                  }}
                >
                  {pct}%
                </span>
              </div>
            </div>

            {/* Shares */}
            <div style={{ padding: '16px 20px 10px' }}>
              {bill.shares.map((share) => (
                <ShareRow
                  key={share.id}
                  homeId={homeId}
                  billId={bill.id}
                  share={share}
                  memberName={memberMap?.[share.memberId]}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
