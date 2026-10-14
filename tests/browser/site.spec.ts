import { test, expect } from '@playwright/test';
import axe from 'axe-core';

const routes = ['/', '/servicios/', '/diagnostico/', '/seo/', '/visibilidad-en-ia/', '/investigacion/', '/publicidad-digital/', '/contenidos/', '/automatizaciones-funnels/', '/metodo/', '/nosotros/', '/recursos/', '/contacto/', '/privacidad/', '/recursos/diagnostico-o-ejecucion/', '/recursos/como-leer-un-diagnostico/', '/recursos/visibilidad-ia-sin-promesas/'];

test('páginas compiladas: navegación, accesibilidad y adaptación móvil', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toHaveCount(1);
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(dimensions.scroll, `${route} a ${width}px`).toBeLessThanOrEqual(dimensions.width + 1);
      if (width === 390) {
        if (route !== '/') {
          const illustration = page.locator('.page-illustration img');
          await expect(illustration, route).toHaveCount(1);
          await illustration.evaluate((image: HTMLImageElement) => image.decode());
          expect(await illustration.evaluate((image: HTMLImageElement) => image.naturalWidth), route).toBeGreaterThan(0);
        }
        await page.addScriptTag({ content: axe.source });
        const result = await page.evaluate(async () => (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
        expect(result.violations.map((violation: any) => ({ id: violation.id, nodes: violation.nodes.map((node: any) => node.target) })), route).toEqual([]);
      }
    }
  }
  expect(errors).toEqual([]);
});

test('menú móvil, teclado y filtro de recursos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');
  await page.goto('/recursos/');
  await page.getByRole('button', { name: 'Visibilidad en IA', exact: true }).click();
  await expect(page.locator('.article-card:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await expect(page.locator('.article-card:visible')).toHaveCount(3);
});

test('la identidad y las cinco ilustraciones cargan en móvil', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.site-header .brand-wordmark')).toHaveText('metrilabCL');
  const illustrations = page.locator('.hero-art img, .service-visual img, .method-visual img, .funnels-visual img');
  await expect(illustrations).toHaveCount(5);
  for (const illustration of await illustrations.all()) {
    await illustration.scrollIntoViewIfNeeded();
    await illustration.evaluate((image: HTMLImageElement) => image.decode());
    expect(await illustration.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    expect(await illustration.evaluate((image: HTMLImageElement) => image.currentSrc)).toMatch(/\.webp$/);
  }
  for (const path of ['/owl.svg', '/brand.svg', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('contacto valida y prepara una consulta sin enviar sus campos', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const submissions: string[] = [];
  const transmittedFields: string[] = [];
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).origin === new URL(baseURL!).origin) submissions.push(request.url());
    let payload = `${request.url()} ${request.postData() || ''}`;
    try { payload = decodeURIComponent(payload.replace(/\+/g, ' ')); } catch {}
    if (['Prueba de consulta', 'https://ejemplo.cl', 'Quiero investigar cómo mejorar mi sitio.'].some(value => payload.includes(value))) transmittedFields.push(request.url());
  });
  await page.goto('/contacto/');
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  expect(await page.locator('#contact-message').evaluate((element: HTMLTextAreaElement) => element.validity.valueMissing)).toBe(true);
  await page.locator('#contact-name').fill('Prueba de consulta');
  await page.locator('#contact-site').fill('https://ejemplo.cl');
  await page.locator('#contact-service').selectOption('Google Ads');
  await page.locator('#contact-message').fill('Quiero investigar cómo mejorar mi sitio.');
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  expect(await page.locator('#contact-consent').evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  await page.locator('#contact-consent').check();
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  await expect(page.locator('#form-status')).toContainText('Mensaje copiado');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('contacto@metrilab.cl');
  expect(copied).toContain('https://ejemplo.cl');
  expect(copied).toContain('Necesito: Google Ads');
  expect(copied).toContain('Quiero investigar');
  expect(copied).toContain('Autorizo a Bastian Vega Yon');
  expect(copied).toContain('12 meses desde la última interacción');
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: async () => { throw new Error('No permitido'); } }));
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  await expect(page.locator('#draft-result')).toBeVisible();
  await expect(page.locator('#draft-result')).toHaveValue(/Quiero investigar/);
  expect(submissions).toEqual([]);
  expect(transmittedFields).toEqual([]);
});

