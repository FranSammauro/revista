import { NextResponse } from 'next/server'
import { clearPrimarySession } from '@/lib/session'

export async function POST() {
  await clearPrimarySession()
  return NextResponse.json({ ok: true })
}
