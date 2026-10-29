import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession } from '@/lib/session'

export async function GET() {
  const session = await getPrimarySession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (session.kind === 'user') {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        displayName: true, email: true, role: true, isInstitutional: true,
        avatarUrl: true, bio: true, instagramHandle: true,
        avatarRemovedAt: true, avatarRemovedBy: true,
      },
    })
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    return NextResponse.json({ user: { ...user, kind: 'user' } })
  }

  // session.kind === 'teacher'
  const identity = await prisma.teacherIdentity.findUnique({
    where: { id: session.teacherIdentityId },
    select: {
      displayName: true, email: true,
      avatarUrl: true, bio: true, instagramHandle: true,
      avatarRemovedAt: true, avatarRemovedBy: true,
    },
  })
  if (!identity) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  return NextResponse.json({
    user: { ...identity, kind: 'teacher', role: 'PROFESOR', isInstitutional: true },
  })
}

const schema = z.object({
  bio: z.string().max(280).optional().nullable(),
  instagramHandle: z.string().max(30).regex(/^[a-zA-Z0-9._]*$/, 'Solo letras, números, puntos y guiones bajos').optional().nullable(),
})

export async function PATCH(req: NextRequest) {
  const session = await getPrimarySession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 })

  // Instagram se guarda sin "@" ni URL, por si lo pegan con alguno de los dos.
  const instagramHandle = parsed.data.instagramHandle
    ?.trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/$/, '') || null
  const bio = parsed.data.bio?.trim() || null

  if (session.kind === 'user') {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { bio, instagramHandle },
      select: { bio: true, instagramHandle: true },
    })
    return NextResponse.json({ ok: true, user })
  }

  const identity = await prisma.teacherIdentity.update({
    where: { id: session.teacherIdentityId },
    data: { bio, instagramHandle },
    select: { bio: true, instagramHandle: true },
  })
  return NextResponse.json({ ok: true, user: identity })
}
