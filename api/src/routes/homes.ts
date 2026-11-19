import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { createHome, createMember, findHome } from '../db/queries'

const homes = new Hono<{ Bindings: Env }>()

const createHomeBody = z.object({
  name: z.string().trim().min(1, 'name is required'),
})

const createMemberBody = z.object({
  name: z.string().trim().min(1, 'name is required'),
})

homes.post(
  '/',
  zValidator('json', createHomeBody, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'name is required' }, 400)
    }
  }),
  async (c) => {
    const { name } = c.req.valid('json')
    const home = await createHome(c.env.DB, name.trim())
    return c.json(home, 201)
  },
)

homes.post(
  '/:homeId/members',
  zValidator('json', createMemberBody, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'name is required' }, 400)
    }
  }),
  async (c) => {
    const homeId = c.req.param('homeId')
    const { name } = c.req.valid('json')

    const home = await findHome(c.env.DB, homeId)
    if (!home) return c.json({ error: 'home not found' }, 404)

    try {
      const member = await createMember(c.env.DB, homeId, name.trim())
      return c.json(member, 201)
    } catch (err) {
      const msg = (err as Error).message ?? ''
      if (msg.includes('UNIQUE') || msg.includes('uq_member_name')) {
        return c.json({ error: 'member already exists in this home' }, 409)
      }
      throw err
    }
  },
)

export default homes
