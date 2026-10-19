'use strict';
const PATTERNS = [
  {
    "id": "checkerboard",
    "name": "Schachbrett",
    "moves": "R2 L2 U2 D2 F2 B2",
    "description": "Jede Seite wird zum Schachbrett. Sechs halbe Drehungen, ideal für den Einstieg."
  },
  {
    "id": "sixspots",
    "name": "Sechs Punkte",
    "moves": "U D' R L' F B' U D'",
    "description": "Sechs Mittelpunkte in einer andersfarbigen Fläche."
  },
  {
    "id": "cubeincube",
    "name": "Würfel im Würfel",
    "moves": "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    "description": "Verschachtelte Farbflächen erzeugen den Eindruck eines kleineren Würfels."
  },
  {
    "id": "superflip",
    "name": "Superflip",
    "moves": "D' R2 F' D2 F2 U2 L' R D' R2 B F R' U2 L' F2 R' U2 R' U'",
    "description": "Alle zwölf Kanten werden an ihrem Platz umgedreht. Ecken und Mittelpunkte bleiben gelöst."
  }
];
if (typeof module !== 'undefined') module.exports = { PATTERNS };
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  let current = PATTERNS.find(p => '#' + p.id === location.hash) || PATTERNS[0];
  let sequence = [], step = 0, reverse = false, playing = null;
  function pause() { clearInterval(playing); playing = null; $('play').textContent = 'Abspielen'; }
  function initial() { return reverse ? Cube.apply(Cube.solved(), current.moves) : Cube.solved(); }
  function render() {
    const state = Cube.apply(initial(), sequence.slice(0, step).join(' '));
    $('cube-net').innerHTML = Cube.svg(state, current.name + ': Schritt ' + step + ' von ' + sequence.length);
    $('counter').textContent = step + ' / ' + sequence.length;
    $('timeline').max = sequence.length; $('timeline').value = step;
    $('timeline').setAttribute('aria-valuetext', 'Schritt ' + step + ' von ' + sequence.length);
    $('previous').disabled = step === 0; $('next').disabled = step === sequence.length;
    $('move-label').textContent = step === 0 ? (reverse ? 'Muster als Ausgangsstellung' : 'Gelöster Würfel') : 'Letzter Zug: ' + sequence[step - 1];
    $('sequence').replaceChildren();
    sequence.forEach((move, index) => {
      const button = document.createElement('button'); button.textContent = move;
      button.setAttribute('aria-label', 'Bis Zug ' + (index + 1) + ': ' + move);
      if (index === step - 1) { button.className = 'current-move'; button.setAttribute('aria-current', 'step'); }
      button.onclick = () => { pause(); step = index + 1; render(); };
      $('sequence').append(button);
    });
    $('direction-label').textContent = reverse ? 'Muster → gelöster Würfel' : 'Gelöster Würfel → Muster';
  }
  function load(pattern, updateHash = true) {
    pause(); current = pattern; reverse = false; $('reverse').checked = false;
    sequence = Cube.tokens(pattern.moves); step = 0;
    $('name').textContent = pattern.name; $('description').textContent = pattern.description;
    $('custom').value = pattern.moves; $('status').textContent = '';
    if (updateHash && PATTERNS.includes(pattern)) history.replaceState(null, '', '#' + pattern.id);
    document.querySelectorAll('[data-pattern]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pattern === pattern.id)));
    render();
  }
  $('next').onclick = () => { pause(); step = Math.min(step + 1, sequence.length); render(); };
  $('previous').onclick = () => { pause(); step = Math.max(step - 1, 0); render(); };
  $('restart').onclick = () => { pause(); step = 0; render(); };
  $('finish').onclick = () => { pause(); step = sequence.length; render(); };
  $('timeline').oninput = event => { pause(); step = Number(event.target.value); render(); };
  function play() {
    if (playing) { pause(); return; }
    if (step === sequence.length) step = 0;
    $('play').textContent = 'Pause'; render();
    playing = setInterval(() => {
      step = Math.min(step + 1, sequence.length); render();
      if (step === sequence.length) pause();
    }, Number($('speed').value));
  }
  $('play').onclick = play;
  $('speed').onchange = () => { if (playing) { pause(); play(); } };
  $('reverse').onchange = event => {
    pause(); reverse = event.target.checked; step = 0;
    sequence = Cube.tokens(reverse ? Cube.inverse(current.moves) : current.moves); render();
  };
  $('apply-custom').onclick = () => {
    try {
      const moves = Cube.tokens($('custom').value);
      if (!moves.length || moves.length > 200) throw new Error('Bitte 1 bis 200 Züge eingeben.');
      load({ id: 'custom', name: 'Eigene Zugfolge', moves: moves.join(' '), description: 'Deine Zugfolge auf einem gelösten Würfel. Die Form wird aus allen 54 Stickern berechnet.' }, false);
      $('status').textContent = 'Zugfolge geladen. Du kannst jeden Schritt prüfen oder rückwärts zum gelösten Würfel gehen.';
    } catch (error) { $('status').textContent = error.message; }
  };
  $('copy').onclick = async () => {
    try { await navigator.clipboard.writeText(sequence.join(' ')); $('status').textContent = 'Zugfolge kopiert.'; }
    catch { $('status').textContent = 'Kopieren nicht verfügbar. Die Zugfolge steht in den nummerierten Schritten oben.'; }
  };
  for (const pattern of PATTERNS) {
    const button = document.createElement('button'); button.className = 'pattern-card';
    button.dataset.pattern = pattern.id; button.setAttribute('aria-pressed', 'false');
    const picture = document.createElement('div'); picture.innerHTML = Cube.svg(Cube.apply(Cube.solved(), pattern.moves), pattern.name);
    const title = document.createElement('b'), count = document.createElement('small');
    title.textContent = pattern.name; count.textContent = Cube.tokens(pattern.moves).length + ' Züge';
    button.append(picture, title, count); button.onclick = () => load(pattern);
    $('gallery').append(button);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('hashchange', () => {
    const pattern = PATTERNS.find(p => '#' + p.id === location.hash);
    if (pattern) load(pattern, false);
  });
  load(current, false);
}

