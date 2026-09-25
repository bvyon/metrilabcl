#!/usr/bin/env node
// Generador estatico del hub de ebooks de MetrilabCL.
//
// Contrato de entrada:
//   site.config.json  -> { baseUrl, siteName, siteLang, publisherName, catalogPathSegment }
//   data/<slug>.json  -> un archivo por titulo medido (ver README)
// Contrato de salida:
//   dist/index.html, dist/404.html, dist/<catalogPathSegment>/<slug>/index.html,
//   dist/sitemap.xml, dist/robots.txt, dist/assets/styles.css, dist/.nojekyll
// Exit codes: 0 build correcto. 1 dato de entrada invalido o invariante roto (falla ruidosa).
//
// Regla de la casa: nunca emitir una pagina a medias ni un campo vacio en silencio.
// Si un campo requerido falta, el build muere con el archivo y el campo en el mensaje.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

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
  for (const k of ['baseUrl', 'siteName', 'siteLang', 'publisherName', 'catalogPathSegment']) {
    if (typeof cfg[k] !== 'string' || !cfg[k].trim()) fail(`site.config.json: falta o esta vacio "${k}"`)
  }
  die()
  if (!/^https:\/\/[^\s/]+(\/[^\s]*)?$/.test(cfg.baseUrl)) {
    fail(`site.config.json: baseUrl debe ser una URL https absoluta, recibido "${cfg.baseUrl}"`)
  }
  if (cfg.baseUrl.endsWith('/')) {
    fail(`site.config.json: baseUrl no debe terminar en "/", recibido "${cfg.baseUrl}"`)
  }
  if (!/^[a-z0-9-]+$/.test(cfg.catalogPathSegment)) {
    fail(`site.config.json: catalogPathSegment debe ser [a-z0-9-]+, recibido "${cfg.catalogPathSegment}"`)
  }
  die()
  // basePath: "" para dominio propio en la raiz, "/metrilab-ebooks" para project pages.
  const u = new URL(cfg.baseUrl)
  cfg.basePath = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')
  cfg.origin = u.origin
  return cfg
}

// ---------- datos de los titulos ----------

const REQUIRED_BOOK = [
  'slug', 'title', 'author', 'asin', 'amazonUrl', 'format',
  'language', 'languageCode', 'printLength', 'publicationDate',
  'publicationDateLabel', 'measurement',
]
const REQUIRED_MEASUREMENT = ['measuredAt', 'source', 'sourceUrl', 'method', 'measuredBy']

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
      if (!Array.isArray(b[campo]) || !b[campo].length || b[campo].some((x) => typeof x !== 'string' || !x.trim())) {
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

// ---------- helpers ----------

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const attr = esc

// Idioma del texto del titulo: el del titulo si se declaro distinto, si no el del libro.
const titleLang = (b) => b.titleLanguageCode || b.languageCode

function fechaEs(iso) {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d || !MESES[m - 1]) {
    fail(`fechaEs: fecha no parseable "${iso}"`)
    die()
  }
  return `${d} de ${MESES[m - 1]} de ${y}`
}

function fechaHoraEs(iso) {
  return `${fechaEs(iso.slice(0, 10))}, ${iso.slice(11, 16)} UTC`
}

// ---------- plantilla base ----------

