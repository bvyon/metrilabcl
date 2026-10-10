import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const origin = 'https://metrilab.cl';
const files = (await readdir('dist', { recursive: true }))
  .filter(file => file.endsWith('.html') && file !== '404.html');

async function verify() {
  await Promise.all(files.map(async file => {
    const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
    const response = await fetch(origin + route, { signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, 200, route);
    assert.equal(await response.text(), await readFile('dist/' + file, 'utf8'), `${route}: contenido publicado distinto`);
  }));
  const www = await fetch('https://www.metrilab.cl/privacidad/', { signal: AbortSignal.timeout(15_000) });
  assert.equal(www.status, 200, 'Privacidad en www');
  assert.equal(await www.text(), await readFile('dist/privacidad/index.html', 'utf8'));
  const missing = await fetch(origin + '/__comprobacion_ruta_inexistente__/', { signal: AbortSignal.timeout(15_000) });
  assert.equal(missing.status, 404, 'Ruta inexistente');
}

for (let attempt = 1; attempt <= 4; attempt++) {
  try {
    await verify();
    console.log(`Publicación verificada: ${files.length} páginas coinciden con la compilación; HTTPS, www y 404 correctos.`);
    break;
  } catch (error) {
    if (attempt === 4) {
      console.error(error.message);
      process.exitCode = 1;
    } else {
      console.log(`Esperando propagación de la publicación (${attempt}/4).`);
      await delay(5_000);
    }
  }
}
