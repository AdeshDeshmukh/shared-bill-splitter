import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { api, type Share } from '../api/client'

type Props = {
  homeId: string
  billId: string
  share: Share
  memberName?: string
}

const C = {
  bg2: '#2a1200',
  border: '#3d1f00',
  accent: '#f97316',
  accentHover: '#ea6c0a',
  textPrimary: '#f5e6d8',
  textMuted: '#a07850',
  green: '#4ade80',
  greenBg: 'rgba(74,222,128,0.12)',
  red: '#f87171',
  pending: '#3d1f00',
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
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: C.accent,
        color: '#1c0a00',
        fontSize: 11,
        fontWeight: 700,
        marginRight: 10,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}

export function ShareRow({ homeId, billId, share, memberName }: Props) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  /**
   * Stable idempotency key per payment intent.
   * Stored in a ref to persist across internal retries without triggering re-renders.
   * If a network timeout occurs, retrying will re-use this exact key.
   */
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID())

  const mutation = useMutation({
    mutationFn: () => api.payShare(billId, share.id, idempotencyKeyRef.current),
    onSuccess: () => {
      setError(null)
      idempotencyKeyRef.current = crypto.randomUUID()
      queryClient.invalidateQueries({ queryKey: ['bills', homeId] })
      queryClient.invalidateQueries({ queryKey: ['balances', homeId] })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const dollars = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)

  const displayName = memberName ?? `Member ${share.memberId.slice(0, 6)}`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: 6,
        background: share.paidAt ? 'rgba(74,222,128,0.05)' : C.bg2,
        border: `1px solid ${share.paidAt ? 'rgba(74,222,128,0.2)' : C.border}`,
        marginBottom: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar name={displayName} />
        <div>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>{displayName}</span>
          <span style={{ marginLeft: 12, fontWeight: 700, color: C.accent, fontSize: 14 }}>
            {dollars(share.amountCents)}
          </span>
          {share.paidAt && (
            <span
              style={{
                marginLeft: 10,
                fontSize: 11,
                fontWeight: 600,
                color: C.green,
                background: C.greenBg,
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.03em',
              }}
            >
              ✓ SETTLED
            </span>
          )}
          {error && (
            <div style={{ fontSize: 12, color: C.red, marginTop: 3, fontWeight: 500 }}>
              Payment failed: {error}
            </div>
          )}
        </div>
      </div>

      {!share.paidAt && (
        <button
          type="button"
          onClick={() => {
            setError(null)
            mutation.mutate()
          }}
          disabled={mutation.isPending}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: `1px solid ${mutation.isPending ? C.border : C.accent}`,
            background: mutation.isPending ? C.pending : C.accent,
            color: mutation.isPending ? C.textMuted : '#1c0a00',
            cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {mutation.isPending ? 'PROCESSING…' : 'PAY SHARE'}
        </button>
      )}
    </div>
  )
}
