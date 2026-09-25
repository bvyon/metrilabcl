#!/usr/bin/env node
// Guardia de salida. Corre DESPUES de `astro build` (ver el script "build" de package.json) y
// mide el HTML emitido, no la intencion del codigo.
//
// Por que existe: el esquema de src/content.config.ts impide que un campo inventado entre por
// los datos, pero no impide que alguien lo escriba a mano en una plantilla. Esto cierra esa
// puerta sobre el artefacto. Exit != 0 rompe el build y, en Vercel, el despliegue.
//
// Uso: node scripts/verificar-salida.mjs [directorio]   (por omision dist/)

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const DIST = process.argv[2] || 'dist'

const problemas = []
const falla = (m) => problemas.push(m)

if (!existsSync(DIST)) {
  console.error(`VERIFICACION FALLIDA — no existe ${DIST}/. Corre \`astro build\` antes.`)
  process.exit(1)
}

function archivos(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...archivos(p))
    else out.push(p)
  }
  return out
}

const todos = archivos(DIST)
const htmls = todos.filter((f) => f.endsWith('.html'))

if (!htmls.length) falla(`${DIST}/ no contiene ningun .html`)

// --- 1. Las cinco cadenas que no se publican sin medicion ---
//
// Cero resenas confirmadas por dos fuentes independientes, cero rankings medidos, cero
// premios. Que lo garantice el build y no la memoria del siguiente que edite.
const PROHIBIDAS = ['aggregateRating', 'ratingValue', 'reviewCount', 'bestseller', 'award']
for (const f of todos) {
  const txt = readFileSync(f, 'utf8')
  for (const c of PROHIBIDAS) {
    const re = new RegExp(c, 'i')
    if (re.test(txt)) {
      falla(`${relative(DIST, f)}: aparece "${c}" en la salida y no hay ningun dato medido que lo respalde`)
    }
  }
}

// --- 2. Cero residuos del destino anterior (GitHub Pages) ---
const RESIDUOS = [
  ['github.io', 'host de GitHub Pages'],
  ['/metrilabcl/', 'prefijo de project pages'],
  ['nojekyll', 'marca de Jekyll, que es de Pages'],
]
for (const f of todos) {
  const txt = readFileSync(f, 'utf8')
  for (const [cadena, que] of RESIDUOS) {
    if (txt.includes(cadena)) falla(`${relative(DIST, f)}: aparece "${cadena}" (${que})`)
  }
}
if (existsSync(join(DIST, '.nojekyll'))) falla(`${DIST}/.nojekyll existe y no deberia`)

// --- 3. Invariante del canonical: autorreferente y con archivo detras ---
//
// La URL que el HTML declara como canonical tiene que ser la URL en la que esa pagina se
// sirve. Un canonical cruzado manda a Google a indexar otra pagina.
const indexables = htmls.filter((f) => !f.endsWith(`${sep}404.html`))
for (const f of indexables) {
  const txt = readFileSync(f, 'utf8')
  const m = txt.match(/<link rel="canonical" href="([^"]+)"/)
  if (!m) { falla(`${relative(DIST, f)}: no declara canonical`); continue }
  let ruta
  try {
    ruta = new URL(m[1]).pathname
  } catch {
    falla(`${relative(DIST, f)}: canonical "${m[1]}" no es una URL absoluta`)
    continue
  }
  if (!ruta.endsWith('/')) {
    falla(`${relative(DIST, f)}: el canonical "${m[1]}" no termina en barra — las URL de este sitio son de directorio`)
  }
  const esperado = join(DIST, ruta.replace(/^\//, ''), 'index.html')
  if (relative(esperado, f) !== '') {
    falla(`${relative(DIST, f)}: declara canonical ${m[1]}, que corresponde a ${relative(DIST, esperado)}`)
  }
  // og:url tiene que coincidir con el canonical: si divergen, cada red social cita una URL.
  const og = txt.match(/<meta property="og:url" content="([^"]+)"/)
  if (!og) falla(`${relative(DIST, f)}: no declara og:url`)
  else if (og[1] !== m[1]) falla(`${relative(DIST, f)}: og:url "${og[1]}" no coincide con el canonical "${m[1]}"`)
}

// --- 4. El sitemap cubre exactamente lo publicado ---
const sitemaps = todos.filter((f) => /sitemap.*\.xml$/.test(f))
if (!sitemaps.length) falla('no se emitio ningun sitemap')
const locs = new Set()
for (const f of sitemaps) {
  for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!/sitemap.*\.xml$/.test(m[1])) locs.add(m[1])
  }
}
const canonicals = new Set(
  indexables.map((f) => (readFileSync(f, 'utf8').match(/<link rel="canonical" href="([^"]+)"/) || [])[1]).filter(Boolean),
)
for (const c of canonicals) {
  if (!locs.has(c)) falla(`el sitemap no lista ${c}, que si se publica`)
}
for (const l of locs) {
  if (!canonicals.has(l)) falla(`el sitemap lista ${l}, que no corresponde a ninguna pagina publicada`)
}
if ([...locs].some((l) => l.includes('404'))) falla('el sitemap lista la pagina 404')

// --- 5. La 404 se marca noindex ---
const p404 = join(DIST, '404.html')
if (!existsSync(p404)) falla('no se emitio 404.html')
else if (!readFileSync(p404, 'utf8').includes('<meta name="robots" content="noindex">')) {
  falla('404.html no lleva meta robots noindex')
}

// --- 6. robots.txt apunta a un sitemap que existe ---
const robots = join(DIST, 'robots.txt')
if (!existsSync(robots)) falla('no se emitio robots.txt')
else {
  const m = readFileSync(robots, 'utf8').match(/^Sitemap:\s*(\S+)$/m)
  if (!m) falla('robots.txt no declara una linea Sitemap:')
  else {
    const rel = new URL(m[1]).pathname.replace(/^\//, '')
    if (!existsSync(join(DIST, rel))) falla(`robots.txt apunta a ${m[1]} pero no se emitio ${DIST}/${rel}`)
  }
}

// --- 7. Titles y meta descriptions unicos entre las indexables ---
for (const [campo, re] of [['title', /<title>([\s\S]*?)<\/title>/], ['description', /<meta name="description" content="([^"]*)"/]]) {
  const visto = new Map()
  for (const f of indexables) {
    const v = (readFileSync(f, 'utf8').match(re) || [])[1]
    if (!v || !v.trim()) { falla(`${relative(DIST, f)}: ${campo} vacio`); continue }
    if (visto.has(v)) falla(`${campo} duplicado entre ${visto.get(v)} y ${relative(DIST, f)}: "${v.slice(0, 70)}..."`)
    visto.set(v, relative(DIST, f))
  }
}

// --- resultado ---
if (problemas.length) {
  console.error(`\nVERIFICACION FALLIDA — ${problemas.length} problema(s) en ${DIST}/:`)
  for (const p of problemas) console.error(`  - ${p}`)
  console.error('')
  process.exit(1)
}

const bytes = todos.reduce((n, f) => n + statSync(f).size, 0)
console.log(`verificacion OK — ${htmls.length} pagina(s), ${todos.length} archivo(s), ${(bytes / 1024).toFixed(1)} kB en ${DIST}/`)
console.log(`  cero de: ${PROHIBIDAS.join(', ')}`)
console.log(`  cero de: ${RESIDUOS.map(([c]) => c).join(', ')}`)
console.log(`  canonical autorreferente y en el sitemap: ${canonicals.size} pagina(s)`)
