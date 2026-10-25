import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const blocks = JSON.parse(await readFile('app/_data/block_diagrams.json', 'utf8'));
const directory = 'app/subjects/collections';
const used = new Set();
for (const file of (await readdir(directory, { recursive: true })).filter((f) =>
  f.endsWith('.md'),
)) {
  const source = await readFile(resolve(directory, file), 'utf8');
  for (const match of source.matchAll(/{%\s*include block-diagram\.html id="([^"]+)"\s*%}/g)) {
    assert.ok(blocks[match[1]], 'Unknown block diagram ' + match[1]);
    assert.match(source, /^block_diagrams: true$/m, 'Missing block_diagrams flag: ' + file);
    used.add(match[1]);
  }
}
for (const [id, block] of Object.entries(blocks)) {
  assert.ok(used.has(id), 'Unused block diagram ' + id);
  for (const key of ['title', 'description', 'author', 'source_url'])
    assert.ok(block[key]?.trim(), 'Missing ' + key + ': ' + id);
  assert.equal(new URL(block.source_url).protocol, 'https:');
  if (block.kind === 'parquet') {
    assert.equal(block.row_groups.length, 2);
    assert.equal(block.row_groups.filter((g) => g.skipped).length, 1);
    assert.equal(block.row_groups[1].columns.filter((c) => c.read).length, 2);
    continue;
  }
  for (const panel of block.panels) {
    const ids = new Set(panel.nodes.map((n) => n.id));
    assert.equal(ids.size, panel.nodes.length, 'Duplicate node in ' + id);
    for (const compact of [false, true]) {
      const columns = compact ? panel.compact_columns : panel.columns;
      const occupied = new Set();
      for (const node of panel.nodes) {
        const column = compact ? (node.compact_column ?? node.column) : node.column;
        const row = compact ? (node.compact_row ?? node.row) : node.row;
        const span = compact ? (node.compact_span ?? node.span ?? 1) : (node.span ?? 1);
        assert.ok(
          [column, row, span, columns].every((n) => Number.isInteger(n) && n > 0),
          'Invalid grid coordinate: ' + id,
        );
        assert.ok(column + span - 1 <= columns, 'Node leaves grid: ' + id + '/' + node.id);
        for (let c = column; c < column + span; c++) {
          const cell = row + ':' + c;
          assert.ok(!occupied.has(cell), 'Overlapping nodes: ' + id);
          occupied.add(cell);
        }
      }
    }
    for (const edge of panel.edges) {
      assert.ok(
        ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to,
        'Invalid connector in ' + id,
      );
    }
  }
}
console.log(
  Object.keys(blocks).length +
    ' native diagrams: references, layout cells and connector endpoints passed',
);
