import { NextRequest, NextResponse } from 'next/server'
import { getPrimarySession } from '@/lib/session'
import { parseArticleText, extractTextFromDocx, extractTextFromPdf } from '@/lib/document-parser'

export const maxDuration = 30

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const PDF_MIME = 'application/pdf'

// Recibe un .docx o .pdf, extrae el texto y lo parsea según la sintaxis de
// [descripcion]...[/descripcion]. NO crea el artículo — devuelve los campos
// detectados para que el usuario los revise/edite en el formulario normal
// de /publicar antes de enviarlo a revisión.
export async function POST(req: NextRequest) {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const form = await req.formData().catch(() => null)
  const file = form?.get('document')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'El archivo no puede pesar más de 8 MB.' }, { status: 400 })
  }

  const isDocx = file.type === DOCX_MIME || file.name.toLowerCase().endsWith('.docx')
  const isPdf = file.type === PDF_MIME || file.name.toLowerCase().endsWith('.pdf')
  if (!isDocx && !isPdf) {
    return NextResponse.json({ error: 'Solo se aceptan archivos .docx o .pdf' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let rawText: string
  try {
    rawText = isDocx ? await extractTextFromDocx(buffer) : await extractTextFromPdf(buffer)
  } catch (err) {
    console.error('Error extrayendo texto del documento:', err)
    return NextResponse.json({
      error: 'No se pudo leer el archivo. Verificá que no esté dañado o protegido con contraseña.',
    }, { status: 422 })
  }

  if (!rawText || !rawText.trim()) {
    return NextResponse.json({
      error: 'El documento no tiene texto detectable (¿es un PDF escaneado/una imagen?). Por ahora no se puede extraer texto de documentos escaneados.',
    }, { status: 422 })
  }

  const parsed = parseArticleText(rawText)
  return NextResponse.json({ ok: true, ...parsed })
}
