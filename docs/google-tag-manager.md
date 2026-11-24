# Google Tag Manager

Contenedor: `GTM-WQVRDHQM`.

Se instaló el fragmento oficial en `src/layouts/Layout.astro`, al principio del `<head>`, y su respaldo `<noscript>` inmediatamente después de abrir el `<body>`. El atributo `is:inline` conserva la ejecución del fragmento en su posición original al compilar con Astro. La plantilla cubre todas las páginas y la página 404.

La comprobación de la compilación valida ambas posiciones y que no se repita el contenedor. La política de privacidad informa que el sitio carga Google Tag Manager. Los campos del preparador de mensajes no se añaden a `dataLayer`.

Las etiquetas, sus activadores y las decisiones de consentimiento se administran y publican en Google Tag Manager. No se añadieron fragmentos independientes de Analytics, Google Ads o Meta desde el código del sitio.

## Google Analytics 4

El 10 de octubre de 2026 se publicó la versión 2 del contenedor, «Activar GA4 para MetrilabCL», con una etiqueta de Google denominada «GA4 | MetrilabCL | Todas las páginas».

- ID de medición: `G-R4D90YVNLK`.
- Activación: `Initialization - All Pages`.
- Propiedad de Analytics: `558361076` (cuenta `411530208`).
- Flujo web MetrilabCL: `16103328324`, para `https://metrilab.cl`.

La etiqueta se administra en GTM. No se copia además el fragmento `gtag.js` a la plantilla: así se mantiene una única configuración de medición. La política de privacidad informa del uso de Analytics y de cookies.

La prueba de instalación de Analytics confirmó: «Se ha detectado correctamente su etiqueta de Google en su sitio web». La medición mejorada está activa para el flujo web.

Se comprobó la recepción real de `page_view`, `session_start` y `first_visit` en el informe de Tiempo real. La captura de comprobación está en `tmp/qa/analytics-tiempo-real.png`. Las visitas iniciales incluyen las comprobaciones de instalación, por lo que no representan consultas comerciales.

Referencia oficial: [Instalar un contenedor web](https://support.google.com/tagmanager/answer/14847097).

Verificación: Astro sin errores en 35 archivos; fragmentos presentes en los 17 HTML compilados; cinco pruebas de navegador aprobadas. El recurso `gtm.js` del contenedor respondió HTTP 200.

## Eventos de contacto (24 de noviembre de 2026)

El sitio envía a `dataLayer` tres eventos propios. El código está en `src/scripts/track.ts`; la página de contacto añade los suyos en `src/pages/contacto.astro`.

| Evento | Cuándo se envía | Parámetros |
| --- | --- | --- |
| `generate_lead` | Clic en un enlace de WhatsApp, de teléfono o de correo; abrir Gmail, Outlook o la aplicación de correo desde el preparador; copiar el mensaje preparado | `method`: `whatsapp`, `telefono`, `correo`, `gmail`, `outlook`, `correo_app` o `copiar`. `placement`: `encabezado`, `contenido` o `pie` |
| `contacto_preparado` | El visitante completa el preparador y pulsa «Preparar correo» | Ninguno |
| `cta_click` | Clic en un llamado a la acción marcado con `data-track` | `cta`: texto del llamado. `placement` |

`generate_lead` registra un intento de contacto, no un mensaje recibido: el sitio no sabe si la persona envió el WhatsApp o el correo. Una misma visita puede generar más de uno (por ejemplo, abrir Gmail y después copiar). Los enlaces de correo de la política de privacidad llevan `data-no-lead` y no cuentan.

Cada evento envía las tres claves (`method`, `placement`, `cta`), vacías cuando no aplican: la capa de datos conserva el último valor de cada clave y, sin eso, un evento heredaría los parámetros del clic anterior.

Ningún evento incluye los campos del preparador: ni nombre, ni sitio, ni servicio elegido, ni mensaje. La prueba de navegador lo comprueba.

### Configuración publicada en Tag Manager

El 24 de noviembre de 2026 se publicó la versión 3 del contenedor, «Eventos de contacto y CTA»:

- Variables de capa de datos `DLV - method`, `DLV - placement` y `DLV - cta`.
- Activador `CE - Eventos de contacto y CTA`: evento personalizado con la expresión regular `^(generate_lead|contacto_preparado|cta_click)$`.
- Etiqueta `GA4 | MetrilabCL | Eventos de contacto y CTA`: evento de GA4 con ID de medición `G-R4D90YVNLK`, nombre de evento `{{Event}}` y los tres parámetros.

Se comprobó en Vista previa, sobre `https://metrilab.cl/contacto/`, que los cuatro tipos de acción envían su evento a Analytics con los parámetros correctos y sin el texto del preparador. La prueba dejó eventos de prueba en la propiedad, entre ellos cuatro `generate_lead` que no son consultas.

### Pendiente en Analytics

En **Administrar → Eventos**, marcar `generate_lead` como evento clave cuando aparezca (puede tardar hasta un día). En **Definiciones personalizadas**, registrar `placement` y `cta` como dimensiones de evento; `method` también, si «Método» no aparece en los informes.

Para que las visitas propias no cuenten: **Administrar → Flujos de datos → Configurar ajustes de etiquetas → Definir tráfico interno**.

Las pruebas de navegador bloquean `googletagmanager.com` y `google-analytics.com`, de modo que ni las ejecuciones locales ni las de GitHub Actions dejan visitas o conversiones en la propiedad.
