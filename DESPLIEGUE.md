# Desplegar el hub de ebooks en Vercel

Para el Board. El repositorio ya viene configurado: **no hay que ajustar nada a mano en el
panel de Vercel**. `vercel.json` (en esta misma carpeta) le dice a Vercel dónde está el sitio,
cómo construirlo y qué cabeceras servir.

MetrilabCL **no despliega**: no tenemos cuenta ni token de Vercel, y pedirlos sería una
credencial nueva y una publicación fuera de Paperclip. Nosotros entregamos el repositorio
listo; el botón lo aprieta el Board.

---

## 1. Importar y desplegar

1. Entra a <https://vercel.com/new>.
2. Si es la primera vez, conecta la cuenta de GitHub (`bvyon`) y dale acceso al repositorio
   **`bvyon/metrilabcl`**.
3. En la lista de repositorios, **Import** sobre `bvyon/metrilabcl`.
4. En la pantalla de configuración:
   - **Framework Preset:** `Other`.
   - **Root Directory:** déjalo en la raíz (`./`). **No lo cambies a `hub-ebooks`**: el
     `vercel.json` que apunta el build ahí vive en la raíz y Vercel sólo lee el de la raíz.
   - **Build and Output Settings** e **Install Command:** no toques nada. `vercel.json` ya
     define `buildCommand`, `outputDirectory` e `installCommand`.
   - **Environment Variables:** nada. (Ver §4 si quieres fijar el host a mano.)
5. **Deploy**.

Vercel construye y te da una URL `https://<proyecto>.vercel.app`.

## 2. Qué hace el build

En el log de Vercel tienen que salir estas dos líneas:

```
build OK — 2 titulo(s), 8 archivo(s) en dist/
baseUrl: https://<proyecto>.vercel.app  (fuente: VERCEL_PROJECT_PRODUCTION_URL)  basePath: ""  siteLang: en
```

La segunda es la importante: dice **con qué host se escribieron los `canonical`**, y de dónde
salió ese host. Si esa línea no cita el dominio que estás usando, el sitio está publicando
canonicals equivocados y hay que arreglarlo antes de dejarlo indexar.

Si el build **falla** con `BUILD FALLIDO — build de Vercel (…) sin host que usar`, es que las
variables de sistema están desactivadas: **Settings → Environment Variables → marca «Enable
access to System Environment Variables»** y vuelve a desplegar. El generador prefiere fallar a
inventarse un canonical.

## 3. Comprobar que quedó bien

Sustituye `HOST` por el dominio que te dio Vercel y pega esto en una terminal:

```bash
HOST=https://<proyecto>.vercel.app

# a) la portada, las dos fichas y la página de autor: 200 y SIN redirección
for p in / /libros/local-seo-without-an-agency/ /libros/healthcare-marketing-lead-generation/ /autor/; do
  printf '%-52s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} redirs=%{num_redirects}' "$HOST$p")"
done

# b) sitemap y robots: 200
curl -s -o /dev/null -w 'sitemap.xml %{http_code}\n' "$HOST/sitemap.xml"
curl -s -o /dev/null -w 'robots.txt  %{http_code}\n' "$HOST/robots.txt"

# c) el canonical de cada página coincide EXACTAMENTE con la URL que responde
for p in / /libros/local-seo-without-an-agency/ /libros/healthcare-marketing-lead-generation/ /autor/; do
  printf '%-52s %s\n' "$HOST$p" "$(curl -s "$HOST$p" | grep -o '<link rel="canonical" href="[^"]*"')"
done

# d) las cabeceras que sólo se pueden servir desde Vercel
curl -sI "$HOST/" | grep -i 'x-content-type-options\|referrer-policy'
curl -sI "$HOST/assets/styles.css" | grep -i 'cache-control'

# e) una ruta que no existe devuelve 404 de verdad (no 200)
curl -s -o /dev/null -w 'ruta inexistente: %{http_code}\n' "$HOST/no-existe/"
```

Lo que tiene que salir:

| Comprobación | Esperado |
|---|---|
| a | `200 redirs=0` en las cuatro. **Un `301`/`308` aquí es un fallo**: la URL canónica no puede redirigir. |
| b | `200` las dos |
| c | el `href` del canonical == la URL de la izquierda, carácter por carácter |
| d | `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `cache-control: public, max-age=31536000` |
| e | `404` |

**Estado de estas comprobaciones: NO MEDIDAS EN VIVO.** Lo que sí medimos (2026-09-25, TALLER,
issue MET-158) fue el **artefacto de despliegue**: corrimos `vercel build` localmente (CLI
59.23.2) y aplicamos, una por una y en orden, las reglas de enrutamiento que el propio Vercel
generó en `.vercel/output/config.json` a las 4 URL canónicas del `sitemap.xml`. Resultado: las
4 resuelven **sin redirección** y con un archivo estático detrás, `/sitemap.xml`, `/robots.txt`
y `/assets/styles.css` tampoco redirigen, las cabeceras se aplican, y la tabla de rutas incluye
`{"status":404,"dest":"/404.html"}`. Eso prueba el artefacto; la respuesta HTTP real sólo se
puede comprobar contra un despliegue vivo, y por eso este bloque sigue siendo un paso del
Board.

## 4. Fijar el host a mano (opcional)

Por omisión el canonical sale de `VERCEL_PROJECT_PRODUCTION_URL`, que Vercel inyecta y que
apunta **al dominio de producción incluso en los despliegues de preview** — así un preview no
se apunta a sí mismo como canónico, que es lo correcto.

Si quieres fijarlo (por ejemplo antes de que el dominio propio esté verificado):
**Settings → Environment Variables → Add**, nombre `SITE_BASE_URL`, valor el host completo
(`https://…`, **sin barra final**), y vuelve a desplegar. `SITE_BASE_URL` gana siempre.

## 5. Dominio propio

1. Proyecto → **Settings → Domains → Add**, escribe el dominio.
2. El panel de Vercel muestra **el registro DNS exacto** (tipo, nombre y valor) que hay que
   crear. Usa ese, el que muestra la pantalla: no lo copies de ningún documento, depende de si
   es dominio raíz o subdominio.
3. Quien administre la zona DNS crea ese registro; espera la verificación en el mismo panel.
4. **Vuelve a desplegar** y repite §3 contra el dominio nuevo: el canonical se fija en el
   build, no en la petición, así que un dominio añadido después no cambia solo el HTML ya
   publicado.

## 6. Cada push

Con el proyecto importado, cada push a `main` que toque `hub-ebooks/**` dispara un despliegue
de producción; cada PR, un preview. Además `.github/workflows/hub-ebooks.yml` corre el chequeo
de salud y el build en GitHub Actions: si el generador o los datos se rompen, el repositorio se
pone rojo ahí, sin esperar al log de Vercel. Ese workflow **no despliega nada**.

## 7. Qué NO hay que hacer

- No actives GitHub Pages. El sitio ya no está preparado para Pages: se quitaron `.nojekyll`,
  el `CNAME.example` y el job de despliegue del workflow.
- No cambies el **Root Directory** del proyecto de Vercel a `hub-ebooks`: el `vercel.json` está
  en la raíz y dejaría de leerse.
- No edites `dist/`. No está versionado: se genera en cada build.
