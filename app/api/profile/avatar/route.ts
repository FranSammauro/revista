import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPrimarySession } from '@/lib/session'
import { writeFile, unlink, mkdir } from 'node:fs/promises'
import path from 'node:path'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

// Devuelve { currentAvatarUrl, save } donde save(url) actualiza el registro
// correcto (User o TeacherIdentity) según el tipo de sesión.
async function resolveAccount(session: NonNullable<Awaited<ReturnType<typeof getPrimarySession>>>) {
  if (session.kind === 'user') {
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return null
    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
      return { blocked: `Tu cuenta está suspendida hasta el ${user.suspendedUntil.toLocaleDateString('es-AR')} y no podés cambiar la foto de perfil.` } as const
    }
    return {
      id: user.id,
      currentAvatarUrl: user.avatarUrl,
      save: (avatarUrl: string | null) => prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl, avatarRemovedAt: null, avatarRemovedBy: null },
      }),
    } as const
  }

  const identity = await prisma.teacherIdentity.findUnique({ where: { id: session.teacherIdentityId } })
  if (!identity) return null
  return {
    id: identity.id,
    currentAvatarUrl: identity.avatarUrl,
    save: (avatarUrl: string | null) => prisma.teacherIdentity.update({
      where: { id: identity.id },
      data: { avatarUrl, avatarRemovedAt: null, avatarRemovedBy: null },
    }),
  } as const
}

export async function POST(req: NextRequest) {
  const session = await getPrimarySession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const account = await resolveAccount(session)
  if (!account) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if ('blocked' in account) return NextResponse.json({ error: account.blocked }, { status: 403 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('avatar')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Formato no permitido. Usá PNG, JPG o WEBP.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'La imagen no puede pesar más de 2 MB.' }, { status: 400 })

  await mkdir(UPLOAD_DIR, { recursive: true })

  const filename = `${account.id}-${Date.now()}.${ext}`
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, filename), bytes)

  if (account.currentAvatarUrl?.startsWith('/uploads/avatars/')) {
    await unlink(path.join(process.cwd(), 'public', account.currentAvatarUrl)).catch(() => {})
  }

  const avatarUrl = `/uploads/avatars/${filename}`
  await account.save(avatarUrl)

  return NextResponse.json({ ok: true, avatarUrl })
}

export async function DELETE() {
  const session = await getPrimarySession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const account = await resolveAccount(session)
  if (!account) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if ('blocked' in account) return NextResponse.json({ error: account.blocked }, { status: 403 })

  if (account.currentAvatarUrl?.startsWith('/uploads/avatars/')) {
    await unlink(path.join(process.cwd(), 'public', account.currentAvatarUrl)).catch(() => {})
  }
  await account.save(null)

  return NextResponse.json({ ok: true })
}
