# MetrilabCL

Sitio de la agencia de marketing digital MetrilabCL: gestión de Google Ads y Meta Ads, tracking de conversiones, chatbots y CRM en WhatsApp, automatizaciones, contenidos y SEO para negocios en Chile. Construido con Astro 7 y TypeScript, con páginas estáticas y JavaScript propio, sin frameworks ni librerías de animación.

Publicado en Cloudflare Workers. Dominio principal: [metrilab.cl](https://metrilab.cl). Dirección alternativa: [metrilabcl.metrilabcl.workers.dev](https://metrilabcl.metrilabcl.workers.dev). Desde el 14 de noviembre de 2026 usa el diseño oscuro e interactivo descrito en [el spec del rediseño](docs/superpowers/specs/2026-11-14-rediseno-interactivo-design.md).

## Vista local

Requiere Node.js 22.12 o superior.

```sh
npm ci
npm run dev
```

Abre la dirección local que indique Astro, normalmente `http://127.0.0.1:4321`.

```sh
npm run check
npm run build
npm run verify
npm run preview
```

El resultado compilado se guarda en `dist/`. No requiere un servidor de aplicación, base de datos ni variables secretas.

Para repetir las pruebas de navegador y accesibilidad: `npx playwright install chromium`, `npm run build` y `npm run test:browser`. La suite sirve el resultado compilado, comprueba las rutas en escritorio y móvil y prueba las interacciones, incluidas las demostraciones de la portada. Si prefieres usar un navegador ya instalado, define `METRILAB_BROWSER_PATH` con la ruta de su ejecutable; por ejemplo, en macOS: `METRILAB_BROWSER_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser`.

## Contenido y diseño

- `src/data/site.ts`: identidad, correo y estado de lanzamiento.
- `src/data/pages.ts` y `src/data/marketing.ts`: contenido de las páginas de servicios, método y estudio.
- `src/data/privacy.ts`: política de privacidad, vinculada a los datos del responsable y al correo configurado.
- `src/data/articles.ts`: lecturas de Recursos, con sus fechas de publicación y revisión.
- `src/pages/index.astro`: portada, con sus tres demostraciones y el script que las mueve.
- `src/styles/global.css`: sistema visual (colores, tipografía, vidrio, movimiento) y adaptación móvil.
- `src/layouts/Layout.astro`: navegación flotante, pie, SEO, datos estructurados y animaciones de entrada.
- `public/media/`: video del encabezado (`hero.mp4`, `hero-mobile.mp4`) e imagen fija (`hero-poster.jpg`).
- `public/`: marca, imagen social y muestra ilustrativa descargable.
- `scripts/generate-brand-assets.mjs` y `scripts/render-social.mjs`: regeneran logos, iconos y la imagen para compartir.

### Portada interactiva

La portada presenta la oferta como un sistema —anuncio, medición y conversación— y deja probarlo:

- **Anuncios:** maqueta conmutable entre Google Ads y Meta Ads con un negocio ficticio, rotulada como ejemplo.
- **Medición en vivo:** una consola muestra los eventos de la propia visita (scroll, secciones, clics) y un embudo de cuatro etapas. Es una demostración local: no envía ni guarda esos eventos, y no modifica la medición real del sitio (GTM y GA4).
- **WhatsApp:** un chat guiado con datos ficticios que agenda una hora y mueve al contacto por un tablero CRM.

El video del encabezado y las ilustraciones de las páginas interiores son material propio, generado para el sitio; los conceptos, prompts y el proceso están en [docs/ilustraciones-y-video-propios.md](docs/ilustraciones-y-video-propios.md). El video se sirve desde `public/media/` en bucle continuo. Con «reducir movimiento» o ahorro de datos se muestra una imagen fija; sin JavaScript, todo el contenido queda visible. Para reemplazarlo basta con sustituir los tres archivos de `public/media/`.

Los trabajos se mencionan solo por rubro (una clínica, una empresa de construcción y ampliaciones, una tienda de materiales de costura), sin nombres ni cifras.

El correo público es **contacto@metrilab.cl**, con recepción y respuestas en **Zoho Mail gratuito**. Acceso: https://mail.zoho.com/. Cloudflare Email Routing está desactivado; los mensajes anteriores siguen en **metrilabcl@gmail.com**. Se comprobaron recepción y respuesta reales. No hay hub de libros ni sección de publicaciones.

El contacto prepara un mensaje y muestra el borrador junto a opciones para abrir Gmail, Outlook o la aplicación de correo, además de copiarlo. Preparar el mensaje no transmite ni guarda los campos. Los enlaces de Gmail y Outlook abren el borrador en el proveedor elegido; el visitante revisa y envía desde allí. La apertura de `mailto:` depende de una aplicación configurada y conserva el borrador visible como alternativa. Al editar los campos se invalidan las opciones anteriores para no abrir un mensaje desactualizado.

La oferta tiene página propia para cada servicio: `/publicidad-digital/`, `/tracking-conversiones/`, `/chatbots-whatsapp/`, `/automatizaciones-funnels/`, `/contenidos/` (textos, gráficas y video) y `/seo/`. Diagnóstico, investigación y visibilidad en IA se conservan como servicios secundarios. El formulario de contacto incluye las opciones «Tracking y medición» y «Chatbot de WhatsApp». Las llamadas a la acción llevan al contacto del sitio.

Los recursos orientan a reconocer una necesidad y consultar a la agencia. Seis lecturas: anuncios que no traen consultas, medición que no cuadra, WhatsApp sin responder, diagnóstico o ejecución, apoyo con un informe pendiente y evaluación de visibilidad en IA. No incluyen listas de comprobación, ejemplos de acciones ni procedimientos para ejecutar el servicio por cuenta propia. Las lecturas y sus llamadas a la acción llevan a `/contacto/`. La muestra de diagnóstico de la página del servicio es ilustrativa; no se presenta como una auditoría ni como un resultado de cliente.

## GitHub

El proyecto contiene `.gitignore` y `package-lock.json`. `node_modules/`, `dist/`, archivos `.env`, archivos `.textClipping` y estado del hosting no deben subirse. Crea un repositorio en tu cuenta, agrega su URL como remoto y sube la carpeta. El repositorio local aún no tiene remoto de GitHub. Las credenciales de publicación no se incorporan a los archivos del sitio ni a Git.

## Vercel

1. Importa el repositorio desde GitHub.
2. Selecciona Astro y Node.js 22 o superior.
3. Usa el comando definido en `vercel.json`: `npm run check && npm run build && npm run verify`.
4. La carpeta de salida es `dist`.
5. Revisa la dirección de prueba antes de conectar `metrilab.cl`.

No hace falta adaptador de Vercel para esta salida estática. El archivo `vercel.json` incluye cabeceras básicas. Configura HTTPS y el dominio principal en el hosting; las redirecciones entre dominios no se fuerzan en el código para conservar las vistas de prueba.

## Cloudflare

Cloudflare recomienda Workers para proyectos nuevos. Este sitio puede desplegarse como activos estáticos usando `wrangler.jsonc`, sin código de Worker ni adaptador de Astro.

1. El repositorio publica automáticamente desde `main` mediante GitHub Actions; consulta [DESPLIEGUE.md](DESPLIEGUE.md).
2. Construcción: `npm run check && npm run build && npm run verify`.
3. Publicación y comprobaciones desde la carpeta del proyecto: `npm run deploy:cloudflare`.
4. El archivo de configuración entrega `dist` y la página de error propia (`404-page`).

Si prefieres Cloudflare Pages: build igual, salida `dist`, sin adaptador. Los archivos `_headers` se aplican al hosting compatible. No configures una redirección SPA a `index.html`, porque este sitio tiene páginas reales y una 404 propia.

El proyecto de Workers es `metrilabcl`. La configuración conserva los dominios `metrilab.cl` y `www.metrilab.cl` en futuras publicaciones. Para autenticar Wrangler usa su inicio de sesión o un token con permisos limitados, suministrado mediante el entorno; nunca incorpores un token al repositorio.

La cabecera `no-transform` en `public/_headers` impide la inserción automática del script de Web Analytics de Cloudflare. Si decides agregar estadísticas, revisa primero la política de privacidad y la configuración de analítica.

## Indexación y Search Console

Desde el 10 de octubre de 2026, `launchReady: true` habilita la indexación de las páginas publicadas a petición del titular. La página 404 conserva `noindex`.

- Sitemap: https://metrilab.cl/sitemap.xml, generado automáticamente a partir de las páginas y artículos publicados.
- Robots: https://metrilab.cl/robots.txt, permite el rastreo y declara la dirección del sitemap.
- En la propiedad de `metrilab.cl` en Search Console, abrir **Sitemaps** y enviar `https://metrilab.cl/sitemap.xml` (o `sitemap.xml` si el formulario ya muestra el dominio).
- Si la propiedad aún no está verificada, completar primero su verificación de titularidad; el archivo robots no se envía por separado.
- Tras enviar el sitemap, usar **Inspección de URLs** para revisar `https://metrilab.cl/` y solicitar su indexación. La inclusión en el sitemap no garantiza indexación ni posiciones.

El dominio registrado es `metrilab.cl`. Si cambia, actualizar `site.url`, `astro.config.mjs`, `wrangler.jsonc` y las referencias de marca. Las comprobaciones de construcción validan URLs canónicas, cobertura del sitemap y ausencia de `noindex` en las páginas publicadas; el despliegue verifica también que sitemap y robots responden HTTP 200 y coinciden con los archivos compilados.

Mantén los entornos de vista previa sin indexación, mediante la configuración del proveedor, al activar producción.

El script `check:launch` detecta el estado de borrador; no sustituye la revisión de contenido ni una evaluación legal.

## Documentación

- [Rediseño interactivo y nueva oferta](docs/superpowers/specs/2026-11-14-rediseno-interactivo-design.md)
- [Ilustraciones y video propios](docs/ilustraciones-y-video-propios.md)
- [Análisis del brief y decisiones de diseño (histórico)](docs/brief-y-propuesta.md)
- [Registro de verificación](docs/verificacion.md)
- [Privacidad y correo](docs/privacidad-y-correo.md)
- [Publicación automática y recuperación](DESPLIEGUE.md)
- [Astro en Vercel](https://docs.astro.build/en/guides/deploy/vercel/)
- [Astro en Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Activos estáticos de Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/)

El sitio se publica en la cuenta de Cloudflare del propietario desde [bvyon/metrilabcl](https://github.com/bvyon/metrilabcl). Cada cambio enviado a `main` activa comprobaciones y publicación automática; las ejecuciones están en [GitHub Actions](https://github.com/bvyon/metrilabcl/actions).
