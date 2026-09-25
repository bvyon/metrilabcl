#!/usr/bin/env node
// Generador estatico del hub de ebooks de MetrilabCL.
//
// Contrato de entrada:
//   site.config.json  -> { baseUrl, siteName, siteLang, publisherName, catalogPathSegment,
//                          authorPathSegment }
//   author.json       -> entidad del autor (pagina /<authorPathSegment>/), ver README
//   data/<slug>.json  -> un archivo por titulo medido (ver README)
//   env SITE_BASE_URL / VERCEL_PROJECT_PRODUCTION_URL -> host del sitio, ver resolveBaseUrl()
// Contrato de salida:
//   dist/index.html, dist/404.html, dist/<catalogPathSegment>/<slug>/index.html,
//   dist/<authorPathSegment>/index.html, dist/sitemap.xml, dist/robots.txt,
//   dist/assets/styles.css
// Exit codes: 0 build correcto. 1 dato de entrada invalido o invariante roto (falla ruidosa).
//
// Regla de la casa: nunca emitir una pagina a medias ni un campo vacio en silencio.
// Si un campo requerido falta, el build muere con el archivo y el campo en el mensaje.
//
// Especificacion implementada: FORJA MET-152 (arquitectura de 4 paginas, chrome en ingles,
// CTA a Amazon), NEXUS MET-151 (JSON-LD que procede / que seria falso), LUPA MET-153
// (CTA de un clic, prueba social nominal o ninguna, cero JS).

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { STRINGS } from './strings.mjs'

// MLE_ROOT permite apuntar el generador a otro arbol (lo usa src/selftest.mjs con fixtures).
const ROOT = process.env.MLE_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const BUILT_AT = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

const errors = []
const fail = (msg) => errors.push(msg)

function die() {
  if (!errors.length) return
  console.error(`\nBUILD FALLIDO — ${errors.length} problema(s):`)
  for (const e of errors) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

// ---------- config ----------

// Resuelve el host del sitio. El orden importa y la fuente elegida se imprime en el log del
// build: en el log de Vercel se lee que el canonical quedo bien sin abrir el HTML.
//
//   1. SITE_BASE_URL              env explicita, gana siempre (override manual del Board).
//   2. VERCEL_PROJECT_PRODUCTION_URL  la inyecta Vercel. Documentacion de Vercel, "System
//      environment variables", leida el 2026-09-25: "A production domain name of the project.
//      We select the shortest production custom domain, or vercel.app domain if no custom
//      domain is available. Note, that this is always set, even in preview deployments."
//      Justo lo que queremos: un preview NO emite un canonical hacia si mismo.
//      Viene sin esquema ("my-site.com"), asi que se le antepone https://.
//   3. site.config.json baseUrl   ultimo recurso, para `npm run build` en local y para el CI.
//
// Guardia: si estamos dentro de un build de Vercel (env VERCEL) y hemos tenido que caer al
// valor 3, el build MUERE. Preferimos un despliegue rojo a un canonical inventado en produccion.
function resolveBaseUrl(cfgBaseUrl) {
  const env = (n) => (typeof process.env[n] === 'string' && process.env[n].trim() ? process.env[n].trim() : null)

  const site = env('SITE_BASE_URL')
  if (site) return { baseUrl: site, fuente: 'SITE_BASE_URL' }

  const prod = env('VERCEL_PROJECT_PRODUCTION_URL')
  if (prod) return { baseUrl: `https://${prod.replace(/^https?:\/\//, '')}`, fuente: 'VERCEL_PROJECT_PRODUCTION_URL' }

  if (env('VERCEL')) {
    console.error('\nBUILD FALLIDO — build de Vercel (VERCEL=' + env('VERCEL') + ') sin host que usar:')
    console.error('  - SITE_BASE_URL no esta definida')
    console.error('  - VERCEL_PROJECT_PRODUCTION_URL no esta definida (Project Settings >')
    console.error('    Environment Variables > "Enable access to System Environment Variables")')
    console.error(`  El baseUrl de site.config.json ("${cfgBaseUrl}") es solo para builds locales:`)
    console.error('  emitirlo en produccion pondria un canonical falso en cada pagina.')
    console.error('  Define SITE_BASE_URL en el proyecto de Vercel o habilita las variables de sistema.\n')
    process.exit(1)
  }
  return { baseUrl: cfgBaseUrl, fuente: 'site.config.json baseUrl' }
}

function loadConfig() {
  const p = join(ROOT, 'site.config.json')
  if (!existsSync(p)) {
    console.error(`BUILD FALLIDO — falta ${p}`)
    process.exit(1)
  }
  let cfg
  try {
    cfg = JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    console.error(`BUILD FALLIDO — site.config.json no es JSON valido: ${e.message}`)
    process.exit(1)
  }
  for (const k of ['baseUrl', 'siteName', 'siteLang', 'publisherName', 'catalogPathSegment', 'authorPathSegment']) {
    if (typeof cfg[k] !== 'string' || !cfg[k].trim()) fail(`site.config.json: falta o esta vacio "${k}"`)
  }
  die()
  // El host puede venir del entorno; la validacion es la misma venga de donde venga, y el
  // mensaje de error nombra la fuente para que se pueda corregir donde toca.
  const resuelto = resolveBaseUrl(cfg.baseUrl)
  cfg.baseUrl = resuelto.baseUrl
  cfg.baseUrlFuente = resuelto.fuente
  if (!/^https:\/\/[^\s/]+(\/[^\s]*)?$/.test(cfg.baseUrl)) {
    fail(`${cfg.baseUrlFuente}: baseUrl debe ser una URL https absoluta, recibido "${cfg.baseUrl}"`)
  }
  if (cfg.baseUrl.endsWith('/')) {
    fail(`${cfg.baseUrlFuente}: baseUrl no debe terminar en "/", recibido "${cfg.baseUrl}"`)
  }
  for (const k of ['catalogPathSegment', 'authorPathSegment']) {
    if (!/^[a-z0-9-]+$/.test(cfg[k])) {
      fail(`site.config.json: ${k} debe ser [a-z0-9-]+, recibido "${cfg[k]}"`)
    }
  }
  if (cfg.catalogPathSegment === cfg.authorPathSegment) {
    fail('site.config.json: catalogPathSegment y authorPathSegment no pueden ser el mismo segmento')
  }
  // Un siteLang sin tabla de cadenas dejaria la plantilla a medio traducir sin avisar.
  if (!STRINGS[cfg.siteLang]) {
    fail(`site.config.json: siteLang "${cfg.siteLang}" no tiene tabla de cadenas en src/strings.mjs ` +
      `(disponibles: ${Object.keys(STRINGS).join(', ')})`)
  }
  die()
  // basePath: "" para dominio propio en la raiz, "/metrilabcl" para project pages.
  const u = new URL(cfg.baseUrl)
  cfg.basePath = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')
  cfg.origin = u.origin
  cfg.authorUrl = `${cfg.baseUrl}/${cfg.authorPathSegment}/`
  return cfg
}

// ---------- datos de los titulos ----------

const REQUIRED_BOOK = [
  'slug', 'title', 'author', 'asin', 'amazonUrl', 'format',
  'language', 'languageCode', 'printLength', 'publicationDate',
  'publicationDateLabel', 'measurement',
]
const REQUIRED_MEASUREMENT = ['measuredAt', 'source', 'sourceUrl', 'method', 'measuredBy']
const REQUIRED_DEMAND_SOURCE = ['url', 'label', 'readAt', 'readBy', 'method']
const REQUIRED_EDITION = ['asin', 'format', 'storefront', 'url', 'confidence', 'note']

const esArregloDeTextos = (v) =>
  Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'string' && x.trim())

