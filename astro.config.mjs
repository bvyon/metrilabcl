import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://metrilab.cl',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