test('preparar correo muestra opciones y conserva el borrador sin una aplicación configurada', async ({ page, context }) => {
  const transmittedFields: string[] = [];
  page.on('request', request => {
    let payload = `${request.url()} ${request.postData() || ''}`;
    try { payload = decodeURIComponent(payload.replace(/\+/g, ' ')); } catch {}
    if (payload.includes('Consulta de botón: análisis & ejecución')) transmittedFields.push(request.url());
  });
  await page.goto('/contacto/');
  const prepare = page.getByRole('button', { name: 'Preparar correo' });
  await prepare.click();
  await expect(page.locator('#delivery-options')).toBeHidden();
  await page.locator('#contact-message').fill('Consulta de botón: análisis & ejecución');
  await prepare.click();
  await expect(page.locator('#delivery-options')).toBeHidden();
  await page.locator('#contact-consent').check();
  await prepare.click();
  await expect(page.locator('#delivery-options')).toBeVisible();
  await expect(prepare).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#delivery-title')).toBeFocused();
  await expect(page.locator('#draft-result')).toHaveValue(/Consulta de botón: análisis & ejecución/);
  await expect(page).toHaveURL(/\/contacto\/$/);
  expect(transmittedFields).toEqual([]);

  for (const id of ['open-gmail', 'open-outlook', 'open-mail-app']) {
    const url = new URL((await page.locator(`#${id}`).getAttribute('href'))!);
    if (id === 'open-gmail') expect(url.origin).toBe('https://mail.google.com');
    if (id === 'open-outlook') expect(url.origin).toBe('https://outlook.live.com');
    if (id === 'open-mail-app') {
      expect(url.protocol).toBe('mailto:');
      expect(url.pathname).toBe('contacto@metrilab.cl');
    } else expect(url.searchParams.get('to')).toBe('contacto@metrilab.cl');
    expect(url.searchParams.get('subject')).toBe('Necesito orientación | Contacto MetrilabCL');
    expect(url.searchParams.get('body')).toContain('Consulta de botón: análisis & ejecución');
    expect(url.searchParams.get('body')).toContain('Autorizo a Bastian Vega Yon');
  }

  // Se intercepta el destino para comprobar la apertura sin crear ni enviar un correo real.
  await context.route('https://mail.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Correo de prueba</p>' }));
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Abrir Gmail', exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/https:\/\/mail\.google\.com\/mail\//);
  await expect(page.locator('#draft-result')).toHaveValue(/Consulta de botón: análisis & ejecución/);
  await popup.close();

  await page.locator('#contact-message').fill('Objetivo actualizado para la segunda propuesta.');
  await expect(page.locator('#delivery-options')).toBeHidden();
  await expect(prepare).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#open-gmail')).not.toHaveAttribute('href');
  await prepare.click();
  await expect(page.locator('#draft-result')).toHaveValue(/Objetivo actualizado/);
  expect(new URL((await page.locator('#open-gmail').getAttribute('href'))!).searchParams.get('body')).not.toContain('Consulta de botón');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll, `Opciones de correo abiertas a ${width}px`).toBeLessThanOrEqual(dimensions.width + 1);
  }
  await page.addScriptTag({ content: axe.source });
  const accessibility = await page.evaluate(async () => (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
  expect(accessibility.violations.map((violation: any) => violation.id)).toEqual([]);
  await page.locator('#contact-consent').uncheck();
  await prepare.click();
  await expect(page.locator('#delivery-options')).toBeHidden();
});

test('la ruta inexistente usa la 404 y vuelve al inicio', async ({ page }) => {
  const response = await page.goto('/una-pagina-que-no-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Un desvío');
  await page.getByRole('link', { name: 'Ir al inicio', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toContainText('Menos ruido');
});
