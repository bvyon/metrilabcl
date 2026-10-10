# Google Tag Manager

Contenedor: `GTM-WQVRDHQM`.

Se instaló el fragmento oficial en `src/layouts/Layout.astro`, al principio del `<head>`, y su respaldo `<noscript>` inmediatamente después de abrir el `<body>`. El atributo `is:inline` conserva la ejecución del fragmento en su posición original al compilar con Astro. La plantilla cubre todas las páginas y la página 404.

La comprobación de la compilación valida ambas posiciones y que no se repita el contenedor. La política de privacidad informa que el sitio carga Google Tag Manager. Los campos del preparador de mensajes no se añaden a `dataLayer`.

Esta instalación incorpora el contenedor. Las etiquetas, sus activadores y las decisiones de consentimiento se administran y publican en Google Tag Manager. No se añadieron etiquetas de Analytics, Google Ads o Meta desde el código del sitio.

Referencia oficial: [Instalar un contenedor web](https://support.google.com/tagmanager/answer/14847097).

Verificación: Astro sin errores en 35 archivos; fragmentos presentes en los 17 HTML compilados; cinco pruebas de navegador aprobadas. El recurso `gtm.js` del contenedor respondió HTTP 200.
