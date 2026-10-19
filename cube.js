'use strict';

const Cube = (() => {
  const FACES = {
    U: { axis: 1, side: 1, dir: -1, color: '#f4cf48', name: 'Gelb', at: [1, 0], col: [1, 0, 0], row: [0, 0, 1] },
    L: { axis: 0, side: -1, dir: 1, color: '#df6262', name: 'Rot', at: [0, 1], col: [0, 0, 1], row: [0, -1, 0] },
    F: { axis: 2, side: 1, dir: -1, color: '#3aab81', name: 'Grün', at: [1, 1], col: [1, 0, 0], row: [0, -1, 0] },
    R: { axis: 0, side: 1, dir: -1, color: '#f49a46', name: 'Orange', at: [2, 1], col: [0, 0, -1], row: [0, -1, 0] },
    B: { axis: 2, side: -1, dir: 1, color: '#5e8ed9', name: 'Blau', at: [3, 1], col: [-1, 0, 0], row: [0, -1, 0] },
    D: { axis: 1, side: -1, dir: 1, color: '#f6f6f0', name: 'Weiß', at: [1, 2], col: [1, 0, 0], row: [0, 0, -1] }
  };
  function solved() {
    const stickers = [];
    for (const [face, f] of Object.entries(FACES)) {
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const p = [0, 0, 0], n = [0, 0, 0];
        p[f.axis] = n[f.axis] = f.side;
        p[(f.axis + 1) % 3] = a;
        p[(f.axis + 2) % 3] = b;
        stickers.push({ p, n, face, id: stickers.length });
      }
    }
    return stickers;
  }
  function tokens(sequence) {
    const result = sequence.trim() ? sequence.trim().split(/\s+/) : [];
    if (result.length > 2000 || result.some(t => !/^[RLUDFBMESrludfbxyz](2|')?$/.test(t))) {
      throw new Error('Ungültige Zugfolge. Verwende R L U D F B, M E S, breite Züge r l u d f b oder x y z.');
    }
    return result;
  }
  function inverse(sequence) {
    return tokens(sequence).reverse().map(t => t.endsWith('2') ? t : t.endsWith("'") ? t.slice(0, -1) : t + "'").join(' ');
  }
  function rotate(v, axis, dir) {
    const out = [...v], a = (axis + 1) % 3, b = (axis + 2) % 3;
    out[a] = -dir * v[b]; out[b] = dir * v[a];
    return out.map(x => x === 0 ? 0 : x);
  }
  function apply(state, sequence) {
    const result = state.map(s => ({ ...s, p: [...s.p], n: [...s.n] }));
    for (const move of tokens(sequence)) {
      const letter = move[0], upper = letter.toUpperCase();
      let axis, dir, includes;
      if ('xyz'.includes(letter)) {
        axis = 'xyz'.indexOf(letter); dir = -1; includes = () => true;
      } else if ('MES'.includes(letter)) {
        [axis, dir] = { M: [0, 1], E: [1, 1], S: [2, -1] }[letter];
        includes = p => p[axis] === 0;
      } else {
        const f = FACES[upper]; axis = f.axis; dir = f.dir;
        includes = p => letter === upper ? p[axis] === f.side : p[axis] * f.side >= 0;
      }
      const turns = move.endsWith('2') ? 2 : move.endsWith("'") ? 3 : 1;
      for (let turn = 0; turn < turns; turn++) {
        for (const sticker of result) if (includes(sticker.p)) {
          sticker.p = rotate(sticker.p, axis, dir);
          sticker.n = rotate(sticker.n, axis, dir);
        }
      }
    }
    return result;
  }
  const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
  function svg(state, label = 'Würfelnetz') {
    let output = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 330" role="img" aria-label="' + label.replace(/[<>&"]/g, '') + '"><title>' + label.replace(/[<>&]/g, '') + '</title>';
    for (const [face, f] of Object.entries(FACES)) {
      const normal = [0, 0, 0]; normal[f.axis] = f.side;
      const x = f.at[0] * 108 + 4, y = f.at[1] * 108 + 4;
      for (const sticker of state.filter(s => dot(s.n, normal) === 1)) {
        const col = dot(sticker.p, f.col) + 1, row = dot(sticker.p, f.row) + 1;
        const color = FACES[sticker.face];
        output += '<rect x="' + (x + col * 32) + '" y="' + (y + row * 32) + '" width="30" height="30" rx="4" fill="' + color.color + '" stroke="#283c33" stroke-width="1"><title>' + face + ': ' + color.name + '</title></rect>';
        if (col === 1 && row === 1) output += '<text x="' + (x + 47) + '" y="' + (y + 52) + '" text-anchor="middle" fill="#152c24" font-family="system-ui" font-size="13" font-weight="700">' + face + '</text>';
      }
    }
    return output + '</svg>';
  }
  return { FACES, solved, apply, inverse, tokens, svg };
})();
if (typeof module !== 'undefined') module.exports = Cube;

