# Desplegar el hub de ebooks

Para el Board. Dos partes: **(a)** importar el repositorio en Vercel y desplegar, **(b)** colgar
el subdominio en Cloudflare.

MetrilabCL **no despliega y no toca DNS**: no tenemos cuenta ni token de Vercel ni acceso a
Cloudflare, y pedirlos sería una credencial nueva *y* una publicación fuera de Paperclip.
Nosotros entregamos el repositorio listo; ustedes aprietan el botón.

---

## (a) Importar en Vercel

1. Entra a <https://vercel.com/new>.
2. Conecta la cuenta de GitHub (`bvyon`) si es la primera vez, y dale acceso a
   **`bvyon/metrilabcl`**.
3. **Import** sobre `bvyon/metrilabcl`.
4. En la pantalla de configuración **no hay que tocar nada**:
   - **Framework Preset** se detecta solo como **Astro**.
   - **Root Directory** se queda en la raíz (`./`). El proyecto Astro está en la raíz
     justamente para esto.
   - **Build Command** (`npm run build`), **Output Directory** (`dist`) e **Install Command**
     (`npm install`) son los que Vercel pone por omisión para Astro y son los correctos.
   - **Environment Variables:** nada. (Ver §(c) si quieres fijar el dominio a mano.)
5. **Deploy**.

Vercel construye y te da una URL `https://<proyecto>.vercel.app`.

### La línea del log que hay que mirar

En el log del build tienen que salir estas dos:

```
[site] https://<el dominio que toca>  (fuente: VERCEL_PROJECT_PRODUCTION_URL)
verificacion OK — 5 pagina(s), 9 archivo(s), 36.6 kB en dist/
```

La primera dice **con qué dominio se escribieron los `canonical`** y de dónde salió ese
dominio. Si no cita el dominio que estás usando, el sitio está publicando canonicals
equivocados. La segunda es la guardia de salida (`scripts/verificar-salida.mjs`): si algo la
rompe, el build sale distinto de 0 y **Vercel no publica nada**.

## (b) El subdominio en Cloudflare

1. **En Vercel:** proyecto → **Settings → Domains → Add** → `libros.bvyon-marketing.cl`.
2. **En Cloudflare**, zona `bvyon-marketing.cl` → **DNS → Add record**:
   - **Type:** `CNAME`
   - **Name:** `libros`
   - **Target:** `cname.vercel-dns.com`
   - **Proxy status: «DNS only» (nube gris)** — no la naranja.
3. Vuelve a Vercel y espera a que el dominio quede verificado y con certificado emitido.

**Por qué «DNS only», medido en su propia zona el 2026-09-25T12:50Z (CEREBRO):**

| Registro | Valor medido | Qué significa |
|---|---|---|
| NS de `bvyon-marketing.cl` | `stan.ns.cloudflare.com`, `lilith.ns.cloudflare.com` | la zona ya está delegada a Cloudflare: **no hay que tocar NIC Chile** |
| Ápice `bvyon-marketing.cl` A | `216.198.79.1`, `64.29.17.1` | son IP de Vercel: el ápice apunta **directo**, sin proxy |
| `curl -I https://bvyon-marketing.cl/` | `server: Vercel`, `x-vercel-id: gru1::…`, `x-nextjs-prerender: 1` | el sitio de la agencia **ya es Next.js en Vercel** |
| `www` A | `104.21.48.65`, `172.67.180.79` | IP de Cloudflare: ese sí está proxeado |

El patrón que ya les funciona con Vercel en esta misma zona es **DNS only**. Con la nube
naranja, la verificación de dominio y la emisión del certificado de Vercel se pelean con el
proxy de Cloudflare.

> **Ojo con el valor del CNAME.** `cname.vercel-dns.com` es el destino estándar de Vercel para
> un subdominio, pero **el valor que manda es el que muestre el panel de Vercel** al añadir el
> dominio en el paso 1. Si el panel muestra otro, usa el del panel.

## (c) Fijar el dominio a mano (opcional)

Por omisión el canonical sale de `VERCEL_PROJECT_PRODUCTION_URL`, que Vercel inyecta y que
apunta **al dominio de producción incluso en los despliegues de preview** — así un preview no
se declara canónico a sí mismo, que es lo correcto.

Para fijarlo (por ejemplo antes de que el subdominio esté verificado): **Settings →
Environment Variables → Add**, nombre `SITE_BASE_URL`, valor el dominio completo (`https://…`,
**sin barra final**), y vuelve a desplegar. `SITE_BASE_URL` gana siempre.

---

## Comprobar que quedó bien

