import { createFileRoute } from '@tanstack/react-router'
import { BalancesPanel } from '../components/BalancesPanel'
import { BillList } from '../components/BillList'

export const Route = createFileRoute('/home/$homeId')({
  component: HomeRoutePage,
})

function HomeRoutePage() {
  const { homeId } = Route.useParams()

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#111827',
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Shared Bill Splitter</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          Viewing Home ID: <code>{homeId}</code>
        </p>
      </header>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Outstanding Balances</h2>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <BalancesPanel homeId={homeId} />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Bills & Shares</h2>
        <BillList homeId={homeId} />
      </section>
    </div>
  )
}
