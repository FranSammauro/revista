import { NextResponse } from 'next/server'
import { getPrimarySession } from '@/lib/session'
import { getOwnArticles } from '@/lib/articles'

export async function GET() {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const articles = await getOwnArticles(session.userId)
  return NextResponse.json({ articles })
}
