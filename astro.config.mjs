// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// El host del sitio NO esta clavado. Se resuelve en este orden y la fuente elegida se imprime
// en el log del build: en el log de Vercel se lee que canonical salio sin abrir el HTML.
//
//   1. SITE_BASE_URL                  env explicita, gana siempre.
//   2. VERCEL_PROJECT_PRODUCTION_URL  la inyecta Vercel. Documentacion de Vercel, "System
//      environment variables" (leida 2026-09-25): "A production domain name of the project.
//      (...) Note, that this is always set, even in preview deployments." Es justo lo que
//      queremos: un despliegue de preview NO emite canonical hacia si mismo, sino hacia
//      produccion. Viene sin esquema ("mi-sitio.com"), asi que se le antepone https://.
//   3. DEFECTO                        para `npm run dev` y `npm run build` en local.
//
// DEFECTO es el subdominio recomendado por el informe (MET-147). El Board todavia no lo
// confirma: por eso es una variable y no una constante repartida por las plantillas.
const DEFECTO = 'https://libros.bvyon-marketing.cl'

function resolverSite() {
  /** @param {string} n @returns {string | null} */
  const env = (n) => (typeof process.env[n] === 'string' && process.env[n].trim() ? process.env[n].trim() : null)

  const explicita = env('SITE_BASE_URL')
  if (explicita) return { url: explicita, fuente: 'SITE_BASE_URL' }

  const produccion = env('VERCEL_PROJECT_PRODUCTION_URL')
  if (produccion) {
    return { url: `https://${produccion.replace(/^https?:\/\//, '')}`, fuente: 'VERCEL_PROJECT_PRODUCTION_URL' }
  }

  return { url: DEFECTO, fuente: 'valor por defecto de astro.config.mjs' }
}

const { url: site, fuente } = resolverSite()

// Falla ruidosa: un canonical mal formado se propaga a las 4 paginas, al sitemap y a cada
// @id del JSON-LD. Preferimos un build rojo a un sitio que se apunta a si mismo mal.
if (!/^https:\/\/[^\s/]+$/.test(site)) {
  throw new Error(
    `[site] ${fuente} tiene que ser una URL https absoluta, sin ruta y sin barra final. Recibido: "${site}"`,
  )
}

console.log(`[site] ${site}  (fuente: ${fuente})`)

export default defineConfig({
  site,
  // URL de directorio con barra final: /libros/<slug>/ sirve libros/<slug>/index.html y
  // responde 200 sin redireccion. Va emparejado con "trailingSlash": true en vercel.json.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Por omision Astro mete la hoja en un <style> dentro de cada pagina. Aqui interesa lo
    // contrario: un archivo en /_astro/ con hash de contenido en el nombre, que las 4 paginas
    // comparten y que se puede servir con Cache-Control immutable a un ano (ver vercel.json).
    // Inmutable SOLO es correcto porque el nombre lleva el hash: si cambia el CSS, cambia el
    // nombre, y no hay forma de servirle a nadie una version vieja.
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      // 404 no es una URL del catalogo: no va al sitemap.
      filter: (page) => !page.includes('/404'),
    }),
  ],
})
