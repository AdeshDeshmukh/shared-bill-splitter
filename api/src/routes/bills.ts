import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  createBill,
  createShares,
  findHome,
  getBalances,
  getBillsWithShares,
  getMembersOrdered,
} from '../db/queries'
import { splitCents } from '../lib/split'

const bills = new Hono<{ Bindings: Env }>()

const createBillBody = z.object({
  title: z.string().trim().min(1, 'title is required'),
  totalCents: z
    .number()
    .refine((v) => Number.isInteger(v) && v > 0, 'total is not a positive whole number'),
})

// POST /api/homes/:homeId/bills — Create a bill and split it across members
bills.post(
  '/:homeId/bills',
  zValidator('json', createBillBody, (result, c) => {
    if (!result.success) {
      const hasTotalIssue = result.error.issues.some(
        (issue) =>
          issue.path.includes('totalCents') ||
          issue.message.includes('total') ||
          issue.path.length === 0,
      )
      if (hasTotalIssue) {
        return c.json({ error: 'total is not a positive whole number' }, 422)
      }
      return c.json({ error: result.error.issues[0]?.message ?? 'invalid request' }, 400)
    }
  }),
  async (c) => {
    const homeId = c.req.param('homeId')
    const { title, totalCents } = c.req.valid('json')

    const home = await findHome(c.env.DB, homeId)
    if (!home) return c.json({ error: 'home not found' }, 404)

    const members = await getMembersOrdered(c.env.DB, homeId)
    if (members.length === 0) {
      return c.json({ error: 'home has no members' }, 422)
    }

    const amounts = splitCents(totalCents, members.length)
    const bill = await createBill(c.env.DB, homeId, title.trim(), totalCents)
    const shares = await createShares(
      c.env.DB,
      bill.id,
      members.map((m) => m.id),
      amounts,
    )

    return c.json(
      {
        id: bill.id,
        homeId: bill.homeId,
        title: bill.title,
        totalCents: bill.totalCents,
        shares: shares.map((s) => ({
          id: s.id,
          memberId: s.memberId,
          amountCents: s.amountCents,
          paidAt: s.paidAt,
        })),
      },
      201,
    )
  },
)

// GET /api/homes/:homeId/bills — List all bills with their shares for a home
bills.get('/:homeId/bills', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await findHome(c.env.DB, homeId)
  if (!home) return c.json({ error: 'home not found' }, 404)

  const billList = await getBillsWithShares(c.env.DB, homeId)
  return c.json({ bills: billList })
})

// GET /api/homes/:homeId/balances — Outstanding balance per member in addition order
bills.get('/:homeId/balances', async (c) => {
  const homeId = c.req.param('homeId')

  const home = await findHome(c.env.DB, homeId)
  if (!home) return c.json({ error: 'home not found' }, 404)

  const balances = await getBalances(c.env.DB, homeId)
  return c.json({ balances })
})

export default bills
