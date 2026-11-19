import { Hono } from 'hono'
import bills from './routes/bills'
import homes from './routes/homes'
import payments from './routes/payments'

const app = new Hono<{ Bindings: Env }>()

// Fallback to strict JSON error for any unmapped route
app.notFound((c) => c.json({ error: 'not found' }, 404))

// Global error handler guaranteeing strictly JSON formatted errors { "error": "message" }
app.onError((err, c) => c.json({ error: err.message || 'internal server error' }, 500))

app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/homes', homes)
app.route('/api/homes', bills)
app.route('/api', payments)

export default app
