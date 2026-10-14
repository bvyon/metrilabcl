import claridad from '../assets/illustrations/claridad.png';
import diagnostico from '../assets/illustrations/diagnostico.png';
import ejecucion from '../assets/illustrations/ejecucion.png';
import evidencia from '../assets/illustrations/evidencia.png';
import campanas from '../assets/illustrations/campanas.png';
import contenidos from '../assets/illustrations/contenidos.png';
import respuestas from '../assets/illustrations/respuestas.png';
import conversacion from '../assets/illustrations/conversacion.png';
import funnels from '../assets/illustrations/funnels.png';

export const illustrations = {
  claridad: { src: claridad, alt: 'Una lupa sobre las capas de una web conecta señales de búsqueda con información organizada.', caption: 'Investigar para ver con claridad.', dark: false },
  diagnostico: { src: diagnostico, alt: 'Una lupa sobre documentos y capas de información representa la revisión de evidencia.', caption: 'De los hallazgos a las prioridades.', dark: false },
  ejecucion: { src: ejecucion, alt: 'Módulos de una web se conectan por etapas hasta una verificación final.', caption: 'Un plan que se convierte en acciones.', dark: false },
  evidencia: { src: evidencia, alt: 'Tres paneles transforman piezas dispersas en una estructura ordenada y un plan.', caption: 'Evidencia → Criterio → Acción.', dark: true },
  campanas: { src: campanas, alt: 'Un megáfono conecta piezas de búsqueda y redes sociales con una audiencia representada por pequeños nodos.', caption: 'Una oferta. Mensajes para cada canal.', dark: false },
  contenidos: { src: contenidos, alt: 'Una pluma sobre documentos y un panel de edición representa la creación de textos con una estructura clara.', caption: 'Palabras elegidas con intención.', dark: false },
  respuestas: { src: respuestas, alt: 'Un panel de respuesta se conecta con dos documentos que representan sus fuentes.', caption: 'Información clara, fuentes conectadas.', dark: false },
  conversacion: { src: conversacion, alt: 'Un sobre y dos paneles de diálogo conectados representan una consulta y una conversación clara.', caption: 'Una pregunta abre el siguiente paso.', dark: false },
  funnels: { src: funnels, alt: 'Un embudo conecta prospectos con contactos, mensajes de seguimiento y una oportunidad de venta mediante un engranaje de automatización.', caption: 'Captación → Seguimiento → Venta.', dark: false },
};

export type IllustrationName = keyof typeof illustrations;

const routeIllustrations: Record<string, IllustrationName> = {
  '/servicios/': 'ejecucion',
  '/diagnostico/': 'diagnostico',
  '/seo/': 'ejecucion',
  '/investigacion/': 'claridad',
  '/publicidad-digital/': 'campanas',
  '/contenidos/': 'contenidos',
  '/automatizaciones-funnels/': 'funnels',
  '/visibilidad-en-ia/': 'respuestas',
  '/metodo/': 'evidencia',
  '/nosotros/': 'claridad',
  '/contacto/': 'conversacion',
  '/privacidad/': 'conversacion',
  '/recursos/': 'contenidos',
  '/recursos/diagnostico-o-ejecucion/': 'ejecucion',
  '/recursos/como-leer-un-diagnostico/': 'diagnostico',
  '/recursos/visibilidad-ia-sin-promesas/': 'respuestas',
};

export function illustrationForRoute(path: string): IllustrationName {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  return routeIllustrations[normalized] || 'claridad';
}
