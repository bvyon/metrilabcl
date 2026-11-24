# Verificación de la primera versión

Fecha: 10 de octubre de 2026. Entorno: local, sitio compilado con Astro 7.3.8.

## Recorrido comprobado

El visitante conoce la oferta en la portada, compara diagnóstico y ejecución, revisa el método o las guías y prepara una consulta por correo. No hay un backend de recepción: el visitante envía el mensaje desde su aplicación de correo, o lo copia y pega.

| Área | Resultado | Evidencia |
| --- | --- | --- |
| Tipos y plantillas | Correcto | `npm run check`: sin errores, advertencias ni sugerencias |
| Construcción estática | Correcto | 15 páginas HTML: 11 principales, 3 guías y 404 |
| Enlaces y recursos internos | Correcto | 402 referencias verificadas en el HTML compilado |
| SEO técnico local | Correcto | Un H1 y título único por página, descripción, canonical, idioma, sitemap y JSON-LD válidos |
| Páginas en navegador | Correcto | 14 rutas con HTTP 200 en la salida compilada |
| Adaptación | Correcto | Sin desplazamiento horizontal a 1440, 390 y 320 px en las 14 rutas; revisión adicional a 768 px en desarrollo |
| Accesibilidad automatizada | Correcto en el alcance probado | Axe sin infracciones de las reglas WCAG A/AA seleccionadas, en las 14 rutas a 390 px |
| Menú móvil y teclado | Correcto | Apertura, cierre con Escape, foco y enlace para saltar al contenido |
| Filtros de recursos | Correcto | Filtro de IA muestra una guía; Todos restaura tres |
| Preparación de consulta | Correcto | Campo obligatorio, contenido copiado al portapapeles y destinatario confirmado |
| Portapapeles bloqueado | Correcto | Se muestra un mensaje seleccionable para copia manual |
| Envíos de formulario | No existen | La prueba no registra solicitudes POST |
| Error 404 | Correcto | Ruta inexistente devuelve HTTP 404 y permite volver al inicio |
| Errores de JavaScript | Ninguno observado | Escucha de errores durante navegación y pruebas |

La suite de navegador incluye cuatro pruebas completas y pasó contra la salida compilada. Los comandos y la configuración para repetirla están en el README.

## Revisión visual

Se inspeccionaron capturas de portada en escritorio y móvil, y de contacto en móvil. Se corrigió un desbordamiento de la tabla de servicios en pantallas pequeñas y se ocultó visualmente el enlace de salto cuando no tiene foco.

## Límites de esta verificación

- La comprobación automatizada no acredita por sí sola conformidad completa con WCAG. La lectura con tecnologías de asistencia y la evaluación manual de todas las interacciones quedan fuera de esta primera revisión.
- No se envió un correo. Se comprobó la preparación y copia del mensaje. La apertura de la aplicación de correo depende del equipo del visitante.
- No hay mediciones de tráfico real ni datos de campo de Core Web Vitals. No se atribuyen resultados de negocio a estas comprobaciones.
- Las pruebas locales se complementaron con la comprobación de la publicación en Cloudflare descrita abajo.
- `launchReady` sigue en `false`. La primera publicación requería completar la política y aprobar la indexación; la actualización de privacidad se documenta abajo. Esto no es un fallo de construcción.

## Estado para entrega

Primera versión funcional publicada en Cloudflare Workers. Repositorio local inicializado, sin remoto de GitHub. La política comenzó como borrador y fue completada con los datos del responsable en la actualización documentada abajo.

## Publicación en Cloudflare

Fecha: 10 de octubre de 2026. Proyecto: `metrilabcl`. Versión final: `a85a8f00-ccf6-4708-9d61-63c2a7dc5afd`.

Dirección alternativa verificada: https://metrilabcl.metrilabcl.workers.dev. Se comprobaron 14 páginas, robots, sitemap, imagen social y muestra descargable con HTTP 200, más una ruta inexistente con HTTP 404. El contenido publicado coincide con los archivos compilados; se verificaron las cabeceras y la instrucción `noindex`.

