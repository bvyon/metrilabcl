#!/usr/bin/env node
// Chequeo de salud del generador. Mide el mecanismo, no la version: comprueba que el build
// (a) produce el sitio correcto con datos buenos y (b) MUERE con exit != 0 y un mensaje claro
// con cada clase de dato malo. Un parser que devuelve vacio en silencio es el fallo caro.
//
// Uso: node src/selftest.mjs        Exit 0 todo verde, 1 algun caso falla.

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const BUILD = join(HERE, 'build.mjs')

let fallos = 0
const ok = (n) => console.log(`  ok   ${n}`)
const no = (n, d) => { fallos++; console.log(`  FALLA ${n}\n       ${d}`) }

const CFG_OK = {
  baseUrl: 'https://ejemplo.cl/repo-de-prueba',
  siteName: 'Sitio de prueba',
  siteLang: 'es',
  publisherName: 'Editor de prueba',
  catalogPathSegment: 'libros',
  authorPathSegment: 'autor',
}

const AUTOR_OK = {
  primaryName: 'Autor de prueba',
  alternateNames: ['AUTOR DE PRUEBA'],
  nameForms: [
    { form: 'Autor de prueba', source: 'Fixture A', measuredBy: 'selftest' },
    { form: 'AUTOR DE PRUEBA', source: 'Fixture B', measuredBy: 'selftest' },
  ],
  knownTitles: [
    { title: 'Titulo de prueba', slug: 'titulo-de-prueba', corroboration: 'Fixture del selftest' },
    { title: 'Titulo sin ficha', slug: null, corroboration: 'Fixture: citado en una fuente, sin ficha medida' },
  ],
  sameAs: [{
    url: 'https://www.ejemplo.org/perfil/1',
    label: 'Perfil de prueba',
    verifiedAt: '2026-01-01T00:00:00Z',
    verifiedBy: 'selftest',
  }],
  notFound: ['No hay biografia recuperable en ninguna fuente medida.'],
  measurement: {
    measuredAt: '2026-01-01T00:00:00Z',
    source: 'Fixture',
    sourceUrl: 'https://www.ejemplo.org/perfil/1',
    method: 'Fixture del selftest',
    measuredBy: 'selftest',
  },
}

const LIBRO_OK = {
  slug: 'titulo-de-prueba',
  title: 'Titulo de prueba',
  author: 'Autor de prueba',
  asin: 'B000000001',
  amazonUrl: 'https://www.amazon.com/dp/B000000001',
  format: 'Kindle Edition',
  language: 'English',
  languageCode: 'en',
  printLength: 42,
  publicationDate: '2025-01-15',
  publicationDateLabel: 'January 15, 2025',
  measurement: {
    measuredAt: '2026-01-01T00:00:00Z',
    source: 'Fixture',
    sourceUrl: 'https://www.amazon.com/dp/B000000001',
    method: 'Fixture del selftest',
    measuredBy: 'selftest',
  },
}

function arbol(cfg, libros, autor = AUTOR_OK) {
  const dir = mkdtempSync(join(tmpdir(), 'mle-selftest-'))
  mkdirSync(join(dir, 'data'), { recursive: true })
  writeFileSync(join(dir, 'site.config.json'), JSON.stringify(cfg, null, 2))
  if (autor !== null) {
    writeFileSync(join(dir, 'author.json'), typeof autor === 'string' ? autor : JSON.stringify(autor, null, 2))
  }
  for (const [nombre, libro] of Object.entries(libros)) {
    writeFileSync(join(dir, 'data', nombre), typeof libro === 'string' ? libro : JSON.stringify(libro, null, 2))
  }
  return dir
}

// El host del build se resuelve desde el entorno (SITE_BASE_URL, VERCEL_PROJECT_PRODUCTION_URL).
// Si el selftest heredara esas variables de quien lo ejecuta, cada fixture emitiria canonicals
// de otro host y los controles fallarian por el entorno, no por el generador. Se limpian
// siempre y cada caso declara explicitamente el entorno que quiere probar.
const ENV_HOST = ['SITE_BASE_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL']

