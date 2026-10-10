import { readFile } from 'node:fs/promises';

const config = await readFile('src/data/site.ts', 'utf8');
const issues = [];
if (!/launchReady:\s*true/.test(config)) issues.push('La indexación sigue desactivada (noindex). Aprobar el lanzamiento para buscadores antes de cambiar launchReady.');
const privacy = await readFile('src/data/privacy.ts', 'utf8');
if (privacy.includes('Esta página no constituye una política aprobada')) issues.push('La política de privacidad sigue siendo un borrador.');
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log('Contenido habilitado para lanzamiento. Verificar el dominio, HTTPS y correo en el hosting elegido.');
