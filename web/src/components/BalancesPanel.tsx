import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

type Props = { homeId: string }

export function BalancesPanel({ homeId }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['balances', homeId],
    queryFn: () => api.getBalances(homeId),
    enabled: Boolean(homeId),
  })

  if (isLoading) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>Loading balances…</p>
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
        Failed to load balances: {(error as Error).message}
      </div>
    )
  }

  if (!data || data.balances.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: 14 }}>No members enrolled in this home yet.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th
              style={{
                textAlign: 'left',
                padding: '8px 0',
                color: '#4b5563',
                fontWeight: 600,
              }}
            >
              Member Name
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '8px 0',
                color: '#4b5563',
                fontWeight: 600,
              }}
            >
              Outstanding Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {data.balances.map((b) => (
            <tr key={b.memberId} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '10px 0', color: '#111827', fontWeight: 500 }}>{b.name}</td>
              <td
                style={{
                  padding: '10px 0',
                  textAlign: 'right',
                  color: b.outstandingCents > 0 ? '#dc2626' : '#059669',
                  fontWeight: 600,
                }}
              >
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(b.outstandingCents / 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
