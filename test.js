'use strict';
const assert = require('node:assert/strict');
const Cube = require('./cube.js');
const { PATTERNS } = require('./app.js');
const solved = Cube.solved();
for (const pattern of PATTERNS) {
  assert.deepEqual(Cube.apply(Cube.apply(solved, pattern.moves), Cube.inverse(pattern.moves)), solved, pattern.name + ' inverse');
}
const checker = Cube.apply(solved, PATTERNS[0].moves);
for (const [face, f] of Object.entries(Cube.FACES)) {
  const stickers = checker.filter(t => t.n[f.axis] === f.side);
  const cornersAndCenter = stickers.filter(t => t.p.filter(x => x === 0).length !== 1);
  assert.ok(cornersAndCenter.every(t => t.face === face));
  const edges = stickers.filter(t => t.p.filter(x => x === 0).length === 1);
  assert.equal(new Set(edges.map(t => t.face)).size, 1);
  assert.notEqual(edges[0].face, face);
}
const spots = Cube.apply(solved, PATTERNS[1].moves);
for (const f of Object.values(Cube.FACES)) {
  const stickers = spots.filter(t => t.n[f.axis] === f.side);
  const nonCenter = stickers.filter(t => t.p.filter(x => x === 0).length !== 2);
  assert.equal(new Set(nonCenter.map(t => t.face)).size, 1, 'six spots face ring');
}
const superflip = Cube.apply(solved, PATTERNS[3].moves);
for (const original of solved) {
  const result = superflip.find(t => t.id === original.id);
  assert.deepEqual(result.p, original.p, 'superflip keeps piece positions');
  if (original.p.filter(x => x === 0).length === 1) assert.notDeepEqual(result.n, original.n, 'every edge flips');
  else assert.deepEqual(result.n, original.n, 'corners and centers unchanged');
}
assert.equal((Cube.svg(superflip).match(/<rect /g) || []).length, 54);
console.log('PASS: four pattern inverses, six checkerboards, six spots, all 12 superflip edges, 54-sticker rendering.');

