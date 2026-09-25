# Hub de ebooks de MetrilabCL

Hub público de los ebooks autopublicados de **MetrilabCL** en Amazon Kindle. Sitio estático
generado con Node (sin dependencias), listo para GitHub Pages desde `main`.

**URL prevista:** https://bvyon.github.io/metrilabcl/ — **todavía no está publicada.**

> **Estado: construido, no publicado.** El Board decidió el 2026-09-25T02:25Z *«ocupar la repo
> asignada al proyecto dentro de bvyon»* y *«solo hagan la pagina yo lo publico despues»*. Por
> eso GitHub Pages **no está habilitado** y el job de despliegue del workflow **no corre**.
> Para publicar hacen falta dos actos humanos, en este orden:
>
> 1. **Settings → Pages → Source: «GitHub Actions»** (no «Deploy from a branch»).
> 2. **Settings → Secrets and variables → Actions → Variables → New repository variable:**
>    nombre `PAGES_ACTIVO`, valor `true`.
>
> Después, **Actions → «Hub de ebooks…» → Run workflow**. El job `construir` ya corre en cada
> push; el job `desplegar` sólo corre con `PAGES_ACTIVO=true`. Así el repositorio no queda con
> un workflow rojo por una decisión pendiente, y nada se publica por accidente.
>
> Con Pages en modo «GitHub Actions» se sirve **únicamente el artefacto `hub-ebooks/dist/`**,
> no el resto del repositorio.

El sitio vive en `hub-ebooks/` dentro del repositorio del proyecto; el workflow está en
`.github/workflows/hub-ebooks.yml`, en la raíz (GitHub sólo lee los workflows de ahí).

## Principio de contenido

Este sitio sólo publica datos **medidos** sobre la página pública del producto en Amazon, con
la fecha de la medición visible en cada ficha.

- Sin reseñas, valoraciones, `aggregateRating` ni estrellas mientras no se midan.
- Sin «bestseller» ni Best Sellers Rank mientras no se mida.
- Sin texto de relleno. Un título que no se pudo medir **no tiene ficha**: se deja fuera del
  catálogo y del `sitemap.xml` en lugar de publicarse a medias.

El generador hace cumplir esto: si un archivo de datos no trae su bloque `measurement`
completo, el build muere con exit 1 y no se despliega nada.

## Cómo se construye

```bash
node src/selftest.mjs   # chequeo de salud del generador (obligatorio en CI)
node src/build.mjs      # genera dist/
```

o con npm: `npm run check` (selftest + build).

No hay `npm install`: el generador usa sólo la librería estándar de Node 20+.

Salida en `dist/` (no versionada):

```
dist/index.html                          índice del catálogo
dist/libros/<slug>/index.html            una ficha por título, URL limpia sin parámetros
dist/404.html                            noindex, fuera del sitemap
dist/sitemap.xml                         generado desde baseUrl
dist/robots.txt                          generado desde baseUrl
dist/assets/styles.css
dist/.nojekyll                           GitHub Pages sirve dist/ tal cual, sin Jekyll
```

## Cómo se agrega un título nuevo

1. Crea `data/<slug>.json`. **El nombre del archivo tiene que ser exactamente el slug**, y el
   slug es la URL: `data/mi-titulo.json` → `/libros/mi-titulo/`.
2. Rellena el esquema completo. Todos los campos de abajo son obligatorios salvo los marcados
   como opcionales:

```jsonc
{
  "slug": "mi-titulo",                       // [a-z0-9] separado por guiones; == nombre del archivo
  "title": "Título exacto del producto",     // literal, como aparece en Amazon
  "author": "Metrilab Cl",
  "asin": "B000000000",                      // 10 caracteres [A-Z0-9]
  "amazonUrl": "https://www.amazon.com/.../dp/B000000000",  // tiene que contener el ASIN
  "format": "Kindle Edition",
  "language": "English",                     // como lo declara Amazon
  "languageCode": "en",                      // BCP-47; idioma DEL LIBRO -> inLanguage del JSON-LD
  "titleLanguageCode": "en",                 // opcional; idioma del TEXTO DEL TÍTULO -> lang del <h1>.
                                             // Sólo si difiere de languageCode (caso real: una ficha
                                             // que declara Spanish con el título en inglés).
  "printLength": 88,                         // entero de páginas, no "88 pages"
  "publicationDate": "2025-08-28",           // YYYY-MM-DD
  "publicationDateLabel": "August 28, 2025", // literal de Amazon, para trazar la fuente
  "fileSize": "590 KB",                      // opcional
  "price": { "amount": "6.99", "currency": "USD" },  // opcional; se muestra con aviso de caducidad.
                                             // 0.00 se rechaza: en Amazon ese cero es el icono de
                                             // Kindle Unlimited, no el precio de compra.
  "measurement": {                           // sin esto el build falla
    "measuredAt": "2026-09-25T01:36:00Z",    // ISO-8601 UTC, segundos incluidos
    "source": "Página de producto de amazon.com",
    "sourceUrl": "https://www.amazon.com/dp/B000000000",
    "method": "Cómo se obtuvo el dato",
    "measuredBy": "Quién lo midió",
    "evidenceFile": "ruta al crudo guardado",          // opcional
    "verifiedAt": "2026-09-25T01:58:00Z",              // opcional
    "verifiedBy": "quién re-verificó"                  // opcional
  },
  "observations": ["Anomalía medida en la ficha de Amazon"],  // opcional; sección propia en la ficha
  "notMeasured": ["Qué quedó sin medir y por qué"]     // opcional, se publica tal cual
}
```

