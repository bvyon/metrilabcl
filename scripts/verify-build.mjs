import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}
const htmlFiles = (await files(root)).filter(file => file.endsWith('.html'));
const titles = new Set();
let checkedLinks = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = file.slice(root.length) || '/';
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: debe tener un solo H1`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title, `${route}: falta título`);
  assert.ok(!titles.has(title), `${route}: título repetido`);
  titles.add(title);
  assert.match(html, /<html[^>]+lang="es-CL"/, `${route}: falta idioma`);
  assert.match(html, /<meta name="description" content="[^"]+"/, `${route}: falta descripción`);
  assert.match(html, /<link rel="canonical" href="https:\/\/metrilab\.cl\//, `${route}: falta canonical`);
  const head = (html.match(/<head>(.*?)<\/head>/s)?.[1] || '').replace(/<!--.*?-->/gs, '');
  const body = (html.match(/<body>(.*?)<\/body>/s)?.[1] || '').replace(/<!--.*?-->/gs, '');
  assert.match(head, /^\s*<script>\(function\(w,d,s,l,i\)/, `${route}: GTM debe iniciar el head`);
  assert.equal((head.match(/'GTM-WQVRDHQM'/g) || []).length, 1, `${route}: contenedor GTM ausente o duplicado`);
  assert.match(body, /^\s*<noscript><iframe[^>]+src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-WQVRDHQM"/, `${route}: GTM noscript debe iniciar el body`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    const schema = JSON.parse(match[1]);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Organization'), `${route}: falta organización`);
    assert.ok(!match[1].includes('aggregateRating'), `${route}: reseñas no autorizadas`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = match[1].split('?')[0];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = resolve(root, `.${decodeURIComponent(href)}`);
    assert.ok(target.startsWith(root), 'Ruta fuera de dist');
    let exists = false;
    for (const candidate of [target, join(target, 'index.html')]) {
      try { if ((await stat(candidate)).isFile()) { exists = true; break; } } catch {}
    }
    assert.ok(exists, `${route}: enlace o recurso roto ${href}`);
    checkedLinks++;
  }
  assert.ok(!/\/publicaciones\//.test(html), `${route}: el usuario retiró publicaciones`);
}
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.equal(sitemapUrls.length, htmlFiles.length - 1, 'Cada página publicada, salvo 404, debe figurar en el sitemap');
assert.ok(!sitemapUrls.some(url => url.includes('404')), 'No incluir 404 en sitemap');
for (const url of sitemapUrls) {
  const html = await readFile(join(root, new URL(url).pathname, 'index.html'), 'utf8');
  assert.ok(html.includes(`href="${url}"`), `Canonical incorrecto: ${url}`);
}
assert.ok((await readFile(join(root, 'robots.txt'), 'utf8')).includes('Sitemap: https://metrilab.cl/sitemap.xml'));
assert.ok((await stat(join(root, 'social.jpg'))).size > 0, 'Falta imagen social');
console.log(`Verificado: ${htmlFiles.length} páginas HTML, ${checkedLinks} enlaces y recursos internos, sitemap, metadatos y JSON-LD.`);
