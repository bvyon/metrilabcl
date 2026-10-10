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