3. `node src/selftest.mjs && node src/build.mjs`. El build rechaza slugs duplicados, ASIN
   duplicados, títulos duplicados (romperían la unicidad de `<title>`/meta description),
   fechas mal formadas y `printLength` no numérico.
4. Commit a `main`. El job `construir` del workflow valida y construye; el índice y el
   `sitemap.xml` recogen el título nuevo automáticamente. El despliegue sigue dependiendo de
   `PAGES_ACTIVO` (ver el estado al principio de este README).

## Cómo se cambia la URL base

`site.config.json` → `baseUrl`. Es la **única** fuente de verdad del host: de ahí se derivan
`<link rel="canonical">`, `og:url`, `sitemap.xml`, la línea `Sitemap:` de `robots.txt`, la
`@id` del JSON-LD y el prefijo de todos los enlaces internos.

```jsonc
{ "baseUrl": "https://bvyon.github.io/metrilabcl" }        // actual: project pages, prefijo /metrilabcl
{ "baseUrl": "https://metrilabcl.github.io" }              // pages de organización en la raíz
{ "baseUrl": "https://ebooks.metrilab.cl" }                // dominio propio en la raíz
```

Reglas que el build valida: `https://`, absoluta, **sin** barra final. El prefijo de los
enlaces internos se deduce del `pathname` de `baseUrl`, así que pasar de un subdirectorio a la
raíz de un dominio no requiere tocar ninguna plantilla. Cambiar el host cuesta un commit.

## Cómo se activa un dominio propio

Hoy **no hay dominio aprobado**, así que no hay archivo `CNAME` en el repositorio: existe
`CNAME.example` como plantilla. Si el Board aprueba un dominio, el procedimiento exacto es:

1. **En el DNS del dominio** (lo hace quien administra la zona):
   - subdominio (p. ej. `ebooks.metrilab.cl`) → un registro `CNAME` a `bvyon.github.io.`
   - dominio raíz (`metrilab.cl`) → cuatro registros `A` a `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (y los `AAAA` equivalentes de
     GitHub si se quiere IPv6). Verifica estas IP en la documentación de GitHub Pages antes de
     aplicarlas: GitHub las ha cambiado en el pasado.
2. **En este repositorio:** `cp CNAME.example CNAME`, pon dentro el dominio exacto (una línea,
   sin `https://`, sin barra final) y añade el paso de copia a `dist/` — o más simple: deja el
   `CNAME` en la raíz y agrega al workflow un `cp CNAME dist/CNAME` después del build, porque
   GitHub Pages sólo lee el `CNAME` que está **dentro del artefacto publicado**.
3. **En `site.config.json`:** cambia `baseUrl` al dominio nuevo, en el mismo commit. Si te
   olvidas de este paso, el sitio queda sirviéndose en el dominio nuevo con canonicals
   apuntando al viejo, que es peor que no tener dominio.
4. **En Settings → Pages:** escribe el dominio en «Custom domain», espera la verificación DNS
   y marca «Enforce HTTPS» cuando GitHub haya emitido el certificado.
5. Verifica en vivo: `curl -sI https://<dominio>/` (http 200) y
   `curl -s https://<dominio>/ | grep canonical` (tiene que citar el dominio nuevo).

## Restricciones reales de GitHub Pages

- **No hay cabeceras HTTP personalizadas.** Nada de `X-Robots-Tag`, CSP propia ni `Cache-Control`
  a medida. Lo que se puede controlar es sólo lo que quepa en el HTML.
- **No hay redirecciones 301 de servidor.** El mapa de URLs se acierta a la primera. Si un slug
  cambia, la URL vieja devuelve 404 y no hay forma limpia de redirigirla: no se resuelve con
  `meta refresh`. Por eso el slug de cada ficha se fija junto con sus datos y no se toca.
- El sitio se sirve desde `dist/` mediante el artefacto de Pages; `.nojekyll` evita que Jekyll
  reinterprete la salida.

## Despliegue

`.github/workflows/hub-ebooks.yml` (en la raíz del repositorio), sobre cada push a `main` que
toque `hub-ebooks/**`, y a mano con «Run workflow»:

1. `node src/selftest.mjs` — si el generador está roto, el workflow se cae aquí.
2. `node src/build.mjs` — si algún dato es inválido, exit 1 y el workflow se cae aquí.
3. `upload-pages-artifact` de `hub-ebooks/dist/`.
4. Job `desplegar`, con `needs: construir` **y** `if: vars.PAGES_ACTIVO == 'true'`:
   `configure-pages` + `deploy-pages`.

Dos consecuencias buscadas: **un build fallido no despliega nada**, y mientras `PAGES_ACTIVO`
no exista el despliegue se **salta** en vez de fallar — el repositorio no acumula workflows
rojos por una decisión que aún no se ha tomado.

## Estado y origen

Andamiaje de MET-155 (MET-147). En este momento el catálogo tiene **2 de los 4 títulos
conocidos**: `B0FP1RY9G4` y `B0HDPV63R4` tienen su página de Amazon medida y guardada como
evidencia, y sus campos fueron re-extraídos dos veces de forma independiente sobre el mismo
crudo. `B0H28T65JL` (interstitial anti-bot en los 2 intentos con navegador real) y
`B0GX2VKG28` (página de aviso «unauthorized AI agent») **no tienen ficha, no están en el índice
y no están en el `sitemap.xml`**: entran cuando exista la medición, no antes.

Los crudos, las mediciones y los informes viven fuera de este repositorio, en
`/paperclip/projects/metrilabcl-ebooks/` (evidencia interna). Aquí sólo está el sitio.
