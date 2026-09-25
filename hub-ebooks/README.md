# Hub de ebooks de MetrilabCL

Hub público de los ebooks autopublicados de **MetrilabCL** en Amazon Kindle. Sitio estático
generado con Node (sin dependencias). **Se despliega en Vercel**, que importa este repositorio
y corre el build en cada push.

**URL:** la asigna Vercel al importar el proyecto (`<proyecto>.vercel.app`) — **todavía no
está desplegada.** El paso a paso para el Board está en [`../DESPLIEGUE.md`](../DESPLIEGUE.md).

> **Estado: construido, no desplegado.** El Board decidió el 2026-09-25T02:25Z *«solo hagan la
> pagina yo lo publico despues»* y el 2026-09-25T12:41Z *«queria que la pagina fuera
> desarrollada normalmente por que yo la iba a subir a vercel, no a githubpages»*. MetrilabCL
> no tiene cuenta ni token de Vercel: nosotros entregamos el repositorio listo, el Board
> importa y aprieta Deploy.

El sitio vive en `hub-ebooks/`; el `vercel.json` que apunta el build ahí está en la **raíz del
repositorio** (Vercel sólo lee el de la raíz), igual que el workflow de CI en
`.github/workflows/hub-ebooks.yml` (GitHub sólo lee los workflows de ahí). Ese workflow **no
despliega**: sólo corre `selftest` + `build` para que el repositorio se ponga rojo si el
generador se rompe.

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
dist/autor/index.html                    página de entidad del autor (Person + sameAs verificados)
dist/404.html                            noindex, fuera del sitemap
dist/sitemap.xml                         generado desde baseUrl
dist/robots.txt                          generado desde baseUrl
dist/assets/styles.css
```

`dist/` no está versionado: el build corre en el despliegue de Vercel y en el CI.

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
  "notMeasured": ["Qué quedó sin medir y por qué"],    // opcional, se publica tal cual

  // opcional — preguntas reales sobre el TEMA, citadas de una fuente pública que no es este
  // libro. Es el único contenido del hub que no sale de la ficha de Amazon (condición de
  // citabilidad 2 de NEXUS, MET-151). La página publica siempre el aviso de que nadie ha leído
  // el interior del libro: citar la pregunta no es afirmar que el libro la responde.
  "demandContext": {
    "source": {
      "url": "https://...",                  // https absoluta
      "label": "cómo se nombra la fuente en el texto",
      "readAt": "2026-09-25",                // YYYY-MM-DD
      "readBy": "quién la leyó",
      "method": "cómo se leyó y cuántas preguntas literales tiene la fuente"
    },
    "questionsLang": "en",                   // BCP-47; idioma en que se citan, sin traducir
    "questions": ["Pregunta literal 1"],     // verbatim; el build muere si el arreglo está vacío
    "notes": ["Dato medido relacionado"]     // opcional
  },

  // opcional — otra edición de la misma obra, vista pero NO medida en amazon.com. Sólo texto
  // visible: nunca entra al JSON-LD (NEXUS excluye workExample sin crudo propio del hermano).
  "relatedEditions": [{
    "asin": "B000000001", "format": "Print edition", "storefront": "amazon.es",
    "url": "https://www.amazon.es/dp/B000000001",   // tiene que contener el ASIN
    "confidence": "Medium", "note": "Qué se vio, dónde y qué queda sin verificar"
  }]
}
```

3. `node src/selftest.mjs && node src/build.mjs`. El build rechaza slugs duplicados, ASIN
   duplicados, títulos duplicados (romperían la unicidad de `<title>`/meta description),
   fechas mal formadas y `printLength` no numérico.
4. Commit a `main`. El CI valida y construye; el índice y el `sitemap.xml` recogen el título
   nuevo automáticamente. Si el proyecto ya está importado en Vercel, ese mismo push dispara
   un despliegue.

## La página de autor (`author.json`)

