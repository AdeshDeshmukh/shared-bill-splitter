import { Hono } from 'hono'
import bills from './routes/bills'
import homes from './routes/homes'

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/homes', homes)
app.route('/api/homes', bills)

export default app
