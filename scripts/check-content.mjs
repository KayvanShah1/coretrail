import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import YAML from 'yaml';

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

const collectionRoot = 'app/subjects/collections';
const sqlDir = `${collectionRoot}/_sql`;
const pages = walk(sqlDir).filter((p) => p.endsWith('.md'));
const urls = new Set(
  pages.map(
    (p) => '/sql/' + path.relative(sqlDir, p).replaceAll('\\', '/').replace(/\.md$/, '') + '/',
  ),
);
urls.add('/sql/');
urls.add('/dsa/');
urls.add('/');

const sequences = new Set();
for (const file of pages) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, 'front matter ' + file);
  const data = YAML.parse(match[1]);
  for (const key of ['title', 'description', 'chapter', 'order', 'sequence'])
    assert.notEqual(data[key], undefined, key + ' ' + file);
  assert.ok(!sequences.has(data.sequence), 'duplicate sequence ' + file);
  sequences.add(data.sequence);
  assert.equal((match[2].match(/^```/gm) || []).length % 2, 0, 'code fences ' + file);
  assert.ok(match[2].length > 150, 'empty page ' + file);
  for (const link of text.matchAll(/'((?:\/sql\/)[^']*)'\s*\|\s*relative_url/g))
    assert.ok(urls.has(link[1]), 'missing internal URL ' + link[1] + ' ' + file);
  assert.ok(!/TODO|Lorem ipsum/.test(text), 'unfinished text ' + file);
}
console.log(
  `Content checks passed: ${pages.length} SQL pages, unique ordering, links, and code fences.`,
);

const chapters = JSON.parse(fs.readFileSync('app/_data/chapters.json', 'utf8'));
const subjects = JSON.parse(fs.readFileSync('app/_data/subjects.json', 'utf8'));
const subjectPages = subjects.map((subject) => `app/subjects/${subject.id}/index.md`);

for (const subject of subjects) urls.add(subject.url);
for (const file of subjectPages) assert.ok(fs.existsSync(file), 'subject page ' + file);

for (const chapter of chapters.sql) {
  const overview = fs.readFileSync(sqlDir + '/' + chapter.id + '/overview.md', 'utf8');
  for (const file of pages.filter(
    (p) =>
      p.replaceAll('\\', '/').startsWith(sqlDir + '/' + chapter.id + '/') &&
      !p.endsWith('overview.md'),
  )) {
    const slug = path.basename(file, '.md');
    assert.ok(
      overview.includes('/sql/' + chapter.id + '/' + slug + '/'),
      'lesson missing from chapter ' + file,
    );
  }
}

const publishedCollections = [
  { id: 'data-engineering', dir: `${collectionRoot}/_de`, prefix: '/data-engineering/' },
  { id: 'ml', dir: `${collectionRoot}/_ml`, prefix: '/ml/' },
  { id: 'ai-engineering', dir: `${collectionRoot}/_ai`, prefix: '/ai-engineering/' },
  { id: 'infrastructure', dir: `${collectionRoot}/_infra`, prefix: '/infrastructure/' },
];
const publishedPages = [];

for (const collection of publishedCollections) {
  const collectionPages = walk(collection.dir).filter((p) => p.endsWith('.md'));
  publishedPages.push(...collectionPages);
  const collectionSequences = new Set();
  const validChapters = new Set(chapters[collection.id].map((chapter) => chapter.id));

  for (const file of collectionPages) {
    const text = fs.readFileSync(file, 'utf8');
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    assert.ok(match, 'front matter ' + file);
    const data = YAML.parse(match[1]);

    for (const key of ['title', 'description', 'chapter', 'order', 'sequence'])
      assert.notEqual(data[key], undefined, key + ' ' + file);
    assert.ok(validChapters.has(data.chapter), 'unknown chapter ' + data.chapter + ' ' + file);
    assert.ok(!collectionSequences.has(data.sequence), 'duplicate sequence ' + file);
    collectionSequences.add(data.sequence);
    assert.equal((match[2].match(/^```/gm) || []).length % 2, 0, 'code fences ' + file);
    assert.ok(match[2].length > 150, 'empty page ' + file);
    assert.ok(!/TODO|Lorem ipsum/.test(text), 'unfinished text ' + file);

    const relative = path.relative(collection.dir, file).replaceAll('\\', '/').replace(/\.md$/, '');
    urls.add(collection.prefix + relative + '/');
  }

  for (const chapter of chapters[collection.id]) {
    const overviewPath = collection.dir + '/' + chapter.id + '/overview.md';
    assert.ok(fs.existsSync(overviewPath), 'chapter overview ' + overviewPath);
    const overview = fs.readFileSync(overviewPath, 'utf8');
    for (const file of collectionPages.filter(
      (p) =>
        p.replaceAll('\\', '/').startsWith(collection.dir + '/' + chapter.id + '/') &&
        !p.endsWith('overview.md'),
    )) {
      const slug = path.basename(file, '.md');
      assert.ok(
        overview.includes(collection.prefix + chapter.id + '/' + slug + '/'),
        'lesson missing from chapter ' + file,
      );
    }
  }
}

const standalonePages = walk('app/subjects').filter(
  (p) => p.endsWith('.md') && !p.replaceAll('\\', '/').startsWith(`${collectionRoot}/`),
);
for (const file of standalonePages) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, 'front matter ' + file);
  const data = YAML.parse(match[1]);
  if (data.permalink) urls.add(data.permalink);
}

const problems = JSON.parse(fs.readFileSync('app/_data/practice_problems.json', 'utf8'));
const allowedHosts = new Set(['platform.stratascratch.com', 'leetcode.com', 'datalemur.com']);
for (const problem of problems) {
  assert.ok(allowedHosts.has(new URL(problem.url).hostname), 'practice URL ' + problem.title);
  assert.ok(urls.has(problem.lesson), 'practice concept link ' + problem.title);
  for (const key of ['title', 'platform', 'level', 'topic', 'focus'])
    assert.ok(problem[key], 'practice metadata ' + key);
}

for (const file of ['app/index.html', ...subjectPages, ...publishedPages, ...standalonePages]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const link of text.matchAll(/{{\s*'((?:\/)[^']*)'\s*\|\s*relative_url/g))
    assert.ok(urls.has(link[1]), 'missing page route ' + link[1] + ' in ' + file);
}

console.log(
  `Navigation checks passed: ${subjects.length} subjects, ${urls.size} known routes, ${problems.length} platform problems.`,
);
