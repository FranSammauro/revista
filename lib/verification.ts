import 'server-only'
import { prisma } from './prisma'
import type { EmailTokenPurpose } from '@prisma/client'

const MAX_ATTEMPTS = 5

interface ConsumeParams {
  purpose: EmailTokenPurpose
  code: string
  userId?: string
  teacherIdentityId?: string
}

type ConsumeResult = { ok: true } | { ok: false; error: string }

/**
 * Busca el token activo más reciente del dueño (alumno o identidad docente)
 * y valida el código con un límite de intentos fallidos, para que no se
 * pueda probar fuerza bruta las 10^6 combinaciones de un código de 6 dígitos.
 * Al agotar los intentos, el token se invalida y hay que pedir uno nuevo.
 */
export async function consumeEmailCode(params: ConsumeParams): Promise<ConsumeResult> {
  const token = await prisma.emailToken.findFirst({
    where: {
      purpose: params.purpose,
      userId: params.userId,
      teacherIdentityId: params.teacherIdentityId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!token) return { ok: false, error: 'Código inválido o expirado' }

  if (token.attempts >= MAX_ATTEMPTS) {
    // Ya se agotaron los intentos en un llamado anterior — se invalida igual
    // por las dudas y se le pide al usuario que solicite un código nuevo.
    await prisma.emailToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
    return { ok: false, error: 'Demasiados intentos fallidos. Pedí un código nuevo.' }
  }

  if (token.code !== params.code) {
    const attempts = token.attempts + 1
    await prisma.emailToken.update({
      where: { id: token.id },
      data: {
        attempts,
        // en el intento número MAX_ATTEMPTS ya lo invalidamos directamente
        ...(attempts >= MAX_ATTEMPTS ? { usedAt: new Date() } : {}),
      },
    })
    return {
      ok: false,
      error: attempts >= MAX_ATTEMPTS
        ? 'Demasiados intentos fallidos. Pedí un código nuevo.'
        : 'Código inválido o expirado',
    }
  }

  await prisma.emailToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
  return { ok: true }
}