```bash
HOST=https://libros.bvyon-marketing.cl   # o la URL .vercel.app mientras no haya dominio

# a) las 4 URL del catálogo: 200 y SIN redirección
for p in / /libros/local-seo-without-an-agency/ /libros/healthcare-marketing-lead-generation/ /autor/; do
  printf '%-52s %s\n' "$p" "$(curl -s -o /dev/null -w 'http=%{http_code} redirs=%{num_redirects}' "$HOST$p")"
done

# b) sitemap y robots
curl -s -o /dev/null -w 'sitemap-index.xml %{http_code}\n' "$HOST/sitemap-index.xml"
curl -s -o /dev/null -w 'robots.txt        %{http_code}\n' "$HOST/robots.txt"

# c) el canonical de cada página coincide EXACTAMENTE con la URL que responde
for p in / /libros/local-seo-without-an-agency/ /libros/healthcare-marketing-lead-generation/ /autor/; do
  printf '%-52s %s\n' "$HOST$p" "$(curl -s "$HOST$p" | grep -o '<link rel="canonical" href="[^"]*"')"
done

# d) las cabeceras
curl -sI "$HOST/" | grep -i 'x-content-type-options\|referrer-policy\|server'
curl -sI "$HOST$(curl -s "$HOST/" | grep -o '/_astro/[^"]*\.css')" | grep -i 'cache-control'

# e) una ruta que no existe devuelve 404 de verdad
curl -s -o /dev/null -w 'ruta inexistente: %{http_code}\n' "$HOST/no-existe/"

# f) la forma sin barra final consolida hacia la canónica
curl -s -o /dev/null -w 'sin barra: %{http_code} -> %{redirect_url}\n' "$HOST/libros/local-seo-without-an-agency"
```

Lo que tiene que salir:

| | Esperado |
|---|---|
| a | `200 redirs=0` en las cuatro. **Un `301`/`308` aquí es un fallo:** la URL canónica no puede redirigir. |
| b | `200` las dos |
| c | el `href` del canonical == la URL de la izquierda, carácter por carácter |
| d | `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `server: Vercel`, y en el CSS `cache-control: public, max-age=31536000, immutable` |
| e | `404` |
| f | `308` hacia la URL con barra final |

### Qué está medido y qué no

**Medido el 2026-09-25 (TALLER, MET-158) sobre el artefacto de despliegue, no sobre un sitio
vivo.** Corrimos `vercel build` localmente (CLI 59.23.2) y aplicamos, en orden, las reglas de
enrutamiento que **Vercel mismo** generó en `.vercel/output/config.json` a cada URL del
sitemap:

- las **4 URL canónicas** resuelven **sin redirección** y con un archivo estático detrás;
- `/robots.txt`, `/sitemap-index.xml`, `/sitemap-0.xml` y el CSS de `/_astro/` tampoco redirigen;
- la forma sin barra final devuelve **308** hacia la canónica;
- las cabeceras se aplican, y el CSS recibe `public, max-age=31536000, immutable`;
- la tabla de rutas termina en `{"handle":"error"}` + `{"status":404,"dest":"/404.html"}`, o
  sea que **la 404 se sirve con status 404** sin configuración extra.

**NO medido, y por eso está aquí como paso de ustedes:** la respuesta HTTP real de un
despliegue vivo, la verificación del dominio y el certificado. Eso sólo se comprueba con los
`curl` de arriba después del primer despliegue.

**Un detalle menor a confirmar en (d):** el preset de Astro para Vercel ya pone su propio
`cache-control: public, max-age=31536000, immutable` en `/_astro/`, y `vercel.json` lo declara
otra vez con el mismo valor. En la tabla de rutas se ven las dos reglas. Comprueben que la
respuesta trae la cabecera **una sola vez**; si saliera duplicada, se quita la de `vercel.json`
y basta con la del preset.

## Cada push

Con el proyecto importado, cada push a `main` dispara un despliegue de producción y cada PR un
preview. Además `.github/workflows/ci.yml` corre `npm ci`, `npm run check` (tipos) y
`npm run build` (que incluye la guardia de salida) en GitHub Actions: si el sitio se rompe, el
repositorio se pone rojo ahí sin esperar al log de Vercel. Ese workflow **no despliega**.

## Qué NO hay que hacer

- **No actives GitHub Pages.** El sitio ya no está preparado para Pages.
- **No cambies el Root Directory** del proyecto de Vercel: el proyecto Astro está en la raíz.
- **No pongas la nube naranja** en el CNAME de `libros` (ver §b).
- **No edites `dist/`.** No está versionado: se genera en cada build.
