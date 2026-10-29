import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const EXAMPLE = `Reacciones de oxidación en la vida cotidiana

[descripcion]
Desde el óxido en un clavo hasta la combustión en un motor, las reacciones de oxidación están en todos lados. Acá explicamos cómo funcionan y por qué importan.
[/descripcion]

## ¿Qué es una oxidación?

Una reacción de oxidación ocurre cuando una sustancia pierde electrones...

### Un ejemplo cotidiano

El óxido del hierro es el caso más conocido.

> "La oxidación no es más que una pérdida de electrones" — definición clásica de química.

Algunos ejemplos comunes:
- El hierro oxidándose con la humedad
- La combustión de un fósforo
- El oscurecimiento de una manzana cortada

**En resumen**, la oxidación es un proceso *fundamental* en química y en la vida diaria.`

function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      background: 'var(--ivd-black)', color: '#e8e8e8', padding: '1.25rem',
      borderRadius: 10, fontSize: '0.82rem', lineHeight: 1.7, overflowX: 'auto',
      fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap',
    }}>
      {children}
    </pre>
  )
}

export default function GuiaFormatoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 100, paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.25rem' }}>
        <Link href="/publicar" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ivd-red)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={15} /> Volver a Publicar
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--ivd-black)', marginBottom: '0.5rem' }}>
          Formato para subir un artículo desde Word o PDF
        </h1>
        <p style={{ color: 'var(--ivd-gray-mid)', marginBottom: '2rem' }}>
          Si escribís tu informe en Word (o cualquier editor) y lo exportás como <code>.docx</code> o <code>.pdf</code>,
          seguí esta estructura para que la revista detecte automáticamente el título, la descripción y el contenido.
          Después de subirlo vas a poder revisar y corregir todo antes de enviarlo.
        </p>

        <Section title="1. Título">
          La <strong>primera línea</strong> del documento es el título del artículo. No hace falta ningún marcador especial, pero tiene que ser la primera línea con texto.
        </Section>

        <Section title="2. Descripción (obligatoria)">
          Justo después del título, un bloque envuelto en <code>[descripcion]</code> y <code>[/descripcion]</code>. Es el resumen corto que aparece en las tarjetas de la revista — entre 1 y 3 oraciones.
        </Section>

        <Section title="3. Contenido">
          Todo lo que sigue es el cuerpo del artículo. Podés usar esta sintaxis:
          <ul style={{ marginTop: 10, paddingLeft: '1.3rem', lineHeight: 1.9 }}>
            <li><code>## Subtítulo</code> — para una sección nueva</li>
            <li><code>### Sub-subtítulo</code> — para una división más chica</li>
            <li><code>**negrita**</code> y <code>*cursiva*</code></li>
            <li><code>&gt; una cita</code> — para citas textuales</li>
            <li><code>- un ítem</code> — para listas</li>
            <li><code>1. un ítem</code> — para listas numeradas</li>
          </ul>
        </Section>

        <Section title="Ejemplo completo">
          <CodeBlock>{EXAMPLE}</CodeBlock>
        </Section>

        <Section title="Cosas a tener en cuenta">
          <ul style={{ paddingLeft: '1.3rem', lineHeight: 1.9 }}>
            <li>La <strong>materia</strong> (Física, Química, etc.) no se detecta del documento — la elegís vos en el formulario después de subirlo.</li>
            <li>Si el documento es un PDF escaneado (una foto convertida a PDF, sin texto real seleccionable), no se puede extraer el texto — tiene que ser un PDF con texto.</li>
            <li>Las imágenes dentro del Word/PDF no se importan todavía — si tu artículo las necesita, agregalas después de publicarlo.</li>
            <li>Siempre vas a poder editar cualquier campo detectado antes de enviar el artículo a revisión.</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', border: '1px solid var(--ivd-gray)', marginBottom: '1.25rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--ivd-black)', marginBottom: '0.6rem' }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.9rem', color: 'var(--ivd-gray-dark)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}
