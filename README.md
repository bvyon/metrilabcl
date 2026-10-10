# MetrilabCL

Sitio editorial de investigación y visibilidad web para Chile. Construido con Astro 7 y TypeScript, con páginas estáticas y JavaScript limitado al menú móvil, filtros de recursos y preparación de correos.

Publicado en Cloudflare Workers el 10 de octubre de 2026. Dominio principal: [metrilab.cl](https://metrilab.cl). Dirección alternativa: [metrilabcl.metrilabcl.workers.dev](https://metrilabcl.metrilabcl.workers.dev). La política de privacidad incluye los datos confirmados del responsable. La indexación sigue desactivada hasta aprobar el lanzamiento para buscadores.

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

Para repetir las pruebas de navegador y accesibilidad: `npx playwright install chromium`, `npm run build` y `npm run test:browser`. La suite sirve el resultado compilado, comprueba las rutas en escritorio y móvil y prueba las interacciones. Si ya tienes Chromium instalado, puedes definir `METRILAB_BROWSER_PATH` con la ruta de su ejecutable.

## Contenido y diseño

- `src/data/site.ts`: identidad, correo y estado de lanzamiento.
- `src/data/pages.ts`: contenido de páginas principales.
- `src/data/privacy.ts`: política de privacidad, vinculada a los datos del responsable y al correo configurado.
- `src/data/articles.ts`: guías de recursos y fechas editoriales.
- `src/pages/index.astro`: composición de la portada.
- `src/styles/global.css`: sistema visual y adaptación móvil.
- `src/layouts/Layout.astro`: navegación, pie, SEO y datos estructurados.
- `public/`: marca, imagen social y muestra ilustrativa descargable.

El correo público es **contacto@metrilab.cl**, con recepción y respuestas en **Zoho Mail gratuito**. Acceso: https://mail.zoho.com/. Cloudflare Email Routing está desactivado; los mensajes anteriores siguen en **metrilabcl@gmail.com**. Se comprobaron recepción y respuesta reales. No hay hub de libros ni sección de publicaciones.

El contacto permite abrir un mensaje en la aplicación de correo o copiarlo. No transmite ni guarda los campos. La apertura de `mailto:` depende de que el visitante tenga configurada una aplicación de correo; la copia ofrece una alternativa.

Las guías están redactadas para esta versión y requieren revisión editorial del propietario antes del lanzamiento. La muestra de diagnóstico es ilustrativa; no se presenta como una auditoría ni como un resultado de cliente.

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

- [Análisis del brief y decisiones de diseño](docs/brief-y-propuesta.md)
- [Registro de verificación](docs/verificacion.md)
- [Privacidad y correo](docs/privacidad-y-correo.md)
- [Publicación automática y recuperación](DESPLIEGUE.md)
- [Astro en Vercel](https://docs.astro.build/en/guides/deploy/vercel/)
- [Astro en Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Activos estáticos de Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/)

El sitio se publica en la cuenta de Cloudflare del propietario desde [bvyon/metrilabcl](https://github.com/bvyon/metrilabcl). Cada cambio enviado a `main` activa comprobaciones y publicación automática; las ejecuciones están en [GitHub Actions](https://github.com/bvyon/metrilabcl/actions).
