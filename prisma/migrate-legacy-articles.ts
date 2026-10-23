// Migra los artículos viejos de content/articulos/*.mdx a la base de datos,
// como artículos PUBLICADOS. Se corre una sola vez (es seguro re-correrlo:
// si el slug ya existe en la DB, lo salta).
//
// Uso: npm run migrate:legacy
//
// Los .mdx viejos tienen un campo "author" en texto libre (ej. "Lic. Astrid
// Uhlenburg") que no corresponde a ningún alumno real registrado. Como todo
// Article necesita un authorId de un User real, se crea un User "archivo"
// por cada nombre de autor distinto que aparezca (cuentas que nunca inician
// sesión, solo existen para que el artículo tenga a quién atribuirse).
import { PrismaClient } from '@prisma/client'
import matter from 'gray-matter'
import fs from 'node:fs'
import path from 'node:path'
import { hashPassword, randomPassword } from '../lib/password'

const prisma = new PrismaClient()
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articulos')

function slugifyAuthorEmail(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `archivo.${base}@institutoverbodivino.edu.ar`
}

async function getOrCreateLegacyAuthor(name: string) {
  const email = slugifyAuthorEmail(name)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing

  return prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(randomPassword()), // nunca se usa para loguearse
      displayName: name,
      role: 'ALUMNO',
      isInstitutional: true,
      emailVerified: true,
    },
  })
}

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log(`No existe ${ARTICLES_DIR} — nada para migrar.`)
    return
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'))
  console.log(`Encontrados ${files.length} artículos viejos.`)

  let migrated = 0
  let skipped = 0

  for (const file of files) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
    const { data, content } = matter(raw)

    const slug: string = data.slug || file.replace(/\.mdx$/, '')

    const alreadyExists = await prisma.article.findUnique({ where: { slug } })
    if (alreadyExists) {
      console.log(`  - ${slug}: ya existe, se salta.`)
      skipped++
      continue
    }

    const subject = await prisma.subject.findUnique({ where: { slug: data.category } })
    if (!subject) {
      console.warn(`  ⚠️  ${slug}: categoría "${data.category}" no existe como materia, se salta.`)
      skipped++
      continue
    }

    const author = await getOrCreateLegacyAuthor(data.author || 'Archivo IVD')

    await prisma.article.create({
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        content: content.trim(),
        coverColor: data.coverColor || subject.color,
        readTime: data.readTime || 5,
        featured: !!data.featured,
        status: 'PUBLICADO',
        authorId: author.id,
        subjectId: subject.id,
        reviewedBy: 'archivo',
        reviewedAt: data.date ? new Date(data.date) : new Date(),
        publishedAt: data.date ? new Date(data.date) : new Date(),
      },
    })

    console.log(`  ✓ ${slug}`)
    migrated++
  }

  console.log(`\nListo: ${migrated} migrados, ${skipped} salteados.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
