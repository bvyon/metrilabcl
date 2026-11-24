import type { APIRoute } from 'astro';
import { pages } from '../data/pages';
import { articles, articleRevision } from '../data/articles';
import { site } from '../data/site';

// Fecha de la última modificación de cada página, tomada de la fecha de revisión que la propia página muestra.
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function isoFromLabel(label?: string) {
  const match = label?.match(/(\d{1,2}) de ([a-zñ]+) de (\d{4})/);
  const month = match ? months.indexOf(match[2]) + 1 : 0;
  return match && month ? `${match[3]}-${String(month).padStart(2, '0')}-${match[1].padStart(2, '0')}` : site.revision;
}
// Portada y contacto no muestran fecha de revisión: se actualiza aquí al cambiar su contenido.
const homeAndContact = '2026-11-24';

export const GET: APIRoute = () => {
  const articleDates = articles.map(article => (article.revised ?? articleRevision).iso);
  const entries: [string, string][] = [
    ['/', homeAndContact],
    ...pages.map((page): [string, string] => [`/${page.slug}/`, isoFromLabel(page.reviewDate)]),
    ['/contacto/', homeAndContact],
    ['/recursos/', [...articleDates].sort().at(-1) ?? site.revision],
    ...articles.map((article, i): [string, string] => [`/recursos/${article.slug}/`, articleDates[i]]),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(([path, lastmod]) => `<url><loc>${site.url}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
