import 'server-only'
import { prisma } from './prisma'
import type { AuditAction, Prisma } from '@prisma/client'

interface LogParams {
  action: AuditAction
  actorUserId?: string
  actorTeacherIdentityId?: string
  actingAsSubjectUsername?: string
  targetUserId?: string
  targetArticleId?: string
  targetCommentId?: string
  ip?: string | null
  metadata?: Prisma.InputJsonValue
}

/** Registra una acción sensible en el log de auditoría (solo visible en el panel admin). */
export async function logAudit(params: LogParams) {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      actorUserId: params.actorUserId,
      actorTeacherIdentityId: params.actorTeacherIdentityId,
      actingAsSubjectUsername: params.actingAsSubjectUsername,
      targetUserId: params.targetUserId,
      targetArticleId: params.targetArticleId,
      targetCommentId: params.targetCommentId,
      ip: params.ip ?? undefined,
      metadata: params.metadata,
    },
  })
}

/**
 * Extrae la IP del cliente de los headers estándar que ponen los proxys
 * (Vercel incluido).
 *
 * ⚠️ Importante si el deploy NO es Vercel: estos headers los puede setear
 * cualquiera que te pegue directo al server (son headers HTTP comunes, no
 * algo "seguro" por sí solo). Esto es confiable solo si la app está detrás
 * de un proxy de confianza (nginx, load balancer, Vercel/Cloudflare) que
 * SOBRESCRIBE el header en vez de solo agregarle un valor — si el server
 * Node queda expuesto directo a internet sin ese proxy delante, cualquiera
 * puede falsificar su IP en los logs de auditoría mandando su propio header
 * X-Forwarded-For. Si despliegan en un VPS propio, hay que configurar el
 * proxy (nginx, etc.) para que limpie/reescriba este header antes de que
 * llegue a Next.js.
 */
export function getClientIp(req: Request): string | null {
  const headers = req.headers
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  return null
}
