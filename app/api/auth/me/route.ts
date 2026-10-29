import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPrimarySession, getSubjectSession } from '@/lib/session'

export async function GET() {
  const primary = await getPrimarySession()
  const subject = await getSubjectSession()

  let avatarUrl: string | null = null

  if (primary?.kind === 'user') {
    const user = await prisma.user.update({
      where: { id: primary.userId },
      data: { lastSeenAt: new Date() },
      select: { avatarUrl: true },
    }).catch(() => null)
    avatarUrl = user?.avatarUrl ?? null
  } else if (primary?.kind === 'teacher') {
    const identity = await prisma.teacherIdentity.update({
      where: { id: primary.teacherIdentityId },
      data: { lastSeenAt: new Date() },
      select: { avatarUrl: true },
    }).catch(() => null)
    avatarUrl = identity?.avatarUrl ?? null
  }

  return NextResponse.json({ primary, subject, avatarUrl })
}
