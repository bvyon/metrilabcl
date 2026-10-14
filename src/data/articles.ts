export interface Article { slug: string; title: string; category: string; description: string; sections: { id: string; title: string; html: string }[]; }
export const articleRevision = { iso: '2026-10-13', label: '13 de octubre de 2026' };
export const articles: Article[] = [
  {
    slug: 'diagnostico-o-ejecucion', title: '¿Tu sitio necesita un diagnóstico o apoyo para ejecutar?', category: 'Decisiones',
    description: 'Si tu web no está dando lo que esperas o tienes mejoras pendientes, podemos ayudarte a definir el servicio que necesita tu negocio.',
    sections: [
      { id: 'situacion', title: 'Cuando no sabes por dónde empezar.', html: `<p>Tu sitio está publicado, pero las consultas no llegan como esperabas. Has probado cambios o recibido opiniones distintas y todavía no tienes una dirección clara. En esa situación, seguir invirtiendo sin entender el problema puede dejar las mismas dudas.</p><p>En MetrilabCL podemos estudiar tu caso y proponerte un <a href="/diagnostico/">diagnóstico</a> con prioridades para tu negocio.</p>` },
      { id: 'pendientes', title: 'Cuando las mejoras siguen pendientes.', html: `<p>Puede que ya tengas un informe o una estrategia, pero tu equipo no cuente con el tiempo o el apoyo necesario para avanzar. También puede que necesites coordinar la web, los contenidos y las campañas con una agencia.</p><p>Podemos hacernos cargo de la <a href="/servicios/#alcance">ejecución</a> dentro de un alcance acordado: SEO, contenidos o publicidad digital, según lo que necesites.</p>` },
      { id: 'ayuda', title: 'Definamos el siguiente paso contigo.', html: `<p>No necesitas llegar con el servicio elegido. Cuéntanos qué está pasando con tu web o tus campañas y qué quieres conseguir. Conversaremos sobre el apoyo que podemos ofrecerte antes de preparar una propuesta.</p><p><a href="/contacto/">Pide orientación a MetrilabCL</a>.</p>` },
    ],
  },
  {
    slug: 'como-leer-un-diagnostico', title: 'Tienes un informe, pero tu web sigue igual.', category: 'Diagnóstico',
    description: 'Un informe puede dejar dudas, decisiones pendientes o cambios que nadie ha aplicado. Te ayudamos a convertir esa situación en un proyecto con dirección.',
    sections: [
      { id: 'dudas', title: 'Muchas recomendaciones, poca claridad.', html: `<p>Has recibido un diagnóstico, pero no sabes qué merece atención primero, qué implica para tu negocio o quién puede hacerse cargo. Las recomendaciones se acumulan y el sitio sigue en el mismo punto.</p><p>En MetrilabCL podemos revisar ese contexto contigo y definir si necesitas un <a href="/diagnostico/">nuevo diagnóstico</a> o apoyo para avanzar con las mejoras pendientes.</p>` },
      { id: 'apoyo', title: 'Una agencia que acompañe el avance.', html: `<p>Cuando falta tiempo, capacidad o coordinación, un documento por sí solo no resuelve el trabajo pendiente. Podemos ayudarte con la estrategia y la ejecución de SEO, contenidos o campañas dentro de la propuesta acordada.</p><p>El objetivo es que tengas claridad sobre el trabajo que nos encargas y cuentes con apoyo para llevarlo adelante.</p>` },
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
