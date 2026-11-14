import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from '@playwright/test';

// Convierte public/social.svg en public/social.jpg con un navegador, para respetar las fuentes incorporadas.
// Usa METRILAB_BROWSER_PATH si Chromium de Playwright no está instalado.
const svg = await readFile('public/social.svg', 'utf8');
const browser = await chromium.launch(process.env.METRILAB_BROWSER_PATH ? { executablePath: process.env.METRILAB_BROWSER_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(`<style>html,body{margin:0;background:#060807}svg{display:block}</style>${svg}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/social.jpg', type: 'jpeg', quality: 88 });
await browser.close();
console.log('public/social.jpg actualizado (1200 × 630).');
