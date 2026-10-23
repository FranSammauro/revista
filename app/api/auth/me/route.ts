import { NextResponse } from 'next/server'
import { getPrimarySession, getSubjectSession } from '@/lib/session'

export async function GET() {
  const primary = await getPrimarySession()
  const subject = await getSubjectSession()
  return NextResponse.json({ primary, subject })
}
