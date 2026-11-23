/* ============================================================
   CENÁRIOS 160x90 em pixel art (desenhados com retângulos)
   ============================================================ */
'use strict';

const SW = 160, SH = 90;
function R(ctx, c, x, y, w, h) { ctx.fillStyle = col(c); ctx.fillRect(x, y, w, h); }
function put(ctx, name, x, y, mode, flip) {
  const s = SPR.canvas(name, mode);
  if (flip) { ctx.save(); ctx.translate(x + s.width, y); ctx.scale(-1, 1); ctx.drawImage(s, 0, 0); ctx.restore(); }
  else ctx.drawImage(s, x, y);
}
function stripes(ctx, c, x, y, w, h, step, vertical = true) {
  for (let i = 0; i < (vertical ? w : h); i += step) vertical ? R(ctx, c, x + i, y, 1, h) : R(ctx, c, x, y + i, w, 1);
}
function checker(ctx, a, b, x, y, w, h, s) {
  for (let j = 0; j < h; j += s) for (let i = 0; i < w; i += s) R(ctx, ((i + j) / s) % 2 ? a : b, x + i, y + j, Math.min(s, w - i), Math.min(s, h - j));
}
function windowPx(ctx, x, y, w, h, sky = 'sky', frame = 'white') {
  R(ctx, 'ink', x - 1, y - 1, w + 2, h + 2); R(ctx, frame, x, y, w, h); R(ctx, sky, x + 2, y + 2, w - 4, h - 4);
  R(ctx, frame, x + (w >> 1) - 1, y, 2, h); R(ctx, frame, x, y + (h >> 1) - 1, w, 2);
  R(ctx, 'white', x + 3, y + 3, 2, 1);
}
function tree(ctx, x, y, s = 1, leaf = 'green') {
  R(ctx, 'brownD', x + 6 * s, y + 14 * s, 3 * s, 10 * s);
  R(ctx, 'ink', x - 1, y + 2 * s - 1, 16 * s + 2, 13 * s + 2);
  R(ctx, leaf, x, y + 2 * s, 16 * s, 13 * s); R(ctx, leaf, x + 3 * s, y, 10 * s, 3 * s);
  R(ctx, 'greenL', x + 3 * s, y + 3 * s, 4 * s, 2 * s); R(ctx, 'greenD', x, y + 12 * s, 16 * s, 3 * s);
}
function house(ctx, x, y, w, h, wall, roof, lit) {
  R(ctx, 'ink', x - 1, y - 1, w + 2, h + 2); R(ctx, wall, x, y, w, h);
  for (let j = y + 3; j < y + h; j += 4) R(ctx, '#0000000d', x, j, w, 1);
  R(ctx, '#00000022', x + w - 2, y, 2, h);
  R(ctx, 'ink', x - 3, y - 6, w + 6, 7); R(ctx, roof, x - 2, y - 5, w + 4, 5);
  for (let i = x - 2; i < x + w + 2; i += 3) R(ctx, '#00000026', i, y - 5, 1, 5); R(ctx, '#ffffff33', x - 2, y - 5, w + 4, 1);
  if (w > 26) { R(ctx, 'ink', x + w - 8, y - 11, 6, 6); R(ctx, 'brownL', x + w - 7, y - 10, 4, 5); }
  R(ctx, 'ink', x + (w >> 1) - 4, y + h - 11, 8, 11); R(ctx, 'brownD', x + (w >> 1) - 3, y + h - 10, 6, 10); R(ctx, 'brown', x + (w >> 1) - 2, y + h - 9, 4, 4);
  R(ctx, 'yellow', x + (w >> 1) + 1, y + h - 5, 1, 1); R(ctx, 'grey', x + (w >> 1) - 5, y + h - 1, 10, 1);
  windowPx(ctx, x + 3, y + 4, 8, 8, lit ? '#ffd65e' : 'sky');
  if (w > 26) windowPx(ctx, x + w - 11, y + 4, 8, 8, lit ? '#ffd65e' : 'sky');
}
function sky(ctx, c1 = 'sky', h = 60) { R(ctx, c1, 0, 0, SW, h); R(ctx, 'white', 18, 10, 18, 4); R(ctx, 'white', 22, 7, 9, 3); R(ctx, 'white', 110, 14, 22, 4); R(ctx, 'white', 116, 11, 10, 3); }

/* ---- detalhes de cidade ---- */
function skyGrad(ctx, top = 'skyD', mid = 'sky', h = 60) { R(ctx, top, 0, 0, SW, h); for (let i = 0; i < 6; i++) R(ctx, mid, 0, Math.round(h * (.2 + i * .12)), SW, h); R(ctx, '#cfeefa', 0, h - 8, SW, 8);
  R(ctx, 'white', 18, 10, 18, 4); R(ctx, 'white', 22, 7, 9, 3); R(ctx, 'white', 110, 14, 22, 4); R(ctx, 'white', 116, 11, 10, 3); R(ctx, '#eaf7fd', 18, 13, 18, 1); R(ctx, '#eaf7fd', 110, 17, 22, 1); }
