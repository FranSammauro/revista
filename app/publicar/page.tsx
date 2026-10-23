import { redirect } from 'next/navigation'
import { getPrimarySession } from '@/lib/session'
import PublicarClient from '@/components/PublicarClient'

export default async function PublicarPage() {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') redirect('/login?next=/publicar')

  return (
    <PublicarClient
      user={{ displayName: session.displayName, role: session.role }}
    />
  )
}