En el navegador publicado se comprobaron portada, menú móvil y Escape, filtro de recursos, preparación y copia de consulta a `metrilabcl@gmail.com`. No se observaron errores de JavaScript. No se envió un correo.

La zona `metrilab.cl` está activa. Se asociaron `metrilab.cl` y `www.metrilab.cl` al proyecto y se guardaron ambos en la configuración de publicación. Cloudflare gestiona el certificado HTTPS.

La comprobación final sobre https://metrilab.cl pasó 19 verificaciones: 14 páginas, cuatro recursos y una ruta inexistente. Se confirmó HTTPS válido, contenido idéntico al compilado, `noindex`, cabeceras y HTTP 404. https://www.metrilab.cl también devuelve la portada correcta por HTTPS. En el dominio principal se repitieron las interacciones de menú, Escape, filtros y copia de consulta, sin errores de JavaScript.

Cloudflare insertaba automáticamente su script de Web Analytics en el dominio propio. Se añadió `Cache-Control: public, max-age=0, must-revalidate, no-transform` para impedir la modificación del contenido, conforme a su [documentación](https://developers.cloudflare.com/web-analytics/get-started/). La publicación final no contiene el script de estadísticas y el navegador no solicita `cloudflareinsights.com`. Esto no desactiva los registros técnicos del proveedor de hosting.

## Actualización inicial de privacidad y correo — histórico

10 de octubre de 2026. Versión publicada: `68c6c9c1-f665-49f2-a6c5-683d10bc1eb1`.

La política identifica a Bastian Vega Yon, Iquique, Chile, su web y LinkedIn; informa conservación de consultas sin contratación hasta 12 meses desde la última interacción, finalidades, proveedores y derechos. No se publica una dirección particular. El preparador exige una casilla inicialmente desmarcada e incorpora la autorización al mensaje escrito. El contacto público y los enlaces de correo usan contacto@metrilab.cl.

Verificación local: análisis de Astro sin errores, advertencias ni sugerencias; 15 HTML compilados y 403 referencias internas; las cuatro pruebas de navegador pasaron, incluida validación del consentimiento, destinatario y alternativa de copia manual. Se comprobó el sitio publicado: 14 páginas idénticas a la compilación, HTTPS, privacidad en www y respuesta 404. Privacidad, contacto y responsable no presentan desbordamiento a 1440, 390 y 320 px. Se inspeccionaron capturas móviles de privacidad y contacto y se verificó la copia del mensaje con autorización. No se observaron errores de JavaScript, solicitudes POST ni el script de estadísticas de Cloudflare.

Email Routing está habilitado y listo. Destino Gmail verificado, regla exacta de contacto activa y MX, SPF y DKIM publicados. Con autorización expresa del propietario se envió un único correo desde su Gmail del perfil Bastian a contacto@metrilab.cl, asunto «Prueba de recepción MetrilabCL — 10-10-2026». Se observó su llegada a la bandeja de entrada de metrilabcl@gmail.com a las 13:00, hora de Chile. Las respuestas salen inicialmente desde Gmail; no se configuró envío como contacto@metrilab.cl. El propietario debe aplicar el plazo de conservación en su buzón, como se explica en `docs/privacidad-y-correo.md`.

La indexación continúa desactivada hasta aprobar el lanzamiento para buscadores. El repositorio local continúa sin remoto de GitHub.

## Correo Zoho y política publicada — 10 de octubre de 2026

Versión: `8cda37dc-693d-4842-85a1-4d8836ac0968`. La política informa Zoho Mail para las nuevas consultas y Gmail para las históricas. La compilación y comprobaciones locales previas pasaron: 25 archivos sin errores, advertencias ni sugerencias; 15 HTML y 403 referencias internas. En esta publicación se verificaron HTTPS 200 y coincidencia exacta con la compilación en portada, contacto y privacidad, incluida privacidad en www. Continúan noindex y la ausencia del script de estadísticas.

Migración completada en Zoho; MX, SPF y DKIM verificados por su asistente. DNS público y API de Cloudflare confirman únicamente los tres MX de Zoho. Los tres MX anteriores se eliminaron con confirmación explícita y Email Routing está desactivado.

Con autorización expresa se enviaron exactamente dos mensajes: Gmail → contacto@metrilab.cl, recibido en Zoho a las 14:11, y respuesta Zoho → Gmail, recibida a las 14:12. Se comprobó el remitente contacto@metrilab.cl, SPF PASS, DKIM PASS para metrilab.cl y TLS. DMARC aparecía FAIL porque faltaba el registro. Se añadió después `v=DMARC1; p=none; adkim=r; aspf=r` y se verificó en DNS público; no se envió otra prueba ni se comprobó DMARC PASS en un correo posterior. Detalles operativos y conservación en `docs/privacidad-y-correo.md`.

## Rediseño interactivo y nueva oferta — 14 de noviembre de 2026

Diseño oscuro con acento lima, portada con tres demostraciones (anuncios, medición en vivo, chat de WhatsApp con CRM), páginas nuevas `/tracking-conversiones/` y `/chatbots-whatsapp/`, tres lecturas nuevas en Recursos e imagen para compartir rehecha. Detalle en `docs/superpowers/specs/2026-11-14-rediseno-interactivo-design.md`.

Verificación local: análisis de Astro sin errores, advertencias ni sugerencias; 23 páginas HTML y 912 enlaces y recursos internos comprobados; seis pruebas de navegador aprobadas con Chrome, incluidas 22 rutas a 1440, 390 y 320 px, accesibilidad con axe (WCAG 2.2 AA), menú, filtros de Recursos, contacto, 404 y las demostraciones de la portada (pestañas de anuncios, chat hasta «hora agendada», tarjeta del CRM y conversión en la consola). La prueba de accesibilidad se ejecuta con movimiento reducido para evaluar el estado final de cada página.

Se inspeccionaron capturas de la portada en escritorio y móvil, al inicio y a la mitad del bucle del video, y de una página interior. La portada no solicita recursos de terceros distintos de Google Tag Manager: el video se sirve desde `public/media/` (H.264, 1,3 MB en escritorio y 0,5 MB en móvil). Las demostraciones no envían ni guardan datos.

## Video e ilustraciones propios — 14 de noviembre de 2026

El video del encabezado y las ilustraciones de las páginas interiores se reemplazaron por material generado para el sitio (detalle en `docs/ilustraciones-y-video-propios.md`). La imagen para compartir se rehízo con el cuadro fijo del video nuevo.

La versión anterior se comprobó en producción tras su publicación: portada, páginas nuevas, una lectura nueva, video e imagen social respondieron HTTP 200 desde `metrilab.cl`, y la publicación automática aprobó sus comprobaciones previas y posteriores.

## Contacto directo, eventos y base de posicionamiento — 24 de noviembre de 2026

Teléfono y WhatsApp en el pie, en contacto y en los llamados a la acción; eventos `generate_lead`, `contacto_preparado` y `cta_click` hacia `dataLayer`; `lastmod` en el sitemap; título de la portada y H1 con «Agencia de marketing digital en Chile»; seis preguntas frecuentes en la portada; teléfono, localidad y responsable en los datos estructurados; política de privacidad actualizada.

Verificación local: análisis de Astro sin errores, advertencias ni sugerencias; 23 páginas HTML y 936 enlaces y recursos internos; siete pruebas de navegador aprobadas con Chrome, incluidas accesibilidad con axe en las 22 rutas y la prueba nueva de eventos. Se compararon capturas del encabezado de la portada contra producción, en escritorio y móvil: solo cambia el texto de la insignia.

La llegada de los eventos a Analytics se comprobó después en la Vista previa de Tag Manager y se publicó la versión 3 del contenedor (`docs/google-tag-manager.md`). Esa prueba detectó que un evento heredaba los parámetros del clic anterior; se corrigió y se repitió con resultado correcto. Sin verificar: la apertura real de WhatsApp o de una llamada, que las pruebas anulan.

Pendiente fuera del código, en Cloudflare: activar «Always Use HTTPS» (`http://metrilab.cl` responde 200 sin redirigir) y una regla de redirección de `www` al dominio principal.
