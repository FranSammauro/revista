import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/require-admin'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 80 }}>
      <div style={{ background: 'var(--ivd-black)', borderBottom: '1px solid rgba(200,16,46,0.2)', padding: '1rem 1.25rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>
            Revista<span style={{ color: 'var(--ivd-red)' }}>IVD</span> · Administración
          </div>
          <AdminNav />
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1.25rem' }}>
        {children}
      </div>
    </div>
  )
}
