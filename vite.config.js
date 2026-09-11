import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { pages, root, renderPage, json } from './scripts/render.mjs';

export default defineConfig({
  plugins: [{
    name: 'configuration-driven-pages',
    transformIndexHtml: { order: 'pre', handler(_html, context) {
      const filename = context.filename.replaceAll('\\','/').split('/').pop();
      return pages.includes(filename) ? renderPage(filename) : _html;
    }},
    configureServer(server) {
      server.middlewares.use('/manifest.webmanifest', (_req,res) => {
        const site=json('site.config.json');res.setHeader('Content-Type','application/manifest+json');
        res.end(JSON.stringify({name:site.brand.name,short_name:site.brand.shortName,start_url:'/',display:'standalone',icons:[{src:site.assets.appIcon,sizes:'any'}]}));
      });
      server.watcher.add([resolve(root,'content'),resolve(root,'src/pages'),resolve(root,'site.config.json')]);
      server.watcher.on('change', path => {
        if (/content|src[/\\]pages|site\.config\.json/.test(path)) server.ws.send({type:'full-reload'});
      });
    },
    generateBundle() {
      const site = json('site.config.json');
      const domain = site.domain.replace(/\/$/,'');
      this.emitFile({type:'asset',fileName:'robots.txt',source:site.seo.indexable ? `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n'});
      this.emitFile({type:'asset',fileName:'sitemap.xml',source:'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>`<url><loc>${domain}/${p==='index.html'?'':p}</loc></url>`).join('')+'</urlset>'});
      this.emitFile({type:'asset',fileName:'manifest.webmanifest',source:JSON.stringify({name:site.brand.name,short_name:site.brand.shortName,description:site.brand.description,start_url:'/',display:'standalone',icons:[{src:site.assets.appIcon,sizes:'any',type:site.assets.appIcon.endsWith('.svg')?'image/svg+xml':'image/png'}]})});
    },
  }],
  build: { rollupOptions: { input: Object.fromEntries(pages.map(p=>[p.replace('.html',''),resolve(root,p)])) } },
});
