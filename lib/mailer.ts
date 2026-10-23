import 'server-only'
import nodemailer from 'nodemailer'

// Configuración SMTP vía variables de entorno. Ver .env.example.
// En desarrollo, si no hay SMTP configurado, los mails se loguean
// por consola en vez de enviarse (para poder probar el flujo sin
// credenciales reales).
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const MAIL_FROM = process.env.MAIL_FROM || 'Revista IVD <no-reply@institutoverbodivino.edu.ar>'

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null

async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!transporter) {
    // Modo desarrollo sin SMTP configurado: no rompe el flujo, solo avisa.
    console.log(`\n[mailer] (SMTP no configurado, mail no enviado realmente)\nPara: ${to}\nAsunto: ${subject}\n${text}\n`)
    return
  }
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html, text })
}

export async function sendVerificationCodeEmail(to: string, displayName: string, code: string) {
  const subject = 'Revista IVD — Código de verificación'
  const text = `Hola ${displayName},\n\nTu código de verificación es: ${code}\n\nExpira en 30 minutos. Si no solicitaste este código, ignorá este mail.`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Revista IVD</h2>
      <p>Hola ${escapeHtml(displayName)},</p>
      <p>Tu código de verificación es:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>Expira en 30 minutos. Si no solicitaste este código, ignorá este mail.</p>
    </div>`
  await sendMail(to, subject, html, text)
}

export async function sendTeacherAccessLinkEmail(to: string, displayName: string, subjectLabel: string, accessUrl: string) {
  const subject = `Revista IVD — Acceso a cuenta de ${subjectLabel}`
  const text = `Hola ${displayName},\n\nSolicitaste acceso a la cuenta compartida de ${subjectLabel}.\nIngresá con este link (válido por 1 hora, un solo uso):\n${accessUrl}\n\nSi no fuiste vos, ignorá este mail.`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Revista IVD</h2>
      <p>Hola ${escapeHtml(displayName)},</p>
      <p>Solicitaste acceso a la cuenta compartida de <strong>${escapeHtml(subjectLabel)}</strong>.</p>
      <p><a href="${accessUrl}" style="display:inline-block;background:#C8102E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Ingresar a ${escapeHtml(subjectLabel)}</a></p>
      <p style="color:#666;font-size:13px">Este link es válido por 1 hora y solo puede usarse una vez. Si no fuiste vos quien lo solicitó, ignorá este mail.</p>
    </div>`
  await sendMail(to, subject, html, text)
}

export async function sendArticleReviewedEmail(
  to: string,
  displayName: string,
  articleTitle: string,
  status: 'PUBLICADO' | 'RECHAZADO' | 'POSPUESTO',
  reviewComment?: string | null
) {
  const statusLabel = { PUBLICADO: 'aprobado y publicado', RECHAZADO: 'rechazado', POSPUESTO: 'pospuesto' }[status]
  const subject = `Revista IVD — Tu artículo fue ${statusLabel}`
  const commentBlock = reviewComment ? `\n\nComentario del/la docente:\n${reviewComment}` : ''
  const text = `Hola ${displayName},\n\nTu artículo "${articleTitle}" fue ${statusLabel}.${commentBlock}`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2>Revista IVD</h2>
      <p>Hola ${escapeHtml(displayName)},</p>
      <p>Tu artículo <strong>${escapeHtml(articleTitle)}</strong> fue <strong>${statusLabel}</strong>.</p>
      ${reviewComment ? `<p style="background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(reviewComment)}</p>` : ''}
    </div>`
  await sendMail(to, subject, html, text)
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
