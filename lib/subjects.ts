// Materias / secciones de la revista — departamento de Ciencias Exactas y Naturales.
// Fuente única de verdad para seed, UI y validación.

export interface SubjectDef {
  slug: string
  label: string
  color: string
  // username de la cuenta compartida de materia (login de profesores), ej. "fisica"
  username: string
}

export const SUBJECTS: SubjectDef[] = [
  { slug: 'matematica', label: 'Matemática', color: '#B8860B', username: 'matematica' },
  { slug: 'quimica', label: 'Química', color: '#C8102E', username: 'quimica' },
  { slug: 'fisica', label: 'Física', color: '#1A4A8A', username: 'fisica' },
  { slug: 'ciencias-de-la-tierra', label: 'Cs. de la Tierra', color: '#2D6A2D', username: 'tierra' },
  { slug: 'biologia', label: 'Biología', color: '#7A3B8C', username: 'biologia' },
]

export const CATEGORIES: Record<string, { label: string; color: string }> = Object.fromEntries(
  SUBJECTS.map(s => [s.slug, { label: s.label, color: s.color }])
)
