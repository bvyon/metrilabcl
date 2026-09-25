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
  baseUrl: 'https://ejemplo.github.io/repo-de-prueba',
  siteName: 'Sitio de prueba',
  siteLang: 'es',
  publisherName: 'Editor de prueba',
  catalogPathSegment: 'libros',
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

function arbol(cfg, libros) {
  const dir = mkdtempSync(join(tmpdir(), 'mle-selftest-'))
  mkdirSync(join(dir, 'data'), { recursive: true })
  writeFileSync(join(dir, 'site.config.json'), JSON.stringify(cfg, null, 2))
  for (const [nombre, libro] of Object.entries(libros)) {
    writeFileSync(join(dir, 'data', nombre), typeof libro === 'string' ? libro : JSON.stringify(libro, null, 2))
  }
  return dir
}

function correr(dir) {
  try {
    const out = execFileSync(process.execPath, [BUILD], {
      env: { ...process.env, MLE_ROOT: dir }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
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
    ['emite 404.html', () => leer('404.html') !== null],
    ['emite .nojekyll', () => leer('.nojekyll') !== null],
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
    ['el sitemap usa baseUrl y lista indice + ficha', () => {
      const s = leer('sitemap.xml')
      return s.includes(`<loc>${CFG_OK.baseUrl}/</loc>`) &&
        s.includes(`<loc>${CFG_OK.baseUrl}/libros/titulo-de-prueba/</loc>`) &&
        (s.match(/<loc>/g) || []).length === 2
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
  ['baseUrl con barra final', { ...CFG_OK, baseUrl: 'https://ejemplo.github.io/repo/' },
    { 'titulo-de-prueba.json': LIBRO_OK }, /no debe terminar en/],
  ['baseUrl no https', { ...CFG_OK, baseUrl: 'ejemplo.github.io/repo' },
    { 'titulo-de-prueba.json': LIBRO_OK }, /URL https absoluta/],
  ['falta siteName en la config', (() => { const c = { ...CFG_OK }; delete c.siteName; return c })(),
    { 'titulo-de-prueba.json': LIBRO_OK }, /falta o esta vacio "siteName"/],
]

function casosMalos() {
  for (const [nombre, cfg, libros, patron] of CASOS_MALOS) {
    const dir = arbol(cfg, libros)
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
  cpSync(join(ROOT, 'data'), join(dir, 'data'), { recursive: true })
  const r = correr(dir)
  if (r.code !== 0) no('los datos reales de data/ construyen', `exit ${r.code}: ${r.err.trim().slice(0, 400)}`)
  else ok(`los datos reales de data/ construyen -> ${r.out.trim().split('\n')[0]}`)
  rmSync(dir, { recursive: true, force: true })
}

console.log('selftest del generador de metrilab-ebooks')
console.log(`\n[1] camino bueno`); casoBueno()
console.log(`\n[2] dominio propio en la raiz`); casoDominioPropio()
console.log(`\n[2-bis] idioma del titulo distinto al del libro`); casoIdiomaDelTitulo()
console.log(`\n[3] falla ruidosa con datos malos (${CASOS_MALOS.length} casos)`); casosMalos()
console.log(`\n[4] datos reales del repositorio`); casoRepoReal()

if (fallos) { console.error(`\nSELFTEST FALLIDO — ${fallos} control(es) en rojo\n`); process.exit(1) }
console.log('\nselftest OK — todos los controles en verde\n')
