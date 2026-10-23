import 'server-only'
import { getPrimarySession, type UserSessionPayload } from './session'

/** Devuelve la sesión si es un User con rol ADMIN, o null si no. */
export async function requireAdmin(): Promise<UserSessionPayload | null> {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user' || session.role !== 'ADMIN') return null
  return session
}