function layout(cfg, { canonical, title, description, lang, bodyClass, main, jsonLd }) {
  const ld = jsonLd ? `\n  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>` : ''
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
  <a class="skip" href="#contenido">Saltar al contenido</a>
  <header class="site-header">
    <p class="brand"><a href="${attr(cfg.basePath)}/">${esc(cfg.siteName)}</a></p>
  </header>
  <main id="contenido">
${main}
  </main>
  <footer class="site-footer">
    <p>${esc(cfg.publisherName)}. Catálogo de títulos autopublicados en Amazon Kindle.</p>
    <p class="nota">Cada dato de este sitio sale de la página pública del título en Amazon y lleva la
    fecha en que se midió. Lo que no se ha medido se declara como no medido, no se estima.</p>
    <p class="nota">Página generada el ${esc(fechaHoraEs(BUILT_AT))}.</p>
  </footer>
</body>
</html>
`
}

// ---------- paginas ----------

function paginaIndice(cfg, books) {
  const canonical = `${cfg.baseUrl}/`
  const n = books.length
  const titulos = n === 1 ? '1 título' : `${n} títulos`
  const description =
    `Catálogo de los ebooks de ${cfg.publisherName} en Amazon Kindle: ${titulos} con ASIN, idioma, ` +
    `extensión y fecha de publicación medidos en la página del producto.`

  const filas = books.map((b) => `        <li class="tarjeta">
          <h2><a href="${attr(cfg.basePath)}/${attr(cfg.catalogPathSegment)}/${attr(b.slug)}/" lang="${attr(titleLang(b))}">${esc(b.title)}</a></h2>
          <dl class="datos">
            <dt>Autor</dt><dd>${esc(b.author)}</dd>
            <dt>Formato</dt><dd>${esc(b.format)}</dd>
            <dt>Idioma</dt><dd>${esc(b.language)}</dd>
            <dt>Extensión</dt><dd>${esc(b.printLength)} páginas</dd>
            <dt>Publicado</dt><dd><time datetime="${attr(b.publicationDate)}">${esc(fechaEs(b.publicationDate))}</time></dd>
            <dt>ASIN</dt><dd><code>${esc(b.asin)}</code></dd>
          </dl>
          <p class="procedencia">Datos medidos el <time datetime="${attr(b.measurement.measuredAt)}">${esc(fechaHoraEs(b.measurement.measuredAt))}</time>.</p>
        </li>`).join('\n')

  const main = `    <h1>${esc(cfg.siteName)}</h1>
    <p class="entrada">Ficha de datos de cada título autopublicado por ${esc(cfg.publisherName)} en Amazon
    Kindle. Los valores de esta página se leyeron de la página pública del producto en Amazon en la fecha
    indicada en cada ficha; no hay reseñas, valoraciones ni posiciones de venta porque no se han medido.</p>
    <h2 class="seccion">Catálogo (${esc(titulos)})</h2>
    <ul class="catalogo">
${filas}
    </ul>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonical,
    url: canonical,
    name: cfg.siteName,
    inLanguage: cfg.siteLang,
    // El ASIN va en cada hasPart para que una verificación externa pueda cruzar nodo por nodo
    // contra el catálogo medido; sin el identificador, el nodo no es comprobable.
    hasPart: books.map((b) => ({
      '@type': 'Book',
      '@id': b.__url,
      name: b.title,
      identifier: [{ '@type': 'PropertyValue', propertyID: 'ASIN', value: b.asin }],
      sameAs: b.amazonUrl,
    })),
  }

  return { path: 'index.html', html: layout(cfg, { canonical, title: `${cfg.siteName} — catálogo con ${titulos}`, description, lang: cfg.siteLang, bodyClass: 'p-indice', main, jsonLd }) }
}

