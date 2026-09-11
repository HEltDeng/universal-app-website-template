import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
export const root = resolve(import.meta.dirname, '..');
export const pages = readdirSync(resolve(root, 'src/pages')).filter(p => p.endsWith('.html'));
export const json = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function valueAt(path, context) {
  if (path === 'this') return context.this;
  const value = path.split('.').reduce((value, key) => value?.[key], context);
  if (value === undefined) throw new Error(`Missing content key: ${path}`);
  return value;
}
export function render(template, context) {
  let result = '', position = 0;
  const pattern = /{{\s*([^}]+?)\s*}}/g;
  while (true) {
    pattern.lastIndex = position;
    const match = pattern.exec(template);
    if (!match) return result + template.slice(position);
    result += template.slice(position, match.index);
    const expression = match[1];
    position = pattern.lastIndex;
    if (expression.startsWith('#')) {
      const [kind, path] = expression.slice(1).split(' ');
      if (!['each', 'if'].includes(kind)) throw new Error(`Unknown block ${kind}`);
      const begin = position;
      let depth = 1, closing;
      while ((closing = pattern.exec(template))) {
        if (closing[1].startsWith('#')) depth++;
        if (closing[1].startsWith('/')) depth--;
        if (!depth) break;
      }
      if (!closing || closing[1] !== '/' + kind) throw new Error('Unbalanced template block');
      const body = template.slice(begin, closing.index);
      const value = valueAt(path, context);
      if (kind === 'each') {
        if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
        result += value.map(item => render(body, {...context, ...(typeof item === 'object' ? item : {}), this:item})).join('');
      } else if (value) result += render(body, context);
      position = pattern.lastIndex;
    } else {
      result += escapeHtml(valueAt(expression, context));
    }
  }
}
export function validate(site) {
  for (const key of ['brand','domain','assets','theme','navigation','headerActions','hero','features','download','github','support','footer','seo']) {
    if (!site[key]) throw new Error(`Required site field: ${key}`);
  }
  if (!/^https:\/\/[^/]+/.test(site.domain)) throw new Error('domain must be an HTTPS URL');
  if (!site.headerActions.length) throw new Error('At least one header action is required');
  for (const action of site.headerActions) {
    if (!['link','theme','announcement','community'].includes(action.type)) throw new Error('Invalid header action type');
    if (!action.icon || !action.label || (action.type === 'link' && !action.href)) throw new Error('Incomplete header action');
  }
  const ids = new Set();
  for (const group of site.features) {
    if (!/^[a-z][a-z0-9-]*$/.test(group.id) || ids.has(group.id)) throw new Error('Feature IDs must be unique slugs');
    ids.add(group.id);
  }
  const walk = obj => {
    for (const [key,value] of Object.entries(obj)) {
      if (value && typeof value === 'object') walk(value);
      if (typeof value === 'string' && /(?:href|url|src|image|logo|icon|favicon|hero|socialPreview)$/i.test(key)) {
        if (/^\s*(?:javascript|data|vbscript):/i.test(value) || value.startsWith('//')) throw new Error(`Unsafe URL in ${key}`);
      }
    }
  };
  walk(site);
  return site;
}
export function themeCss(site) {
  const declarations = entries => Object.entries(entries).map(([key,value]) => {
    if (!/^[\w-]+$/.test(key) || /[{};<>]/.test(value)) throw new Error('Invalid theme token');
    return `--${key}:${value}`;
  }).join(';');
  return `:root{${declarations(Object.fromEntries(Object.entries(site.theme.colors).map(([k,v])=>['color-'+k,v])))};${declarations(site.theme.palette)};${declarations(Object.fromEntries(Object.entries(site.theme.fonts).map(([k,v])=>['font-'+k,v])))};${declarations(site.theme.light)}}html[data-theme="dark"]{${declarations(site.theme.dark)}}`;
}
export function renderPage(filename, override) {
  const site = validate(override || json('site.config.json'));
  const page = json('content/' + filename.replace('.html','.json'));
  const canonical = site.domain.replace(/\/$/,'') + '/' + (filename === 'index.html' ? '' : filename);
  const template = readFileSync(resolve(root,'src/pages',filename),'utf8');
  const featureSections = site.featureSections.map(section=>({...section,groups:section.groupIds.map(id=>{
    const group = site.features.find(group=>group.id===id);
    if (!group) throw new Error(`Unknown feature group: ${id}`);
    return {...group,count:group.items.length};
  })}));
  const featurePreviews = site.features.filter(group=>group.preview !== false);
  const socialPreviewUrl = new URL(site.assets.socialPreview,site.domain).href;
  let html = render(template, {site,page,canonical,socialPreviewUrl,featureSections,featurePreviews,robots:site.seo.indexable?'index,follow':'noindex,nofollow'});
  html = html.replace('</head>', `<style data-theme-config>${themeCss(site)}</style>\n</head>`);
  return html;
}
