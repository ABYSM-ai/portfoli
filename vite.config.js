import { defineConfig } from 'vite';
export default defineConfig({
  base: '/portfoli/',
  esbuild: { jsx: 'automatic' },
  plugins: [{
    name: 'portfolio-pages-assets', enforce: 'pre',
    transform(code, id) {
      if (!id.includes('/src/') || !/\.(jsx?|tsx?|json|css)$/.test(id.split('?')[0])) return;
      return code.replace(/(["'`])\/(images|industrial|ip|visual|posters|awards)\//g, '$1/portfoli/$2/');
    }
  }]
});
