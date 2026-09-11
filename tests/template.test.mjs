import test from 'node:test';
import assert from 'node:assert/strict';
import { render, renderPage, json, validate, pages, themeCss } from '../scripts/render.mjs';

test('all twelve inherited pages render without unresolved content',()=>{
  assert.equal(pages.length,12);
  for(const page of pages) assert.doesNotMatch(renderPage(page),/{{[^}]+}}/);
});
test('content escapes text and attributes and supports nested lists',()=>{
  assert.equal(render('{{#each groups}}{{title}}{{#each items}}[{{this}}]{{/each}}{{/each}}',{groups:[{title:'<A>',items:['"x"']}]}),'&lt;A&gt;[&quot;x&quot;]');
  assert.throws(()=>render('{{missing}}',{}),/Missing/);
});
test('a second product changes brand, hero, metadata, colors and arbitrary feature counts through configuration only',()=>{
  const site=structuredClone(json('site.config.json'));
  site.brand.name='NOVA';site.hero.title='NOVA Workspace';site.domain='https://nova.example';
  site.assets.logo='/brand/new-logo.svg';site.hero.primaryAction.href='contact.html';
  site.theme.light['blue-700']='#7040aa';
  site.features=[{id:'one',kicker:'01',title:'New group',description:'New product',gridClass:'feature-grid',headingClass:'section-heading',titleClass:'section-title',showCount:true,items:Array.from({length:7},(_,i)=>({title:'NOVA feature '+i,description:'Description',icon:'search',image:'',imageAlt:''}))}];
  site.featureSections=[{className:'section feature-section',containerClass:'container',groupIds:['one']}];
  const home=renderPage('index.html',site), features=renderPage('features.html',site);
  assert.match(home,/NOVA Workspace/);assert.match(home,/https:\/\/nova.example/);assert.match(home,/new-logo.svg/);
  assert.match(home,/#7040aa/);assert.equal((features.match(/NOVA feature /g)||[]).length,7);
});
test('unsafe destinations and duplicate anchors are rejected',()=>{
  const site=structuredClone(json('site.config.json'));
  site.hero.primaryAction.href='javascript:alert(1)';assert.throws(()=>validate(site),/Unsafe/);
  site.hero.primaryAction.href='index.html';site.features.push(site.features[0]);assert.throws(()=>validate(site),/unique/);
});
test('CSS configuration cannot escape a style element',()=>{
  const site=structuredClone(json('site.config.json'));site.theme.fonts.sans='</style><script>';
  assert.throws(()=>themeCss(site),/Invalid/);
});