function skyline(ctx, c = '#9fc7e3', base = 52) {
  const t = [[0, 30, 12], [11, 22, 9], [20, 34, 14], [33, 26, 8], [40, 18, 10], [52, 30, 12], [63, 24, 9], [74, 16, 12], [88, 28, 10], [97, 20, 13], [112, 30, 9], [122, 24, 12], [136, 18, 10], [148, 28, 12]];
  for (const [x, y, w] of t) { R(ctx, c, x, y, w, base - y); for (let wy = y + 3; wy < base - 2; wy += 5) for (let wx = x + 2; wx < x + w - 1; wx += 4) R(ctx, '#b8d8ee', wx, wy, 2, 2); }
}
function building(ctx, x, y, w, base, c, shade, k) {
  const h = base - y;
  R(ctx, 'ink', x - 1, y - 1, w + 2, h + 1); R(ctx, c, x, y, w, h); R(ctx, shade, x + w - 2, y, 2, h);
  R(ctx, 'white', x, y, w, 1); R(ctx, shade, x - 1, y + 2, w + 2, 1);
  /* telhado: caixa d'água, antena ou ar-condicionado */
  if (k % 3 === 0) { R(ctx, 'ink', x + 3, y - 5, 7, 5); R(ctx, 'brownL', x + 4, y - 4, 5, 3); R(ctx, 'brown', x + 4, y - 2, 5, 1); }
  else if (k % 3 === 1) { R(ctx, 'ink', x + w - 5, y - 7, 1, 7); R(ctx, 'ink', x + w - 7, y - 6, 5, 1); }
  else { R(ctx, 'ink', x + 2, y - 3, 6, 3); R(ctx, 'greyL', x + 3, y - 2, 4, 2); }
  /* andares e janelas (algumas acesas, algumas com cortina) */
  let n = 0;
  for (let wy = y + 4; wy < base - 14; wy += 7) {
    R(ctx, shade, x, wy + 5, w - 2, 1);
    for (let wx = x + 2; wx < x + w - 5; wx += 5) {
      const v = (k * 7 + n++ * 3) % 5;
      R(ctx, 'ink', wx, wy, 4, 4); R(ctx, v === 0 ? '#ffd65e' : v === 1 ? 'navy' : 'blueL', wx + 1, wy + 1, 2, 2);
      if (v === 2) R(ctx, 'pink', wx + 1, wy + 1, 1, 2); if (v === 3) R(ctx, 'white', wx + 1, wy + 1, 1, 1);
    }
  }
  /* térreo: loja com toldo listrado, vitrine e porta */
  const aw = ['red', 'green', 'orange', 'blue', 'purple', 'teal'][k % 6];
  R(ctx, 'ink', x - 1, base - 13, w + 2, 4);
  for (let i = 0; i < w; i += 2) R(ctx, i % 4 ? 'white' : aw, x + i, base - 12, 2, 2);
  R(ctx, 'ink', x + 2, base - 8, w - 10, 6); R(ctx, 'glass', x + 3, base - 7, w - 12, 4); R(ctx, 'white', x + 4, base - 7, 2, 1);
  R(ctx, 'ink', x + w - 7, base - 9, 5, 9); R(ctx, 'brownD', x + w - 6, base - 8, 3, 8); R(ctx, 'yellow', x + w - 4, base - 4, 1, 1);
}
function sidewalk(ctx, y, h) { R(ctx, 'greyL', 0, y, SW, h); for (let i = 0; i < SW; i += 8) R(ctx, '#bfc5cc', i, y, 1, h); R(ctx, '#bfc5cc', 0, y + (h >> 1), SW, 1); R(ctx, 'grey', 0, y + h, SW, 1); R(ctx, 'white', 0, y + h + 1, SW, 1); }
function road(ctx, y, h, zebra) {
  R(ctx, '#4f5663', 0, y, SW, h);
  for (let i = 0; i < 90; i++) R(ctx, i % 2 ? '#585f6d' : '#474d59', (i * 37) % SW, y + 2 + (i * 13) % (h - 3), 1, 1);
  const mid = y + (h >> 1); for (let i = 4; i < SW; i += 16) { R(ctx, 'yellow', i, mid - 1, 9, 1); R(ctx, 'yellow', i, mid + 1, 9, 1); }
  if (zebra != null) for (let j = y + 2; j < y + h - 2; j += 4) R(ctx, 'white', zebra, j, 14, 2);
  R(ctx, 'grey', 0, y + h - 1, SW, 1);
}
function lamp(ctx, x, y, h = 26) { R(ctx, 'ink', x - 1, y, 3, h); R(ctx, 'greyD', x, y, 1, h); R(ctx, 'ink', x - 1, y - 1, 8, 3); R(ctx, 'greyD', x, y, 6, 1); R(ctx, '#fff1a8', x + 4, y + 1, 3, 2); }
function busStop(ctx, x, y) { R(ctx, 'ink', x - 1, y - 1, 22, 4); R(ctx, 'tealD', x, y, 20, 2); R(ctx, 'ink', x + 1, y + 2, 1, 14); R(ctx, 'ink', x + 18, y + 2, 1, 14); R(ctx, 'glass', x + 2, y + 3, 15, 7); R(ctx, 'brownL', x + 3, y + 11, 13, 2); R(ctx, 'ink', x + 4, y + 13, 1, 3); R(ctx, 'ink', x + 14, y + 13, 1, 3); R(ctx, 'yellow', x + 19, y - 6, 4, 4); R(ctx, 'ink', x + 20, y - 2, 1, 4); }

