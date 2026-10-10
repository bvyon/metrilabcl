# Del brief al sitio de MetrilabCL

Fuente de trabajo: brief entregado por el usuario, fechado el 6 de octubre de 2026. Implementación: 10 de octubre de 2026.

## Lectura estratégica

La parte más sólida del brief es separar diagnóstico y ejecución. Permite explicar qué se compra, quién aplica las mejoras y qué evidencia sostiene la propuesta. El posicionamiento es más específico que «marketing digital»: investigación y visibilidad web con SEO, contenidos, AEO/GEO y experiencia web.

El público chileno y la ausencia de resultados autorizados justifican una identidad sobria, contenido útil y método visible. «Premium» se expresa en precisión, diseño y claridad; no en cifras o clientes imaginarios.

Los volúmenes y conteos del documento son datos reportados por el brief, no mediciones realizadas durante esta implementación. No se trasladaron al sitio como estudio propio. No se reprodujeron las afirmaciones de que un dominio está disponible o de que una función de Google se retiró en cierta fecha sin verificación suficiente.

## Decisiones creativas

**Mensaje de portada: «Menos ruido. Más dirección.»** Es una síntesis editorial, acompañada inmediatamente de una explicación concreta: investigamos cómo te buscan y qué tan bien responde tu sitio. La agencia sigue siendo reconocible como servicio SEO e investigación; el eslogan no reemplaza la oferta.

**Estética editorial.** Fondo marfil, tinta verde oscura, acentos suaves, titulares serif y cuerpo sans. Dos familias, autoalojadas. Tipografía grande, márgenes amplios y jerarquía consistente.

**Visuales propios.** Diagrama conceptual de demanda, contenido y entidad. Sin fotografías genéricas ni gráficas que simulen resultados. Las ilustraciones se construyen con SVG/CSS y no requieren servicios de imágenes.

**Confianza basada en proceso.** Método público, etiquetas de evidencia, alcance, límites y formato ilustrativo de diagnóstico descargable. No se afirma que el ejemplo sea un informe real.

**Contenido útil desde el primer borrador.** Tres guías originales: elegir diagnóstico o ejecución, leer un diagnóstico y evaluar promesas de visibilidad en IA. No se presenta el estudio de mercado del brief como publicación porque faltan sus datos reproducibles y permisos.

## Correcciones respecto del documento

1. **Publicaciones eliminadas.** El usuario indicó que los libros no forman parte de la agencia. Quedan 11 páginas principales, 3 guías y una página de error.
2. **Correo confirmado:** `metrilabcl@gmail.com`. Reemplaza la propuesta de correo del dominio en el brief. Está centralizado para facilitar un cambio posterior.
3. **Contacto sin backend.** Un asistente prepara el correo y permite copiarlo; el visitante lo envía. No hay una falsa confirmación de recepción.
4. **SEO sin palabras clave forzadas.** Títulos únicos, contenidos específicos, una página por propósito y enlaces que conectan guías y servicios.
5. **AEO/GEO con fuentes primarias y límites.** La documentación de Google se cita sólo para Google. No se convierte en una regla universal ni en promesa de inclusión.
6. **Política marcada como borrador.** No se inventan razón social, dirección, representante, base legal ni conservación. La configuración mantiene `noindex` hasta completar los datos reales y la revisión.
7. **Arquitectura portable.** Astro genera HTML estático. No se necesita una aplicación Next.js ni servicios privados para un sitio de esta naturaleza.

## Mapa implementado

| URL | Función |
| --- | --- |
| `/` | Oferta, caminos, método y siguiente paso |
| `/servicios/` | Comparación de diagnóstico y ejecución |
| `/diagnostico/` | Alcance, entregables y muestra ilustrativa |
| `/seo/` | Implementación, accesos y verificación |
| `/visibilidad-en-ia/` | AEO/GEO, fuente primaria y límites |
| `/investigacion/` | Demanda, competencia y evidencia |
| `/metodo/` | Pasos, fuentes y clasificación de afirmaciones |
| `/nosotros/` | Identidad de la organización sin datos supuestos |
| `/recursos/` | Índice y filtros de tres guías |
| `/contacto/` | Correo directo y preparación local de consulta |
| `/privacidad/` | Borrador transparente pendiente de completar |

## Lo que conviene hacer después

- Auditar el sitio desplegado y publicar el informe real como primera muestra propia, con condiciones y fecha.
- Medir clics hacia contacto y consultas recibidas cuando se defina una solución de analítica y su tratamiento de datos.
- Priorizar recursos de calidad sobre una cuota fija de cuatro artículos por mes. El volumen editorial del brief es un supuesto de capacidad.
- Mantener la identidad consistente entre este sitio y perfiles confirmados. Los cambios en el portfolio personal se deciden cuando el dominio de la agencia esté en línea.
- Evaluar contactos por correo antes de agregar otros canales. El sitio actual respeta el canal elegido.

## Fuentes verificadas para la implementación

- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), consultada el 10 de octubre de 2026.
- [Astro: despliegue en Vercel](https://docs.astro.build/en/guides/deploy/vercel/), consultada el 10 de octubre de 2026.
- [Astro: despliegue en Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/), consultada el 10 de octubre de 2026.
- [Cloudflare Workers: activos estáticos](https://developers.cloudflare.com/workers/static-assets/), consultada el 10 de octubre de 2026.
