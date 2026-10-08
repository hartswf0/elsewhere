/* Multiplane Animation Studio: the page is the prompt, and the prompt draws the page.
   Your scroll is the camera. The camera travels down through seven planes; each plane moves 1/depth as far.
   A figure (plane 2) waits at the desk, anticipates, jumps, falls with you, holds when you stop to read, and lands
   in the grove at the bottom. The demos under the sections are drawn with the same rig (cartoon/cartoon.js). */
(function () {
'use strict';
const NS = 'http://www.w3.org/2000/svg', INK = '#141412', PAPER = '#f4efe3', WARM = '#e7833b';
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = 6000; /* camera travel, in world units */
const n1 = v => Math.round(v * 10) / 10;
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const SP = { linear: t => t, out: t => t * t, in: t => 1 - (1 - t) * (1 - t), inout: t => t * t * (3 - 2 * t),
  overshoot: t => { const s = 1.9; t -= 1; return t * t * ((s + 1) * t + s) + 1; } };
const lerp = (a, b, t) => a + (b - a) * t;
function mix(A, B, t) { const o = {}; for (const k in Object.assign({}, A, B)) { const a = A[k], b = B[k];
  o[k] = (typeof a === 'number' && typeof b === 'number') ? lerp(a, b, t) : (Array.isArray(a) && Array.isArray(b)) ? a.map((v, i) => lerp(v, b[i], t)) : (t < .5 ? (k in A ? a : b) : (k in B ? b : a)); } return o; }
const FIG = { x: 0, y: 0, hipH: 44, lean: 0, tilt: 0, fA: [6, 0], fB: [-6, 0], hF: [8, 30], hB: [-8, 30], gaze: [0, 0], sx: 1, sy: 1, dir: 1, k: 1 };
const fig = (P, st) => window.MP.RIGS.figure(Object.assign({}, FIG, P), st || { scarf: 0 });
const bird = P => window.MP.RIGS.bird(Object.assign({ x: 0, y: 0, k: 1, dir: 1 }, P), {});

/* ---------------------------------------------------------------- the world: seven planes */
const world = document.getElementById('world');
const PLANES = [
  { n: 6, d: 10, name: 'SKY / ATMOSPHERE' }, { n: 5, d: 6, name: 'DISTANT BACKGROUND' }, { n: 4, d: 3, name: 'MIDGROUND' },
  { n: 3, d: 1.8, name: 'SECONDARY ACTION' }, { n: 2, d: 1, name: 'CHARACTER ACTION' }, { n: 1, d: .7, name: 'FOREGROUND' }, { n: 0, d: .45, name: 'CAMERA MASK' }];
let rnd = 7; const R = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;

function cloud(x, y, s, fill, op) { let d = ''; for (let i = 0; i < 5; i++) { const cx = x + (i - 2) * 46 * s, cy = y - Math.sin(i / 4 * Math.PI) * 26 * s, r = (34 + 14 * Math.sin(i * 2.1)) * s; d += 'M' + n1(cx - r) + ' ' + n1(cy) + 'a' + n1(r) + ' ' + n1(r) + ' 0 1 0 ' + n1(2 * r) + ' 0a' + n1(r) + ' ' + n1(r) + ' 0 1 0 ' + n1(-2 * r) + ' 0'; }
  return '<path d="' + d + '" fill="' + fill + '" opacity="' + op + '"/><path d="M' + n1(x - 120 * s) + ' ' + n1(y + 10 * s) + 'h' + n1(240 * s) + '" stroke="' + INK + '" stroke-width="2" opacity=".18"/>'; }
function orangeTree(x, y, s, dark) { const leaf = dark ? '#2f4a33' : '#5c7a45', trunk = dark ? '#2a1f18' : '#6b4f35';
  let o = '<path d="M' + x + ' ' + y + 'c' + n1(-6 * s) + ' ' + n1(-80 * s) + ' ' + n1(8 * s) + ' ' + n1(-150 * s) + ' 0 ' + n1(-210 * s) + '" stroke="' + trunk + '" stroke-width="' + n1(16 * s) + '" fill="none" stroke-linecap="round"/>';
  o += '<ellipse cx="' + x + '" cy="' + n1(y - 250 * s) + '" rx="' + n1(120 * s) + '" ry="' + n1(90 * s) + '" fill="' + leaf + '" stroke="' + INK + '" stroke-width="2.4"/>';
  for (let i = 0; i < 7; i++) { const a = i * 2.3 + x, r = (40 + (i * 37) % 70) * s; o += '<circle cx="' + n1(x + Math.cos(a) * r) + '" cy="' + n1(y - 250 * s + Math.sin(a) * r * .6) + '" r="' + n1(9 * s) + '" fill="' + (dark ? '#c4651f' : WARM) + '" stroke="' + INK + '" stroke-width="1.6"/>'; }
  return o; }
const STATIC = {
  6: '<rect x="-500" y="-200" width="2000" height="2200" fill="url(#sky)"/><circle cx="760" cy="1420" r="70" fill="#ffd38a" opacity=".85"/><circle cx="760" cy="1420" r="120" fill="#ffd38a" opacity=".25"/>' +
     cloud(200, 200, 1.1, '#fff', .8) + cloud(820, 330, .8, '#fff', .7),
  5: '<path d="M-500 1820 L-200 1640 L40 1760 L260 1600 L470 1740 L690 1580 L900 1720 L1150 1620 L1500 1780 V2400 H-500Z" fill="#8f86a8" opacity=".55"/>' +
     cloud(120, 700, 1.4, '#fff', .55) + cloud(900, 1000, 1.2, '#fff', .5),
  4: (() => { let o = ''; for (let i = 0; i < 6; i++) o += cloud(-60 + i * 230, 900 + (i % 3) * 210, 1.3 + (i % 2) * .4, '#fff', .9);
     for (let i = 0; i < 7; i++) o += orangeTree(-80 + i * 190, 3040 + (i % 2) * 30, .95, true); return o; })(),
  1: (() => { let o = ''; for (let i = 0; i < 4; i++) o += cloud(i % 2 ? 900 : 80, 2200 + i * 1500, 2.2, '#fff', .92);
     o += '<path d="M-200 9050 C 100 8990 260 9010 420 8930" stroke="#2a1f18" stroke-width="34" fill="none" stroke-linecap="round"/>';
     for (let i = 0; i < 9; i++) o += '<ellipse cx="' + (40 + i * 46) + '" cy="' + (8970 - i * 9 + (i % 2) * 40) + '" rx="46" ry="22" fill="#2f4a33" stroke="' + INK + '" stroke-width="2"/>';
     o += '<circle cx="300" cy="9010" r="22" fill="#c4651f" stroke="' + INK + '" stroke-width="2"/>'; return o; })(),
  0: '<path d="M-60 4300 q 160 -120 260 40 q -120 120 -260 -40z" fill="#1f2a20" opacity=".9"/><path d="M880 8800 q 160 -140 280 30 q -140 130 -280 -30z" fill="#1f2a20" opacity=".9"/>' +
     '<path d="M760 12900 q 200 -160 340 40 q -170 150 -340 -40z" fill="#1f2a20" opacity=".9"/>'
};
const G = {}; PLANES.forEach(p => { let g = world.querySelector('[data-plane="' + p.n + '"]'); if (!g) { g = document.createElementNS(NS, 'g'); g.setAttribute('data-plane', p.n); world.appendChild(g); }
  g.innerHTML = '<g class="st">' + (STATIC[p.n] || '') + '</g><g class="lv"></g><g class="lab" style="display:none"></g>'; G[p.n] = { g, st: g.querySelector('.st'), lv: g.querySelector('.lv'), lab: g.querySelector('.lab'), p }; });
/* the character's own sheet: desk at the top, grove floor at the bottom */
const GROUND = W + 780;
G[2].st.innerHTML = '<g id="desk"></g><path d="M-500 ' + GROUND + 'H1500V' + (GROUND + 900) + 'H-500Z" fill="#5c4632"/><path d="M-500 ' + GROUND + 'H1500" stroke="' + INK + '" stroke-width="3"/>' +
  (() => { let o = ''; for (let i = 0; i < 40; i++) o += '<path d="M' + (-480 + i * 50) + ' ' + GROUND + 'l-5 -14M' + (-472 + i * 50) + ' ' + GROUND + 'l6 -12" stroke="#7e9f6a" stroke-width="2.5" stroke-linecap="round"/>'; return o; })() +
  '<circle cx="640" cy="' + (GROUND - 9) + '" r="9" fill="' + WARM + '" stroke="' + INK + '" stroke-width="1.6"/><circle cx="90" cy="' + (GROUND - 9) + '" r="9" fill="' + WARM + '" stroke="' + INK + '" stroke-width="1.6"/>';
const cast = document.createElementNS(NS, 'g'); cast.setAttribute('class', 'cast'); G[2].g.after ? G[2].g.after(cast) : world.insertBefore(cast, G[1].g);
/* floating sheets of drawing paper and a flock, on plane 3 */
const SHEETS = []; for (let i = 0; i < 16; i++) SHEETS.push({ x: R() * 1000, y: 300 + R() * 4000, r: R() * 60 - 30, s: .6 + R() * .5, ph: R() * 6 });
const FLOCK = [1300, 2500].map((y, j) => ({ y, birds: [0, 1, 2, 3].map(i => ({ dx: i * 70 + (i % 2) * 20, dy: (i % 2) * 34 - i * 6 })), x0: j ? 1200 : -300, dir: j ? -1 : 1 }));
const SHEET = (k) => '<rect x="-26" y="-34" width="52" height="68" fill="#fffdf6" stroke="' + INK + '" stroke-width="1.6"/><circle cx="-14" cy="-26" r="2.4" fill="none" stroke="' + INK + '"/><circle cx="14" cy="-26" r="2.4" fill="none" stroke="' + INK + '"/>' +
  '<path d="M-14 ' + (8 - k * 3) + 'q14 -' + (16 + k * 2) + ' 28 0" stroke="' + INK + '" stroke-width="1.6" fill="none" opacity=".7"/><text x="-20" y="28" font-family="ui-monospace,Menlo,monospace" font-size="9" fill="#5f5b52">K0' + (k % 7 + 1) + '</text>';

/* visible part of the 1000x1000 world on this screen (slice crops the long side) */
let vis = { x0: 0, w: 1000, y0: 0, h: 1000 };
function measure() { const a = innerWidth / innerHeight; vis = a < 1 ? { x0: 500 - 500 * a, w: 1000 * a, y0: 0, h: 1000 } : { x0: 0, w: 1000, y0: 500 - 500 / a, h: 1000 / a }; }
function placeDesk() { const d = document.getElementById('desk'); if (d) d.innerHTML = desk(); }
measure(); addEventListener('resize', () => { measure(); placeDesk(); frame(true); });
const wide = () => innerWidth > 820;
function charX() { return vis.x0 + vis.w * (wide() ? .2 : .26); }
function desk() { const x = charX(); return '<rect x="' + n1(x - 520) + '" y="640" width="' + n1(560 + 30) + '" height="26" fill="#a8844f" stroke="' + INK + '" stroke-width="3"/>' +
  '<path d="M' + n1(x - 500) + ' 666V1100M' + n1(x + 40) + ' 666V1100" stroke="' + INK + '" stroke-width="6"/>' +
  '<rect x="' + n1(x - 230) + '" y="602" width="120" height="38" fill="#fffdf6" stroke="' + INK + '" stroke-width="2" transform="rotate(-6 ' + n1(x - 170) + ' 620)"/>' +
  '<path d="M' + n1(x - 90) + ' 632l70 -8" stroke="' + WARM + '" stroke-width="6" stroke-linecap="round"/><path d="M' + n1(x - 20) + ' 624l8 -1" stroke="' + INK + '" stroke-width="3"/>'; }

/* ---------------------------------------------------------------- the performance, as a function of the camera */
const XS = [ /* the page's own exposure sheet: [camera %, drawing, action] */
  [0, 'K01', 'stands at the edge of the desk'], [.6, 'K02', 'anticipation: crouches, arms back'], [1.2, 'K03', 'launch: stretches up and out'],
  [2.6, 'B01', 'falls; scarf and arms drag behind'], [8, 'H01', 'moving hold whenever you stop to read'], [93, 'K04', 'legs reach for the ground'],
  [98, 'K05', 'landing contact'], [98.7, 'K06', 'compression'], [99.5, 'K07', 'recovery: looks at you'], [100, 'H02', 'hold']];
let cam = 0, vel = 0, still = 0, tNow = 0, lastScroll = 0;
function poseAt(a, t) {
  const x0 = charX(), deskY = 640 - a;
  if (a < 36) { const k = SP.inout(clamp(a / 36)); /* K01 → K02: the anticipation */
    return { P: mix({ x: x0, y: deskY, gaze: [1, .2], hF: [8, 30], hB: [-8, 30], mouth: 'flat' }, { x: x0, y: deskY, hipH: 31, lean: .32, hF: [-14, 22], hB: [-18, 20], fA: [10, 0], fB: [-8, 0], gaze: [1, .6], mouth: 'flat' }, k), sc: 0, rot: 0 }; }
  if (a < 150) { const k = clamp((a - 36) / 114), y = lerp(deskY + 36 - 36, 470, SP.inout(k)) - 130 * Math.sin(Math.PI * Math.min(1, k * 1.1)); /* K03: launch arc */
    return { P: { x: lerp(x0, x0 + 70, SP.in(k)), y, hipH: lerp(31, 48, SP.in(Math.min(1, k * 3))), lean: lerp(.32, -.12, Math.min(1, k * 3)), hF: [8, -32], hB: [-4, -30], fA: [4, -4], fB: [-10, -12], sy: 1 + .25 * Math.sin(Math.PI * Math.min(1, k * 2)), sx: 1 - .1 * Math.sin(Math.PI * Math.min(1, k * 2)), gaze: [.4, -.6], mouth: 'o' }, sc: 1, rot: 0 }; }
  const fx = x0 + 70 + Math.sin(a / 700) * 16;
  const land0 = W - 420, contact = W - 120;
  if (a < land0) { /* B01 falling; H01 when the reader stops */
    const sp = Math.min(1, vel / 40), hold = clamp(still / 40), flail = Math.sin(t / 140) * (1 - hold);
    const fall = { x: fx, y: 470 + Math.sin(t / 900) * 6, hipH: 46, lean: -.04 + Math.sin(a / 500) * .06, hF: [14 + flail * 6, -26 + flail * 6], hB: [-14 - flail * 4, -22 + flail * 5],
      fA: [10, -8 - flail * 4], fB: [-10, -2 + flail * 4], sy: 1 + .3 * sp, sx: 1 - .12 * sp, gaze: [.3, .7], mouth: sp > .4 ? 'o' : 'smile' };
    const rest = { x: fx, y: 470 + Math.sin(t / 700) * 8, hipH: 45 + Math.sin(t / 600), lean: 0, tilt: .12, hF: [18, 2], hB: [-12, 8], fA: [8, -4], fB: [-8, 2], sy: 1, sx: 1, gaze: [1, -.1],
      mouth: 'smile', blink: (t % 3200) < 140 };
    return { P: mix(fall, rest, SP.inout(hold)), sc: 1.2 * (1 - hold) + .3, rot: (Math.sin(a / 600) * 6) * (1 - hold) };
  }
  if (a < contact) { const k = SP.out(clamp((a - land0) / (contact - land0))); /* K04: reaching for the ground */
    return { P: { x: fx, y: lerp(470, GROUND - contact, k), hipH: 48, lean: -.05, hF: [16, -20 + 20 * k], hB: [-16, -16 + 18 * k], fA: [6, 0], fB: [-6, 0], sy: 1 + .2 * k, sx: 1 - .08 * k, gaze: [.2, 1], mouth: 'o' }, sc: 1, rot: 0 }; }
  const g = GROUND - a, k1 = clamp((a - contact) / 40), k2 = clamp((a - contact - 40) / 50), k3 = clamp((a - contact - 90) / 30);
  const P = a < contact + 40 ? mix({ x: fx, y: g, hipH: 46, sy: 1.1, sx: .95, hF: [16, 0], hB: [-16, 2], fA: [12, 0], fB: [-12, 0], mouth: 'o' }, /* K05 → K06 */
      { x: fx, y: g, hipH: 30, lean: .25, sy: .72, sx: 1.22, hF: [20, 14], hB: [-20, 14], fA: [14, 0], fB: [-14, 0], gaze: [.3, .8], mouth: 'flat' }, SP.in(k1))
    : a < contact + 90 ? mix({ x: fx, y: g, hipH: 30, lean: .25, sy: .72, sx: 1.22, hF: [20, 14], hB: [-20, 14], fA: [14, 0], fB: [-14, 0], gaze: [.3, .8] }, /* K06 → K07 */
      { x: fx, y: g, hipH: 45, lean: -.04, sy: 1, sx: 1, hF: [10, 28], hB: [-8, 30], fA: [8, 0], fB: [-8, 0], gaze: [1, -.2], mouth: 'smile' }, SP.overshoot(k2))
      : { x: fx, y: g, hipH: 44, hF: k3 > .5 ? [16, -24 + Math.sin(t / 160) * 5] : [10, 28], hB: [-8, 30], fA: [8, 0], fB: [-8, 0], gaze: [1, -.3], mouth: 'grin', blink: (t % 3400) < 140 };
  return { P, sc: .2, rot: 0 };
}
let showPlanes = false, prevY = scrollY, lastFrame = '';
function frame(force) {
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const target = RM ? W : clamp(scrollY / max) * W;
  const dy = Math.abs(scrollY - prevY); prevY = scrollY;
  vel = vel * .85 + dy * .15 * (W / max) * 4; still = dy < .5 ? still + 1 : 0; cam = target;
  PLANES.forEach(p => { G[p.n].g.setAttribute('transform', 'translate(0 ' + n1(-cam / p.d) + ')'); });
  /* plane 3: sheets of drawings drift and turn; the flock crosses */
  let h3 = '';
  SHEETS.forEach((s, i) => { h3 += '<g transform="translate(' + n1(s.x + Math.sin(tNow / 2200 + s.ph) * 30) + ' ' + n1(s.y + Math.sin(tNow / 1700 + s.ph) * 14) + ') rotate(' + n1(s.r + Math.sin(tNow / 1300 + s.ph) * 14) + ') scale(' + s.s + ')">' + SHEET(i) + '</g>'; });
  FLOCK.forEach(fk => { const sx = fk.x0 + fk.dir * ((tNow / 12) % 1700); fk.birds.forEach((b, i) => { h3 += bird({ x: sx + fk.dir * b.dx, y: fk.y + b.dy, k: 1.1, dir: fk.dir, wing: Math.sin(tNow / 90 + i) > 0 ? 1 : 0, rot: -6 }); }); });
  G[3].lv.innerHTML = h3;
  /* plane 2: the figure */
  const { P, sc, rot } = poseAt(cam, tNow);
  if (RM) { P.sy = 1; P.sx = 1; }
  const fh = fig(P, { scarf: (sc || 0) * (Math.sin(tNow / 120) * .5 + 1.2) });
  cast.setAttribute('transform', 'translate(0 0)');
  cast.innerHTML = rot ? '<g transform="rotate(' + n1(rot) + ' ' + n1(P.x) + ' ' + n1(P.y - 60) + ')">' + fh + '</g>' : fh;
  /* where we are on the page's exposure sheet */
  const pc = cam / W * 100; let row = 0; XS.forEach((r, i) => { if (pc >= r[0]) row = i; });
  const label = 'frame ' + String(Math.round(cam / W * 999)).padStart(3, '0') + ' · ' + XS[row][1];
  if (label !== lastFrame) { lastFrame = label; const at = document.getElementById('at'); if (at) at.textContent = label; document.querySelectorAll('tr[data-xs]').forEach(tr => tr.classList.toggle('now', +tr.dataset.xs === row)); }
  if (showPlanes) labels();
  parallaxGauge();
}
const hud = document.createElementNS(NS, 'g'); hud.style.display = 'none'; world.appendChild(hud);
function labels() { /* one label per plane, drawn on top, each showing how far its sheet has travelled */
  hud.innerHTML = PLANES.map((p, i) => { const x = vis.x0 + vis.w - 372, y = vis.y0 + 96 + i * 34;
    return '<rect x="' + n1(x) + '" y="' + n1(y - 20) + '" width="356" height="28" rx="4" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<text x="' + n1(x + 10) + '" y="' + n1(y) + '" font-family="ui-monospace,Menlo,monospace" font-size="14" fill="' + INK + '">PLANE ' + p.n + ' · ' + p.name + ' · moved ' + Math.round(cam / p.d) + '</text>'; }).join(''); }
document.getElementById('planesBtn').addEventListener('click', e => { showPlanes = !showPlanes; e.currentTarget.setAttribute('aria-pressed', showPlanes);
  hud.style.display = showPlanes ? '' : 'none';
  world.style.zIndex = showPlanes ? 3 : 0; document.querySelector('main').style.opacity = showPlanes ? .35 : ''; frame(true); });

/* ---------------------------------------------------------------- demos: the rules, drawn */
const svgEl = (w, h, label) => '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '">';
const T = (x, y, s, o) => '<text x="' + x + '" y="' + y + '" font-family="' + ((o && o.mono) ? 'ui-monospace,Menlo,monospace' : 'ui-sans-serif,-apple-system,Arial,sans-serif') + '" font-size="' + ((o && o.size) || 13) + '" font-weight="' + ((o && o.w) || 600) + '" fill="' + ((o && o.fill) || INK) + '" text-anchor="' + ((o && o.a) || 'middle') + '">' + s + '</text>';
const KEYS = {
  K01: {}, K02: { tilt: .22, gaze: [-1, -.3], hipH: 45, mouth: 'o' }, K03: { hipH: 31, lean: .32, hF: [-14, 22], hB: [-18, 20], fA: [10, 0], fB: [-10, 0], gaze: [1, .4] },
  K04: { y: -64, hipH: 48, lean: -.14, hF: [6, -32], hB: [-6, -30], fA: [4, -6], fB: [-8, -12], sy: 1.18, sx: .92, gaze: [.4, -.6], mouth: 'o' },
  K05: { hipH: 40, lean: .1, fA: [12, 0], fB: [-12, 0], hF: [18, -10], hB: [-16, -8], gaze: [.2, .6] }, K06: { hipH: 29, lean: .26, sy: .78, sx: 1.16, hF: [16, 12], hB: [-16, 12], fA: [13, 0], fB: [-13, 0] },
  K07: { hipH: 44, mouth: 'smile', gaze: [1, -.2] } };
const KN = { K01: 'idle', K02: 'hears sound', K03: 'anticipation', K04: 'jump extreme', K05: 'landing contact', K06: 'compression', K07: 'recovery' };
const DEMOS = {
  loop(el) { /* DRAW → LOOK → COMPARE → ADJUST → DRAW AGAIN, with a drawing that gets better each lap */
    const words = ['DRAW', 'LOOK', 'COMPARE', 'ADJUST', 'DRAW AGAIN'];
    return { len: 300, cap: 'Each lap, the same head is drawn again with less wobble. On the last lap it is saved.', draw(f) {
      const lap = Math.min(4, Math.floor(f / 60)), u = (f % 60) / 60, cx = 470, cy = 140;
      let s = svgEl(640, 280, 'A loop of five steps around a drawing that steadies with each pass');
      words.forEach((w, i) => { const a = -Math.PI / 2 + i / 5 * Math.PI * 2, x = 160 + Math.cos(a) * 112, y = 140 + Math.sin(a) * 112, on = Math.floor(u * 5) === i;
        s += '<rect x="' + n1(x - 52) + '" y="' + n1(y - 14) + '" width="104" height="28" rx="14" fill="' + (on ? INK : PAPER) + '" stroke="' + INK + '" stroke-width="1.6"/>' + T(n1(x), n1(y + 5), w, { size: 11, fill: on ? PAPER : INK }); });
      const pa = -Math.PI / 2 + u * Math.PI * 2; s += '<circle cx="' + n1(160 + Math.cos(pa) * 72) + '" cy="' + n1(140 + Math.sin(pa) * 72) + '" r="7" fill="' + WARM + '" stroke="' + INK + '" stroke-width="1.5"/>';
      const j = 9 / (lap + 1); let d = ''; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, r = 70 + Math.sin(a * 5 + lap) * j + Math.sin(a * 3) * j * .7; d += (i ? 'L' : 'M') + n1(cx + Math.cos(a) * r) + ' ' + n1(cy + Math.sin(a) * r * .95); }
      s += '<path d="' + d + 'Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + (1.5 + lap * .4) + '"/>';
      s += '<rect x="' + (cx - 40) + '" y="' + (cy - 22) + '" width="30" height="24" fill="none" stroke="' + INK + '" stroke-width="2.4"/><rect x="' + (cx + 10) + '" y="' + (cy - 22) + '" width="30" height="24" fill="none" stroke="' + INK + '" stroke-width="2.4"/><path d="M' + (cx - 20) + ' ' + (cy + 34) + 'q20 ' + (10 + lap * 2) + ' 40 0" fill="none" stroke="' + INK + '" stroke-width="2.4"/>';
      s += T(cx, 262, 'pass ' + (lap + 1) + ' of 5', { mono: 1, w: 500 });
      if (f > 250) s += '<g transform="rotate(-8 ' + (cx + 80) + ' 60)"><rect x="' + (cx + 20) + '" y="44" width="124" height="30" fill="none" stroke="#9a3328" stroke-width="2.4"/>' + T(cx + 82, 64, 'SAVE CHECKPOINT', { size: 12, fill: '#9a3328', w: 800 }) + '</g>';
      return s + '</svg>'; } }; },
  planes() { return { len: 1, live: 1, cap: 'The page you are falling through, by plane. Press “Show planes” at the top to see each sheet labelled in place.', draw() {
      let s = svgEl(640, 350, 'Seven planes of this page, stacked in depth');
      PLANES.forEach((p, i) => { const x = 30 + i * 30, y = 14 + i * 30, c = ['#bfd0c4', '#cfdcc2', '#e8eadf', '#f3e3c7', '#d8c9a8', '#e3dccd', '#cfd9e0'][p.n];
        s += '<path d="M' + x + ' ' + (y + 160) + 'l120 -60h260l-120 60z" fill="' + c + '" stroke="' + INK + '" stroke-width="1.6" opacity=".96"/>' + T(x + 126, y + 116, 'PLANE ' + p.n + ' · ' + p.name.toLowerCase() + (p.n === 2 ? ' (him)' : ''), { size: 11, a: 'start', mono: 1, w: 600 }); });
      s += T(600, 340, 'near ↓', { size: 11, mono: 1, a: 'end', w: 500 }) + T(600, 22, 'far ↑', { size: 11, mono: 1, a: 'end', w: 500 });
      return s + '</svg>'; } }; },
  parallax() { return { len: 1, live: 1, cap: 'Live: how far each plane has moved since the top of this page. Scroll and watch the near planes run.', draw() {
      let s = svgEl(640, 250, 'How far each plane of this page has moved');
      PLANES.forEach((p, i) => { const off = cam / p.d, y = 26 + i * 32, w = 420; s += T(16, y + 5, 'PLANE ' + p.n, { mono: 1, a: 'start', size: 11 }) + '<line x1="110" y1="' + y + '" x2="' + (110 + w) + '" y2="' + y + '" stroke="#cbc5b7" stroke-width="1.5"/>';
        for (let k = 0; k < 8; k++) { const x = 110 + ((k * 60 - off * .15) % w + w) % w; s += '<rect x="' + n1(x) + '" y="' + (y - 7) + '" width="14" height="14" fill="' + (p.n === 2 ? WARM : '#8f8a7e') + '" stroke="' + INK + '" stroke-width="1"/>'; }
        s += T(620, y + 5, '1/' + p.d, { mono: 1, a: 'end', size: 11 }); });
      return s + '</svg>'; } }; },
  keys() { return { len: 168, cap: 'K01–K07 played alone, the key test. If the jump reads with only these, the keys work.', draw(f) {
      const ks = Object.keys(KEYS), cur = Math.floor(f / 24) % 7; let s = svgEl(640, 230, 'Seven key drawings of a jump, played in turn');
      s += '<path d="M10 176H630" stroke="' + INK + '" stroke-width="2"/>';
      ks.forEach((k, i) => { const x = 50 + i * 90; s += '<g opacity="' + (i === cur ? 1 : .28) + '">' + fig(Object.assign({ x, y: 176, k: .62 }, KEYS[k], { y: 176 + (KEYS[k].y || 0) * .62 })) + '</g>';
        s += T(x, 200, k, { mono: 1, size: 12, w: 700, fill: i === cur ? '#9a3328' : INK }) + T(x, 218, KN[k], { size: 10, w: 500 }); });
      return s + '</svg>'; } }; },
  breakdown() { return { len: 120, cap: 'The breakdown is not the midpoint: hips already rising, feet still on the ground, head lagging, arms beginning to swing.', draw(f) {
      let s = svgEl(640, 260, 'A crouch, a breakdown, and the airborne key, with the breakdown highlighted');
      const B = { hipH: 39, lean: .06, tilt: .32, hF: [2, -6], hB: [-10, -2], fA: [10, 0], fB: [-10, 0], sy: 1.1, sx: .96, gaze: [.6, -.2] };
      s += '<path d="M10 200H630" stroke="' + INK + '" stroke-width="2"/>';
      s += '<g opacity=".3">' + fig(Object.assign({ x: 120, y: 200, k: .9 }, KEYS.K03)) + '</g>' + fig(Object.assign({ x: 320, y: 200, k: .9 }, B)) + '<g opacity=".3">' + fig(Object.assign({ x: 520, k: .9 }, KEYS.K04, { y: 200 - 50 })) + '</g>';
      const pulse = .5 + .5 * Math.sin(f / 120 * Math.PI * 2);
      s += '<rect x="262" y="40" width="116" height="168" rx="8" fill="none" stroke="' + WARM + '" stroke-width="' + n1(2 + pulse * 2) + '" stroke-dasharray="6 5"/>';
      s += T(120, 230, 'K03 crouched', { mono: 1 }) + T(320, 230, 'B01 breakdown', { mono: 1, fill: '#9a3328' }) + T(520, 230, 'K04 airborne', { mono: 1 });
      return s + '</svg>'; } }; },
  spacing() { return { len: 96, cap: 'Nine frames each, in the prompt’s own terms. Equal time; unequal space.', draw(f) {
      const rows = [['Slow-in', t => SP.in(t)], ['Slow-out', t => SP.out(t)], ['Ease-in/ease-out', t => SP.inout(t)], ['Fast action', t => t], ['Hold', () => 0]];
      let s = svgEl(640, 250, 'Spacing charts for slow-in, slow-out, ease, fast action and hold');
      const u = (f % 48) / 47;
      rows.forEach((r, i) => { const y = 34 + i * 44, x0 = 170, x1 = r[0] === 'Fast action' ? 600 : 520; s += T(16, y + 5, r[0], { a: 'start', size: 12 }) + '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#cbc5b7" stroke-width="1.5"/>';
        for (let k = 0; k < 9; k++) { const x = x0 + (x1 - x0) * r[1](k / 8); s += '<line x1="' + n1(x) + '" y1="' + (y - 9) + '" x2="' + n1(x) + '" y2="' + (y + 9) + '" stroke="' + INK + '" stroke-width="1.5"/>'; }
        const bx = x0 + (x1 - x0) * r[1](Math.floor(u * 8) / 8); s += '<circle cx="' + n1(bx) + '" cy="' + y + '" r="8" fill="' + WARM + '" stroke="' + INK + '" stroke-width="1.5"/>'; });
      return s + '</svg>'; } }; },
  flip() { return { len: 96, cap: 'Previous (red), current (black), next (blue): judged against its neighbours, the current drawing’s head has shrunk. Flip and it pops.', draw(f) {
      const prev = { hipH: 44, fA: [14, 0], fB: [-14, 0], hF: [-10, 28], hB: [10, 28], k: 1.1 }, cur = { hipH: 47, fA: [1, 0], fB: [3, -9], hF: [0, 30], hB: [0, 30], k: 1.04 }, next = { hipH: 44, fA: [-14, 0], fB: [14, 0], hF: [10, 28], hB: [-10, 28], k: 1.1 };
      const ph = Math.floor(f / 12) % 4, show = [prev, cur, next, cur][ph];
      let s = svgEl(640, 240, 'Onion skin of three drawings, and the same three flipped');
      s += '<path d="M10 200H300M340 200H630" stroke="' + INK + '" stroke-width="2"/>';
      s += '<g opacity=".45" style="filter:sepia(1) saturate(6) hue-rotate(-40deg)">' + fig(Object.assign({ x: 140, y: 200 }, prev)) + '</g><g opacity=".45" style="filter:sepia(1) saturate(6) hue-rotate(170deg)">' + fig(Object.assign({ x: 160, y: 200 }, next)) + '</g>' + fig(Object.assign({ x: 150, y: 200 }, cur));
      s += fig(Object.assign({ x: 480, y: 200 }, show)) + T(150, 228, 'onion skin', { mono: 1 }) + T(480, 228, ['previous', 'current', 'next', 'current'][ph], { mono: 1, fill: ph === 1 || ph === 3 ? '#9a3328' : INK });
      return s + '</svg>'; } }; },
  arcs() { return { len: 72, cap: 'The hand travels an arc; its positions are marked frame by frame. A straight path here would look mechanical.', draw(f) {
      const u = SP.inout(Math.abs(((f % 72) / 36) - 1)); let s = svgEl(640, 240, 'A waving arm with the hand’s arc traced');
      const ang = a => [Math.cos(a) * 34, -Math.sin(a) * 34 + 2];
      s += '<path d="M10 210H630" stroke="' + INK + '" stroke-width="2"/>';
      const sx = 320, shY = 210 - 44 * 1.6 - 34 * 1.6 + 6 * 1.6;
      let d = ''; for (let i = 0; i <= 12; i++) { const a = lerp(-.6, 1.9, i / 12), h = ang(a); d += '<circle cx="' + n1(sx + h[0] * 1.6) + '" cy="' + n1(shY + h[1] * 1.6) + '" r="3" fill="' + WARM + '" stroke="' + INK + '" stroke-width="1"/>'; }
      s += d; const h = ang(lerp(-.6, 1.9, u)); s += fig({ x: sx, y: 210, k: 1.6, hF: h, mouth: 'smile', gaze: [1, -.3] });
      return s + '</svg>'; } }; },
  squash() { return { len: 48, cap: 'Stretch while falling, compress at impact, return toward equilibrium. Width times height stays the same.', draw(f) {
      const u = (f % 48) / 48, h = 1 - Math.pow(2 * u - 1, 2), y = 200 - 150 * h, v = Math.abs(2 * u - 1);
      let sy = 1 + .35 * v * (y < 190 ? 1 : 0), sx = 1 / sy; if (y >= 188) { sy = .62; sx = 1 / sy; }
      let s = svgEl(640, 240, 'A bouncing ball that squashes and stretches');
      s += '<path d="M10 222H630" stroke="' + INK + '" stroke-width="2"/><ellipse cx="320" cy="222" rx="' + n1(26 + 14 * (1 - h)) + '" ry="5" fill="' + INK + '" opacity="' + n1(.1 + .2 * (1 - h)) + '"/>';
      s += '<g transform="translate(320 222) scale(' + n1(sx * 100) / 100 + ' ' + n1(sy * 100) / 100 + ') translate(-320 -222)"><circle cx="320" cy="' + n1(Math.min(198, y)) + '" r="24" fill="' + WARM + '" stroke="' + INK + '" stroke-width="2.4"/></g>';
      return s + '</svg>'; } }; },
  antic() { return { len: 96, cap: 'Before jumping: compress. Hold, crouch, launch, land, settle.', draw(f) {
      const u = f % 96; let P;
      if (u < 20) P = KEYS.K01; else if (u < 34) P = mix(KEYS.K01, KEYS.K03, SP.inout((u - 20) / 14)); else if (u < 40) P = KEYS.K03;
      else if (u < 54) { const k = (u - 40) / 14; P = mix(KEYS.K03, KEYS.K04, SP.in(k)); P.y = -64 * Math.sin(Math.PI * k * .5) ; }
      else if (u < 66) { const k = (u - 54) / 12; P = mix(KEYS.K04, KEYS.K05, SP.out(k)); P.y = -64 * Math.cos(Math.PI * k * .5); }
      else if (u < 72) P = mix(KEYS.K05, KEYS.K06, (u - 66) / 6); else P = mix(KEYS.K06, KEYS.K07, SP.overshoot(Math.min(1, (u - 72) / 12)));
      let s = svgEl(640, 240, 'A figure crouches before it jumps'); s += '<path d="M10 210H630" stroke="' + INK + '" stroke-width="2"/>';
      s += fig(Object.assign({}, P, { x: 320, y: 210 + (P.y || 0), k: 1.3 }), { scarf: u > 40 && u < 70 ? 1 : 0 });
      return s + '</svg>'; } }; },
  xsheet() { return { table: 1 }; },
  model() { return { len: 1, cap: 'The figure that falls through this page: four heads tall, square glasses, a warm scarf that trails, weight low in the hips.', draw() {
      let s = svgEl(640, 270, 'Model sheet of the figure');
      for (let i = 0; i <= 4; i++) s += '<line x1="20" y1="' + (230 - i * 44) + '" x2="620" y2="' + (230 - i * 44) + '" stroke="#cbc5b7" stroke-dasharray="4 4"/>';
      s += fig({ x: 120, y: 230, k: 1.25, gaze: [1, 0] }) + fig({ x: 300, y: 230, k: 1.25, ...KEYS.K03 }) + fig({ x: 480, y: 230, k: 1.25, dir: -1, gaze: [1, -.2], mouth: 'smile', hF: [16, -24] });
      s += T(120, 256, 'neutral', { mono: 1 }) + T(300, 256, 'weight down', { mono: 1 }) + T(480, 256, 'characteristic gesture', { mono: 1 });
      return s + '</svg>'; } }; },
  frog() { /* the prompt's own tiny-prompt example, built */
    const FROG = P => { const sq = P.sq || 1; return '<g transform="translate(' + n1(P.x) + ' ' + n1(P.y) + ') rotate(' + n1(P.r || 0) + ') scale(' + n1((P.dir || 1) / Math.sqrt(sq) * 100) / 100 + ' ' + n1(sq * 100) / 100 + ')"><ellipse cx="0" cy="-16" rx="26" ry="18" fill="#6aa84f" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<path d="M-20 -2q-10 4 -14 2M20 -2q10 4 14 2" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="-10" cy="-34" r="8" fill="#6aa84f" stroke="' + INK + '" stroke-width="2"/><circle cx="12" cy="-34" r="8" fill="#6aa84f" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="' + n1(-9 + (P.gx || 0) * 3) + '" cy="' + n1(-35 + (P.gy || 0) * 3) + '" r="3.2" fill="' + INK + '"/><circle cx="' + n1(13 + (P.gx || 0) * 3) + '" cy="' + n1(-35 + (P.gy || 0) * 3) + '" r="3.2" fill="' + INK + '"/>' +
      '<path d="M-8 -12q9 ' + n1(P.m || 4) + ' 18 0" stroke="' + INK + '" stroke-width="2" fill="none"/>' + (P.sweat ? '<path d="M24 -36q3 5 0 7q-3 -2 0 -7z" fill="#9cc6e6" stroke="' + INK + '"/>' : '') + '</g>'; };
    const MELON = P => '<g transform="translate(' + n1(P.x) + ' ' + n1(P.y) + ') rotate(' + n1(P.r || 0) + ')"><ellipse rx="34" ry="26" fill="#3f7d3a" stroke="' + INK + '" stroke-width="2.4"/><path d="M-26 -10q26 -10 52 0M-30 6q30 -10 60 0" stroke="#a7d17f" stroke-width="3" fill="none"/></g>';
    const K = [[0, { x: -40, y: 210, sq: 1 }, { x: 250, y: 185 }], [30, { x: 200, y: 210, gx: 1 }, { x: 250, y: 185 }], [40, { x: 220, y: 210, gx: 1, gy: 1 }, { x: 250, y: 185 }],
      [50, { x: 232, y: 210, sq: .7, sweat: 1, m: -2 }, { x: 250, y: 160 }], [60, { x: 232, y: 210, sq: .62, sweat: 1, m: -3 }, { x: 236, y: 148 }],
      [72, { x: 262, y: 210, sq: .66, sweat: 1, m: -3 }, { x: 266, y: 150 }], [84, { x: 292, y: 210, sq: .62, sweat: 1, m: -3 }, { x: 296, y: 148 }], [96, { x: 322, y: 210, sq: .66, sweat: 1 }, { x: 326, y: 150 }],
      [104, { x: 322, y: 210, sq: 1, gx: 1, m: 6 }, { x: 420, y: 185, r: 180 }], [114, { x: 400, y: 196, r: 70, sq: 1.15, gx: 1 }, { x: 470, y: 185, r: 300 }],
      [124, { x: 470, y: 212, r: 85, sq: 1 }, { x: 490, y: 182, r: 330 }], [136, { x: 470, y: 210, r: 0, sq: 1, gx: -1, gy: 0, m: 6 }, { x: 488, y: 160, r: 330 }],
      [160, { x: 470, y: 210, gx: 0, gy: 0, m: 6 }, { x: 488, y: 160 }], [176, { x: 470, y: 210, gx: .4, gy: -1, m: 0 }, { x: 488, y: 160 }], [210, { x: 470, y: 210, gx: .4, gy: -1, m: -4, sweat: 1 }, { x: 488, y: 160 }]];
    return { len: 220, cap: 'Built from the prompt’s own tiny example: the frog compresses under the melon, takes three determined steps, dives, catches, looks at camera, then slowly realizes the checkout is upstairs.', draw(f) {
      let i = 0; while (i < K.length - 1 && f >= K[i + 1][0]) i++; const a = K[i], b = K[Math.min(K.length - 1, i + 1)], t = b === a ? 1 : SP.inout(clamp((f - a[0]) / (b[0] - a[0])));
      const fr = mix(a[1], b[1], t), m = mix(a[2], b[2], t);
      let s = svgEl(640, 260, 'A frog carries a watermelon, drops it, catches it, and sees the checkout is upstairs');
      s += '<rect x="0" y="0" width="640" height="260" fill="#efe6d2"/><path d="M0 212H640" stroke="' + INK + '" stroke-width="2.4"/>';
      s += '<path d="M540 212h40v-30h40v-30h40" fill="none" stroke="' + INK + '" stroke-width="3"/><rect x="560" y="70" width="70" height="36" fill="#fffdf6" stroke="' + INK + '" stroke-width="2"/>' + T(595, 93, 'CHECKOUT ↑', { size: 10, w: 800 });
      s += '<rect x="40" y="120" width="120" height="92" fill="none" stroke="#8f8a7e" stroke-width="2"/>' + T(100, 112, 'PRODUCE', { size: 10, fill: '#5f5b52' });
      s += MELON(m) + FROG(fr) + (f > 150 ? '<path d="M500 132l14 -16M512 140l18 -8" stroke="' + INK + '" stroke-width="2" opacity="' + n1(clamp((f - 150) / 10)) + '"/>' : '');
      return s + '</svg>'; } }; },
  test() { return { answers: [['STORY', 'You fall from the desk into the grove. It reads with the sound off; there is no sound.'], ['POSE', 'Crouch, launch, fall, reach, land: each a different silhouette.'],
    ['WEIGHT', 'He compresses before the jump and on contact; nothing floats except the paper.'], ['INTENTION', 'Wanting to see where the text goes; when you stop, he stops and reads with you.'],
    ['TIMING', 'Anticipation on the desk, fast fall while you scroll, moving holds while you read, a squash and settle at the end.'], ['ARCS', 'The launch follows an arc; the scarf drags behind it.'],
    ['VOLUME', 'Same rig on every frame; squash and stretch keep his width times height.'], ['DEPTH', 'Seven planes at seven speeds; press “Show planes” to check.'],
    ['CAMERA', 'The camera is your scroll. It moves to reveal the next rule, and the ground.'], ['PEAK', 'Earlier versions had a separate cartoon per page; this one lets the prompt be the page.']] }; }
};
function mountDemos() {
  document.querySelectorAll('.demo[data-demo]').forEach(el => { const D = DEMOS[el.dataset.demo]; if (!D) return; const d = D(el);
    if (d.table) { el.innerHTML = '<div class="tbl" tabindex="0" role="region" aria-label="This page’s exposure sheet"><table><caption class="vh">This page’s own exposure sheet</caption><thead><tr><th>Camera</th><th>Drawing</th><th>Action</th></tr></thead><tbody>' +
      XS.map((r, i) => '<tr data-xs="' + i + '"><td>' + r[0] + '%</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</tbody></table></div><figcaption>This page’s own x-sheet. The highlighted row is where you are now.</figcaption>'; return; }
    if (d.answers) { el.innerHTML = d.answers.map(a => '<p class="ans"><b>' + a[0] + '</b> ' + a[1] + '</p>').join('') + '<figcaption>The director’s test, answered for this page.</figcaption>'; return; }
    el.innerHTML = '<div class="dv"></div><figcaption>' + d.cap + '</figcaption>'; const dv = el.firstChild;
    let f = 0, on = false, raf = 0, last = 0;
    const paint = () => { dv.innerHTML = d.draw(f); };
    if (d.live) { el._live = paint; paint(); return; }
    f = d.len > 1 ? Math.round(d.len * .8) % d.len : 0; paint();
    if (RM || d.len <= 1) return;
    const tick = ts => { if (!on) return; if (!last) last = ts; while (ts - last >= 1000 / 24) { last += 1000 / 24; f = (f + 2) % d.len; } paint(); raf = requestAnimationFrame(tick); };
    new IntersectionObserver(es => es.forEach(e => { on = e.isIntersecting; if (on) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); }), { threshold: .2 }).observe(el); });
}
function parallaxGauge() { document.querySelectorAll('.demo[data-demo="parallax"]').forEach(el => el._live && el._live()); }

function loop(ts) { tNow = ts || 0; frame(); requestAnimationFrame(loop); }
function boot() { if (!window.MP) return setTimeout(boot, 40); placeDesk(); mountDemos(); if (RM) { frame(true); addEventListener('scroll', () => frame(true), { passive: true }); } else requestAnimationFrame(loop); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
