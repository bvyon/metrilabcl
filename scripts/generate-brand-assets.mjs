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

const editorialFont = (await readFile('node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2')).toString('base64');
const illustration = (await sharp('src/assets/illustrations/claridad.png').resize(520).webp({ quality: 82 }).toBuffer()).toString('base64');
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><style>@font-face{font-family:Brand;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 1000}@font-face{font-family:Editorial;src:url(data:font/woff2;base64,${editorialFont}) format('woff2');font-weight:100 1000}</style><rect width="1200" height="630" fill="#f5f4ee"/><g transform="translate(80 60) scale(.18)">${owl()}</g><text x="153" y="104" font-family="Brand,Arial,sans-serif" font-size="36" letter-spacing="-1" fill="#242a27"><tspan font-weight="400">metrilab</tspan><tspan font-weight="700">CL</tspan></text><text x="80" y="286" font-family="Editorial,Georgia,serif" font-size="94" letter-spacing="-4" fill="#242a27">Menos ruido.</text><text x="80" y="386" font-family="Editorial,Georgia,serif" font-size="94" letter-spacing="-4" fill="#36503e">Más dirección.</text><text x="85" y="463" font-family="Brand,Arial,sans-serif" font-size="23" fill="#626860">SEO, publicidad digital y contenidos en Chile.</text><image href="data:image/webp;base64,${illustration}" x="760" y="130" width="360" height="360"/><line x1="80" y1="547" x2="1120" y2="547" stroke="#dcded5"/><text x="85" y="585" font-family="Brand,Arial,sans-serif" font-size="15" letter-spacing="2" fill="#626860">CON FUENTES Y CRITERIO.</text><text x="1010" y="585" font-family="Brand,Arial,sans-serif" font-size="16" fill="#626860">metrilab.cl</text></svg>`;
await writeFile('public/social.svg', social);
