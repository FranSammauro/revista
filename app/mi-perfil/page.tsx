import { redirect } from 'next/navigation'
import { getPrimarySession } from '@/lib/session'
import PerfilClient from '@/components/PerfilClient'

export default async function MiPerfilPage() {
  const session = await getPrimarySession()
  // Tanto alumnos/admin (kind 'user') como profesores (kind 'teacher')
  // tienen su propio perfil — cada uno con los permisos que le corresponden.
  if (!session) redirect('/login?next=/mi-perfil')

  return <PerfilClient />
}