function paginaFicha(cfg, b) {
  const canonical = b.__url
  // La meta description usa el titulo hasta los dos puntos: el titulo completo de un libro de
  // KDP pasa de 100 caracteres y la descripcion saldria cortada en el resultado de busqueda.
  // El <title> si lleva el titulo completo: ahi el dato real manda sobre la longitud ideal.
  const tituloCorto = b.title.split(':')[0].trim().slice(0, 60)
  const description =
    `«${tituloCorto}» de ${b.author}: ${b.format}, ${b.printLength} páginas, ` +
    `${b.language}, publicado el ${fechaEs(b.publicationDate)}. ASIN ${b.asin}. ` +
    `Medido el ${b.measurement.measuredAt.slice(0, 10)}.`

  const precio = b.price
    ? `\n            <dt>Precio medido</dt><dd>${esc(b.price.currency)} ${esc(b.price.amount)} <span class="nota-inline">(precio de compra en amazon.com al momento de la medición; puede haber cambiado)</span></dd>`
    : ''
  const peso = b.fileSize ? `\n            <dt>Tamaño del archivo</dt><dd>${esc(b.fileSize)}</dd>` : ''

  const noMedido = Array.isArray(b.notMeasured) && b.notMeasured.length
    ? `    <h2>No medido</h2>
    <ul class="no-medido">
${b.notMeasured.map((x) => `      <li>${esc(x)}</li>`).join('\n')}
    </ul>`
    : ''

  // Anomalias de la propia ficha de Amazon: se reportan, no se corrigen ni se esconden.
  const observado = Array.isArray(b.observations) && b.observations.length
    ? `    <h2>Anomalías de la ficha en Amazon</h2>
    <ul class="no-medido">
${b.observations.map((x) => `      <li>${esc(x)}</li>`).join('\n')}
    </ul>

`
    : ''

  const main = `    <nav class="migas" aria-label="Ruta"><a href="${attr(cfg.basePath)}/">Catálogo</a> › <span aria-current="page">${esc(b.asin)}</span></nav>
    <h1 lang="${attr(titleLang(b))}">${esc(b.title)}</h1>
    <p class="entrada">Título de ${esc(b.author)} publicado en Amazon Kindle. Todo lo que sigue se leyó de la
    página pública del producto; nada está estimado.</p>

    <h2>Datos del título</h2>
    <dl class="datos datos-ficha">
            <dt>Autor</dt><dd>${esc(b.author)}</dd>
            <dt>Formato</dt><dd>${esc(b.format)}</dd>
            <dt>Idioma</dt><dd>${esc(b.language)}</dd>
            <dt>Extensión</dt><dd>${esc(b.printLength)} páginas</dd>
            <dt>Fecha de publicación</dt><dd><time datetime="${attr(b.publicationDate)}">${esc(fechaEs(b.publicationDate))}</time></dd>
            <dt>ASIN</dt><dd><code>${esc(b.asin)}</code></dd>${peso}${precio}
    </dl>

    <p class="cta"><a class="boton" href="${attr(b.amazonUrl)}" rel="external nofollow">Ver el título en Amazon</a></p>

    <h2>Procedencia de estos datos</h2>
    <dl class="datos procedencia-dl">
      <dt>Fuente</dt><dd>${esc(b.measurement.source)} — <span class="url">${esc(b.measurement.sourceUrl)}</span></dd>
      <dt>Medido el</dt><dd><time datetime="${attr(b.measurement.measuredAt)}">${esc(fechaHoraEs(b.measurement.measuredAt))}</time></dd>
      <dt>Medido por</dt><dd>${esc(b.measurement.measuredBy)}</dd>
      <dt>Método</dt><dd>${esc(b.measurement.method)}</dd>${b.measurement.verifiedAt ? `
      <dt>Re-verificado el</dt><dd><time datetime="${attr(b.measurement.verifiedAt)}">${esc(fechaHoraEs(b.measurement.verifiedAt))}</time>${b.measurement.verifiedBy ? ` — ${esc(b.measurement.verifiedBy)}` : ''}</dd>` : ''}
    </dl>

${observado}${noMedido}`

  // JSON-LD minimo y defendible: solo propiedades medidas. Sin aggregateRating (no hay resenas
  // medidas) y sin offers (el precio medido caduca y GitHub Pages no lo re-mide). Los datos
  // estructurados definitivos los especifica NEXUS en MET-151 y se aterrizan en MET-156.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': canonical,
    url: canonical,
    name: b.title,
    author: { '@type': 'Person', name: b.author },
    bookFormat: 'https://schema.org/EBook',
    inLanguage: b.languageCode,
    numberOfPages: b.printLength,
    datePublished: b.publicationDate,
    identifier: [{ '@type': 'PropertyValue', propertyID: 'ASIN', value: b.asin }],
    sameAs: b.amazonUrl,
    isPartOf: { '@type': 'CollectionPage', '@id': `${cfg.baseUrl}/` },
  }

  const title = `${b.title} — ficha de datos (ASIN ${b.asin})`
  return {
    path: join(cfg.catalogPathSegment, b.slug, 'index.html'),
    html: layout(cfg, { canonical, title, description, lang: cfg.siteLang, bodyClass: 'p-ficha', main, jsonLd }),
  }
}

