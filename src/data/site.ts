export const site = {
  name: 'MetrilabCL',
  url: 'https://metrilab.cl',
  description: 'Agencia de marketing digital en Chile. SEO, Google Ads, Meta Ads, investigación de palabras clave y contenidos con estrategia, ejecución y seguimiento.',
  email: 'contacto@metrilab.cl',
  owner: {
    name: 'Bastian Vega Yon',
    location: 'Iquique, Chile',
    website: 'https://bvyon-marketing.cl',
    linkedin: 'https://www.linkedin.com/in/bvyon/',
  },
  privacyRetentionMonths: 12,
  launchReady: true,
  revision: '2026-10-10',
};

export function mailto(subject: string, body = '') {
  return site.email ? `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '/contacto/';
}

export const navigation = [
  { href: '/servicios/', label: 'Servicios' },
  { href: '/metodo/', label: 'Método' },
  { href: '/recursos/', label: 'Recursos' },
  { href: '/nosotros/', label: 'El estudio' },
];

export const steps = [
  { title: 'Entender', text: 'Tu negocio, tu sitio y la decisión que necesitas tomar. Definimos la pregunta antes de buscar la respuesta.' },
  { title: 'Investigar', text: 'Demanda, competencia y estado de tu web. Cada hallazgo conserva su fuente, fecha y límites.' },
  { title: 'Priorizar', text: 'Un plan con criterio: qué hacer primero, quién puede hacerlo y cómo comprobar cada cambio.' },
  { title: 'Verificar', text: 'Tu equipo o el nuestro aplica. Contrastamos el antes y el después con el mismo método.' },
];
