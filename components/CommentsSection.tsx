'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle, CornerDownRight, ShieldAlert, ShieldOff, Trash2, Send } from 'lucide-react'

interface RawComment {
  id: string
  parentCommentId: string | null
  createdAt: string
  author: { id: string; displayName: string } | null
  body: string
  isCensored: boolean
  isDeleted: boolean
  isOwn: boolean
}

interface TreeComment extends RawComment {
  children: TreeComment[]
}

function buildTree(flat: RawComment[]): TreeComment[] {
  const byId = new Map<string, TreeComment>()
  flat.forEach(c => byId.set(c.id, { ...c, children: [] }))
  const roots: TreeComment[] = []
  byId.forEach(c => {
    if (c.parentCommentId && byId.has(c.parentCommentId)) {
      byId.get(c.parentCommentId)!.children.push(c)
    } else {
      roots.push(c)
    }
  })
  return roots
}

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<RawComment[]>([])
  const [isModerator, setIsModerator] = useState(false)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [newBody, setNewBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/articles/${slug}/comments`)
    if (res.ok) {
      const data = await res.json()
      setComments(data.comments)
      setIsModerator(data.isModerator)
    }
    setLoading(false)
  }, [slug])

  useEffect(() => {
    load()
    fetch('/api/auth/me').then(r => r.json()).then(d => setLoggedIn(d.primary?.kind === 'user'))
  }, [load])

  async function postComment(body: string, parentCommentId?: string) {
    setError('')
    const res = await fetch(`/api/articles/${slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, parentCommentId }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return false }
    load()
    return true
  }

  async function handleNewComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newBody.trim()) return
    setPosting(true)
    const ok = await postComment(newBody.trim())
    setPosting(false)
    if (ok) setNewBody('')
  }

  async function moderate(id: string, action: 'CENSURAR' | 'DESCENSURAR' | 'BORRAR') {
    await fetch(`/api/comments/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    load()
  }

  const tree = buildTree(comments)

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ivd-gray)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--ivd-black)', marginBottom: '1.5rem' }}>
        <MessageCircle size={20} /> Comentarios {comments.filter(c => !c.isDeleted).length > 0 && `(${comments.filter(c => !c.isDeleted).length})`}
      </h2>

      {loggedIn === false && (
        <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <Link href="/login" style={{ color: 'var(--ivd-red)', fontWeight: 600 }}>Iniciá sesión</Link> o{' '}
          <Link href="/registro" style={{ color: 'var(--ivd-red)', fontWeight: 600 }}>creá una cuenta</Link> para comentar.
        </p>
      )}

      {loggedIn && (
        <form onSubmit={handleNewComment} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={3} maxLength={2000}
            placeholder="Escribí tu comentario..."
            style={{ padding: '10px 14px', border: '1px solid var(--ivd-gray)', borderRadius: 10, resize: 'vertical', fontFamily: 'var(--font-body)' }} />
          {error && <p style={{ color: '#C8102E', fontSize: '0.82rem' }}>{error}</p>}
          <button type="submit" disabled={posting || !newBody.trim()} style={{
            alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', background: 'var(--ivd-red)', color: 'white', border: 'none',
            borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <Send size={14} /> {posting ? 'Publicando...' : 'Comentar'}
          </button>
        </form>
      )}

      {loading && <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.9rem' }}>Cargando comentarios...</p>}
      {!loading && tree.length === 0 && <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.9rem' }}>Todavía no hay comentarios. ¡Sé el primero!</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tree.map(c => (
          <CommentNode key={c.id} comment={c} depth={0} loggedIn={!!loggedIn} isModerator={isModerator}
            onReply={postComment} onModerate={moderate} />
        ))}
      </div>
    </div>
  )
}

function CommentNode({
  comment, depth, loggedIn, isModerator, onReply, onModerate,
}: {
  comment: TreeComment
  depth: number
  loggedIn: boolean
  isModerator: boolean
  onReply: (body: string, parentCommentId?: string) => Promise<boolean>
  onModerate: (id: string, action: 'CENSURAR' | 'DESCENSURAR' | 'BORRAR') => void
}) {
  const [replying, setReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim()) return
    setSending(true)
    const ok = await onReply(replyBody.trim(), comment.id)
    setSending(false)
    if (ok) { setReplyBody(''); setReplying(false) }
  }

  return (
    <div style={{ marginLeft: Math.min(depth, 6) * 20 }}>
      <div style={{
        background: comment.isDeleted ? 'transparent' : 'white',
        border: comment.isDeleted ? 'none' : '1px solid var(--ivd-gray)',
        borderRadius: 10, padding: comment.isDeleted ? '0.4rem 0' : '0.9rem 1.1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: comment.isDeleted ? 'var(--ivd-gray-mid)' : 'var(--ivd-black)' }}>
            {comment.isDeleted ? '—' : comment.author?.displayName}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--ivd-gray-mid)' }}>
            {new Date(comment.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p style={{
          marginTop: 4, fontSize: '0.88rem', lineHeight: 1.55,
          color: comment.isDeleted || comment.isCensored ? 'var(--ivd-gray-mid)' : 'var(--ivd-gray-dark)',
          fontStyle: comment.isDeleted || comment.isCensored ? 'italic' : 'normal',
          whiteSpace: 'pre-wrap',
        }}>
          {comment.body}
        </p>

        {!comment.isDeleted && (
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {loggedIn && (
              <button onClick={() => setReplying(!replying)} style={{
                display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                color: 'var(--ivd-gray-mid)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
              }}>
                <CornerDownRight size={13} /> Responder
              </button>
            )}
            {isModerator && (
              <>
                {comment.isCensored ? (
                  <button onClick={() => onModerate(comment.id, 'DESCENSURAR')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#1a7a3a', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <ShieldOff size={13} /> Quitar censura
                  </button>
                ) : (
                  <button onClick={() => onModerate(comment.id, 'CENSURAR')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#B8860B', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                    <ShieldAlert size={13} /> Censurar
                  </button>
                )}
                <button onClick={() => onModerate(comment.id, 'BORRAR')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#C8102E', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>
                  <Trash2 size={13} /> Borrar
                </button>
              </>
            )}
          </div>
        )}

        {replying && (
          <form onSubmit={handleReply} style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} rows={2} maxLength={2000}
              placeholder="Tu respuesta..."
              style={{ padding: '8px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8, resize: 'vertical', fontSize: '0.85rem' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={sending || !replyBody.trim()} style={{
                padding: '6px 14px', background: 'var(--ivd-black)', color: 'white', border: 'none',
                borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}>
                {sending ? 'Enviando...' : 'Responder'}
              </button>
              <button type="button" onClick={() => setReplying(false)} style={{
                padding: '6px 14px', background: 'none', border: '1px solid var(--ivd-gray)',
                borderRadius: 7, fontSize: '0.78rem', cursor: 'pointer',
              }}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.children.length > 0 && (
        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {comment.children.map(child => (
            <CommentNode key={child.id} comment={child} depth={depth + 1} loggedIn={loggedIn} isModerator={isModerator}
              onReply={onReply} onModerate={onModerate} />
          ))}
        </div>
      )}
    </div>
  )
}
