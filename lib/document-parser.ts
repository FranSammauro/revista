import 'server-only'

// -----------------------------------------------------------------------
// Convierte un .docx o .pdf subido por el usuario en los 3 campos que
// necesita un artículo (título, descripción, contenido), siguiendo una
// sintaxis de texto plano fija — ver la guía que se le muestra al usuario
// en /publicar. La misma lógica de parseo se usa para ambos formatos: la
// extracción de texto difiere (mammoth para .docx, pdf-parse para .pdf),
// pero una vez que tenemos el texto plano, las reglas son idénticas.
// -----------------------------------------------------------------------

export interface ParsedArticle {
  title: string
  excerpt: string
  content: string
  warnings: string[]
}

const DESCRIPTION_BLOCK = /\[descripcion\]([\s\S]*?)\[\/descripcion\]/i

export function parseArticleText(rawText: string): ParsedArticle {
  const warnings: string[] = []

  // Normalizamos saltos de línea y sacamos líneas vacías de más.
  const text = rawText.replace(/\r\n/g, '\n').trim()
  const lines = text.split('\n')

  // Título: primera línea no vacía.
  let titleLineIndex = lines.findIndex(l => l.trim().length > 0)
  if (titleLineIndex === -1) titleLineIndex = 0
  const title = (lines[titleLineIndex] || '').trim()
  if (!title) warnings.push('No se detectó un título — revisá que la primera línea del documento no esté vacía.')

  // Descripción: bloque [descripcion]...[/descripcion], en cualquier parte.
  const descMatch = text.match(DESCRIPTION_BLOCK)
  const excerpt = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : ''
  if (!excerpt) {
    warnings.push('No se encontró el bloque [descripcion]...[/descripcion] — completá la descripción a mano antes de enviar.')
  } else if (excerpt.length < 10) {
    warnings.push('La descripción detectada es muy corta — convendría ampliarla.')
  } else if (excerpt.length > 280) {
    warnings.push('La descripción detectada es muy larga (más de 280 caracteres) — se recortó automáticamente, revisala.')
  }

  // Contenido: todo el texto MENOS la línea del título y el bloque de
  // descripción (con sus marcadores).
  let content = lines.filter((_, i) => i !== titleLineIndex).join('\n')
  content = content.replace(DESCRIPTION_BLOCK, '').trim()
  // Colapsamos 3+ saltos de línea seguidos (quedan huecos al sacar el
  // bloque de descripción del medio del texto).
  content = content.replace(/\n{3,}/g, '\n\n')

  if (!content || content.length < 50) {
    warnings.push('El contenido detectado es muy corto — revisá que el documento tenga el cuerpo del artículo después del bloque de descripción.')
  }

  return {
    title,
    excerpt: excerpt.slice(0, 280),
    content,
    warnings,
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse no tiene build ESM prolijo — se importa así para evitar que
  // intente cargar sus archivos de prueba en tiempo de build.
  const pdfParse = (await import('pdf-parse')).default
  const result = await pdfParse(buffer)
  return result.text
}
