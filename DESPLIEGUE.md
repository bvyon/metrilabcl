# Publicación automática de MetrilabCL

Repositorio: https://github.com/bvyon/metrilabcl

Sitio: https://metrilab.cl. Cloudflare Workers: `metrilabcl`, con dominios `metrilab.cl` y `www.metrilab.cl`.

## Cómo publicar un cambio

1. Editar el proyecto y revisar los cambios.
2. Crear un commit y enviarlo a `main` en GitHub. También funciona editar y guardar un archivo directamente en GitHub.
3. Revisar la ejecución en https://github.com/bvyon/metrilabcl/actions. Al finalizar correctamente, el cambio está publicado.

Un pull request ejecuta las comprobaciones; la publicación ocurre cuando se integra en `main`. Los cambios que solo se guardan en el computador no se publican hasta enviarlos a GitHub. La ejecución manual está disponible mediante «Run workflow» en la rama `main`.

## Qué comprueba la automatización

El flujo `.github/workflows/cloudflare.yml` usa Node 24 e instala las versiones del lockfile con `npm ci`. Ejecuta el análisis de Astro, la compilación, la verificación de enlaces internos y las pruebas existentes de navegador: navegación, accesibilidad, tamaños móviles, consentimiento del contacto y 404.

Solo si esas comprobaciones pasan publica con Wrangler. Después comprueba que las páginas del dominio coinciden con la compilación, que `www` entrega la política y que las rutas inexistentes responden 404. Si una comprobación previa falla, no publica esa versión; el sitio anterior permanece disponible. Si falla la comprobación posterior, revisar la ejecución y el sitio antes de seguir publicando.

Las publicaciones de una misma rama se procesan sin interrumpir un despliegue en curso. Las acciones de GitHub están fijadas a versiones concretas mediante su SHA.

## Credenciales y configuración

El entorno de GitHub `production` permite publicar únicamente desde `main`. Mantiene `CLOUDFLARE_API_TOKEN` como secreto cifrado y `CLOUDFLARE_ACCOUNT_ID` como variable. El token se proporciona únicamente al paso de publicación; no aparece en los archivos ni en los commits. Para renovarlo, actualizar el secreto de ese entorno.

Para un token exclusivo de publicación, limitar permisos a Workers y los dominios que administra este proyecto; no necesita permisos de correo. Consultar la [documentación de Cloudflare para GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).

`wrangler.jsonc` conserva el nombre del Worker y los dominios existentes. No configurar además otra publicación automática en Workers Builds para el mismo sitio: este repositorio ya utiliza GitHub Actions.

La automatización del sitio no modifica los registros de Zoho ni el buzón. La indexación sigue controlada por `launchReady` en `src/data/site.ts`.

## Historial y recuperación

El contenido anterior del hub de libros fue sustituido por el sitio de la agencia mediante un commit normal. Su historial permanece en GitHub. Antes del cambio se guardó además una copia Git recuperable local en `/private/tmp/metrilabcl-github-antes-2026-10-10.bundle`.

Para deshacer un cambio publicado, revertir el commit correspondiente en GitHub o en el repositorio local y enviar la reversión a `main`; se ejecutará el mismo flujo de comprobación y publicación.
