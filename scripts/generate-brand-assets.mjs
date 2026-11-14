import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// The owl is native SVG artwork so it stays clear at both logo and favicon sizes.
const owl = (inverse = false) => {
  const ink = inverse ? '#f5f4ee' : '#36503e';
  const paper = inverse ? '#243e31' : '#f5f4ee';
  const sage = inverse ? ink : '#98ad6c';
  const lime = inverse ? ink : '#c5d781';
  return `<path d="M74 36Q162-21 251 36" fill="none" stroke="${sage}" stroke-width="20"/>
<path d="M29 109v48c0 83 58 135 133 135s132-52 132-135v-48" fill="${paper}" stroke="${ink}" stroke-width="21"/>
<path d="m79 249 40-39 29 21 23-6 10 60c-37-1-73-12-102-36Z" fill="${lime}"/>
<path d="m136 231 28-32 18 11 29-35 83-26v29c-4 61-53 109-122 113-27 2-36-12-36-37Z" fill="${sage}"/>
<circle cx="93" cy="109" r="74" fill="${ink}"/><circle cx="230" cy="109" r="74" fill="${ink}"/>
<circle cx="93" cy="109" r="52" fill="${paper}"/><circle cx="230" cy="109" r="52" fill="${paper}"/>
<circle cx="93" cy="109" r="23" fill="${ink}"/><circle cx="230" cy="109" r="23" fill="${ink}"/>
<path d="M0 2 88 29l42 25-52-9-65-16ZM324 2l-88 27-42 25 52-9 65-16ZM143 160l19 28 20-28Z" fill="${ink}"/>
<circle cx="91" cy="210" r="9" fill="${ink}"/>
<path d="M159 264c35-6 60-23 83-55m-18 5 21-10-2 23" fill="none" stroke="${paper}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
};

for (const inverse of [false, true]) {
  const filename = inverse ? 'owl-inverse.svg' : 'owl.svg';
  await writeFile('public/' + filename, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 332 310">${owl(inverse)}</svg>`);
}

const font = (await readFile('node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2')).toString('base64');
for (const inverse of [false, true]) {
  const color = inverse ? '#f5f4ee' : '#242a27';
  const bg = inverse ? '<rect width="360" height="80" fill="#243e31"/>' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="80" viewBox="0 0 360 80"><style>@font-face{font-family:Brand;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 1000}</style>${bg}<g transform="translate(8 12) scale(.18)">${owl(inverse)}</g><text x="82" y="55" font-family="Brand,Arial,sans-serif" font-size="43" letter-spacing="-1.3" fill="${color}"><tspan font-weight="400">metrilab</tspan><tspan font-weight="700">CL</tspan></text></svg>`;
  await writeFile('public/' + (inverse ? 'brand-inverse.svg' : 'brand.svg'), svg);
}

// A simpler silhouette keeps the eyes legible in a 16px browser tab.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#36503e"/><g fill="#f5f4ee"><path d="M10 14 30 21 32 27 34 21 54 14 51 20 44 23 40 40 32 45 24 40 20 23 13 20Z"/><path d="M14 33v6c0 12 8 19 18 19s18-7 18-19v-6l-7 3v5c-2 7-6 11-11 11s-10-4-11-11v-5Z"/><circle cx="23" cy="30" r="10"/><circle cx="41" cy="30" r="10"/></g><g fill="#36503e"><circle cx="23" cy="30" r="5"/><circle cx="41" cy="30" r="5"/></g><path d="m30 39 2 4 2-4" fill="#36503e"/></svg>`;
await writeFile('public/favicon.svg', favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('Búho SVG, dos logos con DM Sans, favicon SVG/PNG y icono de dispositivo generados.');

// Imagen para compartir: mismo lenguaje que la portada (fondo oscuro, onda teñida de lima y titular).
const italicFont = (await readFile('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2')).toString('base64');
const lime = { r: 217, g: 242, b: 126 };
const wave = (await sharp('public/media/hero-poster.jpg').resize(1200, 630, { fit: 'cover', position: 'top' })
  .composite([{ input: { create: { width: 1200, height: 630, channels: 3, background: lime } }, blend: 'multiply' }])
  .jpeg({ quality: 82 }).toBuffer()).toString('base64');
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><style>@font-face{font-family:Brand;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 1000}@font-face{font-family:Editorial;src:url(data:font/woff2;base64,${italicFont}) format('woff2');font-weight:100 1000;font-style:italic}</style><defs><linearGradient id="shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#060807" stop-opacity=".92"/><stop offset=".55" stop-color="#060807" stop-opacity=".45"/><stop offset="1" stop-color="#060807" stop-opacity="0"/></linearGradient><linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset=".45" stop-color="#060807" stop-opacity="0"/><stop offset="1" stop-color="#060807"/></linearGradient></defs><rect width="1200" height="630" fill="#060807"/><image href="data:image/jpeg;base64,${wave}" x="0" y="-30" width="1200" height="630" opacity=".9"/><rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#floor)"/><g transform="translate(80 62) scale(.16)">${owl(true)}</g><text x="146" y="101" font-family="Brand,Arial,sans-serif" font-size="34" letter-spacing="-1.2" fill="#f2f1ea"><tspan font-weight="400">metrilab</tspan><tspan font-weight="700">CL</tspan></text><text x="74" y="352" font-family="Brand,Arial,sans-serif" font-weight="450" font-size="152" letter-spacing="-8" fill="#f2f1ea">Del clic</text><text x="76" y="482" font-family="Editorial,Georgia,serif" font-style="italic" font-weight="400" font-size="152" letter-spacing="-6" fill="#d9f27e">al cliente.</text><text x="82" y="560" font-family="Brand,Arial,sans-serif" font-size="25" fill="#a6aba2">Google Ads · Meta Ads · Tracking · Chatbots de WhatsApp</text><text x="1120" y="560" text-anchor="end" font-family="Brand,Arial,sans-serif" font-size="20" fill="#f2f1ea">metrilab.cl</text></svg>`;
await writeFile('public/social.svg', social);
console.log('Imagen social SVG generada. Para actualizar social.jpg: node scripts/render-social.mjs');
