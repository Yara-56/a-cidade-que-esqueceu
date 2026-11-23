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
    sky(ctx, 'sky', 58);
    house(ctx, 6, 28, 34, 30, 'yellowL', 'red'); house(ctx, 50, 22, 30, 36, 'tealL', 'blueD'); house(ctx, 92, 30, 28, 28, 'pink', 'brown'); house(ctx, 128, 26, 30, 32, 'greenL', 'redD');
    sidewalk(ctx, 58, 7);
    road(ctx, 67, 23, 64);
    put(ctx, 'vaso', 42, 42); put(ctx, 'vaso', 84, 42); put(ctx, 'hidrante', 122, 42);
    R(ctx, 'ink', 140, 8, 6, 2); R(ctx, 'pink', 141, 6, 4, 2);
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
    sky(ctx, '#ffd9a8', 50); R(ctx, '#ffe9c7', 0, 0, SW, 20);
    house(ctx, 4, 22, 30, 28, 'cream', 'orangeD'); house(ctx, 44, 16, 36, 34, 'blueL', 'navy'); house(ctx, 92, 24, 28, 26, 'yellowL', 'red'); house(ctx, 130, 20, 26, 30, 'pink', 'brownD');
    sidewalk(ctx, 50, 14); R(ctx, 'grey', 0, 64, SW, 2);
    road(ctx, 66, 24, null);
    R(ctx, 'greyD', 86, 18, 2, 34); R(ctx, 'greyD', 86, 18, 9, 2); R(ctx, 'greyL', 92, 20, 5, 2);
    /* amarelinha na calçada e detalhes */
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
    skyGrad(ctx, 'skyD', 'sky', 62); skyline(ctx, '#9fc7e3', 56);
    const b = [[2, 26, 21, 'pink', 'pinkD'], [25, 14, 18, 'yellowL', 'yellowD'], [45, 30, 16, 'tealL', 'teal'], [63, 8, 22, 'purpleL', 'purple'], [87, 22, 18, 'greenL', 'green'], [107, 12, 20, 'blueL', 'blue'], [129, 28, 14, 'cream', 'tan'], [145, 18, 15, 'orange', 'orangeD']];
    b.forEach(([x, y, w, c, sh], k) => building(ctx, x, y, w, 60, c, sh, k));
    sidewalk(ctx, 60, 6); road(ctx, 67, 23, 72);
    lamp(ctx, 22, 36, 24); lamp(ctx, 104, 36, 24);
    tree(ctx, 30, 44, 1); tree(ctx, 118, 46, 1);
    busStop(ctx, 135, 46);
    put(ctx, 'hidrante', 66, 46); put(ctx, 'bancoparque', 88, 50);
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
