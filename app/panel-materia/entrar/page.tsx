import { redirect } from 'next/navigation'
import { getPrimarySession } from '@/lib/session'
import EntrarMateriaClient from '@/components/EntrarMateriaClient'

// El profesor ya tiene su sesión personal (logueado con mail institucional
// docente) pero todavía no activó la sesión de ninguna cuenta de materia.
export default async function EntrarMateriaPage() {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'teacher') redirect('/login')

  return <EntrarMateriaClient />
}
