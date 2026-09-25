// Configuracion del sitio que NO depende del host. El host (`site`) se resuelve en
// astro.config.mjs desde el entorno; aqui vive lo demas.
import { STRINGS } from './strings'

export const SITIO = {
  siteName: 'MetrilabCL Ebooks',
  publisherName: 'MetrilabCL',
  // siteLang selecciona la tabla de cadenas de src/lib/strings.ts (es | en) y el atributo lang
  // del chrome. EN por la demanda medida por RADAR (MET-150) y la especificacion de FORJA
  // (MET-152 §6). Book.inLanguage NO se toca aqui: sale del campo Language de cada ficha.
  siteLang: 'en' as const,
  catalogPathSegment: 'libros',
  authorPathSegment: 'autor',
  buildRef: 'MET-158 (Astro) · contenido MET-156 (FORJA MET-152 / NEXUS MET-151 / LUPA MET-153)',
}

// Un siteLang sin tabla de cadenas dejaria la plantilla a medio traducir sin avisar.
if (!STRINGS[SITIO.siteLang]) {
  throw new Error(
    `siteLang "${SITIO.siteLang}" no tiene tabla de cadenas en src/lib/strings.ts ` +
      `(disponibles: ${Object.keys(STRINGS).join(', ')})`,
  )
}

export const S = STRINGS[SITIO.siteLang]

/** URL absoluta de una ruta del sitio, derivada de `site`. Nunca se concatena a mano. */
export function absoluta(ruta: string, site: URL | undefined): string {
  if (!site) throw new Error('Astro.site no esta definido: falta `site` en astro.config.mjs')
  return new URL(ruta, site).href
}

const MESES_INDEX = 1

/** Fecha legible en el idioma del sitio, desde un YYYY-MM-DD. */
export function fecha(iso: string): string {
  const [y, m, d] = String(iso).split('-').map(Number)
  if (!y || !m || !d || m < MESES_INDEX || m > 12) throw new Error(`fecha no parseable: "${iso}"`)
  return S.fecha(y, m, d)
}

/** Fecha y hora UTC legibles, desde un ISO-8601 UTC. */
export function fechaHora(iso: string): string {
  return `${fecha(String(iso).slice(0, 10))}, ${String(iso).slice(11, 16)} UTC`
}

/** Idioma del TEXTO del titulo: el suyo si se declaro distinto, si no el del libro. Devuelve
 *  undefined cuando el idioma no se ha medido (ficha declarada): sin dato no se emite atributo
 *  lang, en vez de afirmar un idioma que nadie leyo. */
export function idiomaDelTitulo(b: { titleLanguageCode?: string; languageCode?: string }): string | undefined {
  return b.titleLanguageCode || b.languageCode
}