function validarDemanda(b, f) {
  const d = b.demandContext
  if (d === undefined) return
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    fail(`data/${f}: demandContext debe ser un objeto o estar ausente`)
    return
  }
  if (!d.source || typeof d.source !== 'object') {
    fail(`data/${f}: demandContext.source es obligatorio (sin fuente citable no se publica una pregunta)`)
  } else {
    for (const k of REQUIRED_DEMAND_SOURCE) {
      if (!d.source[k]) fail(`data/${f}: falta demandContext.source.${k}`)
    }
    if (d.source.url && !/^https:\/\/\S+$/.test(d.source.url)) {
      fail(`data/${f}: demandContext.source.url debe ser una URL https absoluta, recibido "${d.source.url}"`)
    }
    if (d.source.readAt && !/^\d{4}-\d{2}-\d{2}$/.test(d.source.readAt)) {
      fail(`data/${f}: demandContext.source.readAt debe ser YYYY-MM-DD, recibido "${d.source.readAt}"`)
    }
  }
  if (!esArregloDeTextos(d.questions)) {
    fail(`data/${f}: demandContext.questions debe ser un arreglo no vacio de preguntas literales`)
  }
  if (!d.questionsLang || !/^[a-z]{2}(-[A-Z]{2})?$/.test(String(d.questionsLang))) {
    fail(`data/${f}: demandContext.questionsLang debe ser BCP-47 corto (el idioma en que se citan las preguntas)`)
  }
  if (d.notes !== undefined && !esArregloDeTextos(d.notes)) {
    fail(`data/${f}: demandContext.notes debe ser un arreglo no vacio de textos, o estar ausente`)
  }
}

function validarEdiciones(b, f) {
  if (b.relatedEditions === undefined) return
  if (!Array.isArray(b.relatedEditions) || !b.relatedEditions.length) {
    fail(`data/${f}: relatedEditions debe ser un arreglo no vacio, o estar ausente`)
    return
  }
  for (const [i, e] of b.relatedEditions.entries()) {
    if (!e || typeof e !== 'object') { fail(`data/${f}: relatedEditions[${i}] debe ser un objeto`); continue }
    for (const k of REQUIRED_EDITION) {
      if (!e[k]) fail(`data/${f}: falta relatedEditions[${i}].${k}`)
    }
    if (e.asin && !/^[A-Z0-9]{10}$/.test(e.asin)) {
      fail(`data/${f}: relatedEditions[${i}].asin "${e.asin}" no tiene el formato de 10 caracteres [A-Z0-9]`)
    }
    if (e.url && e.asin && !String(e.url).includes(e.asin)) {
      fail(`data/${f}: relatedEditions[${i}].url no contiene el ASIN ${e.asin}`)
    }
  }
}

