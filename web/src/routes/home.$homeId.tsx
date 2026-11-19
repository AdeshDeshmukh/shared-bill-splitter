import { createFileRoute, Link } from '@tanstack/react-router'
import { BalancesPanel } from '../components/BalancesPanel'
import { BillList } from '../components/BillList'

export const Route = createFileRoute('/home/$homeId')({
  component: HomeRoutePage,
})

const C = {
  bg: '#1c0a00',
  bg2: '#2a1200',
  border: '#3d1f00',
  accent: '#f97316',
  textPrimary: '#f5e6d8',
  textMuted: '#a07850',
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
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              width: 28,
              height: 28,
              borderRadius: 6,
              background: C.accent,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
            }}
          >
            ⚡
          </span>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
            Shared Bill Splitter
          </span>
        </Link>
        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'monospace' }}>
          HOME {homeId.slice(0, 8)}…
        </span>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px 0', color: C.textPrimary }}>
            Home <span style={{ color: C.accent }}>Details</span>
          </h1>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0, fontFamily: 'monospace' }}>
            ID: {homeId}
          </p>
        </div>

        <section
          style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
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
