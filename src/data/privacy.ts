import type { Page } from './pages';
import { site } from './site';

export const privacyPage: Page = {
  slug: 'privacidad',
  title: 'Política de privacidad.',
  seoTitle: 'Política de privacidad | MetrilabCL',
  label: 'PRIVACIDAD / 10 DE OCTUBRE DE 2026',
  breadcrumb: 'Privacidad',
  contact: false,
  description: 'Responsable, uso de las consultas, conservación por 12 meses, proveedores y derechos sobre tus datos en MetrilabCL.',
  lead: 'Aquí explicamos qué información se trata al visitar este sitio o escribirnos, para qué se utiliza y cómo puedes ejercer tus derechos.',
  sections: [
    {
      id: 'responsable', title: 'Quién es responsable.',
      html: `<p><strong>${site.owner.name}</strong> es el responsable del tratamiento de los datos de las consultas dirigidas a MetrilabCL, nombre comercial de este sitio. La ubicación comercial informada es <strong>${site.owner.location}</strong>; no se publica una dirección particular.</p><p>Para consultas de privacidad y ejercicio de derechos, escribe a <a href="mailto:${site.email}?subject=Privacidad%20%7C%20MetrilabCL">${site.email}</a>. Puedes conocer al responsable en <a href="${site.owner.website}">bvyon-marketing.cl</a> y en su <a href="${site.owner.linkedin}" rel="me">perfil de LinkedIn</a>.</p>`,
    },
    {
      id: 'datos', title: 'Qué información se trata.',
      html: `<p>Si escribes por correo, se recibe tu dirección de email, el nombre que facilites, la dirección de tu sitio y el contenido de tu mensaje y sus adjuntos. No necesitamos documentos de identidad, contraseñas, datos de pago ni información sensible para una primera consulta. Evita incluir datos personales de terceros.</p><p>Al visitar la web, Cloudflare puede tratar datos técnicos de conexión, como dirección IP e información de tráfico, para entregar y proteger el sitio. Estos registros son distintos de las consultas que recibimos por correo.</p>`,
    },
    {
      id: 'contacto', title: 'Cómo funciona el contacto.',
      html: `<p>El preparador de mensajes funciona en tu navegador. Sus campos no se envían a MetrilabCL ni se guardan en una base de datos del sitio. «Copiar mensaje» utiliza el portapapeles de tu dispositivo; «Abrir en mi correo» solicita abrir tu aplicación de email.</p><p>El envío se produce únicamente cuando lo realizas desde tu correo. Puedes revisar, modificar o descartar el mensaje antes de enviarlo. Tu navegador, aplicación de correo y proveedor de email pueden gestionar borradores según sus propias opciones.</p>`,
    },
    {
      id: 'finalidades', title: 'Para qué usamos tus datos.',
      html: `<p>Los datos de una consulta se utilizan para responderla, entender el alcance de tu proyecto, preparar una propuesta solicitada y mantener la conversación correspondiente. No se publican tus mensajes ni se utilizan para añadirte automáticamente a una newsletter o enviar publicidad.</p><p>Para ese uso se solicita tu autorización expresa por escrito. El preparador incluye una casilla sin marcar y añade la autorización al mensaje si la aceptas; el sitio no almacena esa elección. Si contactas directamente, podremos pedirte confirmación por correo antes de incorporar tus datos a un seguimiento comercial. Puedes retirar la autorización escribiendo al contacto de privacidad; la retirada no afecta lo realizado previamente de forma lícita.</p>`,
    },
    {
      id: 'conservacion', title: 'Durante cuánto tiempo.',
      html: `<p>Las consultas que no dan lugar a una contratación se conservan por un máximo de <strong>${site.privacyRetentionMonths} meses desde la última interacción</strong>. Transcurrido ese plazo, se eliminan de los archivos de consultas gestionados por MetrilabCL. Puedes solicitar antes su eliminación cuando corresponda.</p><p>Si contratas un servicio, el acuerdo correspondiente deberá informar el tratamiento de los datos necesarios para ejecutarlo. Los documentos que deban conservarse por una obligación legal o para atender una reclamación se limitan a esa finalidad y al plazo aplicable. Las copias técnicas y los registros de los proveedores se rigen también por sus condiciones; no afirmamos que desaparezcan inmediatamente al borrar un mensaje.</p>`,
    },
    {
      id: 'proveedores', title: 'Proveedores y tratamiento fuera de Chile.',
      html: `<p><strong>Cloudflare</strong> proporciona el alojamiento, la distribución y la protección del sitio. <strong>Zoho Mail</strong> proporciona el buzón de contacto@metrilab.cl, donde se reciben y gestionan las nuevas consultas y desde donde se responde. <strong>Google, mediante Gmail</strong>, puede conservar consultas recibidas antes del cambio de proveedor, sujetas al mismo plazo de conservación. Estos servicios pueden tratar información fuera de Chile según su infraestructura y condiciones. No vendemos los datos de las consultas ni los entregamos a terceros para que hagan publicidad.</p><p>La información puede comunicarse cuando lo exija una obligación legal o un requerimiento válido de una autoridad competente. Para conocer el tratamiento de los proveedores, consulta la <a href="https://www.cloudflare.com/privacypolicy/">política de Cloudflare</a>, la <a href="https://www.zoho.com/privacy.html">política de Zoho</a> y la <a href="https://policies.google.com/privacy?hl=es">política de Google</a>. Los enlaces a la web del responsable y a LinkedIn no cargan contenido incrustado: al abrirlos, visitas sitios con sus propias políticas.</p>`,
    },
    {
      id: 'cookies', title: 'Cookies, estadísticas y seguridad.',
      html: `<p>El sitio no incorpora publicidad, píxeles de marketing, analítica de terceros, cuentas de usuario ni cookies propias para seguir tus visitas. Las fuentes se sirven desde el alojamiento del sitio. El hosting puede usar mecanismos técnicos de seguridad y tratar registros de conexión; esto no equivale a afirmar que la navegación sea anónima.</p><p>La conexión al sitio utiliza HTTPS. El preparador reduce la información enviada al servidor al trabajar localmente. Ningún sistema puede garantizar seguridad absoluta: no envíes claves ni información sensible en una consulta inicial. Si un servicio requiere accesos, se acordarán por un canal apropiado y con el alcance necesario.</p>`,
    },
    {
      id: 'derechos', title: 'Cómo ejercer tus derechos.',
      html: `<p>Puedes solicitar información y acceso sobre tus datos, su origen, finalidad y destinatarios; corregir información inexacta; y solicitar eliminación o bloqueo cuando corresponda. También puedes retirar tu autorización y oponerte al uso de tus datos para comunicaciones comerciales en los términos de la legislación aplicable.</p><p>Escribe a <a href="mailto:${site.email}?subject=Privacidad%20%7C%20MetrilabCL">${site.email}</a> con el asunto «Privacidad», indicando la consulta relacionada y qué solicitas. Preferentemente usa la misma dirección desde la que nos contactaste. Si hace falta verificar la identidad, se pedirá sólo lo necesario; no envíes una copia de tu documento de identidad de forma espontánea.</p><p>Las solicitudes se atienden sin cobro y conforme a los plazos legales aplicables. Si no recibes respuesta o discrepas de ella, puedes ejercer las vías de reclamación previstas por la ley. Esta política no limita esos derechos.</p>`,
    },
    {
      id: 'vigencia', title: 'Versión y normativa.',
      html: `<p>Versión del <strong>10 de octubre de 2026</strong>. Esta política cubre la navegación y las consultas de este sitio; no describe el tratamiento de bases de datos de clientes dentro de un servicio contratado.</p><p>Se considera la <a href="https://www.bcn.cl/leychile/navegar?i=141599">Ley N.º 19.628</a> vigente en Chile. La <a href="https://www.bcn.cl/leychile/navegar?idNorma=1209272">Ley N.º 21.719</a> modifica ese régimen a partir del 1 de diciembre de 2026. La política y los procedimientos deberán actualizarse para esa entrada en vigencia y cuando cambien los servicios o las finalidades del tratamiento. La fecha de una modificación se indicará en esta página.</p>`,
    },
  ],
};
