import { Hono } from 'hono'
import { findBill, findIdempotencyKey, findShare, payShare } from '../db/queries'

const payments = new Hono<{ Bindings: Env }>()

// POST /api/bills/:billId/shares/:shareId/pay — Mark a share as paid with idempotency & concurrency safety
payments.post('/bills/:billId/shares/:shareId/pay', async (c) => {
  const billId = c.req.param('billId')
  const shareId = c.req.param('shareId')
  const rawKey = c.req.header('Idempotency-Key')
  const idempotencyKey = rawKey?.trim()

  // HTTP 400 — Idempotency-Key header is mandatory and non-empty
  if (!idempotencyKey) {
    return c.json({ error: 'Idempotency-Key header is required' }, 400)
  }

  // HTTP 404 — Bill must exist
  const bill = await findBill(c.env.DB, billId)
  if (!bill) {
    return c.json({ error: 'bill not found' }, 404)
  }

  // HTTP 404 — Share must exist and belong to the specified bill
  const share = await findShare(c.env.DB, shareId)
  if (!share || share.billId !== billId) {
    return c.json({ error: 'share not found' }, 404)
  }

  // HTTP 200 (Idempotent Replay) — If this exact key was already recorded for this share,
  // return the existing share status without mutating database state.
  const alreadyUsedKey = await findIdempotencyKey(c.env.DB, shareId, idempotencyKey)
  if (alreadyUsedKey) {
    return c.json(
      {
        id: share.id,
        memberId: share.memberId,
        amountCents: share.amountCents,
        paidAt: share.paidAt,
      },
      200,
    )
  }

  // HTTP 409 — Share has already been paid using a different key
  if (share.paidAt !== null) {
    return c.json({ error: 'share already paid with a different key' }, 409)
  }

  // Atomic conditional UPDATE: only succeeds if paid_at IS NULL at write serialization time.
  const result = await payShare(c.env.DB, shareId, idempotencyKey)

  // If a concurrent request won the write race, verify if it was the SAME idempotency key
  if (!result.changed) {
    const isSameKey = await findIdempotencyKey(c.env.DB, shareId, idempotencyKey)
    if (isSameKey) {
      const updatedShare = await findShare(c.env.DB, shareId)
      if (updatedShare) {
        return c.json(
          {
            id: updatedShare.id,
            memberId: updatedShare.memberId,
            amountCents: updatedShare.amountCents,
            paidAt: updatedShare.paidAt,
          },
          200,
        )
      }
    }
    return c.json({ error: 'share already paid with a different key' }, 409)
  }

  return c.json(
    {
      id: share.id,
      memberId: share.memberId,
      amountCents: share.amountCents,
      paidAt: result.paidAt,
    },
    200,
  )
})

export default payments