`/autor/` es una de las cuatro páginas de fase 1 que especificó FORJA (MET-152 §3.3). Su
contenido sale entero de `author.json`, en la raíz del proyecto. El build **muere sin ese
archivo**: la entidad es parte del sitio, no un extra.

Reglas que el generador hace cumplir, y por qué:

- `primaryName` y cada `alternateNames` tienen que aparecer en `nameForms`. El nombre que se
  publica es una forma **medida en una fuente**, nunca una elección editorial. Hoy la fuente
  escribe el nombre de dos maneras («Metrilab Cl» y «Metrilab CL») y la página publica las dos.
- Cada `sameAs` necesita `url`, `label`, `verifiedAt` (ISO-8601 UTC) y `verifiedBy`. Un perfil
  que no se comprobó no se enlaza: `sameAs` es una afirmación de identidad, no un enlace suelto.
- `knownTitles` tiene que incluir **todos** los títulos que el catálogo publica (el build
  compara contra `data/`), y cada entrada lleva su `corroboration`. Los que no tienen `slug` se
  publican nombrados y marcados como no medidos.
- `notFound` es obligatorio y no puede estar vacío. Una entidad sin biografía, sin perfiles
  sociales y sin cobertura de prensa tiene que **decirlo con su método de comprobación**; si
  no, la página es indistinguible de una a medio hacer.

## Idioma del sitio (`siteLang`)

`siteLang` selecciona la tabla de cadenas de `src/strings.mjs` (`es` | `en`) y el atributo
`lang` del chrome. Hoy es `en`: RADAR (MET-150) midió la demanda del contenido tipo guía en
inglés y FORJA lo especificó en MET-152 §6. Volver a español es cambiar esa línea.

`Book.inLanguage` **no** se toca desde aquí: sale del campo `Language` de cada ficha de Amazon
(`languageCode`). Un `siteLang` sin tabla de cadenas mata el build — un sitio a medio traducir
falla sin que se vea.

## Cómo se resuelve la URL base

Del host resuelto se derivan `<link rel="canonical">`, `og:url`, `sitemap.xml`, la línea
`Sitemap:` de `robots.txt`, la `@id` del JSON-LD y el prefijo de todos los enlaces internos.
**No está clavado en el repositorio.** `src/build.mjs` → `resolveBaseUrl()` lo busca en este
orden y **escribe en el log cuál usó y de dónde salió**:

| # | Fuente | Cuándo manda |
|---|--------|--------------|
| 1 | env `SITE_BASE_URL` | siempre que esté definida (override manual, dominio propio) |
| 2 | `https://$VERCEL_PROJECT_PRODUCTION_URL` | dentro de Vercel, si no hay `SITE_BASE_URL` |
| 3 | `site.config.json` → `baseUrl` | build local y CI de GitHub |

La línea que imprime el build es la que se lee en el log de Vercel para saber que el canonical
quedó bien sin abrir el HTML:

```
baseUrl: https://ebooks.metrilab.cl  (fuente: SITE_BASE_URL)  basePath: ""  siteLang: en
```

Por qué `VERCEL_PROJECT_PRODUCTION_URL` y no `VERCEL_URL`: la documentación de Vercel («System
environment variables», leída el 2026-09-25) dice de la primera *«A production domain name of
the project. (…) Note, that this is always set, even in preview deployments»*. Es justo lo que
queremos — **un preview no debe emitir un canonical hacia sí mismo**, sino hacia producción.
`VERCEL_URL`, en cambio, es el host del despliegue concreto.

El `baseUrl` de `site.config.json` es hoy `https://localhost` y **sólo sirve para builds
locales y para el CI**. Dentro de un build de Vercel (env `VERCEL`), si no hay ni
`SITE_BASE_URL` ni `VERCEL_PROJECT_PRODUCTION_URL`, el build **muere con exit 1** y dice qué
falta: preferimos un despliegue rojo a un canonical inventado en producción.

Reglas que el build valida venga de donde venga el valor: `https://`, absoluta, **sin** barra
final; el mensaje de error nombra la fuente. El prefijo de los enlaces internos se deduce del
`pathname`, así que un host en la raíz de un dominio no requiere tocar ninguna plantilla.

