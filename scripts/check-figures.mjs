import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
const root = resolve('app');
const figures = JSON.parse(await readFile(resolve(root, '_data/figures.json'), 'utf8'));
const files = await readdir(resolve(root, 'subjects/collections'), { recursive: true });
const used = new Map();
for (const file of files.filter((file) => file.endsWith('.md'))) {
  const text = await readFile(resolve(root, 'subjects/collections', file), 'utf8');
  for (const block of text.matchAll(/^([\x60~]{3,})(?:text|plaintext)\s*\n([\s\S]*?)^\1\s*$/gm)) {
    assert.ok(!/(?:^|\n)\s*(?:→|↓)|\+-{3,}.*JOIN/.test(block[2]), 'Text-only diagram in ' + file);
  }
  for (const match of text.matchAll(/{%\s*include figure\.html id=["']([^"']+)["']\s*%}/g)) {
    assert.ok(figures[match[1]], 'Unknown figure ' + match[1] + ' in ' + file);
    used.set(match[1], (used.get(match[1]) || 0) + 1);
  }
}
for (const [id, figure] of Object.entries(figures)) {
  assert.ok(used.has(id), 'Unused figure ' + id);
  assert.match(figure.path, /^\/assets\/img\/site\/[a-z0-9/-]+\.(svg|png|gif)$/);
  const target = resolve(root, '.' + figure.path);
  assert.ok(target.startsWith(root + sep), 'Asset leaves app directory: ' + id);
  const bytes = await readFile(target);
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    figure.sha256,
    'Changed image: ' + id,
  );
  for (const key of [
    'title',
    'alt',
    'description',
    'author',
    'source_url',
    'license',
    'license_url',
  ]) {
    assert.ok(typeof figure[key] === 'string' && figure[key].trim(), 'Missing ' + key + ': ' + id);
  }
  for (const key of ['width', 'height', 'display_width']) {
    assert.ok(Number.isInteger(figure[key]) && figure[key] > 0, 'Invalid ' + key + ': ' + id);
  }
  assert.ok(figure.display_width <= figure.width, 'Unnecessary enlargement: ' + id);
  assert.equal(new URL(figure.source_url).protocol, 'https:');
  if (figure.path.endsWith('.svg')) {
    const svg = bytes.toString();
    assert.match(svg, /<svg\b/);
    if (figure.original) {
      assert.match(
        svg,
        /markerUnits="userSpaceOnUse"/,
        'Original arrowheads must use a fixed size: ' + id,
      );
      assert.ok(
        svg.includes('rx="0" fill="' + figure.background + '"'),
        'Original figure needs its declared opaque background: ' + id,
      );
      const fontSizes = [...svg.matchAll(/font-size:\s*([\d.]+)px/g)].map((match) =>
        Number(match[1]),
      );
      assert.ok(
        fontSizes.length && Math.min(...fontSizes) >= figure.min_label_size,
        'Figure labels below declared size: ' + id,
      );
      assert.ok(
        figure.mobile_path && figure.mobile_width && figure.mobile_height,
        'Responsive artwork missing: ' + id,
      );
      const mobile = await readFile(resolve(root, '.' + figure.mobile_path));
      assert.equal(
        createHash('sha256').update(mobile).digest('hex'),
        figure.mobile_sha256,
        'Changed mobile artwork: ' + id,
      );
      assert.ok(
        mobile
          .toString()
          .includes('width="' + figure.mobile_width + '" height="' + figure.mobile_height + '"'),
        'Mobile artwork dimensions: ' + id,
      );
      assert.ok(
        !/<script\b|<(?:iframe|object|embed)\b|(?:href|src)=["'](?:https?:|\/\/)/i.test(
          mobile.toString(),
        ),
        'Active mobile SVG resource: ' + id,
      );
    }
    assert.ok(
      !/<script\b|<(?:iframe|object|embed|video|audio|input)\b|\bon[a-z]+=|<image\b[^>]*(?:href|src)=["'](?:https?:|\/\/)/i.test(
        svg,
      ),
      'Active or remote SVG resource: ' + id,
    );
    assert.ok(!/(?:href|src)=["']javascript:/i.test(svg), 'Script URL in SVG: ' + id);
    for (const match of svg.matchAll(/<image\b[^>]*(?:href|src)=["'](data:[^"']+)/gi)) {
      assert.match(
        match[1].slice(0, 30),
        /^data:image\/(png|jpeg);base64,/,
        'Unexpected embedded media: ' + id,
      );
    }
  } else if (figure.path.endsWith('.png')) {
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), figure.width);
    assert.equal(bytes.readUInt32BE(20), figure.height);
  } else {
    assert.match(bytes.subarray(0, 6).toString(), /^GIF8[79]a$/);
    assert.equal(bytes.readUInt16LE(6), figure.width);
    assert.equal(bytes.readUInt16LE(8), figure.height);
  }
  if (!figure.original) {
    assert.equal(figure.modified, false);
    assert.equal(new URL(figure.original_url).protocol, 'https:');
  }
}
const assetFiles = await readdir(resolve(root, 'assets/img/site'), { recursive: true });
for (const file of assetFiles.filter((file) => /\.(svg|png|gif)$/.test(file))) {
  const asset = '/assets/img/site/' + file.replaceAll('\\', '/');
  assert.ok(
    Object.values(figures).some((figure) => figure.path === asset || figure.mobile_path === asset),
    'Unregistered asset: ' + asset,
  );
}
console.log(
  Object.keys(figures).length +
    ' sourced figures: paths, credits, dimensions, checksums and SVG safety passed',
);
