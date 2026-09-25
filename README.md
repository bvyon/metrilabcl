# Hub de ebooks de MetrilabCL

Hub público de los ebooks autopublicados de **MetrilabCL** en Amazon Kindle. Proyecto
[Astro](https://astro.build) con TypeScript, contenido estático, **cero JavaScript en el
cliente**. Se despliega en Vercel.

**URL prevista:** `https://libros.bvyon-marketing.cl` — **todavía no está desplegada.** El paso
a paso para el Board está en [`DESPLIEGUE.md`](DESPLIEGUE.md).

## Empezar

```bash
npm install
npm run dev      # http://localhost:4321
```

| Script | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo con recarga |
| `npm run build` | `astro build` **y** la guardia de salida; deja el sitio en `dist/` |
| `npm run preview` | sirve `dist/` como lo servirá Vercel |
| `npm run check` | `astro check` — tipos y plantillas |
| `npm run verificar` | sólo la guardia de salida, sobre un `dist/` ya construido |

Node 22+. `dist/` no está versionado: el build corre en el despliegue y en el CI.

## Principio de contenido

Este sitio **sólo publica datos medidos** sobre la página pública del producto en Amazon, con
la fecha de la medición visible en cada ficha.

- Sin reseñas, valoraciones, `aggregateRating` ni estrellas mientras no se midan.
- Sin «bestseller» ni Best Sellers Rank mientras no se midan.
- Un título que no se pudo medir **no tiene ficha**: se queda fuera del catálogo y del sitemap
  en lugar de publicarse a medias.

**Esto no depende de que nadie se acuerde.** Lo hacen cumplir dos mecanismos:

1. **El esquema** (`src/content.config.ts`). Las colecciones se validan con Zod y cada objeto
   es `.strict()`: un campo que no está en el esquema **no se puede publicar**. No hay campos
   de valoración, ranking ni premios en ningún nivel, y es deliberado.
2. **La guardia de salida** (`scripts/verificar-salida.mjs`), encadenada en `npm run build`.
   Mide el HTML emitido y mata el build si aparece `aggregateRating`, `ratingValue`,
   `reviewCount`, `bestseller` o `award`, si un canonical no es autorreferente o no termina en
   barra, si `og:url` no coincide con el canonical, si el sitemap no cubre exactamente lo
   publicado, si la 404 pierde el `noindex` o si hay títulos o meta descriptions duplicados.

## Estructura

```
astro.config.mjs              resuelve `site` desde el entorno (ver abajo)
vercel.json                   trailingSlash y cabeceras HTTP
src/
  content.config.ts           colecciones + esquema Zod (el contrato de los datos)
  data/libros/<slug>.json     una ficha por título medido; el nombre del archivo ES la URL
  data/author.json            la entidad del autor
  lib/sitio.ts                nombre, idioma y segmentos de URL del sitio
  lib/catalogo.ts             invariantes que cruzan varios archivos
  lib/jsonld.ts               los bloques de datos estructurados y qué NO se emite
  lib/strings.ts              cadenas de la plantilla por idioma
  layouts/Base.astro          <head>, canonical, JSON-LD, chrome
  pages/                      /, /libros/<slug>/, /autor/, 404, robots.txt
scripts/verificar-salida.mjs  la guardia de salida
```

## Cómo se resuelve la URL base

De la URL base salen `canonical`, `og:url`, el sitemap, la línea `Sitemap:` de `robots.txt` y
los `@id` del JSON-LD. **No está clavada.** `astro.config.mjs` la resuelve en este orden y
**escribe en el log qué usó y de dónde salió**:

| # | Fuente | Cuándo manda |
|---|---|---|
| 1 | env `SITE_BASE_URL` | siempre que esté definida |
| 2 | `https://$VERCEL_PROJECT_PRODUCTION_URL` | dentro de Vercel, si no hay `SITE_BASE_URL` |
| 3 | `https://libros.bvyon-marketing.cl` | `npm run dev` y `npm run build` en local |

```
[site] https://libros.bvyon-marketing.cl  (fuente: valor por defecto de astro.config.mjs)
```

Por qué `VERCEL_PROJECT_PRODUCTION_URL` y no `VERCEL_URL`: la documentación de Vercel («System
environment variables», leída el 2026-09-25) dice de la primera *«A production domain name of
the project. (…) Note, that this is always set, even in preview deployments»*. Es justo lo que
queremos — **un preview no debe declararse canónico a sí mismo**, sino apuntar a producción.
`VERCEL_URL` es el host del despliegue concreto.

El valor por defecto es el subdominio recomendado por el informe de MET-147; **el Board aún no
lo ha confirmado**, y por eso es una variable y no una constante repartida por las plantillas.

## Barra final y canonical

Las URL son de directorio: `/libros/<slug>/`. Eso son tres piezas que tienen que ir juntas:

- `trailingSlash: 'always'` y `build.format: 'directory'` en `astro.config.mjs`;
- `"trailingSlash": true` en `vercel.json`;
- la guardia de salida, que comprueba que cada canonical termina en barra y apunta al archivo
  que realmente lo sirve.

**Invariante:** la URL que el HTML declara como `canonical` responde **200 sin redirección**, y
la forma sin barra final devuelve 308 hacia ella.

## Cómo se agrega un título

1. Crea `src/data/libros/<slug>.json`. **El nombre del archivo es el slug y es la URL.**
2. Rellena el esquema de `src/content.config.ts`. Si falta un campo requerido, si sobra uno que
   no existe o si un formato no cuadra (ASIN de 10 caracteres, fecha ISO, `measuredAt` en UTC,
   `amazonUrl` que contenga el ASIN), **el build muere con el campo en el mensaje**.
3. Añade el título a `knownTitles` en `src/data/author.json`: la página de autor no puede
   omitir un título que el catálogo sí publica, y el build lo comprueba.
4. `npm run build`. El índice, el sitemap y la página de autor lo recogen solos.

## Cabeceras HTTP

Servirse desde Vercel permite tocar la respuesta, cosa que en GitHub Pages era imposible.
`vercel.json` lo usa: `X-Content-Type-Options: nosniff` y `Referrer-Policy:
strict-origin-when-cross-origin` en todas las rutas, y `Cache-Control: public,
max-age=31536000, immutable` en `/_astro/*`.

Ese `immutable` **sólo es correcto porque los assets llevan hash de contenido en el nombre**
(por eso `build.inlineStylesheets: 'never'`): si cambia el CSS, cambia el nombre del archivo, y
no hay manera de servirle a nadie una versión vieja.

## Estado y origen

Catálogo de MET-147. Hoy tiene **2 de los 4 títulos conocidos**: `B0FP1RY9G4` y `B0HDPV63R4`
tienen su página de Amazon medida y guardada como evidencia. Los otros dos se nombran en
`/autor/` y se marcan explícitamente como no medidos, con su corroboración.

Contenido y datos estructurados según MET-156 (FORJA MET-152, NEXUS MET-151, LUPA MET-153).
Migración a Astro y a Vercel en MET-158.