function loadBooks(cfg) {
  const dir = join(ROOT, 'data')
  if (!existsSync(dir)) {
    console.error(`BUILD FALLIDO — falta el directorio ${dir}`)
    process.exit(1)
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  if (files.length === 0) {
    console.error('BUILD FALLIDO — data/ no contiene ningun titulo. Un catalogo vacio no se publica en silencio.')
    process.exit(1)
  }

  const books = []
  for (const f of files) {
    const p = join(dir, f)
    let b
    try {
      b = JSON.parse(readFileSync(p, 'utf8'))
    } catch (e) {
      fail(`data/${f}: JSON invalido — ${e.message}`)
      continue
    }
    for (const k of REQUIRED_BOOK) {
      const v = b[k]
      const empty = v === undefined || v === null || v === '' ||
        (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
      if (empty) fail(`data/${f}: falta el campo requerido "${k}"`)
    }
    if (b.measurement && typeof b.measurement === 'object') {
      for (const k of REQUIRED_MEASUREMENT) {
        if (!b.measurement[k]) fail(`data/${f}: falta measurement.${k} (sin procedencia no se publica)`)
      }
      if (b.measurement.measuredAt && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(b.measurement.measuredAt)) {
        fail(`data/${f}: measurement.measuredAt debe ser ISO-8601 UTC (YYYY-MM-DDTHH:MM:SSZ), recibido "${b.measurement.measuredAt}"`)
      }
    }
    if (b.slug && b.slug !== basename(f, '.json')) {
      fail(`data/${f}: el slug "${b.slug}" no coincide con el nombre del archivo "${basename(f, '.json')}"`)
    }
    if (b.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.slug)) {
      fail(`data/${f}: slug "${b.slug}" no es una URL limpia ([a-z0-9] separado por guiones)`)
    }
    if (b.slug && (b.slug === cfg.authorPathSegment)) {
      fail(`data/${f}: el slug "${b.slug}" choca con authorPathSegment`)
    }
    if (b.asin && !/^[A-Z0-9]{10}$/.test(b.asin)) {
      fail(`data/${f}: asin "${b.asin}" no tiene el formato de 10 caracteres [A-Z0-9]`)
    }
    if (b.amazonUrl && b.asin && !b.amazonUrl.includes(b.asin)) {
      fail(`data/${f}: amazonUrl no contiene el ASIN ${b.asin}`)
    }
    if (b.printLength !== undefined && !(Number.isInteger(b.printLength) && b.printLength > 0)) {
      fail(`data/${f}: printLength debe ser un entero positivo (paginas medidas), recibido "${b.printLength}"`)
    }
    if (b.publicationDate && !/^\d{4}-\d{2}-\d{2}$/.test(b.publicationDate)) {
      fail(`data/${f}: publicationDate debe ser YYYY-MM-DD, recibido "${b.publicationDate}"`)
    }
    if (b.languageCode && !/^[a-z]{2}(-[A-Z]{2})?$/.test(b.languageCode)) {
      fail(`data/${f}: languageCode debe ser BCP-47 corto (p.ej. "en"), recibido "${b.languageCode}"`)
    }
    // titleLanguageCode: idioma del TEXTO DEL TITULO cuando no coincide con el idioma declarado
    // del libro (caso real y medido: B0HDPV63R4 declara Language=Spanish con el titulo en ingles).
    // inLanguage describe el libro; el atributo lang del titulo describe ese texto. No son lo mismo.
    if (b.titleLanguageCode !== undefined && !/^[a-z]{2}(-[A-Z]{2})?$/.test(String(b.titleLanguageCode))) {
      fail(`data/${f}: titleLanguageCode debe ser BCP-47 corto o estar ausente, recibido "${b.titleLanguageCode}"`)
    }
    for (const campo of ['notMeasured', 'observations']) {
      if (b[campo] === undefined) continue
      if (!esArregloDeTextos(b[campo])) {
        fail(`data/${f}: ${campo} debe ser un arreglo no vacio de textos, o estar ausente`)
      }
    }
    if (b.price !== undefined) {
      if (!b.price || !/^\d+\.\d{2}$/.test(String(b.price.amount || '')) || !/^[A-Z]{3}$/.test(String(b.price.currency || ''))) {
        fail(`data/${f}: price debe ser { amount: "0.00", currency: "USD" } o estar ausente`)
      }
      if (b.price && Number(b.price.amount) === 0) {
        fail(`data/${f}: price.amount es 0.00 — en Amazon ese cero suele ser el icono de Kindle Unlimited, ` +
          'no el precio de compra. Vuelve a medir el precio en vez de publicar un libro gratis que no lo es.')
      }
    }
    validarDemanda(b, f)
    validarEdiciones(b, f)
    b.__file = `data/${f}`
    b.__url = `${cfg.baseUrl}/${cfg.catalogPathSegment}/${b.slug}/`
    books.push(b)
  }
  die()

  for (const key of ['slug', 'asin', 'title']) {
    const seen = new Map()
    for (const b of books) {
      if (seen.has(b[key])) fail(`${key} duplicado "${b[key]}" en ${seen.get(b[key])} y ${b.__file}`)
      seen.set(b[key], b.__file)
    }
  }
  die()
  return books
}

// ---------- entidad del autor ----------
//
// NEXUS (MET-151 §1) midio con cuatro metodos independientes que no existe biografia ni
// perfil social recuperable de esta entidad. La pagina lo declara en vez de rellenarlo.
// Por eso los campos de ausencia (notFound) son OBLIGATORIOS: una pagina de autor sin
// biografia y sin decir por que es indistinguible de una pagina a medio hacer.

const REQUIRED_AUTHOR = ['primaryName', 'nameForms', 'knownTitles', 'sameAs', 'notFound', 'measurement']

function loadAuthor(cfg, books) {
  const p = join(ROOT, 'author.json')
  if (!existsSync(p)) {
    console.error(`BUILD FALLIDO — falta ${p} (la pagina de entidad es parte de la fase 1, no un extra)`)
    process.exit(1)
  }
  let a
  try {
    a = JSON.parse(readFileSync(p, 'utf8'))
  } catch (e) {
    console.error(`BUILD FALLIDO — author.json no es JSON valido: ${e.message}`)
    process.exit(1)
  }
  for (const k of REQUIRED_AUTHOR) {
    const v = a[k]
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)
    if (empty) fail(`author.json: falta el campo requerido "${k}"`)
  }
  die()

  if (a.alternateNames !== undefined && !esArregloDeTextos(a.alternateNames)) {
    fail('author.json: alternateNames debe ser un arreglo no vacio de textos, o estar ausente')
  }
  if (!esArregloDeTextos(a.notFound)) {
    fail('author.json: notFound debe ser un arreglo no vacio de textos (que no existe, y como se comprobo)')
  }
  for (const [i, n] of (a.nameForms || []).entries()) {
    for (const k of ['form', 'source', 'measuredBy']) {
      if (!n || !n[k]) fail(`author.json: falta nameForms[${i}].${k}`)
    }
  }
  const formas = new Set((a.nameForms || []).map((n) => n && n.form))
  if (a.primaryName && !formas.has(a.primaryName)) {
    fail(`author.json: primaryName "${a.primaryName}" no aparece en nameForms — el nombre primario ` +
      'tiene que ser una forma medida en una fuente, no una eleccion editorial')
  }
  for (const alt of a.alternateNames || []) {
    if (!formas.has(alt)) fail(`author.json: alternateNames "${alt}" no aparece en nameForms`)
  }
  for (const [i, s] of (a.sameAs || []).entries()) {
    for (const k of ['url', 'label', 'verifiedAt', 'verifiedBy']) {
      if (!s || !s[k]) fail(`author.json: falta sameAs[${i}].${k} (un sameAs sin comprobacion fechada no se emite)`)
    }
    if (s && s.url && !/^https:\/\/\S+$/.test(s.url)) {
      fail(`author.json: sameAs[${i}].url debe ser una URL https absoluta, recibido "${s.url}"`)
    }
    if (s && s.verifiedAt && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s.verifiedAt)) {
      fail(`author.json: sameAs[${i}].verifiedAt debe ser ISO-8601 UTC, recibido "${s.verifiedAt}"`)
    }
  }
  const slugs = new Set(books.map((b) => b.slug))
  for (const [i, t] of (a.knownTitles || []).entries()) {
    if (!t || !t.title) { fail(`author.json: falta knownTitles[${i}].title`); continue }
    if (!t.corroboration) fail(`author.json: falta knownTitles[${i}].corroboration (por que sabemos que existe)`)
    if (t.slug !== undefined && t.slug !== null && !slugs.has(t.slug)) {
      fail(`author.json: knownTitles[${i}].slug "${t.slug}" no corresponde a ningun archivo de data/`)
    }
  }
  for (const b of books) {
    const enLista = (a.knownTitles || []).some((t) => t && t.slug === b.slug)
    if (!enLista) fail(`author.json: el titulo publicado "${b.slug}" no aparece en knownTitles — ` +
      'la pagina de autor no puede omitir un titulo que el catalogo si publica')
  }
  for (const k of REQUIRED_MEASUREMENT) {
    if (!a.measurement || !a.measurement[k]) fail(`author.json: falta measurement.${k}`)
  }
  die()
  a.__url = cfg.authorUrl
  return a
}