/* ---- cidade brasileira: letreiros, morro, caixa d'água azul, fiação, orelhão, banca, ipê ---- */
const FONT3 = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', Ç: '011100100011010', ' ': '000000000000000' };
function pxText(ctx, txt, x, y, c = 'ink') { let cx = x; for (const ch of txt) { const g = FONT3[ch] || FONT3[' ']; for (let i = 0; i < 15; i++) if (g[i] === '1') R(ctx, c, cx + (i % 3), y + Math.floor(i / 3), 1, 1); cx += 4; } return cx - x; }
function sign(ctx, x, y, w, txt, bg, fg) { R(ctx, 'ink', x - 1, y - 1, w + 2, 9); R(ctx, bg, x, y, w, 7); const tw = txt.length * 4 - 1; pxText(ctx, txt, x + Math.max(1, (w - tw) >> 1), y + 1, fg); }
function morro(ctx, base = 50) {
  for (let x = 0; x < SW; x++) { const h = Math.round(24 + 7 * Math.sin(x / 17) + 4 * Math.sin(x / 7 + 1)); R(ctx, '#6fa86a', x, h, 1, base - h); R(ctx, '#86bd7a', x, h, 1, 1); }
  const cols = ['#f3c6a0', '#e98bb0', '#f4c542', '#8fd6cf', '#fff8ef', '#c3a3e0', '#f08a3c', '#9cc1ef'];
  for (let i = 0; i < 46; i++) { const x = (i * 29) % 156, top = Math.round(24 + 7 * Math.sin(x / 17) + 4 * Math.sin(x / 7 + 1)) + 2 + (i * 5) % 14; if (top > base - 6) continue;
    R(ctx, '#00000033', x + 1, top + 1, 6, 5); R(ctx, cols[i % 8], x, top, 6, 5); R(ctx, '#2b223388', x + 2, top + 2, 1, 2); R(ctx, '#ffffff66', x, top, 6, 1); if (i % 3 === 0) R(ctx, '#4a78c9', x + 4, top - 2, 2, 2); }
}
function caixaAgua(ctx, x, y) { R(ctx, 'ink', x - 1, y - 1, 9, 7); R(ctx, '#3f8fd9', x, y, 7, 5); R(ctx, '#7fbcf0', x + 1, y, 5, 1); R(ctx, '#2c64a8', x, y + 4, 7, 1); }
function predioBR(ctx, x, y, w, base, c, shade, k, loja) {
  const h = base - y;
  R(ctx, '#00000026', x + 2, y + 2, w, h); /* sombra no chão/parede de trás */
  R(ctx, 'ink', x - 1, y - 1, w + 2, h + 1); R(ctx, c, x, y, w, h); R(ctx, shade, x + w - 2, y, 2, h);
  for (let j = y + 2; j < base; j += 3) R(ctx, '#0000000c', x, j, w - 2, 1);
  R(ctx, '#ffffff55', x, y, w, 1);
  caixaAgua(ctx, x + 2 + (k % 2) * (w - 11), y - 6);
  if (k % 3 === 1) { R(ctx, 'ink', x + w - 4, y - 8, 1, 8); R(ctx, 'ink', x + w - 6, y - 7, 5, 1); }
  /* andares com sacada de grade, janelas e ar-condicionado */
  let n = 0;
  for (let wy = y + 3; wy < base - 15; wy += 7) {
    for (let wx = x + 2; wx < x + w - 5; wx += 6) {
      const v = (k * 5 + n++ * 3) % 6;
      R(ctx, 'ink', wx, wy, 4, 5); R(ctx, v === 0 ? '#ffd65e' : v === 1 ? 'navy' : 'glass', wx + 1, wy + 1, 2, 3);
      if (v === 2) R(ctx, 'pink', wx + 1, wy + 1, 1, 3);
      if (v === 4) { R(ctx, 'ink', wx + 4, wy + 3, 3, 2); R(ctx, 'greyL', wx + 4, wy + 3, 2, 1); }
    }
    /* sacada: piso + grade */
    R(ctx, shade, x, wy + 5, w - 2, 1); for (let gx = x + 1; gx < x + w - 2; gx += 2) R(ctx, '#2b223366', gx, wy + 3, 1, 2);
    if ((k + wy) % 3 === 0) { R(ctx, 'ink', x + 3, wy + 2, w - 8, 1); R(ctx, ['red', 'yellow', 'blue', 'white'][(wy + k) % 4], x + 4, wy + 3, 2, 2); R(ctx, ['white', 'pink', 'green'][k % 3], x + 8, wy + 3, 2, 2); }
  }
  /* térreo: loja com letreiro, porta de aço e vitrine */
  R(ctx, 'ink', x - 1, base - 15, w + 2, 15);
  R(ctx, '#e9e3d6', x, base - 14, w, 14);
  if (loja) sign(ctx, x + 1, base - 14, w - 2, loja[0], loja[1], loja[2]);
  R(ctx, 'ink', x + 2, base - 6, w - 4, 6); R(ctx, '#9aa3ad', x + 3, base - 5, w - 6, 5); for (let j = base - 5; j < base; j += 2) R(ctx, '#7c8591', x + 3, j, w - 6, 1);
  if (loja && loja[0] === 'FARMA') { R(ctx, 'white', x + w - 6, base - 22, 5, 5); R(ctx, 'green', x + w - 5, base - 21, 3, 3); R(ctx, 'white', x + w - 4, base - 21, 1, 3); R(ctx, 'white', x + w - 5, base - 20, 3, 1); }
}
function posteBR(ctx, x, top, base) { R(ctx, '#00000033', x + 1, base - 1, 5, 1); R(ctx, 'ink', x - 1, top, 4, base - top); R(ctx, '#b9b6ad', x, top, 2, base - top); R(ctx, 'ink', x - 4, top + 2, 10, 1); R(ctx, 'ink', x - 2, top + 6, 6, 3); R(ctx, '#5d6573', x - 1, top + 7, 4, 1); R(ctx, 'ink', x + 2, top - 1, 6, 2); R(ctx, '#fff1a8', x + 5, top + 1, 2, 1); }
function fios(ctx, xs, y) { for (let w = 0; w < 3; w++) for (let i = 0; i < xs.length - 1; i++) { const a = xs[i], b = xs[i + 1]; for (let x = a; x <= b; x++) { const t = (x - a) / (b - a), sag = Math.sin(t * Math.PI) * (3 + w); R(ctx, '#2b2233aa', x, Math.round(y + w * 2 + sag), 1, 1); } } }
function orelhao(ctx, x, base) { R(ctx, 'ink', x + 3, base - 13, 2, 13); R(ctx, '#00000033', x, base - 1, 8, 1); R(ctx, 'ink', x - 1, base - 20, 10, 9); R(ctx, '#2f7fd0', x, base - 19, 8, 7); R(ctx, '#f08a3c', x, base - 19, 8, 2); R(ctx, 'greyD', x + 3, base - 16, 2, 3); }
function banca(ctx, x, base) { R(ctx, '#00000033', x + 1, base - 1, 22, 1); R(ctx, 'ink', x - 1, base - 19, 24, 19); R(ctx, '#2e8b57', x, base - 18, 22, 18); R(ctx, '#3cae6e', x, base - 18, 22, 3); sign(ctx, x + 1, base - 17, 20, 'BANCA', 'yellow', 'ink');
  for (let i = 0; i < 4; i++) { R(ctx, ['red', 'white', 'blue', 'yellow'][i], x + 2 + i * 4, base - 9, 3, 4); R(ctx, '#2b223355', x + 2 + i * 4, base - 6, 3, 1); } R(ctx, 'ink', x, base - 3, 20, 1); }
