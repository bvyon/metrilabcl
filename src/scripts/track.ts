// Eventos para Google Tag Manager. Solo viajan el nombre del evento, el canal y la zona de la página:
// nunca el contenido de una consulta ni los campos del preparador de mensajes.
type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

// La capa de datos conserva el último valor de cada clave. Cada evento declara las tres, aunque sea vacías,
// para no heredar el canal o la zona del clic anterior.
export function pushEvent(event: string, detail: Record<string, string> = {}) {
  const target = window as DataLayerWindow;
  (target.dataLayer ||= []).push({ event, method: undefined, placement: undefined, cta: undefined, ...detail });
}

function contactMethod(link: HTMLAnchorElement) {
  if (link.dataset.leadMethod) return link.dataset.leadMethod;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('https://wa.me/')) return 'whatsapp';
  if (href.startsWith('tel:')) return 'telefono';
  if (href.startsWith('mailto:')) return 'correo';
  return '';
}

// Un intento de contacto (WhatsApp, llamada o correo) se registra como generate_lead; el resto de los
// enlaces marcados con data-track, como cta_click.
export function trackClicks() {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!link || link.hasAttribute('data-no-lead')) return;
    const placement = link.closest('.site-header') ? 'encabezado' : link.closest('.site-footer') ? 'pie' : 'contenido';
    const method = contactMethod(link);
    if (method) pushEvent('generate_lead', { method, placement });
    else if (link.dataset.track) pushEvent('cta_click', { cta: link.dataset.trackDetail || link.textContent?.trim() || '', placement });
  });
}
