import { Hono } from 'hono'
import bills from './routes/bills'
import homes from './routes/homes'
import payments from './routes/payments'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/homes', homes)
app.route('/api/homes', bills)
app.route('/api', payments)

export default app
