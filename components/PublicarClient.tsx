'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCategoryIcon } from '@/components/icons'
import { SUBJECTS } from '@/lib/subjects'
import { LogOut, Send, FileText, Clock, CheckCircle2, UploadCloud, AlertTriangle } from 'lucide-react'

interface User { displayName: string; role: string }

export default function PublicarClient({ user }: { user: User }) {
  const router = useRouter()
  const [subjectSlug, setSubjectSlug] = useState(SUBJECTS[0].slug)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [readTime, setReadTime] = useState(5)
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // --- Importar desde .docx/.pdf ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseWarnings, setParseWarnings] = useState<string[]>([])
  const [parsedFileName, setParsedFileName] = useState('')

  async function handleFile(file: File) {
    setError(''); setParseWarnings([]); setParsing(true)
    try {
      const formData = new FormData()
      formData.append('document', file)
      const res = await fetch('/api/articles/parse-document', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setTitle(data.title || '')
      setExcerpt(data.excerpt || '')
      setContent(data.content || '')
      setParseWarnings(data.warnings || [])
      setParsedFileName(file.name)
    } catch {
      setError('No se pudo procesar el archivo. Intentá de nuevo.')
    } finally {
      setParsing(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const cat = SUBJECTS.find(s => s.slug === subjectSlug)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, content, readTime, subjectSlug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess('¡Listo! Tu artículo entró en revisión. Te vamos a avisar por mail cuando el/la docente de la materia lo revise.')
      setTitle(''); setExcerpt(''); setContent(''); setReadTime(5)
    } catch {
      setError('Error al enviar. Intentá de nuevo.')
    } finally {
      setPublishing(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1px solid var(--ivd-gray)', borderRadius: 8,
    outline: 'none', color: 'var(--ivd-black)',
    fontFamily: 'var(--font-body)',
  }

  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700 as const,
    color: 'var(--ivd-red)', letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, marginBottom: '0.6rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'var(--ivd-black)', borderBottom: '1px solid rgba(200,16,46,0.2)', padding: '1rem 1.25rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/escudo-ivd.png" alt="IVD" width={32} height={32} style={{ objectFit: 'contain', display: 'block' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                Revista<span style={{ color: 'var(--ivd-red)' }}>IVD</span> · Publicar
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                {user.displayName}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/mis-articulos" style={{
              display: 'flex', alignItems: 'center', gap: 5, background: 'none',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)',
              borderRadius: 8, padding: '7px 13px', fontSize: '0.82rem',
              fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', textDecoration: 'none',
            }}>
              Mis artículos
            </a>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 5, background: 'none',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
              borderRadius: 8, padding: '7px 13px', cursor: 'pointer',
              fontSize: '0.82rem', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
            }}>
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.25rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div className="red-line" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ivd-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Nuevo artículo</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--ivd-black)' }}>
            Enviar artículo a revisión
          </h1>
          <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.9rem', marginTop: 4 }}>
            El/la docente de la materia que elijas va a revisarlo antes de que se publique.
          </p>
        </div>

        {/* Importar desde .docx / .pdf */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            marginBottom: '1.25rem', padding: '1.5rem', borderRadius: 12, cursor: 'pointer',
            border: `2px dashed ${dragOver ? 'var(--ivd-red)' : 'var(--ivd-gray-mid)'}`,
            background: dragOver ? 'rgba(200,16,46,0.04)' : 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center',
            transition: 'all 0.15s',
          }}
        >
          <UploadCloud size={26} color={dragOver ? 'var(--ivd-red)' : 'var(--ivd-gray-mid)'} />
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ivd-black)' }}>
            {parsing ? 'Procesando documento...' : 'Arrastrá acá tu .docx o .pdf, o hacé click para elegirlo'}
          </p>
          <p style={{ fontSize: '0.76rem', color: 'var(--ivd-gray-mid)' }}>
            Se completan el título, la descripción y el contenido automáticamente — revisalos antes de enviar.{' '}
            <a href="/guia-formato-articulos" onClick={e => e.stopPropagation()} style={{ color: 'var(--ivd-red)', fontWeight: 600 }}>
              Ver formato esperado
            </a>
          </p>
          {parsedFileName && !parsing && (
            <p style={{ fontSize: '0.76rem', color: '#1a7a3a', fontWeight: 600 }}>✓ {parsedFileName} procesado</p>
          )}
          <input ref={fileInputRef} type="file" accept=".docx,.pdf" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>

        {parseWarnings.length > 0 && (
          <div style={{ marginBottom: '1.25rem', padding: '12px 16px', background: '#fff8e6', border: '1px solid #ffdd88', borderRadius: 10 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700, color: '#8a6500', marginBottom: 6 }}>
              <AlertTriangle size={15} /> Revisá esto antes de enviar:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#8a6500' }}>
              {parseWarnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handlePublish}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)' }}>
              <label style={labelStyle}>Materia *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SUBJECTS.map(s => (
                  <button key={s.slug} type="button" onClick={() => setSubjectSlug(s.slug)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                      borderRadius: 20, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      border: subjectSlug === s.slug ? `2px solid ${s.color}` : '1px solid var(--ivd-gray)',
                      background: subjectSlug === s.slug ? `${s.color}14` : 'white',
                      color: subjectSlug === s.slug ? s.color : 'var(--ivd-gray-dark)',
                    }}>
                    {getCategoryIcon(s.slug, 14, subjectSlug === s.slug ? s.color : 'var(--ivd-gray-mid)')}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)' }}>
              <label style={labelStyle}><FileText size={13} style={{ display: 'inline', marginRight: 5 }} />Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Ej: Reacciones de oxidación en la vida cotidiana"
                style={{ ...inputStyle, fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}
                onFocus={e => (e.target.style.borderColor = 'var(--ivd-red)')}
                onBlur={e => (e.target.style.borderColor = 'var(--ivd-gray)')}
              />
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)' }}>
              <label style={labelStyle}>Resumen (2-3 oraciones) *</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} required rows={3}
                placeholder="Una descripción breve que aparece en las tarjetas..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.target.style.borderColor = 'var(--ivd-red)')}
                onBlur={e => (e.target.style.borderColor = 'var(--ivd-gray)')}
              />
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)' }}>
              <label style={labelStyle}>Contenido (Markdown) *</label>
              <p style={{ fontSize: '0.77rem', color: 'var(--ivd-gray-mid)', marginBottom: '0.6rem' }}>
                <code style={{ background: 'var(--ivd-gray)', padding: '1px 5px', borderRadius: 3 }}>## Título</code>{' '}
                <code style={{ background: 'var(--ivd-gray)', padding: '1px 5px', borderRadius: 3 }}>**negrita**</code>{' '}
                <code style={{ background: 'var(--ivd-gray)', padding: '1px 5px', borderRadius: 3 }}>*itálica*</code>{' '}
                <code style={{ background: 'var(--ivd-gray)', padding: '1px 5px', borderRadius: 3 }}>&gt; cita</code>
              </p>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={18}
                placeholder="## Introducción&#10;&#10;Escribí el contenido acá..."
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: '0.88rem', resize: 'vertical', lineHeight: 1.7 }}
                onFocus={e => (e.target.style.borderColor = 'var(--ivd-red)')}
                onBlur={e => (e.target.style.borderColor = 'var(--ivd-gray)')}
              />
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={labelStyle}><Clock size={13} style={{ display: 'inline', marginRight: 5 }} />Lectura (min)</label>
                <input type="number" min={1} max={30} value={readTime} onChange={e => setReadTime(Number(e.target.value))}
                  style={{ width: 70, padding: '8px 10px', border: '1px solid var(--ivd-gray)', borderRadius: 8, fontSize: '0.95rem', fontFamily: 'var(--font-body)', outline: 'none', textAlign: 'center' }}
                />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ivd-gray-mid)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color={cat?.color} />
                Se va a enviar a revisión de <strong style={{ color: cat?.color }}>{cat?.label}</strong>
              </div>
            </div>

            {error && <div style={{ padding: '12px 16px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 10, color: '#cc0000', fontSize: '0.88rem' }}>⚠️ {error}</div>}
            {success && <div style={{ padding: '12px 16px', background: '#f0fff4', border: '1px solid #b3e6c5', borderRadius: 10, color: '#1a7a3a', fontSize: '0.88rem' }}>✅ {success}</div>}

            <button type="submit" disabled={publishing}
              style={{
                padding: '13px 28px', background: publishing ? 'rgba(200,16,46,0.5)' : 'var(--ivd-red)',
                color: 'white', border: 'none', borderRadius: 10, fontWeight: 700,
                fontSize: '0.95rem', cursor: publishing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'var(--font-body)', alignSelf: 'flex-start',
              }}>
              <Send size={16} />
              {publishing ? 'Enviando...' : 'Enviar a revisión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
