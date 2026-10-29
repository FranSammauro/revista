import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// "En línea" es una aproximación simple: consideramos que alguien está en
// línea si tuvo actividad (cualquier llamada a /api/auth/me, que se dispara
// en cada carga de página) en los últimos 2 minutos. No es presencia en
// tiempo real vía WebSocket, pero para una revista escolar alcanza y sobra
// sin la complejidad de mantener conexiones abiertas.
const ONLINE_WINDOW_MS = 2 * 60 * 1000

// Perfil público de un alumno/admin — lo que cualquiera puede ver al hacer
// click en un comentario (estilo "vista previa de perfil" de Discord).
// A propósito NO incluye mail, estado de suspensión, ni nada sensible.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, displayName: true, avatarUrl: true, bio: true,
      instagramHandle: true, role: true, lastSeenAt: true, createdAt: true,
    },
  })
  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const isOnline = !!user.lastSeenAt && Date.now() - user.lastSeenAt.getTime() < ONLINE_WINDOW_MS

  return NextResponse.json({
    profile: {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      instagramHandle: user.instagramHandle,
      role: user.role,
      isOnline,
      memberSince: user.createdAt,
    },
  })
}