// ---------- helpers ----------

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const attr = esc

// Idioma del texto del titulo: el del titulo si se declaro distinto, si no el del libro.
const titleLang = (b) => b.titleLanguageCode || b.languageCode

function makeFechas(S) {
  const fecha = (iso) => {
    const [y, m, d] = String(iso).split('-').map(Number)
    if (!y || !m || !d || m < 1 || m > 12) {
      fail(`fecha: no parseable "${iso}"`)
      die()
    }
    return S.fecha(y, m, d)
  }
  const fechaHora = (iso) => `${fecha(String(iso).slice(0, 10))}, ${String(iso).slice(11, 16)} UTC`
  return { fecha, fechaHora }
}

// ---------- plantilla base ----------

function layout(cfg, S, { canonical, title, description, lang, bodyClass, main, jsonLd }) {
  const bloques = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  const ld = bloques
    .map((b) => `\n  <script type="application/ld+json">${JSON.stringify(b, null, 2)}</script>`)
    .join('')
  const { fechaHora } = makeFechas(S)
  return `<!DOCTYPE html>
<html lang="${attr(lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(description)}">
  <link rel="canonical" href="${attr(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${attr(cfg.siteName)}">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta name="generator" content="metrilab-ebooks build ${attr(cfg.buildRef || '')} ${attr(BUILT_AT)}">
  <link rel="stylesheet" href="${attr(cfg.basePath)}/assets/styles.css">${ld}
</head>
<body class="${attr(bodyClass)}">
  <a class="skip" href="#contenido">${esc(S.skip)}</a>
  <header class="site-header">
    <p class="brand"><a href="${attr(cfg.basePath)}/">${esc(cfg.siteName)}</a></p>
  </header>
  <main id="contenido">
${main}
  </main>
  <footer class="site-footer">
    <p>${esc(S.piePublisher(cfg.publisherName))}</p>
    <p class="nota">${esc(S.pieNota)}</p>
    <p class="nota">${esc(S.pieGenerado(fechaHora(BUILT_AT)))}</p>
  </footer>
</body>
</html>
`
}

// BreadcrumbList: la jerarquia real de este sitio. El indice ES el catalogo, asi que su
// migaja tiene un solo elemento — emitir "Inicio > Catalogo" con la misma URL dos veces
// seria declarar una jerarquia que no existe.
function migajas(cfg, canonical, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

// ---------- paginas ----------

function paginaIndice(cfg, S, books, autor) {
  const { fecha, fechaHora } = makeFechas(S)
  const canonical = `${cfg.baseUrl}/`
  const titulos = S.titulosCuenta(books.length)
  const description = S.indiceDescripcion(cfg.publisherName, titulos)

  const filas = books.map((b) => `        <li class="tarjeta">
          <h3><a href="${attr(cfg.basePath)}/${attr(cfg.catalogPathSegment)}/${attr(b.slug)}/" lang="${attr(titleLang(b))}">${esc(b.title)}</a></h3>
          <dl class="datos">
            <dt>${esc(S.dtAutor)}</dt><dd>${esc(b.author)}</dd>
            <dt>${esc(S.dtFormato)}</dt><dd>${esc(b.format)}</dd>
            <dt>${esc(S.dtIdioma)}</dt><dd>${esc(b.language)}</dd>
            <dt>${esc(S.dtExtension)}</dt><dd>${esc(S.paginas(b.printLength))}</dd>
            <dt>${esc(S.dtPublicado)}</dt><dd><time datetime="${attr(b.publicationDate)}">${esc(fecha(b.publicationDate))}</time></dd>
            <dt>${esc(S.dtAsin)}</dt><dd><code>${esc(b.asin)}</code></dd>
          </dl>
          <p class="procedencia">${esc(S.medidoEl(fechaHora(b.measurement.measuredAt)))}</p>
        </li>`).join('\n')

  const main = `    <h1>${esc(cfg.siteName)}</h1>
    <p class="entrada">${esc(S.indiceEntrada(cfg.publisherName))}</p>
    <h2 class="seccion">${esc(S.indiceCatalogo(titulos))}</h2>
    <ul class="catalogo">
${filas}
    </ul>

    <h2>${esc(S.indiceAutorH2)}</h2>
    <p>${esc(S.indiceAutorTexto(autor.primaryName))}</p>
    <p><a href="${attr(cfg.basePath)}/${attr(cfg.authorPathSegment)}/">${esc(S.indiceAutorEnlace)}</a></p>`

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonical,
    url: canonical,
    name: cfg.siteName,
    inLanguage: cfg.siteLang,
    // El ASIN va en cada hasPart para que una verificación externa pueda cruzar nodo por nodo
    // contra el catálogo medido; sin el identificador, el nodo no es comprobable (NEXUS §3.1).
    hasPart: books.map((b) => ({
      '@type': 'Book',
      '@id': b.__url,
      url: b.__url,
      name: b.title,
      inLanguage: b.languageCode,
      identifier: [{ '@type': 'PropertyValue', propertyID: 'ASIN', value: b.asin }],
      sameAs: b.amazonUrl,
    })),
  }, migajas(cfg, canonical, [{ name: S.migaCatalogo, url: canonical }])]

  return {
    path: 'index.html',
    html: layout(cfg, S, {
      canonical,
      title: S.indiceTitulo(cfg.siteName, titulos),
      description,
      lang: cfg.siteLang,
      bodyClass: 'p-indice',
      main,
      jsonLd,
    }),
  }
}

