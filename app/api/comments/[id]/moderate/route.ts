import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession, getSubjectSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({ action: z.enum(['CENSURAR', 'DESCENSURAR', 'BORRAR']) })

// Cualquier materia con sesión activa (no solo la del artículo) o el admin
// pueden moderar un comentario — queda registrado en el log con qué cuenta
// actuó, tal como acordamos.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const primary = await getPrimarySession()
  const subject = await getSubjectSession()
  const isAdmin = primary?.kind === 'user' && primary.role === 'ADMIN'

  if (!isAdmin && !subject) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })

  const moderatorLabel = isAdmin ? 'admin' : subject!.username

  const data =
    parsed.data.action === 'CENSURAR'
      ? { isCensored: true, censoredBy: moderatorLabel, censoredAt: new Date() }
      : parsed.data.action === 'DESCENSURAR'
        ? { isCensored: false, censoredBy: null, censoredAt: null }
        : { isDeleted: true }

  await prisma.comment.update({ where: { id }, data })

  await logAudit({
    action: parsed.data.action === 'BORRAR' ? 'COMENTARIO_BORRADO' : 'COMENTARIO_MODERADO',
    actorUserId: isAdmin ? primary!.userId : undefined,
    actorTeacherIdentityId: subject ? subject.actingTeacherIdentityId : undefined,
    actingAsSubjectUsername: subject ? subject.username : undefined,
    targetCommentId: comment.id,
    targetUserId: comment.authorId,
    ip: getClientIp(req),
    metadata: { action: parsed.data.action },
  })

  return NextResponse.json({ ok: true })
}
