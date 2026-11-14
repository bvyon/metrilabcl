# Ilustraciones y video propios

14 de noviembre de 2026. Todo el material visual del sitio es propio: el video del encabezado y las trece ilustraciones de las páginas interiores se generaron para MetrilabCL con Higgsfield (video: Seedance 2.5; imágenes: GPT Image 2.6). Reemplazan al video del catálogo de MotionSites y a las ilustraciones claras de la primera identidad.

Representan conceptos. No son resultados medidos, capturas de herramientas ni trabajos de clientes, y no contienen texto, logotipos ni personas.

## Ilustraciones

Archivos en `src/assets/illustrations/` (JPEG, 1168 × 880). Astro entrega versiones WebP adaptadas a la pantalla. La asignación a cada ruta, los textos alternativos y los pies de imagen están en `src/data/illustrations.ts`.

| Archivo | Dónde se usa | Concepto |
| --- | --- | --- |
| `sistema.jpg` | Servicios, Recursos | Seis pedestales unidos por una línea de luz: megáfono, medidor, burbuja, engranaje, pluma y lupa. |
| `campanas.jpg` | Google Ads y Meta Ads; lectura de anuncios | Un megáfono proyecta tres haces hacia tres piezas de distinto formato y una audiencia. |
| `tracking.jpg` | Tracking y conversiones; lectura de medición | Esferas que cruzan un aro que las registra y caen en un embudo de cuatro niveles. |
| `chatbot.jpg` | Chatbots y CRM; lectura de WhatsApp | Un teléfono, tres burbujas, un calendario con un día marcado y un fichero de contactos. |
| `funnels.jpg` | Automatizaciones y funnels | Embudo de tres niveles y engranajes que entregan una sola esfera. |
| `contenidos.jpg` | Contenidos | Pluma sobre hojas, un marco con una imagen y otro con un símbolo de video. |
| `ejecucion.jpg` | SEO; lectura de diagnóstico o ejecución | Módulos de una web en tres plataformas, una verificación y una lupa. |
| `diagnostico.jpg` | Diagnóstico; lectura del informe | Lupa sobre hojas de evidencia, un alfiler y tres bloques de prioridad. |
| `claridad.jpg` | Investigación | Mapa en relieve con una curva iluminada, tres marcadores y una brújula. |
| `respuestas.jpg` | Visibilidad en IA y su lectura | Panel de respuesta unido por hilos de luz a dos documentos fuente. |
| `evidencia.jpg` | Método | Tres paneles: piezas dispersas, alineadas y ordenadas. |
| `conversacion.jpg` | Contacto, Privacidad | Sobre entreabierto con luz y dos burbujas conectadas. |
| `estudio.jpg` | El estudio | Un búho de cerámica rodeado por cuatro herramientas unidas por una línea. |

### Dirección de arte común

Todas las imágenes comparten este encabezado de prompt, seguido de su concepto:

> Editorial 3D still-life illustration for a premium digital marketing agency website. Restrained tactile miniature objects in matte charcoal ceramic, smoked frosted glass and satin dark metal, with small glowing chartreuse-lime (#d9f27e) accents as the only colour. Seamless near-black background (#060807) that falls off to darkness at all edges, soft single key light from the upper left, subtle rim light, gentle contact shadows, shallow depth of field. Precise, elegant, quiet, believable materials, studio photograph of conceptual miniature objects. One clear concept, not generic decoration. Objects centred and fully inside the frame with generous empty margins. No text, no letters, no digits, no logos, no brand marks, no interface screenshots, no people, no watermark.

Formato 4:3. Para sumar una ilustración nueva, repetir el encabezado y describir un solo concepto con objetos concretos; después convertir el PNG a JPEG de calidad 90 y registrarlo en `src/data/illustrations.ts`.

## Video del encabezado

Prompt (texto a video, 8 s, 720p, 16:9, sin audio):

> Single continuous shot, locked camera, no cuts. Abstract macro CGI render on a pure black (#000000) seamless background. Millions of tiny glowing white dust particles form one wide, soft, translucent ribbon of light that undulates slowly like silk in zero gravity. The ribbon enters from the upper left and sweeps across the upper half and the right side of the frame, folding gently over itself, with a brighter luminous crest along its leading edge and fine sparkling grains drifting off it. The lower-left third of the frame stays completely empty and black for the whole shot. Monochrome only: white and soft grey on black, no colour at all. Soft volumetric glow, shallow depth of field, fine film grain. Very slow, calm, continuous motion at half real-time; lighting stays constant; nothing enters or leaves the frame; all edges of the frame fall off to pure black. No text, no letters, no logos, no interface, no people, no objects, no watermark. 24 fps.

Se genera en blanco y negro a propósito: el color lima lo pone el sitio con `mix-blend-mode: multiply`, así el tono coincide siempre con el de la marca.

Proceso con ffmpeg sobre el archivo generado:

1. Curva de contraste para aclarar la cinta sin levantar el negro: `curves=all='0/0 0.06/0.01 0.35/0.62 0.7/0.95 1/1'`.
2. Bucle de ida y vuelta (el clip seguido de sí mismo invertido), 16 s sin corte visible.
3. H.264, 24 fps, sin audio, `+faststart`: `hero.mp4` a 1280 px (CRF 29, 0,8 MB) y `hero-mobile.mp4` a 854 px (CRF 31, 0,2 MB).
4. `hero-poster.jpg`: cuadro del segundo 5,5, para movimiento reducido, ahorro de datos y la imagen para compartir.

El cuadro fijo también alimenta `public/social.svg` y `public/social.jpg` mediante `scripts/generate-brand-assets.mjs` y `scripts/render-social.mjs`.
