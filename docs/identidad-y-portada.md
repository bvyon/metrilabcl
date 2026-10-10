# Identidad e ilustraciones de MetrilabCL

Nombre: **metrilabCL**, con DM Sans de peso 400 para «metrilab» y peso 700 para «CL», sin punto. El búho se redibujó como SVG para conservar nitidez; el favicon circular simplifica los detalles para tamaños pequeños.

## Referencias de dirección visual

Se revisaron [Clay, San Francisco](https://clay.global/), [Mekanism, San Francisco](https://www.mekanism.com/) y [Ondho, Barcelona](https://ondho.com/). Se tomó como referencia el uso de imágenes amplias, composiciones cuidadas y jerarquía tipográfica. Las ilustraciones son originales: materiales mate y vidrio, tonos marfil, verde bosque y salvia. Representan conceptos; no son resultados medidos ni trabajos de clientes.

## Archivos

- `public/brand.svg` y `public/brand-inverse.svg`: logotipos con la tipografía incorporada.
- `public/owl.svg` y `public/owl-inverse.svg`: símbolo.
- `public/favicon.svg`, `public/favicon-32.png` y `public/apple-touch-icon.png`: navegador y dispositivos.
- `public/social.svg` y `public/social.jpg`: vista previa del enlace al compartirlo.
- `src/assets/illustrations/`: cuatro originales PNG. Astro entrega versiones WebP adaptadas a la pantalla; solo la portada se carga con prioridad.

## Verificación del resultado

El flujo es: visita a la portada → carga de logo y cuatro ilustraciones → navegación hacia servicios o contacto. No requiere una API ni una base de datos.

| Comprobación | Resultado |
| --- | --- |
| Compilación | 27 archivos comprobados sin errores, advertencias ni sugerencias |
| Recursos internos | 15 páginas HTML y 469 enlaces y recursos verificados |
| Imágenes | Cuatro ilustraciones cargadas correctamente en WebP; versiones de aproximadamente 5–39 KB |
| Pantallas | Sin desbordamiento horizontal a 1440, 390 y 320 px |
| Navegador | Cinco pruebas aprobadas: páginas, accesibilidad, menú, imágenes, contacto y 404 |

Los SVG del logo contienen DM Sans; las imágenes de diagnóstico, ejecución y método se cargan al acercarse a ellas. Los originales se conservan para futuras variantes.

## Prompts finales de generación

### claridad

Use case: stylized-concept / editorial illustration for a premium digital strategy agency's website. A coherent visual system for MetrilabCL: restrained tactile 3D still-life, sculptural matte ceramic and frosted glass, confident Swiss editorial composition, very soft natural side lighting, warm ivory #f5f4ee, forest green #36503e, muted sage #98ad6c, small pale chartreuse #dceba0 accents. Precise, elegant, premium, quiet, believable materials, subtle shadows. Clear conceptual objects that teach rather than generic decoration. No text, letters, digits, logos, chart axis labels, mock data, watermarks, UI screenshots, people, neon, plastic cartoon style or exaggerated metallic effects. Objects must be fully within frame with ample breathing room, clean cohesive composition. Hero artwork, portrait-friendly square composition. A large deep forest green magnifying glass with real frosted optical glass resting diagonally over three layered ivory and sage abstract website panels. One panel has neatly aligned embossed rectangular content blocks. Beneath the lens these blocks become visually sharp and organized while a few small translucent dots outside the lens suggest scattered search signals. A thin graceful curved green pathway joins three small circular nodes around the composition, subtly communicating search demand, useful content, and visibility. Main lens and panels occupy central 65 percent of image. Ground and background perfectly warm ivory #f5f4ee, no horizon, no frame, no black background. Refined studio photograph of conceptual miniature objects, not an interface mockup.

### diagnostico

Use case: stylized-concept / editorial illustration for a premium digital strategy agency's website. A coherent visual system for MetrilabCL: restrained tactile 3D still-life, sculptural matte ceramic and frosted glass, confident Swiss editorial composition, very soft natural side lighting, warm ivory #f5f4ee, forest green #36503e, muted sage #98ad6c, small pale chartreuse #dceba0 accents. Precise, elegant, premium, quiet, believable materials, subtle shadows. Clear conceptual objects that teach rather than generic decoration. No text, letters, digits, logos, chart axis labels, mock data, watermarks, UI screenshots, people, neon, plastic cartoon style or exaggerated metallic effects. Objects must be fully within frame with ample breathing room, clean cohesive composition. Wide landscape service-card illustration with a 3:2 composition. A compact matte forest-green magnifying glass above a neat fan of ivory evidence sheets and sage translucent layers. Each sheet has only simple embossed geometric bars and small dots, absolutely no letters or numbers. One elegant green pin marks a finding. Explain diagnosis and research with a tangible composition. Low camera at a gentle isometric angle, objects centered, background and ground entirely ivory #f5f4ee. Fewer objects, generous empty margins, same restrained art direction as a premium optics and paper still life.

### ejecucion

Use case: stylized-concept / editorial illustration for a premium digital strategy agency's website. A coherent visual system for MetrilabCL: restrained tactile 3D still-life, sculptural matte ceramic and frosted glass, confident Swiss editorial composition, very soft natural side lighting, warm ivory #f5f4ee, forest green #36503e, muted sage #98ad6c, small pale chartreuse #dceba0 accents. Precise, elegant, premium, quiet, believable materials, subtle shadows. Clear conceptual objects that teach rather than generic decoration. No text, letters, digits, logos, chart axis labels, mock data, watermarks, UI screenshots, people, neon, plastic cartoon style or exaggerated metallic effects. Objects must be fully within frame with ample breathing room, clean cohesive composition. Wide landscape service-card illustration with a 3:2 composition. A beautifully organized small modular website architecture assembled from matte forest-green, sage and ivory ceramic rectangular blocks and clear frosted-glass panels. A single gentle pale chartreuse connecting route travels between three ascending platforms, ending in a small completed circular check symbol (only geometric check, no text). Explain deliberate implementation and verified progress, not financial growth. Precise satisfying modular construction with believable contact shadows. Background and ground entirely warm ivory #f5f4ee, quiet minimal central composition, same tactile studio art direction as an optics and paper still life.

### evidencia

Use case: stylized-concept / editorial illustration for a premium digital strategy agency's website. A coherent visual system for MetrilabCL: restrained tactile 3D still-life, sculptural matte ceramic and frosted glass, confident Swiss editorial composition, very soft natural side lighting, warm ivory #f5f4ee, forest green #36503e, muted sage #98ad6c, small pale chartreuse #dceba0 accents. Precise, elegant, premium, quiet, believable materials, subtle shadows. Clear conceptual objects that teach rather than generic decoration. No text, letters, digits, logos, chart axis labels, mock data, watermarks, UI screenshots, people, neon, plastic cartoon style or exaggerated metallic effects. Objects must be fully within frame with ample breathing room, clean cohesive composition. Wide landscape 16:9 illustration for a dark forest-green website section. Three slim frosted-glass and matte ivory evidence panels progressively align from scattered small sage geometric fragments at left into a coherent structured panel at right, joined by a single subtle ivory connecting line and three discrete circular nodes. Explain how evidence becomes an actionable plan. Use dark matte forest-green #242a27 seamless ground and background, muted sage blocks, ivory outlines and a very restrained pale chartreuse accent. Clear realistic tactile still-life lighting, no glowing neon, no gradients or artificial space scene. Main composition centered with dark quiet empty space around all sides. No text or mock numeric results.