function correr(dir, envExtra = {}) {
  const env = { ...process.env, MLE_ROOT: dir }
  for (const k of ENV_HOST) delete env[k]
  Object.assign(env, envExtra)
  try {
    const out = execFileSync(process.execPath, [BUILD], {
      env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { code: 0, out, err: '' }
  } catch (e) {
    return { code: e.status ?? -1, out: e.stdout || '', err: e.stderr || '' }
  }
}

// --- 1. camino bueno: el build produce el sitio y los invariantes se cumplen ---

function casoBueno() {
  const dir = arbol(CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK })
  const r = correr(dir)
  const n = 'build con datos validos'
  if (r.code !== 0) { no(n, `exit ${r.code}: ${r.err.trim() || r.out.trim()}`); rmSync(dir, { recursive: true, force: true }); return }

  const leer = (p) => existsSync(join(dir, 'dist', p)) ? readFileSync(join(dir, 'dist', p), 'utf8') : null
  const controles = [
    ['emite index.html', () => leer('index.html') !== null],
    ['emite la ficha en URL limpia', () => leer('libros/titulo-de-prueba/index.html') !== null],
    ['emite la pagina de autor en URL limpia', () => leer('autor/index.html') !== null],
    ['emite 404.html', () => leer('404.html') !== null],
    ['NO emite .nojekyll (era solo para GitHub Pages)', () => leer('.nojekyll') === null],
    ['emite assets/styles.css', () => (leer('assets/styles.css') || '').includes('--tinta')],
    ['canonical del indice = baseUrl + "/"',
      () => leer('index.html').includes(`<link rel="canonical" href="${CFG_OK.baseUrl}/">`)],
    ['canonical de la ficha es autorreferente',
      () => leer('libros/titulo-de-prueba/index.html')
        .includes(`<link rel="canonical" href="${CFG_OK.baseUrl}/libros/titulo-de-prueba/">`)],
    ['og:url coincide con el canonical',
      () => leer('libros/titulo-de-prueba/index.html')
        .includes(`<meta property="og:url" content="${CFG_OK.baseUrl}/libros/titulo-de-prueba/">`)],
    ['@id del JSON-LD sale de baseUrl',
      () => leer('libros/titulo-de-prueba/index.html').includes(`"@id": "${CFG_OK.baseUrl}/libros/titulo-de-prueba/"`)],
    ['el sitemap usa baseUrl y lista indice + ficha + autor', () => {
      const s = leer('sitemap.xml')
      return s.includes(`<loc>${CFG_OK.baseUrl}/</loc>`) &&
        s.includes(`<loc>${CFG_OK.baseUrl}/libros/titulo-de-prueba/</loc>`) &&
        s.includes(`<loc>${CFG_OK.baseUrl}/autor/</loc>`) &&
        (s.match(/<loc>/g) || []).length === 3
    }],
    ['el sitemap NO lista 404.html', () => !leer('sitemap.xml').includes('404')],
    ['robots.txt apunta al sitemap de baseUrl',
      () => leer('robots.txt').includes(`Sitemap: ${CFG_OK.baseUrl}/sitemap.xml`)],
    ['404.html lleva noindex', () => leer('404.html').includes('<meta name="robots" content="noindex">')],
    ['el indice enlaza a la ficha con el basePath del proyecto',
      () => leer('index.html').includes('href="/repo-de-prueba/libros/titulo-de-prueba/"')],
    ['la hoja de estilos se enlaza con el basePath',
      () => leer('index.html').includes('href="/repo-de-prueba/assets/styles.css"')],
    ['<html lang> sale de siteLang', () => leer('index.html').startsWith('<!DOCTYPE html>\n<html lang="es">')],
    ['el titulo del libro va marcado con su propio idioma',
      () => leer('libros/titulo-de-prueba/index.html').includes('<h1 lang="en">')],
    ['no hay aggregateRating ni resenas inventadas',
      () => !/aggregateRating|reviewCount|ratingValue|bestseller/i.test(leer('libros/titulo-de-prueba/index.html'))],
    ['la ficha muestra la fecha de medicion',
      () => leer('libros/titulo-de-prueba/index.html').includes('datetime="2026-01-01T00:00:00Z"')],
    ['el enlace a Amazon lleva rel explicito',
      () => leer('libros/titulo-de-prueba/index.html')
        .includes('href="https://www.amazon.com/dp/B000000001" rel="external nofollow"')],
    ['la ficha emite BreadcrumbList con @id bajo baseUrl',
      () => leer('libros/titulo-de-prueba/index.html')
        .includes(`"@id": "${CFG_OK.baseUrl}/libros/titulo-de-prueba/#breadcrumb"`)],
    ['el indice enlaza a la pagina de autor',
      () => leer('index.html').includes('href="/repo-de-prueba/autor/"')],
    ['la pagina de autor emite Person con las dos formas medidas del nombre', () => {
      const a = leer('autor/index.html')
      return a.includes('"@type": "Person"') && a.includes('"name": "Autor de prueba"') &&
        a.includes('"alternateName": "AUTOR DE PRUEBA"')
    }],
    ['el Person lleva @id absoluto bajo baseUrl',
      () => leer('autor/index.html').includes(`"@id": "${CFG_OK.baseUrl}/autor/#person"`)],
    ['el sameAs del autor solo lista perfiles comprobados', () => {
      const a = leer('autor/index.html')
      const m = a.match(/"sameAs": \[\s*"([^"]+)"\s*\]/)
      return !!m && m[1] === 'https://www.ejemplo.org/perfil/1'
    }],
    ['la pagina de autor declara lo que no existe',
      () => leer('autor/index.html').includes('No hay biografia recuperable en ninguna fuente medida.')],
    ['la pagina de autor marca el titulo sin ficha como no medido',
      () => leer('autor/index.html').includes('Titulo sin ficha') &&
        !leer('autor/index.html').includes('href="/repo-de-prueba/libros/titulo-sin-ficha/"')],
  ]
  let malos = 0
  for (const [nombre, f] of controles) {
    let bien = false
    try { bien = !!f() } catch (e) { bien = false }
    if (bien) ok(nombre); else { no(nombre, 'control falso'); malos++ }
  }
  if (!malos) ok(n)
  rmSync(dir, { recursive: true, force: true })
}

// --- 2. basePath vacio cuando baseUrl es la raiz de un dominio propio ---

function casoDominioPropio() {
  const dir = arbol({ ...CFG_OK, baseUrl: 'https://ebooks.ejemplo.cl' }, { 'titulo-de-prueba.json': LIBRO_OK })
  const r = correr(dir)
  const n = 'baseUrl en la raiz de un dominio: enlaces internos sin prefijo'
  if (r.code !== 0) { no(n, `exit ${r.code}: ${r.err.trim()}`) }
  else {
    const i = readFileSync(join(dir, 'dist', 'index.html'), 'utf8')
    if (i.includes('href="/libros/titulo-de-prueba/"') && i.includes('href="/assets/styles.css"') &&
      i.includes('<link rel="canonical" href="https://ebooks.ejemplo.cl/">')) ok(n)
    else no(n, 'los enlaces internos o el canonical no siguieron a baseUrl')
  }
  rmSync(dir, { recursive: true, force: true })
}

// --- 2-bis. titulo en un idioma distinto al del libro, y anomalias de la fuente ---
//
// Caso real medido: B0HDPV63R4 declara Language=Spanish con el titulo en ingles. El atributo
// lang del titulo describe ese texto; inLanguage describe el libro. Confundirlos hace que un
// lector de pantalla lea un titulo ingles con voz española.
function casoIdiomaDelTitulo() {
  const libro = {
    ...LIBRO_OK,
    language: 'Spanish',
    languageCode: 'es',
    titleLanguageCode: 'en',
    observations: ['La ficha declara Spanish con el titulo en ingles.'],
  }
  const dir = arbol(CFG_OK, { 'titulo-de-prueba.json': libro })
  const r = correr(dir)
  const n = 'titleLanguageCode marca el idioma del titulo sin tocar inLanguage'
  if (r.code !== 0) { no(n, `exit ${r.code}: ${r.err.trim()}`); rmSync(dir, { recursive: true, force: true }); return }
  const ficha = readFileSync(join(dir, 'dist', 'libros', 'titulo-de-prueba', 'index.html'), 'utf8')
  const indice = readFileSync(join(dir, 'dist', 'index.html'), 'utf8')
  const controles = [
    ['el h1 lleva el idioma del titulo', () => ficha.includes('<h1 lang="en">')],
    ['inLanguage del JSON-LD sigue siendo el idioma del libro', () => ficha.includes('"inLanguage": "es"')],
    ['el enlace del indice lleva el idioma del titulo', () => indice.includes('lang="en">Titulo de prueba</a>')],
    ['la ficha publica las anomalias de la fuente',
      () => ficha.includes('Anomalías de la ficha en Amazon') &&
        ficha.includes('La ficha declara Spanish con el titulo en ingles.')],
  ]
  let malos = 0
  for (const [nombre, f] of controles) {
    let bien = false
    try { bien = !!f() } catch { bien = false }
    if (bien) ok(nombre); else { no(nombre, 'control falso'); malos++ }
  }
  if (!malos) ok(n)
  rmSync(dir, { recursive: true, force: true })
}

// --- 2-ter. chrome en ingles y bloque de contexto de demanda ---
//
// El bloque de preguntas reales es el unico contenido del hub que no sale de la ficha de
// Amazon (condicion de citabilidad 2 de NEXUS). Se comprueba que se publique con su fuente,
// su fecha y el aviso de que el libro no se ha leido — sin ese aviso, citar la pregunta
// insinuaria que el libro la responde.
function casoIngesYDemanda() {
  const libro = {
    ...LIBRO_OK,
    demandContext: {
      source: {
        url: 'https://www.ejemplo.org/faq/',
        label: 'the example FAQ',
        readAt: '2026-01-02',
        readBy: 'selftest',
        method: 'Fixture del selftest.',
      },
      questionsLang: 'es',
      questions: ['¿Cuánto cuesta?'],
      notes: ['Nota medida de fixture.'],
    },
    relatedEditions: [{
      asin: 'B000000002', format: 'Print edition', storefront: 'amazon.es',
      url: 'https://www.amazon.es/dp/B000000002', confidence: 'Medium', note: 'Fixture.',
    }],
  }
  const dir = arbol({ ...CFG_OK, siteLang: 'en' }, { 'titulo-de-prueba.json': libro })
  const r = correr(dir)
  const n = 'chrome en ingles + bloque de demanda con fuente y aviso'
  if (r.code !== 0) { no(n, `exit ${r.code}: ${r.err.trim()}`); rmSync(dir, { recursive: true, force: true }); return }
  const ficha = readFileSync(join(dir, 'dist', 'libros', 'titulo-de-prueba', 'index.html'), 'utf8')
  const indice = readFileSync(join(dir, 'dist', 'index.html'), 'utf8')
  const controles = [
    ['<html lang> sigue a siteLang=en', () => indice.startsWith('<!DOCTYPE html>\n<html lang="en">')],
    ['el chrome se traduce', () => indice.includes('Skip to content') && ficha.includes('Title data')],
    ['la fecha se formatea en ingles', () => ficha.includes('January 15, 2025')],
    ['la pregunta se cita literal y con su idioma',
      () => ficha.includes('<li lang="es">¿Cuánto cuesta?</li>')],
    ['la fuente de la pregunta va con URL y fecha',
      () => ficha.includes('https://www.ejemplo.org/faq/') && ficha.includes('January 2, 2026')],
    ['el aviso de que el libro no se ha leido se publica',
      () => ficha.includes('Nobody at MetrilabCL has read the inside of the book')],
    ['la edicion hermana se menciona en texto y NO en el JSON-LD', () => {
      const bloques = [...ficha.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => m[1])
      return ficha.includes('B000000002') && !bloques.some((b) => b.includes('B000000002')) &&
        !bloques.some((b) => b.includes('workExample'))
    }],
    ['no hay JS en la pagina',
      () => !/<script(?![^>]*type="application\/ld\+json")/i.test(ficha)],
  ]
  let malos = 0
  for (const [nombre, f] of controles) {
    let bien = false
    try { bien = !!f() } catch { bien = false }
    if (bien) ok(nombre); else { no(nombre, 'control falso'); malos++ }
  }
  if (!malos) ok(n)
  rmSync(dir, { recursive: true, force: true })
}

// --- 3. cada dato malo tiene que MATAR el build con un mensaje que lo nombre ---

const CASOS_MALOS = [
  ['data/ vacio no publica un catalogo vacio', CFG_OK, {}, /ningun titulo/i],
  ['JSON roto', CFG_OK, { 'titulo-de-prueba.json': '{no es json' }, /JSON invalido/i],
  ['falta un campo requerido', CFG_OK,
    { 'titulo-de-prueba.json': (() => { const b = { ...LIBRO_OK }; delete b.printLength; return b })() },
    /falta el campo requerido "printLength"/],
  ['falta la procedencia', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, measurement: { ...LIBRO_OK.measurement, measuredAt: undefined } } },
    /falta measurement\.measuredAt/],
  ['slug que no coincide con el archivo', CFG_OK,
    { 'otro-nombre.json': LIBRO_OK }, /no coincide con el nombre del archivo/],
  ['slug que no es URL limpia', CFG_OK,
    { 'Titulo Raro.json': { ...LIBRO_OK, slug: 'Titulo Raro' } }, /no es una URL limpia/],
  ['ASIN con formato invalido', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, asin: 'XX' } }, /no tiene el formato de 10 caracteres/],
  ['amazonUrl que no corresponde al ASIN', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, amazonUrl: 'https://www.amazon.com/dp/B0ZZZZZZZZ' } },
    /no contiene el ASIN/],
  ['printLength no numerico', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, printLength: '88 pages' } }, /printLength debe ser un entero positivo/],
  ['fecha de publicacion mal formada', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, publicationDate: 'August 28, 2025' } },
    /publicationDate debe ser YYYY-MM-DD/],
  ['measuredAt sin formato UTC', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, measurement: { ...LIBRO_OK.measurement, measuredAt: '2026-01-01' } } },
    /measuredAt debe ser ISO-8601 UTC/],
  ['precio mal formado', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, price: { amount: '6,99', currency: 'usd' } } },
    /price debe ser/],
  // El "$0.00" del swatch Kindle es el icono de Kindle Unlimited, no el precio: publicarlo
  // regalaria un libro que se vende. Un cero que pasa por precio es el peor cero silencioso.
  ['precio 0.00 (el cero de Kindle Unlimited)', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, price: { amount: '0.00', currency: 'USD' } } },
    /Kindle Unlimited/],
  ['titleLanguageCode que no es BCP-47', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, titleLanguageCode: 'Ingles' } },
    /titleLanguageCode debe ser BCP-47/],
  ['observations vacio (una seccion vacia no se publica)', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, observations: [] } },
    /observations debe ser un arreglo no vacio/],
  ['notMeasured que no es un arreglo', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, notMeasured: 'no medido' } },
    /notMeasured debe ser un arreglo no vacio/],
  ['dos titulos con el mismo ASIN', CFG_OK, {
    'titulo-de-prueba.json': LIBRO_OK,
    'otro-titulo.json': { ...LIBRO_OK, slug: 'otro-titulo', title: 'Otro titulo' },
  }, /asin duplicado/],
  ['dos titulos con el mismo title (meta duplicada)', CFG_OK, {
    'titulo-de-prueba.json': LIBRO_OK,
    'otro-titulo.json': { ...LIBRO_OK, slug: 'otro-titulo', asin: 'B000000002', amazonUrl: 'https://www.amazon.com/dp/B000000002' },
  }, /title duplicado/],
  ['baseUrl con barra final', { ...CFG_OK, baseUrl: 'https://ejemplo.cl/repo/' },
    { 'titulo-de-prueba.json': LIBRO_OK }, /no debe terminar en/],
  ['baseUrl no https', { ...CFG_OK, baseUrl: 'ejemplo.cl/repo' },
    { 'titulo-de-prueba.json': LIBRO_OK }, /URL https absoluta/],
  ['falta siteName en la config', (() => { const c = { ...CFG_OK }; delete c.siteName; return c })(),
    { 'titulo-de-prueba.json': LIBRO_OK }, /falta o esta vacio "siteName"/],
  // Un siteLang sin tabla de cadenas dejaria media plantilla en el idioma equivocado sin avisar.
  ['siteLang sin tabla de cadenas', { ...CFG_OK, siteLang: 'fr' },
    { 'titulo-de-prueba.json': LIBRO_OK }, /no tiene tabla de cadenas/],
  ['catalogPathSegment igual a authorPathSegment', { ...CFG_OK, authorPathSegment: 'libros' },
    { 'titulo-de-prueba.json': LIBRO_OK }, /no pueden ser el mismo segmento/],
  // --- pagina de autor: la entidad es parte de la fase 1, no un extra opcional ---
  ['falta author.json', CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK }, /falta .*author\.json/, null],
  ['author.json roto', CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK },
    /author\.json no es JSON valido/, '{no es json'],
  ['author.json sin notFound (una entidad vacia tiene que decir que esta vacia)', CFG_OK,
    { 'titulo-de-prueba.json': LIBRO_OK }, /falta el campo requerido "notFound"/,
    (() => { const a = { ...AUTOR_OK }; delete a.notFound; return a })()],
  ['primaryName que no es ninguna forma medida', CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK },
    /no aparece en nameForms/, { ...AUTOR_OK, primaryName: 'MetrilabCL' }],
  ['sameAs sin fecha de comprobacion', CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK },
    /falta sameAs\[0\]\.verifiedAt/,
    { ...AUTOR_OK, sameAs: [{ url: 'https://www.ejemplo.org/perfil/1', label: 'Perfil', verifiedBy: 'selftest' }] }],
  ['la pagina de autor omite un titulo publicado', CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK },
    /no aparece en knownTitles/,
    { ...AUTOR_OK, knownTitles: [{ title: 'Otro', slug: null, corroboration: 'Fixture' }] }],
  ['knownTitles apunta a un slug que no existe', CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK },
    /no corresponde a ningun archivo de data/,
    { ...AUTOR_OK, knownTitles: [...AUTOR_OK.knownTitles, { title: 'Fantasma', slug: 'fantasma', corroboration: 'Fixture' }] }],
  // --- contexto de demanda: una pregunta sin fuente citable es una pregunta inventada ---
  ['demandContext sin fuente', CFG_OK,
    { 'titulo-de-prueba.json': { ...LIBRO_OK, demandContext: { questions: ['¿Y?'], questionsLang: 'es' } } },
    /demandContext\.source es obligatorio/],
  ['demandContext sin preguntas', CFG_OK,
    {
      'titulo-de-prueba.json': {
        ...LIBRO_OK,
        demandContext: {
          questions: [], questionsLang: 'es',
          source: { url: 'https://ejemplo.org/faq', label: 'FAQ', readAt: '2026-01-01', readBy: 'selftest', method: 'fixture' },
        },
      },
    },
    /demandContext\.questions debe ser un arreglo no vacio/],
  ['demandContext con fuente que no es URL absoluta', CFG_OK,
    {
      'titulo-de-prueba.json': {
        ...LIBRO_OK,
        demandContext: {
          questions: ['¿Y?'], questionsLang: 'es',
          source: { url: '/faq', label: 'FAQ', readAt: '2026-01-01', readBy: 'selftest', method: 'fixture' },
        },
      },
    },
    /demandContext\.source\.url debe ser una URL https absoluta/],
  ['relatedEditions con ASIN que no coincide con su URL', CFG_OK,
    {
      'titulo-de-prueba.json': {
        ...LIBRO_OK,
        relatedEditions: [{
          asin: 'B000000009', format: 'Paperback', storefront: 'amazon.es',
          url: 'https://www.amazon.es/dp/B000000008', confidence: 'Media', note: 'fixture',
        }],
      },
    },
    /relatedEditions\[0\]\.url no contiene el ASIN/],
]

