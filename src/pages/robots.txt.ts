import type { APIRoute } from 'astro'
import { SITIO } from '../lib/sitio'

// La linea Sitemap sale de `site`, no de una constante: cambiar de host no deja aqui la URL
// del host viejo.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('falta `site` en astro.config.mjs')
  return new Response(
    `# robots.txt de ${SITIO.siteName} — generado por src/pages/robots.txt.ts desde \`site\`
User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', site).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
