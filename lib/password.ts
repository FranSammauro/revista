// Nota: a propósito SIN 'import server-only' acá. Esta lib la usan tanto
// las rutas de API (donde 'server-only' no hace falta — una Route Handler
// nunca se puede colar en un bundle de cliente) como los scripts sueltos
// prisma/seed.ts y prisma/migrate-legacy-articles.ts, que corren con tsx
// por fuera del build de Next. 'server-only' depende de un reemplazo
// especial que hace el bundler de Next para convertirse en un módulo
// vacío; sin ese bundler (como al correr tsx directo) el paquete tira
// error siempre, rompiendo cualquier script que importe esta lib.
import bcrypt from 'bcryptjs'
// Import explícito del módulo nativo de Node en vez de depender del global
// `crypto` (Web Crypto). El global existe sin flags recién desde Node 19+
// (estable desde Node 20) — usar node:crypto directamente evita que esto
// se rompa en silencio si el servidor corre una versión de Node más vieja.
import { randomBytes, randomInt } from 'node:crypto'

const SALT_ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function randomPassword(length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length]
  return out
}

export function randomToken(length = 48): string {
  return randomBytes(length).toString('hex')
}

export function randomSixDigitCode(): string {
  // randomInt es criptográficamente seguro y, a diferencia de un módulo
  // sobre bytes aleatorios, no tiene sesgo de distribución.
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}
