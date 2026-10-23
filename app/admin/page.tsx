import { prisma } from '@/lib/prisma'
import { FileText, Clock, Users, ShieldAlert } from 'lucide-react'

export default async function AdminDashboard() {
  const [enRevision, publicados, alumnos, suspendidos] = await Promise.all([
    prisma.article.count({ where: { status: 'EN_REVISION' } }),
    prisma.article.count({ where: { status: 'PUBLICADO' } }),
    prisma.user.count({ where: { role: 'ALUMNO' } }),
    prisma.user.count({ where: { suspendedUntil: { gt: new Date() } } }),
  ])

  const cards = [
    { label: 'En revisión', value: enRevision, icon: <Clock size={18} />, color: '#B8860B' },
    { label: 'Publicados', value: publicados, icon: <FileText size={18} />, color: '#1a7a3a' },
    { label: 'Alumnos registrados', value: alumnos, icon: <Users size={18} />, color: '#1A4A8A' },
    { label: 'Cuentas suspendidas', value: suspendidos, icon: <ShieldAlert size={18} />, color: '#C8102E' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--ivd-black)', marginBottom: '1.5rem' }}>
        Resumen
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.color, marginBottom: 8 }}>
              {c.icon}
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: 'var(--ivd-black)' }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
