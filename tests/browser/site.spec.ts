import { test, expect } from '@playwright/test';
import axe from 'axe-core';

const routes = ['/', '/servicios/', '/diagnostico/', '/seo/', '/visibilidad-en-ia/', '/investigacion/', '/metodo/', '/nosotros/', '/recursos/', '/contacto/', '/privacidad/', '/recursos/diagnostico-o-ejecucion/', '/recursos/como-leer-un-diagnostico/', '/recursos/visibilidad-ia-sin-promesas/'];

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

test('contacto valida y prepara una consulta sin enviar datos', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const submissions: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') submissions.push(request.url()); });
  await page.goto('/contacto/');
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  expect(await page.locator('#contact-message').evaluate((element: HTMLTextAreaElement) => element.validity.valueMissing)).toBe(true);
  await page.locator('#contact-name').fill('Prueba de consulta');
  await page.locator('#contact-site').fill('https://ejemplo.cl');
  await page.locator('#contact-message').fill('Quiero investigar cómo mejorar mi sitio.');
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  expect(await page.locator('#contact-consent').evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
  await page.locator('#contact-consent').check();
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  await expect(page.locator('#form-status')).toContainText('Mensaje copiado');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('contacto@metrilab.cl');
  expect(copied).toContain('https://ejemplo.cl');
  expect(copied).toContain('Quiero investigar');
  expect(copied).toContain('Autorizo a Bastian Vega Yon');
  expect(copied).toContain('12 meses desde la última interacción');
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: async () => { throw new Error('No permitido'); } }));
  await page.getByRole('button', { name: 'Copiar mensaje' }).click();
  await expect(page.locator('#draft-result')).toBeVisible();
  await expect(page.locator('#draft-result')).toHaveValue(/Quiero investigar/);
  expect(submissions).toEqual([]);
});

test('la ruta inexistente usa la 404 y vuelve al inicio', async ({ page }) => {
  const response = await page.goto('/una-pagina-que-no-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Un desvío');
  await page.getByRole('link', { name: 'Ir al inicio', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toContainText('Menos ruido');
});
