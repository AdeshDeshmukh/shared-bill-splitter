import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { ShareRow } from './ShareRow'

type Props = {
  homeId: string
  memberMap?: Record<string, string>
}

const C = {
  bg2: '#2a1200',
  border: '#3d1f00',
  accent: '#f97316',
  textPrimary: '#f5e6d8',
  textMuted: '#a07850',
  green: '#4ade80',
  red: '#f87171',
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
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 6,
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
          padding: '32px 20px',
          borderRadius: 8,
          border: `1px dashed ${C.border}`,
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
              borderRadius: 10,
              border: `1px solid ${allPaid ? 'rgba(74,222,128,0.25)' : C.border}`,
              background: C.bg2,
              overflow: 'hidden',
            }}
          >
            {/* Bill header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '16px 18px 12px',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <strong style={{ fontSize: 16, color: C.textPrimary }}>{bill.title}</strong>
                  {allPaid && (
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
                      FULLY SETTLED
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: C.textMuted }}>ID: {bill.id.slice(0, 8)}…</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(bill.totalCents / 100)}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                  {paidCount}/{totalCount} shares settled
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: C.border,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: allPaid ? C.green : C.accent,
                    borderRadius: 2,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.textMuted }}>Settlement progress</span>
                <span
                  style={{ fontSize: 10, color: allPaid ? C.green : C.accent, fontWeight: 700 }}
                >
                  {pct}%
                </span>
              </div>
            </div>

            {/* Shares */}
            <div style={{ padding: '12px 18px' }}>
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