function bloqueDemanda(cfg, S, b) {
  const d = b.demandContext
  if (!d) return ''
  const { fecha } = makeFechas(S)
  const preguntas = d.questions
    .map((q) => `      <li lang="${attr(d.questionsLang)}">${esc(q)}</li>`).join('\n')
  const notas = Array.isArray(d.notes) && d.notes.length
    ? d.notes.map((n) => `    <p class="nota">${esc(n)}</p>`).join('\n') + '\n'
    : ''
  return `    <h2>${esc(S.h2Demanda)}</h2>
    <p>${esc(S.demandaIntro(d.source.label, fecha(d.source.readAt)))}</p>
    <ul class="preguntas">
${preguntas}
    </ul>
    <p class="aviso">${esc(S.demandaAviso)}</p>
${notas}    <p class="procedencia">${esc(S.demandaFuente(d.source.url))} — ${esc(d.source.method)} ${esc(d.source.readBy)}</p>

`
}

function bloqueEdiciones(cfg, S, b) {
  if (!Array.isArray(b.relatedEditions) || !b.relatedEditions.length) return ''
  const filas = b.relatedEditions.map((e) => `      <li>${esc(e.format)} — <code>${esc(e.asin)}</code>,
        <a href="${attr(e.url)}" rel="external nofollow">${esc(e.storefront)}</a>.
        ${esc(e.note)}</li>`).join('\n')
  return `    <h2>${esc(S.h2OtrasEdiciones)}</h2>
    <ul class="no-medido">
${filas}
    </ul>

`
}

function bloqueMasDelAutor(cfg, S, b, books, autor) {
  const otros = books.filter((o) => o.slug !== b.slug)
  const enlaceAutor = `<a href="${attr(cfg.basePath)}/${attr(cfg.authorPathSegment)}/">${esc(S.verPaginaAutor)}</a>`
  if (!otros.length) {
    return `    <h2>${esc(S.h2MasDelAutor)}</h2>
    <p>${S.masDelAutorSinOtros(esc(autor.primaryName), enlaceAutor)}</p>

`
  }
  const filas = otros.map((o) => `      <li><a href="${attr(cfg.basePath)}/${attr(cfg.catalogPathSegment)}/${attr(o.slug)}/" lang="${attr(titleLang(o))}">${esc(o.title)}</a></li>`).join('\n')
  return `    <h2>${esc(S.h2MasDelAutor)}</h2>
    <p>${esc(S.masDelAutorTexto(autor.primaryName))}</p>
    <ul class="enlaces">
${filas}
    </ul>
    <p>${enlaceAutor}</p>

`
}