function pagina404(cfg) {
  // 404.html no va al sitemap y se marca noindex: no es una URL del catalogo.
  const main = `    <h1>Esta página no existe</h1>
    <p class="entrada">La dirección que pediste no corresponde a ninguna ficha de este catálogo.</p>
    <p><a href="${attr(cfg.basePath)}/">Ir al catálogo</a></p>`
  const html = layout(cfg, {
    canonical: `${cfg.baseUrl}/404.html`,
    title: `Página no encontrada — ${cfg.siteName}`,
    description: 'La dirección pedida no corresponde a ninguna ficha de este catálogo.',
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
.entrada{color:var(--tinta-suave);margin:0 0 1.5rem}
.migas{font-size:.85rem;color:var(--tinta-suave);margin-top:1.5rem}
.migas a{color:var(--tinta-suave)}
.catalogo{list-style:none;padding:0;margin:0;display:grid;gap:1rem}
.tarjeta{background:#fff;border:1px solid var(--linea);border-radius:8px;padding:1.1rem 1.25rem}
.tarjeta h2{margin:0 0 .75rem;font-size:1.06rem;line-height:1.35}
dl.datos{display:grid;grid-template-columns:auto 1fr;gap:.3rem .9rem;margin:0;font-size:.93rem}
dl.datos dt{color:var(--tinta-suave)}
dl.datos dd{margin:0}
dl.datos-ficha,dl.procedencia-dl{background:#fff;border:1px solid var(--linea);border-radius:8px;padding:1rem 1.15rem}
dl.procedencia-dl{grid-template-columns:auto;gap:.15rem}
dl.procedencia-dl dt{font-weight:600;color:var(--tinta);margin-top:.5rem}
dl.procedencia-dl dt:first-child{margin-top:0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em}
.url{word-break:break-all;color:var(--tinta-suave)}
.procedencia,.nota,.nota-inline{color:var(--tinta-suave);font-size:.84rem}
.procedencia{margin:.85rem 0 0}
.no-medido{color:var(--tinta-suave);font-size:.93rem;padding-left:1.1rem}
.cta{margin:1.5rem 0}
.boton{display:inline-block;background:var(--acento);color:#fff;text-decoration:none;
  padding:.65rem 1.1rem;border-radius:6px;font-weight:600}
.boton:hover{background:#093c6b}
.site-footer{margin-top:3rem;padding-top:1.25rem;padding-bottom:3rem;border-top:1px solid var(--linea)}
.site-footer p{margin:.4rem 0}
@media (prefers-color-scheme:dark){
  :root{--tinta:#e8eaee;--tinta-suave:#a3abb8;--linea:#2b313a;--fondo:#12151a;--acento:#7cb6ea}
  .tarjeta,dl.datos-ficha,dl.procedencia-dl{background:#181c22}
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
  const books = loadBooks(cfg)

  rmSync(DIST, { recursive: true, force: true })
  mkdirSync(DIST, { recursive: true })

  const paginas = [paginaIndice(cfg, books), ...books.map((b) => paginaFicha(cfg, b)), pagina404(cfg)]

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
  // Invariante: el indice enlaza a cada ficha.
  const indice = paginas[0].html
  for (const b of books) {
    const href = `${cfg.basePath}/${cfg.catalogPathSegment}/${b.slug}/`
    if (!indice.includes(`href="${href}"`)) fail(`el indice no enlaza a ${href}`)
  }
  die()

  const escritos = paginas.map((p) => emit(p.path, p.html))

  const urls = [`${cfg.baseUrl}/`, ...books.map((b) => b.__url)]
  escritos.push(emit('sitemap.xml', sitemap(cfg, urls)))
  escritos.push(emit('robots.txt', robots(cfg)))
  escritos.push(emit('assets/styles.css', CSS))
  escritos.push(emit('.nojekyll', ''))

  // Invariante: toda URL del sitemap tiene un archivo emitido detras.
  for (const u of urls) {
    const rel = u.slice(cfg.baseUrl.length).replace(/^\//, '') + 'index.html'
    if (!existsSync(join(DIST, rel))) fail(`sitemap declara ${u} pero no se emitio dist/${rel}`)
  }
  die()

  console.log(`build OK — ${books.length} titulo(s), ${escritos.length} archivo(s) en dist/`)
  console.log(`baseUrl: ${cfg.baseUrl}  basePath: "${cfg.basePath}"`)
  for (const f of escritos) console.log(`  dist/${f}`)
}

main()
