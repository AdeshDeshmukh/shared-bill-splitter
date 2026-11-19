import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { api, type Share } from '../api/client'

type Props = {
  homeId: string
  billId: string
  share: Share
  memberName?: string
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
          {memberName ?? `Member: ${share.memberId.slice(0, 8)}…`}
        </span>
        <span
          style={{
            marginLeft: 12,
            fontWeight: 600,
            color: '#111827',
          }}
        >
          {dollars(share.amountCents)}
        </span>
        {share.paidAt && (
          <span
            style={{
              marginLeft: 10,
              fontSize: 12,
              fontWeight: 500,
              color: '#059669',
              background: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            ✓ Paid
          </span>
        )}
        {error && (
          <div
            style={{
              fontSize: 12,
              color: '#dc2626',
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            Payment failed: {error}
          </div>
        )}
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
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: mutation.isPending ? '#f3f4f6' : '#2563eb',
            color: mutation.isPending ? '#9ca3af' : '#ffffff',
            cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
        >
          {mutation.isPending ? 'Processing…' : 'Pay Share'}
        </button>
      )}
    </div>
  )
}
