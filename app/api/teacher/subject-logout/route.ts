import { NextResponse } from 'next/server'
import { clearSubjectSession } from '@/lib/session'

export async function POST() {
  await clearSubjectSession()
  return NextResponse.json({ ok: true })
}