function ipe(ctx, x, base) { R(ctx, '#00000030', x - 2, base - 1, 18, 2); R(ctx, 'ink', x + 5, base - 14, 4, 14); R(ctx, 'brown', x + 6, base - 14, 2, 14); R(ctx, 'ink', x - 2, base - 28, 18, 15);
  R(ctx, '#f4c542', x - 1, base - 27, 16, 13); R(ctx, '#ffd84d', x + 1, base - 29, 12, 3); for (let i = 0; i < 18; i++) R(ctx, i % 3 ? '#fff1a8' : '#d9a520', x - 1 + (i * 7) % 16, base - 27 + (i * 5) % 12, 1, 1); }
function calcadaPortuguesa(ctx, y, h) { R(ctx, '#f3efe6', 0, y, SW, h); for (let x = 0; x < SW; x++) { const yy = Math.round(y + h / 2 + Math.sin(x / 4) * (h / 2 - 1)); R(ctx, '#2b2233', x, yy, 1, 1); } R(ctx, 'white', 0, y + h, SW, 1); R(ctx, '#d3d0c6', 0, y + h + 1, SW, 1); }
function muroGrafite(ctx, x, y, w, h) { R(ctx, 'ink', x - 1, y - 1, w + 2, h + 1); R(ctx, '#e9e3d6', x, y, w, h); const c = ['#e0705a', '#f4c542', '#3fa7a0', '#8f5fb8', '#4a78c9'];
  for (let i = 0; i < w; i += 6) { R(ctx, c[(i / 6) % 5], x + i, y + 3 + (i % 4), 5, h - 6 - (i % 4)); R(ctx, '#ffffff88', x + i + 1, y + 4 + (i % 4), 2, 1); } R(ctx, '#b9b2a4', x, y, w, 1); }

