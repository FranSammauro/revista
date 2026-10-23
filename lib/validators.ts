// Reglas de validación de mail institucional.
//
// Nota importante: el formato "nombre.apellido" vs "apellido.nombre" no se
// puede distinguir con una regex (ambos son "palabra.palabra@dominio") —
// la regex solo confirma que el mail tiene la sintaxis institucional.
// - Para ALUMNOS, eso alcanza: cualquier mail con esta sintaxis del dominio
//   institucional habilita publicar.
// - Para PROFESORES, la sintaxis es necesaria pero no suficiente: además
//   tiene que estar en la whitelist dinámica (TeacherWhitelistEntry).

const INSTITUTIONAL_DOMAIN = 'institutoverbodivino.edu.ar'

// apellido.nombre@institutoverbodivino.edu.ar  (o nombre.apellido, mismo patrón)
// Letras (con acentos/ñ), guiones y apóstrofes para apellidos compuestos.
const INSTITUTIONAL_EMAIL_REGEX = new RegExp(
  `^[a-záéíóúñü]+(?:-[a-záéíóúñü]+)*\\.[a-záéíóúñü]+(?:-[a-záéíóúñü]+)*@${INSTITUTIONAL_DOMAIN.replace('.', '\\.')}$`,
  'i'
)

const GENERIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isInstitutionalEmailFormat(email: string): boolean {
  return INSTITUTIONAL_EMAIL_REGEX.test(email.trim())
}

export function isValidEmailFormat(email: string): boolean {
  return GENERIC_EMAIL_REGEX.test(email.trim())
}

/**
 * A partir de un mail institucional con formato "apellido.nombre" genera
 * "Nombre Apellido" para mostrar como nombre del alumno.
 * (Si el mail tiene formato "nombre.apellido" el resultado queda invertido
 * a la inversa — ver nota en el módulo: no se puede distinguir el orden
 * solo con el mail, así que esto se usa únicamente para ALUMNOS, donde
 * se les pide confirmar/corregir el nombre generado antes de guardarlo.)
 */
export function displayNameFromInstitutionalEmail(email: string): string {
  const local = email.trim().split('@')[0]
  const [first, second] = local.split('.')
  const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
  // apellido.nombre -> "Nombre Apellido"
  return `${cap(second)} ${cap(first)}`.trim()
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export const INSTITUTIONAL_EMAIL_DOMAIN = INSTITUTIONAL_DOMAIN
