import type { Page } from './pages';
import { site } from './site';

export const privacyPage: Page = {
  slug: 'privacidad',
  title: 'Política de privacidad.',
  seoTitle: 'Política de privacidad | MetrilabCL',
  label: 'PRIVACIDAD / 13 DE OCTUBRE DE 2026',
  breadcrumb: 'Privacidad',
  contact: false,
  reviewDate: 'Última actualización: 13 de octubre de 2026',
  description: 'Cómo MetrilabCL trata los datos de las consultas y la navegación, cuánto tiempo los conserva y cómo ejercer tus derechos.',
  lead: 'Información sobre el uso de tus datos al visitar metrilab.cl o contactar con la agencia MetrilabCL.',
  sections: [
    {
      id: 'responsable', title: 'Responsable y contacto.',
      html: `<p>El responsable del tratamiento de tus datos es <strong>${site.owner.name}</strong>, a cargo de la agencia <strong>${site.name}</strong>. Contacto: <a href="mailto:${site.email}?subject=Privacidad">${site.email}</a>.</p>`,
    },
    {
      id: 'datos', title: 'Datos y uso.',
      html: `<p>Al escribirnos, recibimos tu email y los datos que incluyas en el mensaje, como nombre, sitio web y adjuntos. Con tu autorización, los usamos para responder tu consulta, preparar una propuesta solicitada y mantener la conversación. No los usamos para enviarte publicidad sin un consentimiento específico.</p><p>El preparador de mensajes funciona en tu navegador: no envía ni guarda sus campos en el sitio. Si eliges Gmail u Outlook, el borrador se abre en ese proveedor. Recibimos esa información cuando tú envías el correo.</p>`,
    },
    {
      id: 'conservacion', title: 'Conservación.',
      html: `<p>Las consultas sin contratación se conservan hasta <strong>${site.privacyRetentionMonths} meses desde la última interacción</strong>. Los datos de servicios contratados se tratan según el acuerdo correspondiente y las obligaciones legales de conservación.</p>`,
    },
    {
      id: 'proveedores', title: 'Proveedores.',
      html: `<p><a href="https://www.cloudflare.com/privacypolicy/">Cloudflare</a> aloja y protege el sitio y puede tratar datos técnicos de conexión, como la dirección IP. <a href="https://www.zoho.com/privacy.html">Zoho Mail</a> gestiona el correo de contacto; las consultas anteriores al cambio de proveedor permanecen en Gmail, de <a href="https://policies.google.com/privacy?hl=es">Google</a>, sujetas al mismo plazo de conservación. Estos proveedores pueden tratar datos fuera de Chile. No vendemos tus datos ni los cedemos para publicidad; pueden comunicarse cuando exista una obligación legal.</p>`,
    },
    {
      id: 'cookies', title: 'Cookies y estadísticas.',
      html: `<p>Usamos <strong>Google Tag Manager</strong> para administrar etiquetas y <strong>Google Analytics 4</strong> para medir visitas y mejorar el sitio. Analytics puede usar cookies y recoger páginas visitadas, origen del tráfico, interacciones y datos del navegador o dispositivo. El preparador no incorpora el contenido de tu consulta a estas herramientas.</p><p>Puedes administrar o eliminar cookies en tu navegador y usar el <a href="https://tools.google.com/dlpage/gaoptout?hl=es">complemento para inhabilitar Analytics</a>. Consulta la <a href="https://policies.google.com/privacy?hl=es">política de Google</a> para conocer su tratamiento de datos.</p>`,
    },
    {
      id: 'derechos', title: 'Tus derechos.',
      html: `<p>Puedes solicitar información y acceso a tus datos, corregirlos, pedir su eliminación o bloqueo cuando corresponda y retirar tu autorización. Escribe a <a href="mailto:${site.email}?subject=Privacidad">${site.email}</a> con el asunto «Privacidad», indicando tu solicitud y la consulta relacionada. Las solicitudes se atienden sin cobro y dentro de los plazos legales aplicables.</p>`,
    },
  ],
};