function casosMalos() {
  for (const [nombre, cfg, libros, patron, autor] of CASOS_MALOS) {
    const dir = arbol(cfg, libros, autor === undefined ? AUTOR_OK : autor)
    const r = correr(dir)
    if (r.code === 0) no(nombre, 'el build salio con exit 0 en vez de morir')
    else if (!patron.test(r.err)) no(nombre, `exit ${r.code} pero el mensaje no dice ${patron}: ${r.err.trim().slice(0, 240)}`)
    else ok(`${nombre} -> exit ${r.code}`)
    rmSync(dir, { recursive: true, force: true })
  }
}

// --- 4. los datos reales del repositorio pasan el build ---

function casoRepoReal() {
  const dir = mkdtempSync(join(tmpdir(), 'mle-real-'))
  cpSync(join(ROOT, 'site.config.json'), join(dir, 'site.config.json'))
  cpSync(join(ROOT, 'author.json'), join(dir, 'author.json'))
  cpSync(join(ROOT, 'data'), join(dir, 'data'), { recursive: true })
  const r = correr(dir)
  if (r.code !== 0) no('los datos reales de data/ construyen', `exit ${r.code}: ${r.err.trim().slice(0, 400)}`)
  else ok(`los datos reales de data/ construyen -> ${r.out.trim().split('\n')[0]}`)
  rmSync(dir, { recursive: true, force: true })
}

