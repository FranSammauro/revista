import { PrismaClient } from '@prisma/client'
import { SUBJECTS } from '../lib/subjects'
import { hashPassword } from '../lib/password'

const prisma = new PrismaClient()

async function main() {
  // Materias + cuenta compartida por materia
  for (const s of SUBJECTS) {
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { label: s.label, color: s.color },
      create: { slug: s.slug, label: s.label, color: s.color },
    })

    await prisma.subjectAccount.upsert({
      where: { subjectId: subject.id },
      update: {},
      create: {
        subjectId: subject.id,
        username: s.username,
        passwordHash: null,
        mustChangePassword: true,
      },
    })
  }

  // Admin del desarrollador — cambiar el mail/clave acá antes de ir a producción,
  // o hacerlo vía variables de entorno ADMIN_EMAIL / ADMIN_PASSWORD.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@institutoverbodivino.edu.ar'
  const adminPassword = process.env.ADMIN_PASSWORD || 'cambiar-esta-password'

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      displayName: 'Administrador',
      role: 'ADMIN',
      isInstitutional: true,
      emailVerified: true,
    },
  })

  console.log('Seed completo. Materias:', SUBJECTS.map(s => s.slug).join(', '))
  console.log(`Admin: ${adminEmail} (si no seteaste ADMIN_PASSWORD, la default es "cambiar-esta-password" — cambiala)`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
