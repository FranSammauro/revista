import { redirect } from 'next/navigation'
import { getPrimarySession } from '@/lib/session'
import { getOwnArticles } from '@/lib/articles'
import MisArticulosClient from '@/components/MisArticulosClient'

export default async function MisArticulosPage() {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') redirect('/login?next=/mis-articulos')

  const articles = await getOwnArticles(session.userId)
  return <MisArticulosClient articles={articles} />
}
