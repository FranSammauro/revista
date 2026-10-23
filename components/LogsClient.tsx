'use client'
import { useEffect, useState } from 'react'

interface LogRow {
  id: string
  action: string
  actingAsSubjectUsername: string | null
  ip: string | null
  createdAt: string
  metadata: unknown
  actorUser: { email: string; displayName: string } | null
  actorTeacherIdentity: { email: string; displayName: string } | null
  targetUser: { email: string; displayName: string } | null
}

const ACTION_LABEL: Record<string, string> = {
  REGISTRO_USUARIO: 'Registro de usuario',
  VERIFICACION_EMAIL: 'Verificación de mail',
  LOGIN: 'Inicio de sesión',
  LOGIN_FALLIDO: 'Intento de login fallido',
  CAMBIO_PASSWORD: 'Cambio de contraseña',
  ACCESO_TEMPORAL_PROFESOR: 'Acceso temporal a materia',
  ARTICULO_ENVIADO_REVISION: 'Artículo enviado a revisión',
  ARTICULO_APROBADO: 'Artículo aprobado',
  ARTICULO_RECHAZADO: 'Artículo rechazado',
  ARTICULO_POSPUESTO: 'Artículo pospuesto',
  COMENTARIO_CREADO: 'Comentario creado',
  COMENTARIO_MODERADO: 'Comentario moderado',
  COMENTARIO_BORRADO: 'Comentario borrado',
  USUARIO_SUSPENDIDO: 'Usuario suspendido',
  USUARIO_REACTIVADO: 'Usuario reactivado',
  WHITELIST_PROFESOR_AGREGADO: 'Profesor agregado a whitelist',
  WHITELIST_PROFESOR_QUITADO: 'Profesor quitado de whitelist',
}

export default function LogsClient() {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load(nextCursor?: string) {
    setLoading(true)
    const res = await fetch(`/api/admin/audit-logs${nextCursor ? `?cursor=${nextCursor}` : ''}`)
    const data = await res.json()
    setLogs(prev => nextCursor ? [...prev, ...data.logs] : data.logs)
    setCursor(data.nextCursor)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--ivd-black)', marginBottom: '0.5rem' }}>
        Logs de auditoría
      </h1>
      <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Quién hizo qué, incluyendo cambios de contraseña de materias, moderación y suspensiones.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {logs.map(l => {
          const actorLabel = l.actorUser
            ? `${l.actorUser.displayName} (${l.actorUser.email})`
            : l.actorTeacherIdentity
              ? `${l.actorTeacherIdentity.displayName} (${l.actorTeacherIdentity.email})${l.actingAsSubjectUsername ? ` → actuando como "${l.actingAsSubjectUsername}"` : ''}`
              : 'Desconocido'

          return (
            <div key={l.id} style={{ background: 'white', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid var(--ivd-gray)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <strong>{ACTION_LABEL[l.action] || l.action}</strong>
                <span style={{ color: 'var(--ivd-gray-mid)' }}>{new Date(l.createdAt).toLocaleString('es-AR')}</span>
              </div>
              <div style={{ color: 'var(--ivd-gray-dark)', marginTop: 4 }}>{actorLabel}</div>
              {l.targetUser && <div style={{ color: 'var(--ivd-gray-mid)' }}>Sobre: {l.targetUser.displayName} ({l.targetUser.email})</div>}
              {l.ip && <div style={{ color: 'var(--ivd-gray-mid)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>IP: {l.ip}</div>}
            </div>
          )
        })}
      </div>

      {loading && <p style={{ marginTop: '1rem' }}>Cargando...</p>}
      {!loading && cursor && (
        <button onClick={() => load(cursor)} style={{
          marginTop: '1rem', padding: '9px 18px', background: 'var(--ivd-black)', color: 'white',
          border: 'none', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          Cargar más
        </button>
      )}
    </div>
  )
}