function paginaFicha(cfg, S, b, books, autor) {
  const { fecha, fechaHora } = makeFechas(S)
  const canonical = b.__url
  // La meta description usa el titulo hasta los dos puntos: el titulo completo de un libro de
  // KDP pasa de 100 caracteres y la descripcion saldria cortada en el resultado de busqueda.
  // El <title> si lleva el titulo completo: ahi el dato real manda sobre la longitud ideal.
  const tituloCorto = b.title.split(':')[0].trim().slice(0, 60)
  const description = S.fichaDescripcion(
    tituloCorto, b.author, b.format, b.printLength, b.language,
    fecha(b.publicationDate), b.asin, b.measurement.measuredAt.slice(0, 10),
  )

  const precio = b.price
    ? `\n            <dt>${esc(S.dtPrecio)}</dt><dd>${esc(b.price.currency)} ${esc(b.price.amount)} <span class="nota-inline">${esc(S.precioNota)}</span></dd>`
    : ''
  const peso = b.fileSize ? `\n            <dt>${esc(S.dtPeso)}</dt><dd>${esc(b.fileSize)}</dd>` : ''

  const noMedido = Array.isArray(b.notMeasured) && b.notMeasured.length
    ? `    <h2>${esc(S.h2NoMedido)}</h2>
    <ul class="no-medido">
${b.notMeasured.map((x) => `      <li>${esc(x)}</li>`).join('\n')}
    </ul>`
    : ''

  // Anomalias de la propia ficha de Amazon: se reportan, no se corrigen ni se esconden.
  const observado = Array.isArray(b.observations) && b.observations.length
    ? `    <h2>${esc(S.h2Anomalias)}</h2>
    <ul class="no-medido">
${b.observations.map((x) => `      <li>${esc(x)}</li>`).join('\n')}
    </ul>

`
    : ''

  const main = `    <nav class="migas" aria-label="${attr(S.rutaLabel)}"><a href="${attr(cfg.basePath)}/">${esc(S.migaCatalogo)}</a> › <span aria-current="page">${esc(b.asin)}</span></nav>
    <h1 lang="${attr(titleLang(b))}">${esc(b.title)}</h1>
    <p class="entrada">${esc(S.fichaEntrada(b.author))}</p>

    <h2>${esc(S.h2Datos)}</h2>
    <dl class="datos datos-ficha">
            <dt>${esc(S.dtAutor)}</dt><dd>${esc(b.author)}</dd>
            <dt>${esc(S.dtFormato)}</dt><dd>${esc(b.format)}</dd>
            <dt>${esc(S.dtIdioma)}</dt><dd>${esc(b.language)}</dd>
            <dt>${esc(S.dtExtension)}</dt><dd>${esc(S.paginas(b.printLength))}</dd>
            <dt>${esc(S.dtFechaPublicacion)}</dt><dd><time datetime="${attr(b.publicationDate)}">${esc(fecha(b.publicationDate))}</time></dd>
            <dt>${esc(S.dtAsin)}</dt><dd><code>${esc(b.asin)}</code></dd>${peso}${precio}
    </dl>

    <p class="cta"><a class="boton" href="${attr(b.amazonUrl)}" rel="external nofollow">${esc(S.cta)}</a></p>

${bloqueDemanda(cfg, S, b)}${bloqueEdiciones(cfg, S, b)}${bloqueMasDelAutor(cfg, S, b, books, autor)}    <h2>${esc(S.h2Procedencia)}</h2>
    <dl class="datos procedencia-dl">
      <dt>${esc(S.dtFuente)}</dt><dd>${esc(b.measurement.source)} — <span class="url">${esc(b.measurement.sourceUrl)}</span></dd>
      <dt>${esc(S.dtMedidoEl)}</dt><dd><time datetime="${attr(b.measurement.measuredAt)}">${esc(fechaHora(b.measurement.measuredAt))}</time></dd>
      <dt>${esc(S.dtMedidoPor)}</dt><dd>${esc(b.measurement.measuredBy)}</dd>
      <dt>${esc(S.dtMetodo)}</dt><dd>${esc(b.measurement.method)}</dd>${b.measurement.verifiedAt ? `
      <dt>${esc(S.dtReverificado)}</dt><dd><time datetime="${attr(b.measurement.verifiedAt)}">${esc(fechaHora(b.measurement.verifiedAt))}</time>${b.measurement.verifiedBy ? ` — ${esc(b.measurement.verifiedBy)}` : ''}</dd>` : ''}
    </dl>

${observado}${noMedido}`

  // JSON-LD: solo propiedades medidas (lista "procede" de NEXUS, MET-151 §3.1). Sin
  // aggregateRating ni review (0 resenas confirmadas por dos fuentes independientes), sin
  // isbn (el unico observado es de otro ASIN), sin offers (el precio medido caduca y Pages
  // no lo re-mide), sin workExample (el hermano en papel solo esta visto en amazon.es).
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': canonical,
    url: canonical,
    name: b.title,
    // Forma literal del byline de ESTA ficha: NEXUS §3.1 pide no normalizar entre fichas.
    author: { '@type': 'Person', name: b.author },
    bookFormat: 'https://schema.org/EBook',
    inLanguage: b.languageCode,
    numberOfPages: b.printLength,
    datePublished: b.publicationDate,
    identifier: [{ '@type': 'PropertyValue', propertyID: 'ASIN', value: b.asin }],
    sameAs: b.amazonUrl,
    isPartOf: { '@type': 'CollectionPage', '@id': `${cfg.baseUrl}/` },
  }, migajas(cfg, canonical, [
    { name: S.migaCatalogo, url: `${cfg.baseUrl}/` },
    { name: b.title, url: canonical },
  ])]

  return {
    path: join(cfg.catalogPathSegment, b.slug, 'index.html'),
    html: layout(cfg, S, {
      canonical,
      title: S.fichaTitulo(b.title, b.asin),
      description,
      lang: cfg.siteLang,
      bodyClass: 'p-ficha',
      main,
      jsonLd,
    }),
  }
}

