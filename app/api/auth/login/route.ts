import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { normalizeEmail } from '@/lib/validators'
import { setPrimarySession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  email: z.string(),
  password: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const ip = getClientIp(req)
  const email = normalizeEmail(parsed.data.email)
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await logAudit({ action: 'LOGIN_FALLIDO', ip, metadata: { email } })
    return NextResponse.json({ error: 'Mail o contraseña incorrectos' }, { status: 401 })
  }

  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    return NextResponse.json({
      error: `Tu cuenta está suspendida hasta el ${user.suspendedUntil.toLocaleDateString('es-AR')}.`,
    }, { status: 403 })
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: 'Todavía no verificaste tu mail.' }, { status: 403 })
  }

  await setPrimarySession({
    kind: 'user',
    userId: user.id,
    role: user.role,
    displayName: user.displayName,
  })

  await logAudit({ action: 'LOGIN', actorUserId: user.id, targetUserId: user.id, ip })

  return NextResponse.json({
    ok: true,
    user: {
      displayName: user.displayName,
      role: user.role,
      isInstitutional: user.isInstitutional,
    },
  })
}
