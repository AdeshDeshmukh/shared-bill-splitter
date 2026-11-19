import { createFileRoute, Link } from '@tanstack/react-router'
import { BalancesPanel } from '../components/BalancesPanel'
import { BillList } from '../components/BillList'

export const Route = createFileRoute('/home/$homeId')({
  component: HomeRoutePage,
})

const C = {
  bg: '#fbf9f6',
  card: '#ffffff',
  bgSubtle: '#faf7f3',
  border: '#e8e2d8',
  accent: '#e11d48',
  accentSoft: 'rgba(225, 29, 72, 0.08)',
  textPrimary: '#1c1917',
  textMuted: '#78716c',
}

function HomeRoutePage() {
  const { homeId } = Route.useParams()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: C.textPrimary,
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: '#ffffff',
          padding: '0 32px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.accent,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: '#ffffff',
            }}
          >
            ✦
          </span>
          <span style={{ fontWeight: 700, fontSize: 17, color: C.textPrimary }}>
            Shared Bill Splitter
          </span>
        </Link>
        <span
          style={{
            fontSize: 12,
            color: C.accent,
            background: C.accentSoft,
            padding: '4px 10px',
            borderRadius: 6,
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          HOME: {homeId.slice(0, 8)}…
        </span>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px 0', color: C.textPrimary }}>
            Household <span style={{ color: C.accent }}>Details</span>
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0, fontFamily: 'monospace' }}>
            ID: {homeId}
          </p>
        </div>

        <section
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          }}
        >
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: C.textMuted,
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
            }}
          >
            Member Balances
          </h2>
          <BalancesPanel homeId={homeId} />
        </section>

        <section>
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: C.textMuted,
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
            }}
          >
            Bills & Shares
          </h2>
          <BillList homeId={homeId} />
        </section>
      </main>
    </div>
  )
}
