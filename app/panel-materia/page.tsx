import { redirect } from 'next/navigation'
import { getSubjectSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import PanelMateriaClient from '@/components/PanelMateriaClient'

export default async function PanelMateriaPage() {
  const session = await getSubjectSession()
  if (!session) redirect('/panel-materia/entrar')

  const account = await prisma.subjectAccount.findUnique({ where: { id: session.subjectAccountId } })
  if (account?.mustChangePassword) redirect('/panel-materia/nueva-contrasena')

  const subject = await prisma.subject.findUnique({ where: { slug: session.subjectSlug } })

  return <PanelMateriaClient subjectLabel={subject?.label || session.subjectSlug} username={session.username} />
}