function paginaAutor(cfg, S, autor, books) {
  const { fecha, fechaHora } = makeFechas(S)
  const canonical = autor.__url

  const nombres = autor.nameForms.map((n) => `        <tr>
          <td>${esc(n.form)}</td>
          <td>${esc(n.source)}</td>
          <td>${esc(n.measuredBy)}</td>
        </tr>`).join('\n')

  const titulos = autor.knownTitles.map((t) => {
    const libro = t.slug ? books.find((b) => b.slug === t.slug) : null
    const nombre = libro
      ? `<a href="${attr(cfg.basePath)}/${attr(cfg.catalogPathSegment)}/${attr(libro.slug)}/" lang="${attr(titleLang(libro))}">${esc(t.title)}</a>`
      : `<span>${esc(t.title)}</span>`
    const estado = libro ? S.autorConFicha : S.autorSinFicha
    return `      <li>${nombre} — <span class="nota-inline">${esc(estado)}</span>.
        <span class="nota-inline">${esc(t.corroboration)}</span></li>`
  }).join('\n')

  const perfiles = autor.sameAs.map((s) => `      <li><a href="${attr(s.url)}" rel="external nofollow">${esc(s.label)}</a>
        — <span class="nota-inline">${esc(S.autorVerificado(fechaHora(s.verifiedAt), s.verifiedBy))}</span></li>`).join('\n')

  const ausencias = autor.notFound.map((x) => `      <li>${esc(x)}</li>`).join('\n')

  const main = `    <nav class="migas" aria-label="${attr(S.rutaLabel)}"><a href="${attr(cfg.basePath)}/">${esc(S.migaCatalogo)}</a> › <span aria-current="page">${esc(autor.primaryName)}</span></nav>
    <h1>${esc(autor.primaryName)}</h1>
    <p class="entrada">${esc(S.autorEntrada(autor.primaryName))}</p>

    <h2>${esc(S.autorH2Nombres)}</h2>
    <p>${esc(S.autorNombresIntro)}</p>
    <table class="tabla-nombres">
      <thead>
        <tr><th scope="col">${esc(S.autorThForma)}</th><th scope="col">${esc(S.autorThFuente)}</th><th scope="col">${esc(S.autorThMedido)}</th></tr>
      </thead>
      <tbody>
${nombres}
      </tbody>
    </table>

    <h2>${esc(S.autorH2Titulos)}</h2>
    <p>${esc(S.autorTitulosIntro(autor.knownTitles.length))}</p>
    <ul class="enlaces">
${titulos}
    </ul>

    <h2>${esc(S.autorH2Perfiles)}</h2>
    <p>${esc(S.autorPerfilesIntro)}</p>
    <ul class="enlaces">
${perfiles}
    </ul>

    <h2>${esc(S.autorH2NoEncontrado)}</h2>
    <ul class="no-medido">
${ausencias}
    </ul>

    <h2>${esc(S.autorH2Procedencia)}</h2>
    <dl class="datos procedencia-dl">
      <dt>${esc(S.dtFuente)}</dt><dd>${esc(autor.measurement.source)} — <span class="url">${esc(autor.measurement.sourceUrl)}</span></dd>
      <dt>${esc(S.dtMedidoEl)}</dt><dd><time datetime="${attr(autor.measurement.measuredAt)}">${esc(fechaHora(autor.measurement.measuredAt))}</time></dd>
      <dt>${esc(S.dtMedidoPor)}</dt><dd>${esc(autor.measurement.measuredBy)}</dd>
      <dt>${esc(S.dtMetodo)}</dt><dd>${esc(autor.measurement.method)}</dd>
    </dl>`

  // Person con las dos formas medidas del nombre y sameAs SOLO hacia los perfiles que
  // respondieron al comprobarlos (NEXUS §3.1 y condicion de citabilidad 4). Sin
  // Organization: no existe una entidad recuperable con datos de contacto reales (§3.2).
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${canonical}#person`,
    url: canonical,
    name: autor.primaryName,
    mainEntityOfPage: canonical,
  }
  if (Array.isArray(autor.alternateNames) && autor.alternateNames.length) {
    person.alternateName = autor.alternateNames.length === 1 ? autor.alternateNames[0] : autor.alternateNames
  }
  person.sameAs = autor.sameAs.map((s) => s.url)

  const jsonLd = [person, migajas(cfg, canonical, [
    { name: S.migaCatalogo, url: `${cfg.baseUrl}/` },
    { name: autor.primaryName, url: canonical },
  ])]

  return {
    path: join(cfg.authorPathSegment, 'index.html'),
    html: layout(cfg, S, {
      canonical,
      title: S.autorTitulo(autor.primaryName, cfg.siteName),
      description: S.autorDescripcion(autor.primaryName, autor.knownTitles.length),
      lang: cfg.siteLang,
      bodyClass: 'p-autor',
      main,
      jsonLd,
    }),
  }
}

function pagina404(cfg, S) {
  // 404.html no va al sitemap y se marca noindex: no es una URL del catalogo.
  const main = `    <h1>${esc(S.p404Titulo)}</h1>
    <p class="entrada">${esc(S.p404Entrada)}</p>
    <p><a href="${attr(cfg.basePath)}/">${esc(S.p404Enlace)}</a></p>`
  const html = layout(cfg, S, {
    canonical: `${cfg.baseUrl}/404.html`,
    title: S.p404Head(cfg.siteName),
    description: S.p404Desc,
    lang: cfg.siteLang,
    bodyClass: 'p-404',
    main,
    jsonLd: null,
  }).replace('<link rel="canonical"', '<meta name="robots" content="noindex">\n  <link rel="canonical"')
  return { path: '404.html', html }
}

