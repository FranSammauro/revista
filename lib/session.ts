import 'server-only'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'

const SECRET = process.env.SESSION_SECRET
if (!SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('Falta SESSION_SECRET en las variables de entorno')
}
const SECRET_KEY = SECRET || 'dev-only-insecure-secret-change-me'

const USER_COOKIE = 'ivd_session'
const SUBJECT_COOKIE = 'ivd_subject_session'

// -----------------------------------------------------------------------
// Sesión de usuario (alumno / admin) o de identidad personal de profesor
// -----------------------------------------------------------------------

export interface UserSessionPayload {
  kind: 'user'
  userId: string
  role: Role
  displayName: string
}

export interface TeacherSessionPayload {
  kind: 'teacher'
  teacherIdentityId: string
  email: string
  displayName: string
}

export type PrimarySessionPayload = UserSessionPayload | TeacherSessionPayload

export async function setPrimarySession(payload: PrimarySessionPayload) {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' })
  const store = await cookies()
  store.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function getPrimarySession(): Promise<PrimarySessionPayload | null> {
  const store = await cookies()
  const raw = store.get(USER_COOKIE)?.value
  if (!raw) return null
  try {
    return jwt.verify(raw, SECRET_KEY) as PrimarySessionPayload
  } catch {
    return null
  }
}

export async function clearPrimarySession() {
  const store = await cookies()
  store.delete(USER_COOKIE)
}

// -----------------------------------------------------------------------
// Sesión de "cuenta de materia" activa (ej. "Física"). Se suma por arriba
// de la sesión personal del profesor; no la reemplaza.
// -----------------------------------------------------------------------

export interface SubjectSessionPayload {
  kind: 'subject'
  subjectAccountId: string
  subjectSlug: string
  subjectLabel: string // ej. "Física" — para mostrar en la UI sin otra consulta
  username: string
  // quién activó esta sesión, para el log de auditoría de cada acción
  actingTeacherIdentityId: string
  actingTeacherEmail: string
}

export async function setSubjectSession(payload: SubjectSessionPayload) {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' })
  const store = await cookies()
  store.set(SUBJECT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function getSubjectSession(): Promise<SubjectSessionPayload | null> {
  const store = await cookies()
  const raw = store.get(SUBJECT_COOKIE)?.value
  if (!raw) return null
  try {
    return jwt.verify(raw, SECRET_KEY) as SubjectSessionPayload
  } catch {
    return null
  }
}

export async function clearSubjectSession() {
  const store = await cookies()
  store.delete(SUBJECT_COOKIE)
}