## Cómo se activa un dominio propio

Hoy **no hay dominio aprobado**. Cuando el Board apruebe uno:

1. **En Vercel:** proyecto → **Settings → Domains → Add**, escribe el dominio y sigue las
   instrucciones que muestra el panel. El registro DNS exacto (tipo, nombre y valor) **lo
   entrega ese panel al añadir el dominio**; no lo copies de aquí ni de ninguna otra parte:
   depende de si es raíz o subdominio y Vercel lo ha cambiado en el pasado.
2. **En el DNS del dominio:** quien administre la zona crea exactamente el registro que mostró
   el panel de Vercel, y se espera la verificación.
3. **El canonical:** define `SITE_BASE_URL` en **Settings → Environment Variables** con el
   dominio nuevo (`https://…`, sin barra final), o deja que `VERCEL_PROJECT_PRODUCTION_URL` lo
   recoja solo — Vercel elige el dominio de producción personalizado más corto en cuanto está
   verificado. **Vuelve a desplegar**: el canonical se fija en el build, no en la petición.
4. Verifica en vivo: `curl -sI https://<dominio>/` (200, sin `Location`) y
   `curl -s https://<dominio>/ | grep canonical` (tiene que citar el dominio nuevo).

## Qué gana el sitio al servirse desde Vercel

La limitación que el informe le achacaba a GitHub Pages era no poder tocar la respuesta HTTP.
En Vercel sí se puede, y `vercel.json` (raíz del repositorio) lo usa:

- **Cabeceras propias.** `X-Content-Type-Options: nosniff` y
  `Referrer-Policy: strict-origin-when-cross-origin` en todas las rutas, y `Cache-Control:
  public, max-age=31536000` en `/assets/*`.
  ⚠️ `assets/styles.css` **no lleva hash en el nombre**: con ese TTL, si cambias el CSS los
  visitantes que ya lo tienen en caché seguirán con el viejo. La regla es **cambiar el CSS =
  cambiar el nombre del archivo**.
- **Redirecciones de servidor.** `trailingSlash: true`: `/libros/<slug>` responde 308 hacia
  `/libros/<slug>/`, que es la URL canónica. Ya no hace falta acertar el mapa de URLs a la
  primera: un slug que cambie se puede redirigir con `redirects` en `vercel.json`. Aun así el
  slug de cada ficha se fija junto con sus datos y no se toca sin motivo.
- **404 real.** `404.html` en la raíz de la salida se sirve con **status 404** para cualquier
  ruta que no exista, sin configuración extra.

## Despliegue

En Vercel, importando este repositorio. El paso a paso para el Board está en
[`../DESPLIEGUE.md`](../DESPLIEGUE.md) y la configuración en `../vercel.json`.

`.github/workflows/hub-ebooks.yml` es **sólo CI**: sobre cada push y PR que toque
`hub-ebooks/**` corre `node src/selftest.mjs` y `node src/build.mjs`. No despliega nada. Sirve
para que el repositorio se ponga rojo si el generador o los datos se rompen.

## Estado y origen

Andamiaje de MET-155 (MET-147). En este momento el catálogo tiene **2 de los 4 títulos
conocidos**: `B0FP1RY9G4` y `B0HDPV63R4` tienen su página de Amazon medida y guardada como
evidencia, y sus campos fueron re-extraídos dos veces de forma independiente sobre el mismo
crudo. `B0H28T65JL` (interstitial anti-bot en los 2 intentos con navegador real) y
`B0GX2VKG28` (página de aviso «unauthorized AI agent») **no tienen ficha, no están en el índice
y no están en el `sitemap.xml`**: entran cuando exista la medición, no antes.

Los crudos, las mediciones y los informes viven fuera de este repositorio, en
`/paperclip/projects/metrilabcl-ebooks/` (evidencia interna). Aquí sólo está el sitio.
