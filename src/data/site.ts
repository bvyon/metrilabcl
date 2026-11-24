export const site = {
  name: 'MetrilabCL',
  url: 'https://metrilab.cl',
  description: 'Agencia de marketing digital en Chile. Google Ads, Meta Ads, tracking de conversiones, chatbots y CRM en WhatsApp, automatizaciones, contenidos y SEO.',
  email: 'contacto@metrilab.cl',
  phone: '+56937441215',
  phoneLabel: '+56 9 3744 1215',
  locality: 'Iquique',
  region: 'Tarapacá',
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

export const tel = `tel:${site.phone}`;

export function whatsapp(text = 'Hola, MetrilabCL. Vengo desde metrilab.cl y quiero hacer una consulta.') {
  return `https://wa.me/${site.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export const navigation = [
  { href: '/servicios/', label: 'Servicios' },
  { href: '/metodo/', label: 'Método' },
  { href: '/recursos/', label: 'Recursos' },
  { href: '/nosotros/', label: 'El estudio' },
];