// --- 5. resolucion del host: entorno > entorno de Vercel > config, y falla ruidosa ---
//
// Es el mecanismo que hace desplegable el sitio en Vercel sin clavar el dominio en el repo.
// Se mide sobre el canonical emitido y sobre el exit code, no sobre la intencion del codigo.
function casoResolucionDelHost() {
  const casos = [
    {
      n: 'SITE_BASE_URL gana al baseUrl de site.config.json',
      env: { SITE_BASE_URL: 'https://hub.ejemplo.cl' },
      espera: 'https://hub.ejemplo.cl', fuente: 'SITE_BASE_URL',
    },
    {
      n: 'VERCEL_PROJECT_PRODUCTION_URL (sin esquema) se usa si no hay SITE_BASE_URL',
      env: { VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'hub.vercel.app' },
      espera: 'https://hub.vercel.app', fuente: 'VERCEL_PROJECT_PRODUCTION_URL',
    },
    {
      // El matiz que importa: en un preview, VERCEL_PROJECT_PRODUCTION_URL sigue apuntando a
      // produccion. El canonical de un preview NO debe apuntarse a si mismo.
      n: 'en un preview el canonical apunta a produccion, no al host del preview',
      env: {
        VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: 'hub-git-rama-equipo.vercel.app',
        VERCEL_PROJECT_PRODUCTION_URL: 'hub.vercel.app',
      },
      espera: 'https://hub.vercel.app', fuente: 'VERCEL_PROJECT_PRODUCTION_URL',
    },
    {
      n: 'SITE_BASE_URL gana tambien dentro de Vercel',
      env: { VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'hub.vercel.app', SITE_BASE_URL: 'https://ebooks.ejemplo.cl' },
      espera: 'https://ebooks.ejemplo.cl', fuente: 'SITE_BASE_URL',
    },
    {
      n: 'sin entorno cae al baseUrl de site.config.json',
      env: {},
      espera: CFG_OK.baseUrl, fuente: 'site.config.json baseUrl',
    },
  ]
  for (const c of casos) {
    const dir = arbol(CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK })
    const r = correr(dir, c.env)
    if (r.code !== 0) no(c.n, `exit ${r.code}: ${r.err.trim().slice(0, 240)}`)
    else {
      const i = readFileSync(join(dir, 'dist', 'index.html'), 'utf8')
      const s = readFileSync(join(dir, 'dist', 'sitemap.xml'), 'utf8')
      const canonicalOk = i.includes(`<link rel="canonical" href="${c.espera}/">`)
      const sitemapOk = s.includes(`<loc>${c.espera}/libros/titulo-de-prueba/</loc>`)
      // El log es parte del contrato: es lo unico que se lee en Vercel para saber que host salio.
      const logOk = r.out.includes(`baseUrl: ${c.espera}  (fuente: ${c.fuente})`)
      if (canonicalOk && sitemapOk && logOk) ok(c.n)
      else no(c.n, `canonical:${canonicalOk} sitemap:${sitemapOk} log:${logOk} — log: ${r.out.split('\n').find((l) => l.startsWith('baseUrl:'))}`)
    }
    rmSync(dir, { recursive: true, force: true })
  }

  // Falla ruidosa: dentro de Vercel sin host que usar, antes que un canonical inventado.
  const malos = [
    {
      n: 'build de Vercel sin SITE_BASE_URL ni VERCEL_PROJECT_PRODUCTION_URL -> muere',
      env: { VERCEL: '1' }, patron: /sin host que usar/,
    },
    {
      n: 'SITE_BASE_URL invalida -> muere nombrando SITE_BASE_URL',
      env: { SITE_BASE_URL: 'http://ejemplo.cl' }, patron: /SITE_BASE_URL: baseUrl debe ser una URL https absoluta/,
    },
    {
      n: 'SITE_BASE_URL con barra final -> muere nombrando SITE_BASE_URL',
      env: { SITE_BASE_URL: 'https://ejemplo.cl/' }, patron: /SITE_BASE_URL: baseUrl no debe terminar en/,
    },
  ]
  for (const c of malos) {
    const dir = arbol(CFG_OK, { 'titulo-de-prueba.json': LIBRO_OK })
    const r = correr(dir, c.env)
    if (r.code === 0) no(c.n, 'el build salio con exit 0 en vez de morir')
    else if (!c.patron.test(r.err)) no(c.n, `exit ${r.code} pero el mensaje no dice ${c.patron}: ${r.err.trim().slice(0, 240)}`)
    else ok(`${c.n} -> exit ${r.code}`)
    rmSync(dir, { recursive: true, force: true })
  }
}

console.log('selftest del generador de metrilab-ebooks')
console.log(`\n[1] camino bueno`); casoBueno()
console.log(`\n[2] dominio propio en la raiz`); casoDominioPropio()
console.log(`\n[2-bis] idioma del titulo distinto al del libro`); casoIdiomaDelTitulo()
console.log(`\n[2-ter] chrome en ingles y contexto de demanda`); casoIngesYDemanda()
console.log(`\n[3] falla ruidosa con datos malos (${CASOS_MALOS.length} casos)`); casosMalos()
console.log(`\n[4] datos reales del repositorio`); casoRepoReal()
console.log(`\n[5] resolucion del host (SITE_BASE_URL / Vercel / config)`); casoResolucionDelHost()

if (fallos) { console.error(`\nSELFTEST FALLIDO — ${fallos} control(es) en rojo\n`); process.exit(1) }
console.log('\nselftest OK — todos los controles en verde\n')
