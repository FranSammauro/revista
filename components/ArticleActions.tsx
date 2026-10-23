'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function ArticleActions({ slug }: { slug: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    const res = await fetch(`/api/articles/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/articulos')
      router.refresh()
    } else {
      setDeleting(false)
      setConfirming(false)
      alert('Error al eliminar el artículo.')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--ivd-gray-mid)', fontFamily: 'var(--font-mono)' }}>
        Moderación:
      </span>
      <button onClick={handleDelete} disabled={deleting} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', borderRadius: 8,
        border: `1px solid ${confirming ? '#C8102E' : 'var(--ivd-gray)'}`,
        background: confirming ? '#C8102E' : 'transparent',
        color: confirming ? 'white' : 'var(--ivd-gray-dark)',
        fontSize: '0.8rem', fontWeight: 600,
        cursor: deleting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', fontFamily: 'var(--font-body)',
      }}
        onMouseEnter={e => { if (!confirming) { const el = e.currentTarget; el.style.borderColor = '#C8102E'; el.style.color = '#C8102E' } }}
        onMouseLeave={e => { if (!confirming) { const el = e.currentTarget; el.style.borderColor = 'var(--ivd-gray)'; el.style.color = 'var(--ivd-gray-dark)' } }}
      >
        <Trash2 size={13} />
        {deleting ? 'Eliminando...' : confirming ? '¿Confirmar?' : 'Eliminar'}
      </button>
      {confirming && !deleting && (
        <button onClick={() => setConfirming(false)} style={{
          fontSize: '0.78rem', color: 'var(--ivd-gray-mid)', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'underline',
        }}>Cancelar</button>
      )}
    </div>
  )
}