function sitemap(cfg, urls) {
  const body = urls.map((u) => `  <url>\n    <loc>${esc(u)}</loc>\n  </url>`).join('\n')
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${body}\n</urlset>\n`
}

function robots(cfg) {
  return `# robots.txt de ${cfg.siteName} — generado por src/build.mjs desde site.config.json
User-agent: *
Allow: /

Sitemap: ${cfg.baseUrl}/sitemap.xml
`
}

const CSS = `:root{--tinta:#15181d;--tinta-suave:#4a5260;--linea:#d9dde4;--fondo:#fbfbfc;--acento:#0b4f8a}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--fondo);color:var(--tinta);
  font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.skip{position:absolute;left:-9999px}
.skip:focus{position:static;display:inline-block;padding:.5rem;background:#fff}
.site-header,main,.site-footer{max-width:46rem;margin:0 auto;padding:0 1.25rem}
.site-header{padding-top:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--linea)}
.brand{margin:0;font-weight:600;font-size:1rem;letter-spacing:.01em}
.brand a{color:var(--tinta);text-decoration:none}
a{color:var(--acento)}
h1{font-size:1.6rem;line-height:1.25;margin:1.75rem 0 .75rem}
h2{font-size:1.12rem;margin:2rem 0 .6rem}
h3{font-size:1.06rem;margin:0 0 .75rem;line-height:1.35}
.entrada{color:var(--tinta-suave);margin:0 0 1.5rem}
.migas{font-size:.85rem;color:var(--tinta-suave);margin-top:1.5rem}
.migas a{color:var(--tinta-suave)}
.catalogo{list-style:none;padding:0;margin:0;display:grid;gap:1rem}
.tarjeta{background:#fff;border:1px solid var(--linea);border-radius:8px;padding:1.1rem 1.25rem}
dl.datos{display:grid;grid-template-columns:auto 1fr;gap:.3rem .9rem;margin:0;font-size:.93rem}
dl.datos dt{color:var(--tinta-suave);min-width:0}
dl.datos dd{margin:0;min-width:0}
dl.datos-ficha,dl.procedencia-dl{background:#fff;border:1px solid var(--linea);border-radius:8px;padding:1rem 1.15rem}
dl.procedencia-dl{grid-template-columns:auto;gap:.15rem}
dl.procedencia-dl dt{font-weight:600;color:var(--tinta);margin-top:.5rem}
dl.procedencia-dl dt:first-child{margin-top:0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em}
/* La URL de procedencia es larga y no tiene espacios: overflow-wrap:anywhere la parte y
   reduce el min-content que usa el grid para dimensionar la pista. Verificado con
   metrilab-render en 390px (desborde=0). */
.url{overflow-wrap:anywhere;color:var(--tinta-suave)}
.procedencia,.nota,.nota-inline{color:var(--tinta-suave);font-size:.84rem}
.procedencia{margin:.85rem 0 0}
.no-medido,.preguntas,.enlaces{color:var(--tinta-suave);font-size:.93rem;padding-left:1.1rem}
.enlaces{color:var(--tinta)}
.preguntas li{margin:.25rem 0}
.aviso{background:#fff;border:1px solid var(--linea);border-left:3px solid var(--acento);
  border-radius:6px;padding:.8rem 1rem;font-size:.9rem;color:var(--tinta-suave)}
/* table-layout:fixed — sin el, el ancho de la tabla lo fija el texto mas largo de la celda
   y desbordaba el viewport movil por 15px (metrilab-render 390px, 2026-09-25T02:56Z). */
table.tabla-nombres{border-collapse:collapse;width:100%;table-layout:fixed;font-size:.93rem;
  background:#fff;border:1px solid var(--linea);border-radius:8px}
table.tabla-nombres th,table.tabla-nombres td{text-align:left;padding:.5rem .75rem;
  border-bottom:1px solid var(--linea);vertical-align:top;overflow-wrap:anywhere}
table.tabla-nombres tr:last-child td{border-bottom:0}
.cta{margin:1.5rem 0}
.boton{display:inline-block;background:var(--acento);color:#fff;text-decoration:none;
  padding:.65rem 1.1rem;border-radius:6px;font-weight:600}
.boton:hover{background:#093c6b}
.site-footer{margin-top:3rem;padding-top:1.25rem;padding-bottom:3rem;border-top:1px solid var(--linea)}
.site-footer p{margin:.4rem 0}
@media (prefers-color-scheme:dark){
  :root{--tinta:#e8eaee;--tinta-suave:#a3abb8;--linea:#2b313a;--fondo:#12151a;--acento:#7cb6ea}
  .tarjeta,dl.datos-ficha,dl.procedencia-dl,.aviso,table.tabla-nombres{background:#181c22}
  .brand a{color:var(--tinta)}
  .boton{color:#0d1117}
}
`

// ---------- emision ----------

function emit(rel, content) {
  const p = join(DIST, rel)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, content)
  return rel
}

function main() {
  const cfg = loadConfig()
  const S = STRINGS[cfg.siteLang]
  const books = loadBooks(cfg)
  const autor = loadAuthor(cfg, books)

  rmSync(DIST, { recursive: true, force: true })
  mkdirSync(DIST, { recursive: true })

  const paginas = [
    paginaIndice(cfg, S, books, autor),
    ...books.map((b) => paginaFicha(cfg, S, b, books, autor)),
    paginaAutor(cfg, S, autor, books),
    pagina404(cfg, S),
  ]

  // Invariante: titles y meta descriptions unicos entre todas las paginas indexables.
  const indexables = paginas.filter((p) => p.path !== '404.html')
  for (const campo of [/<title>([\s\S]*?)<\/title>/, /<meta name="description" content="([^"]*)"/]) {
    const seen = new Map()
    for (const p of indexables) {
      const v = (p.html.match(campo) || [])[1]
      if (!v || !v.trim()) { fail(`${p.path}: ${campo} vacio`); continue }
      if (seen.has(v)) fail(`duplicado entre ${seen.get(v)} y ${p.path}: "${v.slice(0, 70)}..."`)
      seen.set(v, p.path)
    }
  }
  // Invariante: el indice enlaza a cada ficha y a la pagina de autor.
  const indice = paginas[0].html
  for (const b of books) {
    const href = `${cfg.basePath}/${cfg.catalogPathSegment}/${b.slug}/`
    if (!indice.includes(`href="${href}"`)) fail(`el indice no enlaza a ${href}`)
  }
  if (!indice.includes(`href="${cfg.basePath}/${cfg.authorPathSegment}/"`)) {
    fail(`el indice no enlaza a la pagina de autor ${cfg.basePath}/${cfg.authorPathSegment}/`)
  }
  // Invariante: ningun campo de valoracion en ninguna pagina emitida. Es el error que la
  // casa no perdona, asi que se comprueba sobre el HTML final, no sobre la intencion.
  for (const p of paginas) {
    const m = p.html.match(/aggregateRating|ratingValue|reviewCount|ratingCount|bestRating|worstRating/i)
    if (m) fail(`${p.path}: aparece "${m[0]}" en el HTML emitido y no hay ninguna resena medida`)
  }
  die()

  const escritos = paginas.map((p) => emit(p.path, p.html))

  const urls = [`${cfg.baseUrl}/`, ...books.map((b) => b.__url), cfg.authorUrl]
  escritos.push(emit('sitemap.xml', sitemap(cfg, urls)))
  escritos.push(emit('robots.txt', robots(cfg)))
  escritos.push(emit('assets/styles.css', CSS))

  // Invariante: toda URL del sitemap tiene un archivo emitido detras.
  for (const u of urls) {
    const rel = u.slice(cfg.baseUrl.length).replace(/^\//, '') + 'index.html'
    if (!existsSync(join(DIST, rel))) fail(`sitemap declara ${u} pero no se emitio dist/${rel}`)
  }
  die()

  console.log(`build OK — ${books.length} titulo(s), ${escritos.length} archivo(s) en dist/`)
  console.log(`baseUrl: ${cfg.baseUrl}  (fuente: ${cfg.baseUrlFuente})  basePath: "${cfg.basePath}"  siteLang: ${cfg.siteLang}`)
  for (const f of escritos) console.log(`  dist/${f}`)
}

main()
