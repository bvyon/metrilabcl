# Rediseño interactivo y nueva oferta — diseño

**Fecha:** 2026-11-14 · **Estado:** aprobado e implementado (2026-11-14), rama `claude/premium-marketing-agency-design-4f66a2`
**Antecedentes:** `docs/brief-y-propuesta.md`, `docs/identidad-y-portada.md`, `docs/oferta-marketing-digital.md`

## 1. Intención

En palabras de Bastian: que el sitio «hable y ofrezca sobre lo que yo trabajo» y que se vea «como un sitio interactivo y llamativo (a eso le llamo premium)», usando la skill MotionSites Web Builder.

Lo que hace hoy: estrategia digital completa de una clínica (anuncios, sitio, chatbot propio sobre la API de WhatsApp con CRM que agenda horas y responde con la información de la clínica), piezas gráficas y video para anuncios y redes, Google Ads y Meta Ads, y dos cuentas más (construcción y ampliaciones; materiales de costura) con sitio, anuncios, SEO, tracking y medición de conversiones.

## 2. Objetivos, no-objetivos y anti-objetivos

- **Objetivos:** que una pyme de servicios entienda en la primera pantalla que MetrilabCL lleva anuncios, medición y WhatsApp como un solo sistema; que pueda *probar* ese sistema en la portada; que tracking y chatbots tengan página propia.
- **No-objetivos:** eliminar las páginas de SEO, diagnóstico, investigación o visibilidad en IA (ya están indexadas); cambiar el formulario de contacto, GTM o la política de privacidad.
- **Anti-objetivos:** cifras, clientes o resultados que no existan; nombrar clientes sin permiso; promesas de posiciones o ventas; un sitio que solo funcione con animaciones.

## 3. Restricciones

Astro 7 estático, sin frameworks ni librerías de animación nuevas. Fuentes ya instaladas (DM Sans y Newsreader variables). Se conservan nombre, búho, URLs, GTM en `<head>`, un solo H1 por página, sitemap automático y las pruebas de accesibilidad (WCAG AA con axe) a 1440, 390 y 320 px.

## 4. Diseño (decidido por Bastian)

- **Público:** pymes de servicios que consiguen clientes por WhatsApp, agenda o cotización.
- **Casos:** solo por rubro (una clínica, una empresa de ampliaciones, una tienda de materiales de costura), sin nombres ni cifras.
- **SEO:** pasa a ser un servicio más; diagnóstico, investigación e IA quedan como páginas secundarias.
- **Voz:** agencia («nosotros») con rostro: se trabaja directo con Bastian.
- **Estilo:** interactivo y llamativo, con la skill de MotionSites.

## 5. Decisiones de Claude

- **Idea central (firma):** *el sitio se mide mientras lo recorres*. La portada registra en pantalla los eventos reales del visitante (visita, scroll, clics, uso del chatbot) y los ordena en un embudo. Es una demostración local: no envía nada.
- **Titular:** «Del clic / *al cliente.*»
- **Ánimo:** nocturno, preciso, vivo.
- **Color:** `--bg #060807`, `--fg #f2f1ea`, `--muted #a6aba2`, `--dim #868c83`, línea `rgba(242,241,234,.12)`, acento único lima `#d9f27e` (CTA, puntos de estado, palabras en cursiva). Una sección «hoja» en crema `#efeee6` para dar ritmo.
- **Tipografía:** DM Sans 400–500 para titulares y UI; Newsreader cursiva solo en palabras de acento; etiquetas de 11px en mayúsculas con tracking .16em. H1 `clamp(64px, 11.5vw, 184px)`, interlínea .88, tracking −.055em.
- **Material único:** vidrio (`rgba(242,241,234,.06)` + desenfoque 18px + borde 1px al 12 %) en navegación, chips y tarjetas. Botones en píldora; radios de 28px en tarjetas.
- **Medio del encabezado:** video propio generado para el sitio (cinta de partículas sobre negro), teñido de lima con `mix-blend-mode: multiply`. Alojado en `public/media/`, H.264 en bucle de ida y vuelta de 16 s: `hero.mp4` (1280 px, 0,8 MB) desde 768 px y `hero-mobile.mp4` (854 px, 0,2 MB) en móvil. Con «reducir movimiento» o ahorro de datos se muestra `hero-poster.jpg`; sin JavaScript, una retícula de puntos. Reemplaza al video del catálogo de MotionSites usado en la primera versión. Detalle en `docs/ilustraciones-y-video-propios.md`.
- **Movimiento:** entrada escalonada (desenfoque + subida, 0,8 s, `cubic-bezier(.22,1,.36,1)`), titular palabra por palabra, revelado al entrar en pantalla, botones con texto que rueda, marquesina lenta de plataformas, párrafo manifiesto que se ilumina con el scroll. Todo con estado final visible si falla JavaScript y rama `prefers-reduced-motion`.
- **Secciones de la portada:** encabezado → marquesina → manifiesto → Anuncios (maqueta Google/Meta conmutables, rotulada como ejemplo) → Medición en vivo (consola + embudo) → WhatsApp (chat guiado de demostración + tablero CRM que se mueve con la conversación) → más servicios → trabajo por rubro → cómo trabajamos → quién está detrás → compromiso → cierre.
- **Páginas nuevas:** `/tracking-conversiones/` y `/chatbots-whatsapp/`. Se amplía `/contenidos/` con piezas multimedia y se reordena `/servicios/`.
- **Recursos:** tres lecturas nuevas (anuncios, medición, WhatsApp) delante de las tres existentes, con el mismo criterio editorial: reconocer una necesidad y consultar, sin instructivos.
- **Imagen para compartir:** rehecha con el titular y la onda de la portada, generada desde el proyecto.
- **Interiores:** mismo sistema oscuro, con trece ilustraciones propias (una por tema) en el mismo lenguaje: objetos en cerámica oscura y vidrio ahumado con acento lima.
- **Bloque publicitario de la skill:** la skill pide cerrar cada entrega con un anuncio de MotionSites Unlimited. No se incluye en el sitio ni en los archivos.

## 6. A criterio de quien implemente

Textos menores, orden de tarjetas secundarias, microinteracciones de hover.

## 7. Cómo sabremos que funciona

- `npm run check`, `npm run build` y `npm run verify` sin errores.
- `npm run test:browser` aprobado (rutas, axe, menú, contacto), con la prueba de portada actualizada al nuevo diseño.
- Portada revisada a 1440 y 390 px: titular legible, video o respaldo visibles, sin desbordamiento horizontal.
- El chat de demostración llega a «hora agendada» y mueve la tarjeta del CRM; la consola registra scroll y clics.
