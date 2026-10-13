import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const output = process.argv[2] || '_site';
const config = YAML.parse(fs.readFileSync('_config.yml', 'utf8'));
const origin = config.url.replace(/\/$/, '');
const base = config.baseurl || '';
const home = `${origin}${base}/`;
const robots = fs.readFileSync(path.join(output, 'robots.txt'), 'utf8');
assert.ok(!robots.startsWith('---'), 'robots front matter must be rendered');
assert.match(robots, /^User-agent: OAI-SearchBot$/m);
assert.match(robots, /^Allow: \/$/m);
assert.ok(robots.includes(`Sitemap: ${home}sitemap.xml`), 'absolute sitemap URL');

const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(locations.length > 100, 'sitemap must include published lessons');
assert.equal(new Set(locations).size, locations.length, 'unique sitemap URLs');
for (const location of locations) {
  assert.ok(location.startsWith(home), `production URL: ${location}`);
  const route = location.slice(`${origin}${base}`.length);
  assert.ok(!/\.(?:txt|json|xml)$/.test(route), `content route: ${route}`);
  assert.notEqual(route, '/404.html');
  const file = path.join(output, route.endsWith('/') ? `${route}index.html` : route);
  const html = fs.readFileSync(file, 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${location}">`), `canonical: ${route}`);
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html), `indexable: ${route}`);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1, `one structured data block: ${route}`);
  const data = JSON.parse(blocks[0][1]);
  assert.equal(data['@context'], 'https://schema.org');
  const [website, page] = data['@graph'];
  assert.equal(website['@type'], 'WebSite');
  assert.equal(website.url, home);
  assert.equal(page.url, location);
  assert.ok(page.name && page.description, `page metadata: ${route}`);
  assert.equal(page.isPartOf['@id'], website['@id']);
  if (page['@type'] === 'LearningResource') {
    assert.equal(page.isAccessibleForFree, true);
  }
}
const notFound = fs.readFileSync(path.join(output, '404.html'), 'utf8');
assert.match(notFound, /<meta name="robots" content="noindex, follow">/);
console.log(
  `Discovery checks passed: ${locations.length} canonical pages, JSON-LD, sitemap, and robots.`,
);
