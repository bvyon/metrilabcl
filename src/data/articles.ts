export interface DateStamp { iso: string; label: string; }
export interface Article { slug: string; title: string; category: string; description: string; published?: DateStamp; revised?: DateStamp; sections: { id: string; title: string; html: string }[]; }
export const articlePublished: DateStamp = { iso: '2026-10-10', label: '10 de octubre de 2026' };
export const articleRevision: DateStamp = { iso: '2026-10-13', label: '13 de octubre de 2026' };
const november: DateStamp = { iso: '2026-11-14', label: '14 de noviembre de 2026' };
export const articles: Article[] = [
  {
    slug: 'anuncios-sin-consultas', title: '¿Pagas anuncios y no sabes si traen clientes?', category: 'Anuncios', published: november, revised: november,
    description: 'Si inviertes en Google o Meta y no puedes decir qué campañas generan consultas, podemos revisar tus cuentas y ordenar la gestión y la medición.',
    sections: [
      { id: 'situacion', title: 'Inviertes cada mes, pero no ves la relación.', html: `<p>Las campañas están activas y el presupuesto se gasta, pero no tienes claro cuántas consultas llegan por los anuncios ni cuáles valen la pena. Los reportes hablan de clics e impresiones, y tu pregunta es otra: ¿esto me está trayendo clientes?</p><p>En MetrilabCL podemos revisar tus cuentas de <a href="/publicidad-digital/">Google Ads y Meta Ads</a> y contarte qué vemos antes de proponerte un trabajo.</p>` },
      { id: 'apoyo', title: 'Una gestión que parte por la medición.', html: `<p>Gestionar campañas sin conversiones bien registradas es decidir a ciegas. Por eso nuestro trabajo une la gestión de los anuncios con el <a href="/tracking-conversiones/">tracking de conversiones</a>: primero dejamos claro qué se mide y después ajustamos campañas, mensajes y piezas.</p><p>No prometemos una cantidad de ventas. Acordamos el trabajo, los accesos y cómo vas a ver lo que ocurre con tu inversión.</p>` },
      { id: 'conversemos', title: 'Cuéntanos qué inviertes y qué esperas.', html: `<p>No necesitas traer un diagnóstico. Cuéntanos en qué plataformas anuncias, qué vendes y qué te gustaría saber de tus campañas. Conversaremos sobre el apoyo que podemos ofrecerte antes de preparar una propuesta.</p><p><a href="/contacto/">Consulta por la gestión de tus campañas</a>.</p>` },
    ],
  },
  {
    slug: 'medicion-que-no-cuadra', title: 'Tus reportes dicen una cosa y tu negocio otra.', category: 'Medición', published: november, revised: november,
    description: 'Cuando las conversiones de tus plataformas no coinciden con las consultas que recibes, conviene revisar la medición antes de seguir invirtiendo.',
    sections: [
      { id: 'situacion', title: 'Números que no coinciden.', html: `<p>Google Ads muestra conversiones que no reconoces, Analytics cuenta otra cifra y en tu correo o tu WhatsApp las consultas son distintas. O no hay conversiones configuradas y cada decisión se toma por intuición.</p><p>Puede ocurrir cuando las etiquetas se instalaron por partes o el sitio cambió con el tiempo. En MetrilabCL podemos revisar tu <a href="/tracking-conversiones/">medición</a> y explicarte qué se está registrando.</p>` },
      { id: 'apoyo', title: 'Ordenar lo que se mide.', html: `<p>Nos encargamos de Google Tag Manager, Google Analytics 4, las conversiones de Google Ads, el píxel de Meta y Search Console, según lo que tu negocio necesite. Definimos contigo qué acciones cuentan como conversión y comprobamos cada una antes de darla por buena.</p><p>Ninguna medición registra todas las visitas. Te entregamos una configuración documentada y te decimos con claridad qué puede responder y qué no.</p>` },
      { id: 'conversemos', title: 'Conversemos antes de invertir más.', html: `<p>Cuéntanos qué plataformas usas y qué dudas tienes de tus números. Te orientaremos sobre el alcance de una revisión y la propuesta que podemos ofrecerte.</p><p><a href="/contacto/">Consulta por tracking y conversiones</a>.</p>` },
    ],
  },
  {
    slug: 'whatsapp-sin-responder', title: 'Los mensajes de WhatsApp llegan cuando no puedes responder.', category: 'WhatsApp', published: november, revised: november,
    description: 'Si las consultas se acumulan, se responden tarde o se pierden entre chats, un asistente con CRM puede ordenar la atención de tu negocio.',
    sections: [
      { id: 'situacion', title: 'Consultas que se enfrían.', html: `<p>Los mensajes llegan mientras atiendes, fuera de horario o todos a la vez. Algunos se responden tarde, otros se pierden entre conversaciones y nadie sabe con certeza cuántas personas preguntaron y no agendaron.</p><p>En MetrilabCL construimos <a href="/chatbots-whatsapp/">chatbots sobre la API de WhatsApp Business conectados a un CRM</a>, para que cada consulta reciba respuesta y quede registrada.</p>` },
      { id: 'apoyo', title: 'Un asistente con la información de tu negocio.', html: `<p>El asistente responde las preguntas habituales, agenda horas y deriva a una persona cuando corresponde. Tu equipo ve cada contacto con su historial y su estado, sin revisar los chats uno por uno.</p><p>Es un trabajo que ya realizamos para un centro de salud. Definimos contigo qué responde el asistente y qué queda siempre en manos de tu equipo. Puedes <a href="/#whatsapp">probar una demostración guiada</a> en la portada.</p>` },
      { id: 'conversemos', title: 'Cuéntanos cómo atiendes hoy.', html: `<p>Cuéntanos por dónde te escriben tus clientes, quién responde y qué se te está quedando sin atender. Conversaremos sobre el asistente y el CRM que podrían servirle a tu negocio.</p><p><a href="/contacto/">Consulta por un chatbot para tu negocio</a>.</p>` },
    ],
  },
  {
    slug: 'diagnostico-o-ejecucion', title: '¿Tu sitio necesita un diagnóstico o apoyo para ejecutar?', category: 'Decisiones', revised: november,
    description: 'Si tu web o tus campañas no están dando lo que esperas, o tienes mejoras pendientes, podemos ayudarte a definir el servicio que necesita tu negocio.',
    sections: [
      { id: 'situacion', title: 'Cuando no sabes por dónde empezar.', html: `<p>Tu sitio está publicado y quizá ya inviertes en anuncios, pero las consultas no llegan como esperabas. Has probado cambios o recibido opiniones distintas y todavía no tienes una dirección clara. En esa situación, seguir invirtiendo sin entender el problema puede dejar las mismas dudas.</p><p>En MetrilabCL podemos estudiar tu caso y proponerte un <a href="/diagnostico/">diagnóstico</a> con prioridades para tu negocio.</p>` },
      { id: 'pendientes', title: 'Cuando las mejoras siguen pendientes.', html: `<p>Puede que ya tengas un informe o una estrategia, pero tu equipo no cuente con el tiempo o el apoyo necesario para avanzar. También puede que necesites coordinar la web, los contenidos y las campañas con una agencia.</p><p>Podemos hacernos cargo de la <a href="/servicios/#alcance">ejecución</a> dentro de un alcance acordado: campañas, medición, automatización de WhatsApp, contenidos o SEO, según lo que necesites.</p>` },
      { id: 'ayuda', title: 'Definamos el siguiente paso contigo.', html: `<p>No necesitas llegar con el servicio elegido. Cuéntanos qué está pasando con tu web o tus campañas y qué quieres conseguir. Conversaremos sobre el apoyo que podemos ofrecerte antes de preparar una propuesta.</p><p><a href="/contacto/">Pide orientación a MetrilabCL</a>.</p>` },
    ],
  },
  {
    slug: 'como-leer-un-diagnostico', title: 'Tienes un informe, pero tu web sigue igual.', category: 'Diagnóstico', revised: november,
    description: 'Un informe puede dejar dudas, decisiones pendientes o cambios que nadie ha aplicado. Te ayudamos a convertir esa situación en un proyecto con dirección.',
    sections: [
      { id: 'dudas', title: 'Muchas recomendaciones, poca claridad.', html: `<p>Has recibido un diagnóstico, pero no sabes qué merece atención primero, qué implica para tu negocio o quién puede hacerse cargo. Las recomendaciones se acumulan y el sitio sigue en el mismo punto.</p><p>En MetrilabCL podemos revisar ese contexto contigo y definir si necesitas un <a href="/diagnostico/">nuevo diagnóstico</a> o apoyo para avanzar con las mejoras pendientes.</p>` },
      { id: 'apoyo', title: 'Una agencia que acompañe el avance.', html: `<p>Cuando falta tiempo, capacidad o coordinación, un documento por sí solo no resuelve el trabajo pendiente. Podemos ayudarte con la estrategia y la ejecución de campañas, medición, contenidos o SEO dentro de la propuesta acordada.</p><p>El objetivo es que tengas claridad sobre el trabajo que nos encargas y cuentes con apoyo para llevarlo adelante.</p>` },
      { id: 'conversemos', title: 'Cuéntanos dónde se quedó tu proyecto.', html: `<p>Si tienes un informe pendiente, recomendaciones contradictorias o cambios que aún no se han aplicado, conversemos. Definiremos contigo qué apoyo corresponde y el alcance de una propuesta.</p><p><a href="/contacto/">Consulta por apoyo para tu web</a>.</p>` },
    ],
  },
  {
    slug: 'visibilidad-ia-sin-promesas', title: 'Visibilidad en IA: ¿cuándo pedir una evaluación?', category: 'IA',
    description: 'Si tus clientes consultan buscadores y asistentes de IA, podemos evaluar cómo encaja tu presencia digital en ese contexto y qué servicio tiene sentido para tu negocio.',
    sections: [
      { id: 'contexto', title: 'Una inquietud que merece contexto.', html: `<p>Quieres saber cómo aparece tu negocio cuando las personas buscan respuestas sobre lo que ofreces. Quizá has visto competidores mencionados o recibido propuestas de visibilidad en IA y no sabes si corresponde invertir en ese servicio.</p><p>Una evaluación de MetrilabCL puede ayudarte a entender tu situación y el alcance de un trabajo de <a href="/visibilidad-en-ia/">visibilidad en IA</a>.</p>` },
      { id: 'agencia', title: 'Apoyo para tu presencia digital.', html: `<p>Relacionamos esa inquietud con tu web, tu oferta y tus objetivos. Si el servicio encaja con tu negocio, podemos proponerte apoyo de investigación, SEO y contenidos con un alcance definido.</p><p>La aparición o recomendación de una marca depende de cada sistema de IA. No garantizamos citas ni posiciones; acordamos el trabajo que la agencia puede realizar.</p>` },
      { id: 'consulta', title: 'Conversemos antes de invertir.', html: `<p>Cuéntanos tu negocio y qué te preocupa de su presencia en buscadores o asistentes de IA. Te orientaremos sobre el servicio y la propuesta que podemos ofrecerte.</p><p><a href="/contacto/">Consulta por visibilidad en IA</a>.</p>` },
    ],
  },
];
