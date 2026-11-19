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
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: C.accentSoft,
        color: C.accent,
        fontSize: 11,
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
        padding: '12px 14px',
        borderRadius: 8,
        background: share.paidAt ? C.greenBg : C.bgSubtle,
        border: `1px solid ${share.paidAt ? 'rgba(5, 150, 105, 0.2)' : C.border}`,
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar name={displayName} />
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{displayName}</span>
          <span
            style={{
              marginLeft: 12,
              fontWeight: 700,
              color: share.paidAt ? C.green : C.accent,
              fontSize: 14,
            }}
          >
            {dollars(share.amountCents)}
          </span>
          {share.paidAt && (
            <span
              style={{
                marginLeft: 10,
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
            padding: '7px 16px',
            borderRadius: 6,
            border: 'none',
            background: mutation.isPending ? '#e2dcd4' : C.accent,
            color: mutation.isPending ? C.textMuted : '#ffffff',
            cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: mutation.isPending ? 'none' : '0 1px 2px rgba(225, 29, 72, 0.2)',
            flexShrink: 0,
          }}
        >
          {mutation.isPending ? 'PROCESSING…' : 'PAY SHARE'}
        </button>
      )}
    </div>
  )
}