const SCENES = {
  sala(ctx) {
    R(ctx, 'cream', 0, 0, SW, 64); stripes(ctx, '#ead8b8', 0, 0, SW, 64, 6);
    R(ctx, 'brownL', 0, 62, SW, 2);
    R(ctx, 'tan', 0, 64, SW, 26); stripes(ctx, 'brownL', 0, 66, SW, 24, 8, false);
    windowPx(ctx, 14, 12, 26, 22);
    R(ctx, 'red', 10, 10, 4, 30); R(ctx, 'red', 40, 10, 4, 30);
    /* sofá */
    R(ctx, 'ink', 47, 41, 46, 25); R(ctx, 'blue', 48, 42, 44, 12); R(ctx, 'blueD', 48, 54, 44, 10); R(ctx, 'blueL', 50, 44, 18, 8); R(ctx, 'blueL', 71, 44, 18, 8);
    R(ctx, 'ink', 46, 50, 5, 15); R(ctx, 'blue', 47, 51, 3, 13); R(ctx, 'ink', 89, 50, 5, 15); R(ctx, 'blue', 90, 51, 3, 13);
    /* tapete */
    R(ctx, 'ink', 40, 72, 64, 12); R(ctx, 'pink', 41, 73, 62, 10); stripes(ctx, 'pinkD', 43, 75, 58, 6, 6);
    /* quadro */
    R(ctx, 'ink', 60, 14, 22, 16); R(ctx, 'yellow', 61, 15, 20, 14); R(ctx, 'green', 63, 22, 16, 5); R(ctx, 'orange', 72, 18, 4, 4);
    /* cozinha à direita */
    R(ctx, 'greyL', 112, 0, 48, 64); checker(ctx, 'white', 'greyL', 112, 20, 48, 22, 4);
    R(ctx, 'ink', 111, 41, 49, 25); R(ctx, 'white', 112, 42, 48, 23); R(ctx, 'greyD', 112, 42, 48, 3);
    R(ctx, 'ink', 116, 47, 18, 14); R(ctx, 'greyL', 117, 48, 16, 12); R(ctx, 'ink', 140, 47, 16, 14); R(ctx, 'greyL', 141, 48, 14, 12);
    R(ctx, 'ink', 118, 39, 4, 2); R(ctx, 'ink', 126, 39, 4, 2);
    R(ctx, 'brownD', 104, 0, 4, 64);
  },
  portaria(ctx) {
    R(ctx, 'tealL', 0, 0, SW, 62); checker(ctx, 'tealL', '#a7e0da', 0, 0, SW, 62, 8);
    R(ctx, 'greyL', 0, 62, SW, 28); checker(ctx, 'greyL', 'white', 0, 62, SW, 28, 7);
    /* porta de vidro */
    R(ctx, 'ink', 6, 10, 38, 53); R(ctx, 'greyD', 7, 11, 36, 51); R(ctx, 'glass', 9, 13, 15, 47); R(ctx, 'glass', 26, 13, 15, 47); R(ctx, 'white', 11, 15, 2, 12); R(ctx, 'white', 28, 15, 2, 12);
    R(ctx, 'ink', 6, 4, 38, 6); R(ctx, 'navy', 7, 5, 36, 4); R(ctx, 'yellow', 12, 6, 26, 2);
    /* escaninhos */
    R(ctx, 'ink', 108, 8, 46, 34); R(ctx, 'brownL', 109, 9, 44, 32);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { R(ctx, 'brownD', 111 + i * 11, 11 + j * 10, 9, 8); R(ctx, 'tan', 112 + i * 11, 12 + j * 10, 7, 2); }
    /* balcão */
    R(ctx, 'ink', 52, 46, 54, 22); R(ctx, 'brown', 53, 47, 52, 20); R(ctx, 'brownL', 53, 47, 52, 3); R(ctx, 'brownD', 53, 62, 52, 5);
    R(ctx, 'ink', 50, 44, 58, 3);
    /* luminária */
    R(ctx, 'ink', 76, 0, 2, 8); R(ctx, 'ink', 70, 8, 14, 4); R(ctx, 'yellowL', 71, 9, 12, 2);
  },
  cozinha(ctx) {
    R(ctx, 'white', 0, 0, SW, 64); checker(ctx, 'white', 'tealL', 0, 0, SW, 64, 6);
    R(ctx, 'greyD', 0, 64, SW, 26); checker(ctx, 'greyD', 'grey', 0, 64, SW, 26, 8);
    windowPx(ctx, 60, 6, 40, 20);
    /* bancada */
    R(ctx, 'ink', 0, 44, SW, 22); R(ctx, 'greyL', 0, 45, SW, 5); R(ctx, 'grey', 0, 50, SW, 15);
    for (let i = 4; i < SW; i += 22) { R(ctx, 'greyD', i, 52, 18, 11); R(ctx, 'greyL', i + 7, 56, 4, 1); }
    /* fogão industrial */
    R(ctx, 'ink', 104, 36, 52, 10); R(ctx, 'greyD', 105, 37, 50, 8); R(ctx, 'ink', 110, 39, 10, 3); R(ctx, 'ink', 128, 39, 10, 3); R(ctx, 'ink', 144, 39, 8, 3);
    /* prateleira */
    R(ctx, 'ink', 4, 18, 46, 3); R(ctx, 'brownL', 5, 18, 44, 2);
    R(ctx, 'red', 8, 11, 6, 7); R(ctx, 'yellow', 16, 12, 5, 6); R(ctx, 'green', 23, 10, 6, 8); R(ctx, 'blueL', 31, 12, 8, 6);
  },
  salaaula(ctx) {
    R(ctx, 'yellowL', 0, 0, SW, 62); R(ctx, '#f0dc8c', 0, 50, SW, 12);
    R(ctx, 'tan', 0, 62, SW, 28); stripes(ctx, 'brownL', 0, 62, SW, 28, 10);
    R(ctx, 'ink', 40, 6, 80, 36); R(ctx, 'brownL', 41, 7, 78, 34); R(ctx, 'greenD', 43, 9, 74, 30);
    R(ctx, 'white', 48, 14, 20, 1); R(ctx, 'white', 48, 18, 30, 1); R(ctx, 'white', 48, 22, 14, 1); R(ctx, 'yellowL', 90, 14, 10, 10);
    windowPx(ctx, 6, 10, 26, 26); windowPx(ctx, 128, 10, 26, 26);
    for (const [x, y] of [[20, 62], [70, 62], [120, 62]]) {
      R(ctx, 'ink', x - 1, y - 1, 26, 6); R(ctx, 'brownL', x, y, 24, 4); R(ctx, 'greyD', x + 2, y + 4, 2, 12); R(ctx, 'greyD', x + 20, y + 4, 2, 12);
    }
  },
  ruacasas(ctx) {
    sky(ctx, 'sky', 58); morro(ctx, 46);
    house(ctx, 6, 28, 34, 30, 'yellowL', 'orangeD'); house(ctx, 50, 22, 30, 36, 'tealL', 'orangeD'); house(ctx, 92, 30, 28, 28, 'pink', 'red'); house(ctx, 128, 26, 30, 32, 'greenL', 'orangeD');
    caixaAgua(ctx, 30, 14); caixaAgua(ctx, 70, 8); caixaAgua(ctx, 146, 12);
    for (const x of [0, 44, 84, 124]) { R(ctx, 'ink', x, 50, 4, 8); R(ctx, '#e9e3d6', x + 1, 51, 2, 7); }
    for (let x = 4; x < SW; x += 3) if (!((x > 18 && x < 28) || (x > 60 && x < 70) || (x > 100 && x < 110) || (x > 138 && x < 148))) R(ctx, '#2b223399', x, 51, 1, 7);
    R(ctx, '#2b223399', 0, 51, SW, 1);
    sidewalk(ctx, 58, 7); R(ctx, 'white', 0, 65, SW, 2);
    road(ctx, 67, 23, 64);
    posteBR(ctx, 46, 14, 60); posteBR(ctx, 122, 14, 60); fios(ctx, [0, 47, 123, 160], 15);
    ipe(ctx, 84, 60);
    put(ctx, 'vaso', 42, 42); put(ctx, 'hidrante', 122, 42);
  },

  quarto(ctx) {
    R(ctx, 'purpleL', 0, 0, SW, 64);
    for (let y = 4; y < 60; y += 12) for (let x = (y / 12 % 2) * 8 + 4; x < SW; x += 16) { R(ctx, 'pink', x, y, 3, 3); R(ctx, 'white', x + 1, y + 1, 1, 1); }
    R(ctx, 'brownL', 0, 62, SW, 28); stripes(ctx, 'brown', 0, 62, SW, 28, 9, false);
    windowPx(ctx, 64, 8, 30, 24); R(ctx, 'yellow', 60, 6, 4, 32); R(ctx, 'yellow', 94, 6, 4, 32);
    /* poltrona */
    R(ctx, 'ink', 9, 33, 38, 34); R(ctx, 'redD', 10, 34, 36, 30); R(ctx, 'red', 14, 38, 28, 16); R(ctx, 'redD', 10, 54, 36, 6); R(ctx, 'brownD', 12, 64, 3, 4); R(ctx, 'brownD', 41, 64, 3, 4);
    /* mesinha */
    R(ctx, 'ink', 104, 52, 34, 4); R(ctx, 'brown', 105, 53, 32, 2); R(ctx, 'brownD', 108, 56, 3, 12); R(ctx, 'brownD', 131, 56, 3, 12);
    /* tapete preso */
    R(ctx, 'ink', 50, 75, 50, 10); R(ctx, 'teal', 51, 76, 48, 8);
    /* fotos na parede */
    R(ctx, 'ink', 112, 12, 14, 12); R(ctx, 'white', 113, 13, 12, 10); R(ctx, 'sky', 114, 14, 10, 5); R(ctx, 'ink', 130, 16, 12, 10); R(ctx, 'white', 131, 17, 10, 8); R(ctx, 'pink', 132, 18, 8, 4);
  },
  feira(ctx) {
    sky(ctx, 'sky', 50);
    R(ctx, 'greyL', 0, 50, SW, 40); checker(ctx, 'greyL', '#c6ccd3', 0, 50, SW, 40, 10);
    const stall = (x, c1, goods) => {
      R(ctx, 'ink', x - 1, 14, 46, 9); for (let i = 0; i < 44; i += 8) R(ctx, i % 16 ? 'white' : c1, x + i, 15, 8, 7);
      R(ctx, 'brownD', x + 1, 22, 2, 34); R(ctx, 'brownD', x + 41, 22, 2, 34);
      R(ctx, 'ink', x - 1, 44, 46, 10); R(ctx, 'brownL', x, 45, 44, 8);
      goods.forEach((g, i) => { R(ctx, 'ink', x + 3 + i * 10, 39, 9, 7); R(ctx, g, x + 4 + i * 10, 40, 7, 5); });
    };
    stall(4, 'red', ['red', 'orange', 'greenL', 'yellow']); stall(58, 'green', ['greenL', 'green', 'purple', 'red']); stall(112, 'blue', ['yellow', 'orange', 'tan', 'red']);
  },
  cooperativa(ctx) {
    R(ctx, 'greyL', 0, 0, SW, 60); stripes(ctx, 'grey', 0, 0, SW, 60, 12);
    R(ctx, 'ink', 0, 0, SW, 6); R(ctx, 'greyD', 0, 0, SW, 5);
    R(ctx, 'ink', 6, 10, 70, 14); R(ctx, 'green', 7, 11, 68, 12); R(ctx, 'white', 10, 14, 62, 6);
    R(ctx, 'tan', 0, 60, SW, 30); stripes(ctx, 'brownL', 0, 60, SW, 30, 14);
    /* esteira */
    R(ctx, 'ink', 20, 44, 120, 10); R(ctx, 'greyD', 21, 45, 118, 6); stripes(ctx, 'ink', 22, 45, 116, 6, 6); R(ctx, 'grey', 26, 54, 3, 12); R(ctx, 'grey', 130, 54, 3, 12);
    /* fardos */
    for (const [x, c] of [[90, 'blueL'], [112, 'greyL'], [134, 'red']]) { R(ctx, 'ink', x - 1, 12, 22, 22); R(ctx, c, x, 13, 20, 20); stripes(ctx, 'ink', x, 13, 20, 20, 7, false); }
  },
  parque(ctx) {
    sky(ctx, 'sky', 40);
    R(ctx, 'greenL', 0, 40, SW, 50); R(ctx, 'green', 0, 40, SW, 3);
    R(ctx, 'ink', 92, 58, 64, 26); R(ctx, 'blue', 93, 59, 62, 24); R(ctx, 'blueL', 98, 64, 18, 2); R(ctx, 'blueL', 124, 74, 14, 2);
    R(ctx, 'tan', 0, 70, 92, 8); R(ctx, 'tan', 40, 44, 12, 34);
    tree(ctx, 4, 12, 1.5); tree(ctx, 60, 14, 1.3, 'greenD'); tree(ctx, 128, 10, 1.4);
    for (let x = 6; x < 40; x += 7) { R(ctx, 'green', x, 80, 1, 3); R(ctx, 'green', x + 3, 84, 1, 3); }
    for (const [x, y, c] of [[30, 50, 'pink'], [36, 52, 'yellow'], [84, 46, 'red'], [140, 50, 'pink'], [150, 46, 'yellow']]) { R(ctx, 'green', x, y + 2, 1, 3); R(ctx, c, x - 1, y, 3, 2); }
  },
  rua(ctx) {
    sky(ctx, '#ffd9a8', 50); R(ctx, '#ffe9c7', 0, 0, SW, 20); morro(ctx, 44);
    house(ctx, 4, 22, 30, 28, 'cream', 'orangeD'); house(ctx, 44, 16, 36, 34, 'blueL', 'orangeD'); house(ctx, 92, 24, 28, 26, 'yellowL', 'red'); house(ctx, 130, 20, 26, 30, 'pink', 'brownD');
    caixaAgua(ctx, 70, 4); caixaAgua(ctx, 22, 10);
    R(ctx, 'ink', 96, 18, 18, 1); R(ctx, 'red', 99, 19, 3, 3); R(ctx, 'white', 104, 19, 3, 4); R(ctx, 'blue', 109, 19, 3, 3);
    muroGrafite(ctx, 0, 42, 44, 8); muroGrafite(ctx, 120, 42, 40, 8);
    sidewalk(ctx, 50, 14); R(ctx, 'white', 0, 64, SW, 2);
    road(ctx, 66, 24, null);
    posteBR(ctx, 86, 18, 52); fios(ctx, [0, 87, 160], 19);
    for (let i = 0; i < 4; i++) { R(ctx, 'white', 112 + i * 7, 56, 6, 1); R(ctx, 'white', 112 + i * 7, 61, 6, 1); R(ctx, 'white', 112 + i * 7, 56, 1, 6); }
    put(ctx, 'hidrante', 2, 40); put(ctx, 'vaso', 36, 38);
  },

  ruanoite(ctx) {
    R(ctx, 'night', 0, 0, SW, 50); for (const [x, y] of [[10, 6], [40, 12], [70, 4], [104, 9], [140, 5], [150, 18], [24, 20]]) R(ctx, 'yellowL', x, y, 1, 1);
    R(ctx, 'white', 128, 6, 8, 8); R(ctx, 'night', 131, 5, 8, 7);
    house(ctx, 4, 22, 30, 28, '#5a5f86', '#3a3f66'); house(ctx, 44, 16, 36, 34, '#4f6b8a', '#33405e'); house(ctx, 92, 24, 28, 26, '#6b5f86', '#423a5e'); house(ctx, 130, 20, 26, 30, '#5a5f86', '#3a3f66');
    R(ctx, '#4b5068', 0, 50, SW, 14); R(ctx, '#3d4158', 0, 63, SW, 3); R(ctx, 'nightD', 0, 66, SW, 24); for (let i = 6; i < SW; i += 24) R(ctx, '#7a7f96', i, 78, 12, 2);
    for (const x of [30, 110]) { R(ctx, 'greyD', x, 14, 2, 38); R(ctx, 'greyD', x, 14, 9, 2); R(ctx, '#7a7f96', x + 6, 16, 5, 2); }
  },
  festa(ctx) {
    R(ctx, 'night', 0, 0, SW, 56); for (const [x, y, c] of [[14, 8, 'yellow'], [44, 4, 'pink'], [80, 10, 'tealL'], [120, 5, 'yellow'], [146, 12, 'pink']]) { R(ctx, c, x, y, 2, 2); R(ctx, c, x - 2, y + 0, 1, 1); }
    house(ctx, 4, 26, 30, 30, 'yellowL', 'red', true); house(ctx, 44, 20, 36, 36, 'tealL', 'blueD', true); house(ctx, 92, 28, 28, 28, 'pink', 'brown', true); house(ctx, 128, 24, 30, 32, 'greenL', 'redD', true);
    R(ctx, 'tan', 0, 56, SW, 34); checker(ctx, 'tan', '#e8c896', 0, 56, SW, 34, 8);
    for (let i = 0; i < SW; i += 8) { const y = 18 + Math.round(Math.sin(i / 25) * 3); R(ctx, ['red', 'yellow', 'teal', 'pink', 'green'][(i / 8) % 5], i + 2, y, 4, 4); R(ctx, 'ink', i, y - 1, 8, 1); }
  },
  cidade(ctx) {
    skyGrad(ctx, 'skyD', 'sky', 60); morro(ctx, 52);
    const lojas = [['PADOCA', 'yellow', 'brownD'], ['FARMA', 'green', 'white'], ['LANCHE', 'red', 'white'], ['BAR', 'blue', 'white'], ['SALAO', 'pink', 'ink'], ['FEIRA', 'orange', 'ink']];
    const b = [[1, 22, 26, 'cream', 'tan'], [29, 12, 26, 'tealL', 'teal'], [57, 26, 22, 'pink', 'pinkD'], [81, 8, 26, 'yellowL', 'yellowD'], [109, 20, 24, 'blueL', 'blue'], [135, 14, 25, 'greenL', 'green']];
    b.forEach(([x, y, w, c, sh], k) => predioBR(ctx, x, y, w, 60, c, sh, k, lojas[k]));
    calcadaPortuguesa(ctx, 60, 5); R(ctx, 'white', 0, 66, SW, 1);
    road(ctx, 67, 23, 72);
    posteBR(ctx, 24, 30, 64); posteBR(ctx, 96, 30, 64); posteBR(ctx, 150, 30, 64); fios(ctx, [0, 25, 97, 151, 160], 31);
    ipe(ctx, 4, 64); orelhao(ctx, 70, 64); banca(ctx, 112, 64);
  }
};

/* compõe um cenário com objetos e elenco, devolve canvas */
function composeScene(key, items = [], cast = []) {
  const c = mkCanvas(SW, SH), ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  (SCENES[key] || SCENES.cidade)(ctx);
  for (const it of items) if (!it.hidden && it.prop) put(ctx, it.prop, it.x, it.y, it.mode, it.flip);
  for (const m of cast) put(ctx, m.id, m.x, m.y, m.mode, m.flip);
  return c;
}
