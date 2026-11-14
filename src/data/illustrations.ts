import campanas from '../assets/illustrations/campanas.jpg';
import tracking from '../assets/illustrations/tracking.jpg';
import chatbot from '../assets/illustrations/chatbot.jpg';
import funnels from '../assets/illustrations/funnels.jpg';
import contenidos from '../assets/illustrations/contenidos.jpg';
import ejecucion from '../assets/illustrations/ejecucion.jpg';
import diagnostico from '../assets/illustrations/diagnostico.jpg';
import claridad from '../assets/illustrations/claridad.jpg';
import respuestas from '../assets/illustrations/respuestas.jpg';
import evidencia from '../assets/illustrations/evidencia.jpg';
import conversacion from '../assets/illustrations/conversacion.jpg';
import estudio from '../assets/illustrations/estudio.jpg';
import sistema from '../assets/illustrations/sistema.jpg';

// Ilustraciones propias, generadas para el sitio. Los conceptos y prompts están en docs/ilustraciones-y-video-propios.md.
export const illustrations = {
  campanas: { src: campanas, alt: 'Un megáfono proyecta tres haces de luz hacia tres piezas de anuncio de distinto formato, frente a una audiencia de pequeños puntos.', caption: 'Un mensaje, un formato para cada canal.' },
  tracking: { src: tracking, alt: 'Unas esferas recorren un riel, cruzan un aro que las registra y caen encendidas en un embudo de cuatro niveles.', caption: 'Cada acción se registra una vez.' },
  chatbot: { src: chatbot, alt: 'Un teléfono con tres burbujas de conversación conectadas a un calendario con un día marcado y a un fichero de contactos.', caption: 'Responder, agendar, ordenar.' },
  funnels: { src: funnels, alt: 'Un embudo de tres niveles recibe varias esferas y, mediante engranajes, entrega una sola esfera encendida.', caption: 'Captación → Seguimiento → Venta.' },
  contenidos: { src: contenidos, alt: 'Una pluma sobre hojas de papel, junto a un marco con una imagen y otro con un símbolo de video.', caption: 'Textos, gráficas y video.' },
  ejecucion: { src: ejecucion, alt: 'Módulos de una web sobre tres plataformas ascendentes, unidos por una línea que termina en una verificación, con una lupa al frente.', caption: 'Un sitio que se encuentra y funciona.' },
  diagnostico: { src: diagnostico, alt: 'Una lupa sobre hojas de evidencia destaca unas barras; un alfiler marca un hallazgo y tres bloques apilados ordenan las prioridades.', caption: 'De los hallazgos a las prioridades.' },
  claridad: { src: claridad, alt: 'Un mapa en relieve con una curva de nivel iluminada, tres marcadores y una brújula.', caption: 'Conocer el terreno antes de avanzar.' },
  respuestas: { src: respuestas, alt: 'Un panel de respuesta flota conectado por dos hilos de luz a dos documentos que representan sus fuentes.', caption: 'Información clara, fuentes conectadas.' },
  evidencia: { src: evidencia, alt: 'Tres paneles muestran las mismas piezas: dispersas, parcialmente alineadas y finalmente ordenadas en una estructura.', caption: 'Evidencia → Criterio → Acción.' },
  conversacion: { src: conversacion, alt: 'Un sobre entreabierto con luz en su interior y dos burbujas de conversación unidas por una línea.', caption: 'Una pregunta abre el siguiente paso.' },
  estudio: { src: estudio, alt: 'Un búho de cerámica oscura con ojos encendidos, rodeado por un megáfono, un medidor, una burbuja de conversación y un engranaje unidos por una línea.', caption: 'Una persona a cargo de todo el sistema.' },
  sistema: { src: sistema, alt: 'Seis pedestales unidos por una línea de luz sostienen un megáfono, un medidor, una burbuja de conversación, un engranaje, una pluma y una lupa.', caption: 'Seis servicios, un mismo sistema.' },
};

export type IllustrationName = keyof typeof illustrations;

const routeIllustrations: Record<string, IllustrationName> = {
  '/servicios/': 'sistema',
  '/publicidad-digital/': 'campanas',
  '/tracking-conversiones/': 'tracking',
  '/chatbots-whatsapp/': 'chatbot',
  '/automatizaciones-funnels/': 'funnels',
  '/contenidos/': 'contenidos',
  '/seo/': 'ejecucion',
  '/diagnostico/': 'diagnostico',
  '/investigacion/': 'claridad',
  '/visibilidad-en-ia/': 'respuestas',
  '/metodo/': 'evidencia',
  '/nosotros/': 'estudio',
  '/contacto/': 'conversacion',
  '/privacidad/': 'conversacion',
  '/recursos/': 'sistema',
  '/recursos/anuncios-sin-consultas/': 'campanas',
  '/recursos/medicion-que-no-cuadra/': 'tracking',
  '/recursos/whatsapp-sin-responder/': 'chatbot',
  '/recursos/diagnostico-o-ejecucion/': 'ejecucion',
  '/recursos/como-leer-un-diagnostico/': 'diagnostico',
  '/recursos/visibilidad-ia-sin-promesas/': 'respuestas',
};

export function illustrationForRoute(path: string): IllustrationName {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  return routeIllustrations[normalized] || 'sistema';
}
