import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { ShareRow } from './ShareRow'

type Props = {
  homeId: string
  memberMap?: Record<string, string>
}

export function BillList({ homeId, memberMap }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bills', homeId],
    queryFn: () => api.getBills(homeId),
    enabled: Boolean(homeId),
  })

  if (isLoading) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>Loading bills…</p>
  }

  if (isError) {
    return (
      <div
        style={{
          padding: 12,
          background: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: 6,
          color: '#b91c1c',
          fontSize: 14,
        }}
      >
        Failed to load bills: {(error as Error).message}
      </div>
    )
  }

  if (!data || data.bills.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>No bills created for this home yet.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.bills.map((bill) => (
        <div
          key={bill.id}
          style={{
            padding: 18,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <div>
              <strong style={{ fontSize: 16, color: '#111827' }}>{bill.title}</strong>
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                ID: {bill.id.slice(0, 8)}…
              </span>
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#1f2937',
              }}
            >
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(bill.totalCents / 100)}
            </span>
          </div>

          <div>
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
      ))}
    </div>
  )
}
