/* ============================================================
   A CIDADE QUE ESQUECEU — Pixel art gerada por código
   Paleta única + objetos (props) + personagens montáveis
   ============================================================ */
'use strict';

const PAL = {
  ink: '#2b2233', inkL: '#4a4058', white: '#fff8ef', cream: '#f3e6cf', paper: '#fbf3e4',
  red: '#d9534f', redD: '#a63d3d', orange: '#f08a3c', orangeD: '#c8652a',
  yellow: '#f4c542', yellowD: '#c99a2a', yellowL: '#fff1a8',
  green: '#5cae6a', greenD: '#3d7f4c', greenL: '#a5d97f',
  teal: '#3fa7a0', tealD: '#2b7a76', tealL: '#8fd6cf',
  blue: '#4a78c9', blueD: '#33549a', blueL: '#9cc1ef', navy: '#2f3f6b',
  purple: '#8f5fb8', purpleL: '#c3a3e0', pink: '#e98bb0', pinkD: '#c0607f',
  brown: '#8b5a2b', brownD: '#5e3c1e', brownL: '#c08a55', tan: '#dcb683',
  grey: '#9aa3ad', greyD: '#5d6573', greyL: '#d3d8de',
  sky: '#a8dcf2', skyD: '#7fbfe0', night: '#27305a', nightD: '#1b2142', glass: '#cfeef7',
  s1: '#f6d3b3', s2: '#e0aa7e', s3: '#b97a4e', s4: '#7d4e31',
  vest: '#c6f05a', caramel: '#c98a3e', caramelD: '#8f5a26', caramelL: '#e6b574'
};

/* ---------- utilidades de canvas ---------- */
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function col(k) { return PAL[k] || k; }
function drawOps(ctx, ops, ox = 0, oy = 0) {
  for (const o of ops) { ctx.fillStyle = col(o[0]); ctx.fillRect(ox + o[1], oy + o[2], o[3], o[4]); }
}
/* contorno automático de 1px em volta de tudo que não é transparente */
function outlined(src, color = PAL.ink) {
  const w = src.width, h = src.height;
  const d = src.getContext('2d').getImageData(0, 0, w, h).data;
  const out = mkCanvas(w + 2, h + 2), ctx = out.getContext('2d');
  const img = ctx.createImageData(w + 2, h + 2), o = img.data;
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const rgb = hexRgb(color);
  for (let y = 0; y < h + 2; y++) for (let x = 0; x < w + 2; x++) {
    const sx = x - 1, sy = y - 1, i = (y * (w + 2) + x) * 4;
    if (op(sx, sy)) { const j = (sy * w + sx) * 4; o[i] = d[j]; o[i + 1] = d[j + 1]; o[i + 2] = d[j + 2]; o[i + 3] = 255; }
    else if (op(sx - 1, sy) || op(sx + 1, sy) || op(sx, sy - 1) || op(sx, sy + 1)) { o[i] = rgb[0]; o[i + 1] = rgb[1]; o[i + 2] = rgb[2]; o[i + 3] = 255; }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}
function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
/* filtros de pixel: cinza (esquecido) e silhueta (mistério) */
function filtered(src, mode, amount = 1) {
  const w = src.width, h = src.height, out = mkCanvas(w, h), ctx = out.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  const sil = hexRgb('#4b4760'), silL = hexRgb('#6d6884');
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    if (mode === 'gray') {
      const g = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11;
      const t = g * .85 + 30;
      d[i] = d[i] + (t - d[i]) * amount; d[i + 1] = d[i + 1] + (t - d[i + 1]) * amount; d[i + 2] = d[i + 2] + (t + 8 - d[i + 2]) * amount;
    } else if (mode === 'sil') {
      const dark = d[i] + d[i + 1] + d[i + 2] < 200;
      const c = dark ? sil : silL; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

/* ============================================================
   OBJETOS (16x16, contorno automático)
   cada operação: [cor, x, y, largura, altura]
   'top' = desenhado depois do contorno (vapor, água, brilho)
   ============================================================ */
/* carros com proporção de verdade (32x14) e ônibus (48x22) */
function carOps(C, CD, CL, glass = 'glass') {
  return [[C, 1, 6, 30, 5], [C, 7, 2, 15, 4], [C, 6, 4, 1, 2], [C, 22, 3, 2, 3], [C, 24, 5, 3, 1],
    [glass, 8, 3, 6, 3], [glass, 15, 3, 6, 3], ['white', 9, 3, 2, 1], ['white', 16, 3, 2, 1], [CD, 14, 3, 1, 3],
    [CL, 2, 6, 27, 1], [CD, 1, 10, 30, 1], [CD, 14, 7, 1, 3], ['white', 11, 8, 2, 1], ['white', 18, 8, 2, 1], [CD, 23, 5, 1, 1],
    ['yellowL', 29, 7, 2, 2], ['red', 1, 7, 1, 2], ['greyD', 0, 9, 2, 2], ['greyD', 29, 9, 3, 2],
    ['ink', 4, 9, 6, 5], ['ink', 21, 9, 6, 5], ['ink', 5, 8, 4, 1], ['ink', 22, 8, 4, 1], ['greyL', 6, 10, 2, 2], ['greyL', 23, 10, 2, 2], ['grey', 6, 12, 2, 1], ['grey', 23, 12, 2, 1]];
}
const PROPS = {
  roupa: { ops: [['blue', 1, 11, 14, 4], ['blueD', 1, 13, 14, 1], ['pink', 2, 7, 12, 4], ['pinkD', 2, 9, 12, 1], ['yellow', 1, 3, 14, 4], ['yellowD', 1, 5, 14, 1], ['white', 6, 3, 4, 1]] },
  panela: { ops: [['greyD', 3, 7, 10, 7], ['grey', 2, 6, 12, 2], ['greyL', 4, 8, 2, 4], ['greyD', 0, 8, 2, 2], ['greyD', 14, 8, 2, 2], ['brownD', 4, 6, 8, 1]], top: [['white', 5, 0, 1, 2], ['white', 6, 2, 1, 2], ['white', 10, 1, 1, 2], ['white', 9, 3, 1, 2]] },
  planta: { ops: [['brownL', 4, 11, 8, 5], ['brown', 3, 10, 10, 2], ['brownD', 4, 10, 8, 1], ['green', 7, 2, 2, 8], ['green', 2, 4, 5, 3], ['green', 9, 3, 5, 3], ['greenL', 3, 4, 2, 1], ['greenL', 11, 3, 2, 1], ['greenD', 7, 7, 2, 1]], top: [['blueL', 5, 12, 1, 1], ['blueL', 9, 13, 1, 1]] },
  brinquedos: { ops: [['red', 1, 8, 14, 8], ['redD', 1, 8, 14, 2], ['yellow', 2, 3, 5, 5], ['yellowD', 3, 4, 1, 1], ['brownL', 9, 2, 5, 6], ['brownL', 8, 1, 2, 2], ['brownL', 13, 1, 2, 2], ['ink', 10, 4, 1, 1], ['ink', 12, 4, 1, 1]] },
  tv: { ops: [['greyD', 0, 2, 16, 10], ['night', 1, 3, 14, 8], ['greyD', 6, 12, 4, 2], ['greyD', 4, 14, 8, 2]], top: [['nightD', 3, 5, 3, 1]] },
  gato: { ops: [['orange', 1, 9, 12, 6], ['orange', 9, 5, 6, 6], ['orange', 9, 3, 2, 2], ['orange', 13, 3, 2, 2], ['orangeD', 4, 9, 1, 5], ['orangeD', 7, 9, 1, 5], ['ink', 10, 8, 2, 1], ['ink', 13, 8, 1, 1], ['pink', 12, 9, 1, 1], ['orange', 0, 13, 3, 2]] },
  balde: { ops: [['blue', 3, 6, 9, 9], ['blueD', 2, 5, 11, 2], ['blueL', 4, 8, 2, 5], ['yellow', 10, 11, 6, 4], ['yellowD', 10, 13, 6, 1], ['grey', 4, 2, 7, 1], ['grey', 3, 3, 1, 2], ['grey', 11, 3, 1, 2]] },
  caixa: { ops: [['tan', 1, 4, 14, 11], ['brownL', 1, 4, 14, 3], ['cream', 7, 4, 2, 11], ['brownL', 2, 11, 4, 2]] },
  racao: { ops: [['red', 3, 1, 10, 14], ['redD', 3, 1, 10, 2], ['yellow', 4, 5, 8, 6], ['white', 5, 7, 6, 2], ['white', 4, 6, 2, 2], ['white', 10, 8, 2, 2]] },
  violao: { ops: [['brownL', 3, 9, 10, 7], ['brownL', 4, 6, 8, 4], ['brown', 4, 13, 8, 2], ['brownD', 7, 0, 2, 7], ['brownD', 7, 11, 2, 2], ['yellow', 6, 0, 4, 1]] },
  sementes: { ops: [['greenL', 3, 1, 10, 14], ['green', 3, 1, 10, 2], ['white', 5, 5, 6, 6], ['yellow', 7, 6, 2, 2], ['pink', 6, 7, 1, 1], ['pink', 9, 7, 1, 1], ['green', 7, 8, 2, 2], ['brownD', 5, 12, 6, 1]] },
  pneu: { ops: [['ink', 4, 1, 8, 2], ['ink', 4, 13, 8, 2], ['ink', 1, 4, 2, 8], ['ink', 13, 4, 2, 8], ['ink', 2, 2, 3, 3], ['ink', 11, 2, 3, 3], ['ink', 2, 11, 3, 3], ['ink', 11, 11, 3, 3], ['greyL', 7, 3, 2, 10], ['greyL', 3, 7, 10, 2], ['grey', 6, 6, 4, 4]] },
  fraldas: { ops: [['blueL', 2, 2, 12, 13], ['blue', 2, 2, 12, 2], ['white', 4, 6, 8, 6], ['pink', 6, 8, 4, 2], ['yellow', 5, 7, 1, 1]] },
  touca: { ops: [['brown', 7, 0, 2, 3], ['white', 4, 3, 8, 3], ['white', 3, 6, 10, 9], ['cream', 3, 9, 10, 1], ['orange', 5, 10, 6, 4], ['orangeD', 5, 10, 6, 1]] },
  panelao: { ops: [['grey', 1, 5, 14, 10], ['greyL', 0, 4, 16, 2], ['greyD', 1, 13, 14, 2], ['greyL', 3, 7, 2, 5]], top: [['white', 4, 0, 1, 3], ['white', 8, 1, 1, 3], ['white', 12, 0, 1, 3]] },
  cardapio: { ops: [['white', 3, 1, 10, 14], ['red', 7, 0, 2, 2], ['greyD', 5, 4, 6, 1], ['greyD', 5, 6, 5, 1], ['greyD', 5, 8, 6, 1], ['red', 9, 10, 3, 3], ['green', 10, 9, 1, 1], ['orange', 5, 11, 3, 2]] },
  legumes: { ops: [['brownL', 0, 9, 16, 7], ['brown', 0, 12, 16, 1], ['orange', 2, 4, 3, 6], ['green', 2, 2, 3, 2], ['red', 7, 5, 4, 4], ['green', 8, 4, 2, 1], ['greenL', 11, 3, 5, 6], ['green', 12, 5, 3, 1]] },
  relogio: { ops: [['white', 3, 2, 10, 12], ['white', 2, 4, 12, 8], ['red', 3, 1, 10, 1], ['ink', 7, 4, 2, 4], ['ink', 8, 7, 3, 2]] },
  torneira: { ops: [['grey', 2, 2, 10, 3], ['greyL', 2, 2, 10, 1], ['grey', 10, 5, 3, 3], ['grey', 6, 0, 2, 2], ['pink', 1, 11, 6, 4], ['white', 2, 10, 2, 1]], top: [['blueL', 11, 9, 1, 6], ['blue', 10, 14, 3, 1]] },
  prato: { ops: [['white', 0, 9, 16, 5], ['greyL', 1, 12, 14, 1], ['cream', 3, 7, 6, 3], ['brownD', 8, 7, 5, 3], ['orange', 5, 6, 2, 1], ['green', 11, 6, 3, 2]] },
  faca: { ops: [['greyL', 1, 6, 9, 3], ['grey', 1, 8, 9, 1], ['brown', 10, 6, 5, 3], ['orange', 3, 11, 7, 3], ['green', 10, 11, 3, 2]] },
  papel: { ops: [['white', 4, 6, 9, 8], ['white', 3, 8, 11, 4], ['greyL', 6, 8, 2, 2], ['greyL', 9, 10, 3, 1], ['greyL', 7, 12, 2, 1]] },
  banana: { ops: [['yellow', 6, 3, 3, 7], ['yellow', 2, 8, 5, 3], ['yellow', 9, 8, 5, 3], ['yellowD', 3, 10, 3, 1], ['yellowD', 10, 10, 3, 1], ['brown', 7, 2, 1, 1], ['brownD', 6, 9, 3, 2]] },
  casaco: { ops: [['blue', 3, 2, 10, 12], ['blue', 1, 3, 2, 10], ['blue', 13, 3, 2, 10], ['blueD', 7, 2, 2, 12], ['blueL', 5, 2, 2, 2], ['blueL', 9, 2, 2, 2], ['yellow', 4, 9, 2, 1]] },
  garrafinha: { ops: [['teal', 5, 3, 6, 12], ['tealL', 6, 5, 1, 8], ['ink', 6, 0, 4, 3], ['white', 5, 8, 6, 3], ['tealD', 6, 9, 4, 1]] },
  livro: { ops: [['purple', 2, 2, 12, 12], ['white', 3, 12, 11, 2], ['yellow', 4, 5, 7, 1], ['yellow', 4, 7, 5, 1], ['purpleL', 2, 2, 2, 12]] },
  giz: { ops: [['brownL', 1, 8, 9, 4], ['greyD', 1, 11, 9, 2], ['white', 11, 4, 3, 9], ['greyL', 11, 11, 3, 2]] },
  cadeira: { ops: [['orange', 1, 11, 14, 3], ['orange', 1, 3, 3, 9], ['orangeD', 4, 14, 2, 2], ['orangeD', 12, 14, 2, 2], ['greyD', 1, 2, 3, 1]] },
  chiclete: { ops: [['pink', 4, 7, 8, 6], ['pink', 6, 5, 5, 2], ['pinkD', 6, 9, 3, 2], ['white', 5, 7, 2, 1]] },
  vacina: { ops: [['yellow', 2, 1, 12, 14], ['yellowD', 2, 1, 2, 14], ['white', 6, 3, 6, 4], ['red', 8, 8, 2, 6], ['red', 6, 10, 6, 2]] },
  pneuagua: { ops: [['ink', 1, 6, 14, 8], ['greyD', 2, 7, 12, 6], ['blue', 4, 8, 8, 4], ['ink', 3, 2, 1, 1], ['ink', 6, 1, 1, 1], ['ink', 11, 3, 1, 1]], top: [['blueL', 5, 9, 3, 1]] },
  idoso: { ops: [['brownL', 2, 6, 12, 10], ['red', 1, 3, 14, 4], ['redD', 4, 1, 8, 2], ['blueL', 4, 9, 3, 3], ['brown', 9, 10, 3, 6], ['yellow', 4, 10, 1, 1]] },
  mudanca: { ops: [['tan', 0, 7, 9, 9], ['brownL', 0, 7, 9, 2], ['tan', 7, 3, 9, 8], ['brownL', 7, 3, 9, 2], ['cream', 11, 3, 1, 8]] },
  gestante: { ops: [['white', 2, 1, 12, 14], ['pink', 4, 4, 8, 4], ['red', 7, 5, 2, 2], ['greyD', 4, 10, 8, 1], ['greyD', 4, 12, 6, 1], ['pinkD', 2, 1, 12, 2]] },
  oculos: { ops: [['ink', 1, 5, 6, 5], ['ink', 9, 5, 6, 5], ['ink', 7, 6, 2, 1], ['glass', 2, 6, 4, 3], ['glass', 10, 6, 4, 3], ['ink', 0, 5, 1, 2], ['ink', 15, 5, 1, 2]], top: [['white', 2, 6, 1, 1], ['white', 10, 6, 1, 1]] },
  remedios: { ops: [['blueL', 0, 5, 16, 8], ['blue', 0, 5, 16, 2], ['white', 1, 8, 3, 4], ['white', 5, 8, 3, 4], ['white', 9, 8, 3, 4], ['white', 13, 8, 2, 4], ['red', 2, 9, 1, 1], ['yellow', 6, 10, 1, 1], ['green', 10, 9, 1, 1], ['red', 13, 10, 1, 1]] },
  bengala: { ops: [['brown', 7, 3, 2, 13], ['brown', 3, 1, 6, 2], ['brown', 3, 3, 2, 2], ['brownL', 8, 4, 1, 10]] },
  album: { ops: [['red', 2, 2, 12, 12], ['redD', 2, 2, 2, 12], ['white', 6, 4, 6, 6], ['sky', 7, 5, 4, 2], ['green', 7, 7, 4, 2], ['yellow', 6, 11, 6, 1]] },
  radio: { ops: [['brown', 1, 5, 14, 10], ['tan', 3, 7, 6, 6], ['brownD', 4, 8, 4, 1], ['brownD', 4, 10, 4, 1], ['yellow', 11, 8, 2, 2], ['greyD', 12, 0, 1, 5]] },
  terra: { ops: [['brown', 0, 10, 16, 6], ['brownD', 2, 12, 3, 1], ['brownD', 9, 13, 4, 1], ['grey', 5, 2, 6, 3], ['brownL', 9, 4, 2, 8]] },
  semente: { ops: [['brown', 0, 11, 16, 5], ['brownD', 6, 11, 4, 2], ['tan', 4, 4, 3, 3], ['tan', 9, 3, 3, 3], ['tan', 7, 7, 2, 2]] },
  regador: { ops: [['green', 3, 6, 9, 8], ['greenD', 3, 12, 9, 2], ['green', 12, 5, 3, 2], ['green', 14, 3, 2, 3], ['greenD', 5, 3, 5, 2], ['greenD', 4, 4, 1, 3], ['greenD', 10, 4, 1, 3]], top: [['blueL', 15, 8, 1, 2], ['blueL', 14, 10, 1, 2]] },
  cesta: { ops: [['brownL', 1, 8, 14, 7], ['brown', 1, 10, 14, 1], ['brown', 1, 12, 14, 1], ['red', 3, 4, 4, 4], ['red', 8, 3, 4, 5], ['green', 4, 3, 2, 1], ['green', 9, 2, 2, 1], ['brownL', 4, 0, 8, 1], ['brownL', 3, 1, 1, 7], ['brownL', 12, 1, 1, 7]] },
  caminhonete: { ops: [['blue', 0, 6, 10, 6], ['blue', 9, 3, 6, 9], ['glass', 10, 4, 4, 3], ['red', 1, 3, 3, 3], ['greenL', 5, 3, 3, 3], ['ink', 2, 11, 4, 4], ['ink', 10, 11, 4, 4], ['grey', 3, 12, 2, 2], ['grey', 11, 12, 2, 2]] },
  barraca: { ops: [['red', 0, 1, 16, 3], ['white', 2, 1, 2, 3], ['white', 7, 1, 2, 3], ['white', 12, 1, 2, 3], ['brown', 1, 4, 1, 12], ['brown', 14, 4, 1, 12], ['brownL', 0, 10, 16, 3], ['red', 3, 8, 3, 2], ['orange', 7, 8, 3, 2], ['greenL', 11, 8, 3, 2]] },
  tomate: { ops: [['red', 2, 4, 12, 11], ['red', 4, 3, 8, 1], ['redD', 3, 12, 10, 2], ['green', 5, 2, 6, 2], ['green', 7, 0, 2, 2], ['white', 5, 6, 2, 2]] },
  bike: { ops: [['ink', 0, 9, 6, 6], ['ink', 10, 9, 6, 6], ['greyL', 2, 11, 2, 2], ['greyL', 12, 11, 2, 2], ['teal', 3, 7, 9, 2], ['teal', 6, 4, 2, 5], ['ink', 4, 3, 5, 1], ['teal', 11, 4, 2, 6], ['ink', 10, 3, 4, 1]] },
  capacete: { ops: [['teal', 3, 4, 10, 7], ['teal', 5, 3, 6, 1], ['tealD', 2, 10, 12, 2], ['tealL', 5, 5, 2, 2], ['ink', 4, 12, 1, 2], ['ink', 11, 12, 1, 2]] },
  mochila: { ops: [['red', 1, 2, 14, 13], ['redD', 1, 2, 14, 3], ['white', 4, 7, 8, 4], ['red', 6, 8, 4, 2], ['grey', 3, 14, 10, 1]] },
  jornal: { ops: [['greyL', 1, 3, 14, 11], ['greyD', 3, 5, 6, 2], ['grey', 3, 9, 4, 3], ['greyD', 9, 9, 4, 1], ['greyD', 9, 11, 4, 1], ['white', 10, 5, 3, 2]] },
  papelao: { ops: [['tan', 0, 5, 16, 9], ['brownL', 0, 5, 16, 2], ['brownL', 0, 9, 16, 1], ['brownD', 6, 11, 4, 1]] },
  pet: { ops: [['glass', 5, 4, 6, 11], ['blueL', 5, 7, 6, 3], ['glass', 6, 2, 4, 2], ['blue', 6, 0, 4, 2], ['white', 6, 11, 1, 2]] },
  iogurte: { ops: [['white', 3, 4, 10, 11], ['pink', 3, 7, 10, 4], ['greyL', 2, 3, 12, 2], ['white', 6, 8, 4, 2]] },
  lata: { ops: [['red', 4, 2, 8, 13], ['greyL', 4, 1, 8, 2], ['greyL', 4, 14, 8, 1], ['white', 6, 6, 4, 2], ['redD', 10, 3, 1, 11]] },
  vidro: { ops: [['greenL', 4, 4, 8, 11], ['green', 5, 2, 6, 2], ['yellow', 5, 0, 6, 2], ['white', 5, 6, 1, 6], ['orange', 6, 9, 4, 4]] },
  guardanapo: { ops: [['white', 2, 3, 12, 11], ['red', 4, 6, 3, 2], ['orange', 9, 9, 3, 3], ['greyL', 2, 8, 12, 1]] },
  espelho: { ops: [['brownL', 2, 1, 12, 14], ['glass', 4, 3, 8, 10], ['ink', 6, 5, 1, 3], ['ink', 7, 8, 2, 1], ['ink', 9, 9, 1, 3], ['white', 5, 4, 1, 2]] },
  tesoura: { ops: [['grey', 7, 1, 2, 8], ['grey', 9, 2, 2, 7], ['red', 4, 9, 4, 6], ['red', 9, 9, 4, 6], ['greyL', 7, 1, 1, 6]] },
  carrinho: { ops: [['green', 1, 4, 11, 6], ['greenD', 1, 8, 11, 2], ['ink', 5, 11, 4, 4], ['greyL', 6, 12, 2, 2], ['brown', 11, 6, 5, 1], ['brown', 1, 10, 1, 5], ['brown', 10, 10, 1, 3]] },
  folhas: { ops: [['orange', 1, 9, 14, 6], ['yellow', 3, 7, 5, 3], ['red', 9, 6, 4, 3], ['orangeD', 5, 11, 4, 2], ['yellowD', 11, 10, 3, 2], ['green', 6, 5, 2, 2]] },
  galho: { ops: [['brown', 1, 8, 14, 2], ['brown', 4, 4, 2, 4], ['brown', 10, 9, 2, 4], ['green', 2, 2, 5, 3], ['green', 11, 12, 4, 3], ['greenL', 3, 2, 2, 1], ['brownD', 1, 9, 14, 1]] },
  flor: { ops: [['green', 7, 7, 2, 9], ['green', 4, 10, 3, 2], ['pink', 4, 1, 8, 6], ['pink', 6, 0, 4, 8], ['yellow', 7, 3, 2, 2], ['pinkD', 5, 6, 6, 1]] },
  muda: { ops: [['brown', 3, 11, 10, 5], ['brownD', 3, 11, 10, 1], ['green', 7, 4, 2, 7], ['greenL', 3, 3, 4, 3], ['greenL', 9, 1, 4, 4], ['green', 4, 4, 2, 1]] },
  pa: { ops: [['grey', 4, 9, 8, 6], ['greyL', 5, 10, 2, 3], ['brown', 7, 1, 2, 8], ['brown', 5, 0, 6, 2]] },
  adubo: { ops: [['greenD', 2, 2, 12, 13], ['green', 2, 2, 12, 2], ['tan', 4, 6, 8, 5], ['greenD', 6, 7, 4, 3], ['brown', 4, 14, 8, 1]] },
  buraco: { ops: [['brown', 0, 8, 16, 8], ['brownD', 3, 10, 10, 4], ['ink', 5, 11, 6, 2], ['brownL', 12, 5, 4, 3]] },
  saco: { ops: [['ink', 3, 4, 10, 11], ['inkL', 4, 6, 3, 6], ['ink', 6, 1, 4, 3], ['yellow', 7, 2, 2, 1]] },
  lixeira: { ops: [['orange', 3, 4, 10, 11], ['orangeD', 2, 3, 12, 2], ['orangeD', 6, 7, 1, 6], ['orangeD', 9, 7, 1, 6]] },
  lixeiracheia: { ops: [['orange', 3, 6, 10, 9], ['orangeD', 2, 5, 12, 2], ['white', 3, 2, 4, 3], ['red', 7, 1, 3, 4], ['greyL', 10, 3, 3, 2], ['white', 0, 13, 3, 2]] },
  bueiro: { ops: [['greyD', 1, 8, 14, 6], ['ink', 2, 9, 1, 4], ['ink', 5, 9, 1, 4], ['ink', 8, 9, 1, 4], ['ink', 11, 9, 1, 4], ['orange', 1, 4, 5, 4], ['yellow', 6, 5, 5, 3], ['brown', 11, 5, 4, 3]] },
  bueirolimpo: { ops: [['greyD', 1, 8, 14, 6], ['ink', 2, 9, 1, 4], ['ink', 5, 9, 1, 4], ['ink', 8, 9, 1, 4], ['ink', 11, 9, 1, 4]] },
  garrafa: { ops: [['green', 3, 8, 12, 5], ['green', 1, 9, 2, 3], ['greenL', 5, 9, 6, 1], ['white', 7, 10, 4, 2]] },
  vassoura: { ops: [['brown', 7, 0, 2, 10], ['yellow', 3, 10, 10, 6], ['yellowD', 5, 12, 1, 4], ['yellowD', 8, 12, 1, 4], ['yellowD', 11, 12, 1, 4], ['red', 3, 9, 10, 2]] },
  cone: { ops: [['orange', 6, 1, 4, 3], ['white', 5, 4, 6, 2], ['orange', 4, 6, 8, 3], ['white', 3, 9, 10, 2], ['orange', 3, 11, 10, 2], ['orangeD', 1, 13, 14, 3]] },
  luvas: { ops: [['red', 1, 5, 6, 10], ['red', 0, 2, 2, 5], ['red', 2, 1, 4, 4], ['red', 9, 5, 6, 10], ['red', 14, 2, 2, 5], ['red', 10, 1, 4, 4], ['redD', 1, 12, 6, 2], ['redD', 9, 12, 6, 2]] },
  lampada: { ops: [['yellowL', 4, 1, 8, 8], ['yellowL', 3, 3, 10, 4], ['yellow', 6, 5, 4, 3], ['grey', 5, 9, 6, 2], ['greyD', 5, 11, 6, 1], ['grey', 5, 12, 6, 2], ['greyD', 6, 14, 4, 1]], top: [['white', 5, 2, 2, 2]] },
  lampadaqueimada: { ops: [['greyL', 4, 1, 8, 8], ['greyL', 3, 3, 10, 4], ['grey', 6, 5, 4, 3], ['grey', 5, 9, 6, 2], ['greyD', 5, 11, 6, 1], ['grey', 5, 12, 6, 2], ['ink', 7, 4, 2, 1]] },
  caminhao: { ops: [['yellow', 0, 8, 12, 5], ['yellow', 11, 5, 5, 8], ['glass', 12, 6, 3, 3], ['greyD', 2, 1, 2, 7], ['greyD', 2, 1, 8, 2], ['white', 8, 0, 4, 3], ['ink', 2, 12, 4, 4], ['ink', 11, 12, 4, 4], ['grey', 3, 13, 2, 2], ['grey', 12, 13, 2, 2]] },
  desligar: { ops: [['greyL', 2, 1, 12, 14], ['greyD', 2, 1, 12, 2], ['ink', 5, 5, 6, 8], ['red', 6, 9, 4, 3], ['yellow', 7, 3, 2, 1]] },
  poste: { ops: [['greyD', 7, 3, 2, 13], ['greyD', 7, 2, 7, 2], ['yellowL', 11, 4, 4, 2], ['greyD', 5, 15, 6, 1]], top: [['yellow', 10, 6, 6, 1]] },
  maquina: { ops: [['white', 1, 1, 14, 15], ['greyL', 1, 1, 14, 3], ['greyD', 3, 6, 10, 9], ['blueL', 4, 7, 8, 7], ['blue', 5, 10, 6, 3], ['red', 11, 2, 2, 1], ['green', 8, 2, 2, 1]] },
  varal: { ops: [['brown', 0, 0, 2, 16], ['brown', 14, 0, 2, 16], ['greyD', 2, 2, 12, 1], ['blue', 3, 3, 4, 6], ['pink', 9, 3, 4, 5], ['yellowD', 4, 2, 1, 2], ['yellowD', 10, 2, 1, 2]] },
  cesto: { ops: [['tan', 1, 6, 14, 10], ['brownL', 1, 8, 14, 1], ['brownL', 1, 11, 14, 1], ['brownL', 1, 14, 14, 1], ['blue', 3, 3, 5, 3], ['pink', 8, 2, 5, 4], ['yellow', 6, 4, 4, 2]] },
  ferro: { ops: [['blue', 2, 7, 13, 6], ['blue', 5, 5, 9, 2], ['greyL', 1, 12, 14, 3], ['blueD', 8, 2, 6, 2], ['blueD', 13, 2, 1, 4], ['red', 6, 9, 2, 2]] },
  cama: { ops: [['brown', 0, 6, 2, 10], ['brownL', 2, 9, 14, 4], ['white', 2, 7, 4, 2], ['blueL', 6, 7, 10, 3], ['brown', 14, 9, 2, 7]] },
  chuveiro: { ops: [['grey', 2, 0, 2, 4], ['grey', 2, 1, 9, 2], ['greyL', 8, 3, 6, 2]], top: [['blueL', 9, 6, 1, 3], ['blueL', 11, 7, 1, 3], ['blueL', 13, 6, 1, 3], ['blueL', 10, 11, 1, 3], ['blueL', 12, 12, 1, 3]] },
  xicara: { ops: [['white', 3, 6, 9, 7], ['white', 12, 7, 3, 4], ['brown', 4, 6, 7, 2], ['greyL', 1, 13, 14, 2]], top: [['white', 6, 1, 1, 3], ['white', 8, 2, 1, 3]] },
  passeio: { ops: [['green', 2, 0, 12, 9], ['greenD', 2, 6, 12, 3], ['greenL', 4, 1, 3, 2], ['brown', 7, 9, 2, 7], ['greenD', 0, 14, 16, 2]] },
  sabonete: { ops: [['pink', 2, 7, 12, 7], ['white', 4, 9, 8, 3]], top: [['white', 3, 3, 3, 3], ['white', 10, 2, 2, 2], ['white', 7, 4, 2, 2]] },
  interfone: { ops: [['greyL', 3, 1, 10, 14], ['greyD', 5, 3, 6, 4], ['grey', 5, 9, 2, 2], ['grey', 9, 9, 2, 2], ['grey', 5, 12, 2, 2], ['grey', 9, 12, 2, 2], ['green', 7, 4, 2, 1]] },
  caderno: { ops: [['blue', 2, 2, 12, 13], ['white', 4, 4, 9, 9], ['greyD', 5, 6, 6, 1], ['greyD', 5, 8, 7, 1], ['greyD', 5, 10, 5, 1], ['ink', 2, 3, 1, 1], ['ink', 2, 6, 1, 1], ['ink', 2, 9, 1, 1], ['ink', 2, 12, 1, 1]] },
  chaves: { ops: [['yellow', 2, 2, 6, 6], ['yellowD', 4, 4, 2, 2], ['yellow', 7, 7, 7, 2], ['yellow', 11, 9, 2, 3], ['yellow', 13, 9, 1, 2], ['grey', 3, 8, 3, 6], ['grey', 4, 13, 4, 1]] },
  pato: { ops: [['white', 2, 8, 11, 6], ['white', 10, 3, 4, 6], ['orange', 14, 5, 2, 2], ['ink', 12, 4, 1, 1], ['greyL', 4, 9, 5, 2], ['blueL', 0, 14, 16, 2]] },
  grama: { ops: [['greenL', 0, 10, 16, 6], ['green', 0, 13, 16, 3], ['green', 2, 8, 1, 2], ['green', 6, 9, 1, 1], ['green', 10, 8, 1, 2], ['green', 14, 9, 1, 1]] },
  bancoparque: { ops: [['brownL', 0, 6, 16, 3], ['brownL', 0, 2, 16, 3], ['brown', 0, 9, 16, 2], ['greyD', 1, 11, 2, 5], ['greyD', 13, 11, 2, 5]] },
  coracao: { ops: [['red', 2, 3, 5, 6], ['red', 9, 3, 5, 6], ['red', 1, 5, 14, 4], ['red', 3, 9, 10, 2], ['red', 5, 11, 6, 2], ['red', 7, 13, 2, 1], ['white', 3, 4, 2, 2]] },
  estrela: { ops: [['yellow', 7, 0, 2, 4], ['yellow', 0, 5, 16, 3], ['yellow', 3, 4, 10, 6], ['yellow', 4, 10, 3, 4], ['yellow', 9, 10, 3, 4], ['yellow', 2, 13, 3, 2], ['yellow', 11, 13, 3, 2], ['yellowL', 6, 5, 2, 2]] },
  casa: { ops: [['cream', 2, 7, 12, 9], ['red', 0, 6, 16, 2], ['red', 2, 4, 12, 2], ['red', 4, 2, 8, 2], ['red', 6, 0, 4, 2], ['brown', 7, 11, 3, 5], ['glass', 3, 9, 3, 3], ['glass', 11, 9, 3, 3]] },
  predio: { ops: [['purpleL', 2, 0, 12, 16], ['glass', 4, 2, 3, 3], ['glass', 9, 2, 3, 3], ['glass', 4, 7, 3, 3], ['glass', 9, 7, 3, 3], ['brown', 6, 12, 4, 4]] },
  obra: { ops: [['orange', 0, 6, 16, 3], ['white', 2, 6, 3, 3], ['white', 8, 6, 3, 3], ['white', 14, 6, 2, 3], ['greyD', 1, 9, 2, 7], ['greyD', 13, 9, 2, 7], ['yellow', 6, 0, 4, 4], ['ink', 7, 1, 2, 2]] },
  agua: { ops: [['blue', 0, 4, 16, 10], ['blueL', 2, 6, 5, 1], ['blueL', 9, 9, 5, 1], ['blueD', 0, 12, 16, 2]] },
  sacola: { ops: [['white', 2, 5, 12, 10], ['greenL', 2, 5, 12, 2], ['ink', 5, 1, 1, 4], ['ink', 10, 1, 1, 4], ['ink', 5, 1, 6, 1], ['orange', 4, 3, 3, 3], ['green', 9, 2, 3, 4]] },
  farmacia: { ops: [['white', 1, 2, 14, 13], ['green', 6, 4, 4, 9], ['green', 3, 7, 10, 3], ['greenD', 1, 2, 14, 1]] },
  pizza: { ops: [['tan', 1, 4, 14, 10], ['red', 2, 5, 12, 8], ['yellow', 3, 6, 10, 6], ['red', 4, 7, 2, 2], ['red', 9, 9, 2, 2], ['green', 7, 6, 2, 1], ['brownL', 1, 4, 14, 1]] },
  dog: { ops: [['caramel', 3, 7, 9, 4], ['caramel', 10, 4, 5, 5], ['caramelL', 14, 6, 2, 2], ['caramelD', 10, 3, 2, 3], ['caramel', 1, 4, 2, 4], ['caramel', 4, 11, 2, 3], ['caramel', 9, 11, 2, 3], ['cream', 5, 10, 5, 1], ['ink', 13, 5, 1, 1], ['ink', 15, 6, 1, 1], ['red', 10, 8, 3, 1]] },
  dog2: { ops: [['caramel', 3, 7, 9, 4], ['caramel', 10, 4, 5, 5], ['caramelL', 14, 6, 2, 2], ['caramelD', 10, 3, 2, 3], ['caramel', 1, 6, 3, 2], ['caramel', 3, 11, 2, 3], ['caramel', 10, 11, 2, 3], ['cream', 5, 10, 5, 1], ['ink', 13, 5, 1, 1], ['ink', 15, 6, 1, 1], ['red', 10, 8, 3, 1]] },
  dogsleep: { ops: [['caramel', 2, 9, 12, 5], ['caramel', 10, 7, 5, 5], ['caramelD', 10, 6, 2, 3], ['caramelL', 14, 10, 2, 2], ['caramel', 0, 11, 3, 2], ['ink', 12, 9, 2, 1], ['red', 10, 11, 3, 1]] },
  passaro: { ops: [['blueD', 5, 7, 6, 3], ['blueD', 2, 5, 4, 2], ['blueD', 10, 5, 4, 2], ['orange', 11, 8, 2, 1]] },
  passaro2: { ops: [['blueD', 5, 6, 6, 3], ['blueD', 2, 8, 4, 2], ['blueD', 10, 8, 4, 2], ['orange', 11, 7, 2, 1]] },
  carro: { w: 32, h: 14, ops: carOps('red', 'redD', '#ef8a84') },
  carro2: { w: 32, h: 14, ops: carOps('blue', 'blueD', 'blueL') },
  carro3: { w: 32, h: 14, ops: carOps('greyL', 'grey', 'white', 'skyD') },
  taxi: { w: 32, h: 14, ops: carOps('yellow', 'yellowD', 'yellowL').concat([['ink', 13, 1, 4, 1], ['white', 14, 0, 2, 1]]) },
  bombeiros: { w: 48, h: 22, ops: [['red', 0, 4, 47, 13], ['redD', 0, 14, 47, 2], ['white', 0, 10, 40, 1], ['greyL', 4, 1, 30, 2], ['greyD', 6, 0, 1, 3], ['greyD', 31, 0, 1, 3],
    ['glass', 38, 5, 8, 5], ['white', 39, 5, 2, 1], ['ink', 36, 4, 1, 12], ['yellowL', 45, 12, 2, 2], ['blue', 40, 2, 3, 2], ['red', 43, 2, 3, 2], ['yellow', 4, 7, 6, 2], ['yellow', 14, 7, 6, 2], ['yellow', 24, 7, 6, 2],
    ['ink', 5, 15, 8, 7], ['ink', 33, 15, 8, 7], ['greyL', 7, 17, 4, 3], ['greyL', 35, 17, 4, 3]] },
  onibus: { w: 48, h: 22, ops: [['teal', 0, 2, 47, 15], ['tealL', 1, 2, 45, 1], ['white', 0, 11, 47, 2], ['tealD', 0, 16, 47, 1],
    ['glass', 3, 4, 5, 5], ['glass', 10, 4, 5, 5], ['glass', 17, 4, 5, 5], ['glass', 24, 4, 5, 5], ['glass', 31, 4, 3, 5], ['glass', 41, 3, 5, 8],
    ['white', 4, 4, 2, 1], ['white', 11, 4, 2, 1], ['white', 18, 4, 2, 1], ['white', 25, 4, 2, 1], ['white', 42, 3, 2, 2],
    ['greyD', 35, 4, 5, 12], ['glass', 36, 5, 3, 5], ['ink', 40, 0, 6, 2], ['yellow', 41, 0, 4, 1],
    ['yellowL', 45, 13, 2, 2], ['red', 0, 13, 1, 2], ['greyD', 0, 17, 48, 1],
    ['ink', 6, 15, 8, 7], ['ink', 33, 15, 8, 7], ['greyL', 8, 17, 4, 3], ['greyL', 35, 17, 4, 3]] },
  hidrante: { ops: [['red', 5, 4, 6, 11], ['red', 4, 2, 8, 3], ['redD', 3, 8, 10, 2], ['greyD', 4, 15, 8, 1]] },
  vaso: { ops: [['orangeD', 4, 10, 8, 6], ['orange', 3, 9, 10, 2], ['green', 4, 4, 8, 6], ['pink', 5, 3, 2, 2], ['yellow', 9, 4, 2, 2], ['red', 7, 6, 2, 2]] },
  mosca: { ops: [['ink', 6, 7, 5, 4], ['glass', 3, 4, 4, 3], ['glass', 10, 4, 4, 3], ['red', 6, 7, 1, 1], ['red', 10, 7, 1, 1]] },
  mosquito: { ops: [['ink', 5, 7, 7, 2], ['ink', 11, 6, 3, 1], ['glass', 5, 3, 3, 4], ['glass', 9, 3, 3, 4], ['ink', 4, 9, 1, 4], ['ink', 8, 9, 1, 4], ['ink', 11, 9, 1, 4], ['white', 6, 7, 1, 1]] },
  rato: { ops: [['grey', 3, 8, 10, 6], ['grey', 11, 6, 4, 5], ['greyL', 11, 5, 2, 2], ['ink', 13, 8, 1, 1], ['pink', 15, 9, 1, 1], ['pink', 0, 12, 4, 1], ['greyD', 4, 13, 2, 2], ['greyD', 10, 13, 2, 2]] },
  louca: { ops: [['white', 1, 11, 14, 4], ['greyL', 1, 13, 14, 1], ['white', 2, 7, 12, 4], ['greyL', 2, 9, 12, 1], ['blueL', 3, 3, 10, 4], ['blue', 3, 5, 10, 1], ['brownD', 5, 2, 3, 2], ['orange', 10, 8, 2, 2]] },
  roupasuja: { ops: [['blue', 1, 9, 9, 6], ['pink', 6, 7, 9, 7], ['yellow', 3, 5, 6, 4], ['brown', 4, 10, 2, 2], ['brown', 10, 9, 2, 1], ['greyD', 8, 12, 3, 1]] },
  mato: { ops: [['greenD', 0, 10, 16, 6], ['green', 1, 3, 2, 8], ['green', 4, 1, 2, 10], ['greenD', 7, 4, 2, 7], ['green', 10, 2, 2, 9], ['greenD', 13, 5, 2, 6], ['yellowD', 4, 0, 2, 2]] },
  poca: { ops: [['blueD', 0, 9, 16, 6], ['blue', 2, 10, 12, 4], ['blueL', 4, 11, 4, 1], ['brown', 10, 12, 3, 1]] },
  murcha: { ops: [['brownL', 4, 11, 8, 5], ['brown', 3, 10, 10, 2], ['brownL', 7, 4, 2, 7], ['tan', 3, 6, 4, 2], ['tan', 9, 5, 4, 2], ['brown', 5, 3, 3, 2]] },
  vazia: { ops: [['tan', 1, 7, 14, 8], ['brownL', 1, 7, 14, 2], ['brown', 3, 10, 10, 4]] },
  carta: { ops: [['white', 1, 3, 14, 11], ['greyL', 1, 3, 14, 1], ['pink', 1, 4, 7, 5], ['pink', 8, 4, 7, 5], ['white', 2, 4, 12, 3], ['red', 6, 8, 4, 3]] },
  /* novas profissões */
  extintor: { ops: [['red', 5, 4, 6, 11], ['redD', 9, 4, 2, 11], ['white', 6, 8, 3, 2], ['ink', 6, 1, 4, 3], ['greyD', 9, 1, 4, 1], ['ink', 12, 2, 2, 6]] },
  apito: { ops: [['greyL', 3, 6, 9, 6], ['white', 4, 7, 3, 2], ['greyD', 11, 7, 4, 3], ['ink', 5, 9, 2, 2], ['yellow', 1, 3, 3, 3]] },
  placasolar: { ops: [['navy', 1, 4, 14, 8], ['blue', 2, 5, 3, 2], ['blue', 6, 5, 3, 2], ['blue', 10, 5, 4, 2], ['blue', 2, 8, 3, 3], ['blue', 6, 8, 3, 3], ['blue', 10, 8, 4, 3], ['white', 2, 5, 1, 1], ['greyD', 7, 12, 2, 3]] },
  pare: { ops: [['greyD', 7, 9, 2, 7], ['red', 3, 1, 10, 9], ['red', 2, 3, 12, 5], ['white', 4, 4, 8, 3]] },
  celularvelho: { ops: [['ink', 4, 1, 8, 14], ['greyD', 5, 2, 6, 12], ['glass', 5, 3, 6, 8], ['white', 6, 4, 2, 1], ['grey', 7, 12, 2, 1], ['red', 9, 9, 2, 2]] },
  computador: { ops: [['ink', 1, 2, 14, 9], ['greyL', 2, 3, 12, 7], ['blueL', 3, 4, 10, 5], ['white', 4, 5, 2, 1], ['grey', 6, 11, 4, 2], ['greyD', 3, 13, 10, 2]] },
  bateria: { ops: [['ink', 4, 3, 8, 11], ['green', 5, 4, 6, 9], ['greenL', 5, 4, 6, 2], ['greyL', 6, 1, 4, 2], ['white', 7, 7, 2, 3]] },
  placa: { ops: [['greenD', 1, 3, 14, 10], ['green', 2, 4, 12, 8], ['yellow', 3, 5, 6, 1], ['yellow', 3, 8, 8, 1], ['ink', 10, 5, 3, 3], ['orange', 4, 10, 2, 1], ['orange', 9, 10, 2, 1]] },
  chip: { ops: [['ink', 4, 4, 8, 8], ['greyD', 5, 5, 6, 6], ['yellow', 2, 5, 2, 1], ['yellow', 2, 8, 2, 1], ['yellow', 12, 5, 2, 1], ['yellow', 12, 8, 2, 1], ['yellow', 5, 2, 1, 2], ['yellow', 9, 2, 1, 2], ['yellow', 5, 12, 1, 2], ['yellow', 9, 12, 1, 2], ['white', 6, 6, 2, 1]] },
  porquinho: { ops: [['pink', 2, 5, 12, 8], ['pink', 12, 6, 3, 4], ['pinkD', 14, 7, 2, 2], ['pink', 4, 3, 3, 3], ['ink', 10, 7, 1, 1], ['pinkD', 3, 13, 2, 2], ['pinkD', 10, 13, 2, 2], ['ink', 6, 5, 4, 1], ['pinkD', 0, 7, 2, 1]] },
  moeda: { ops: [['yellowD', 3, 3, 10, 10], ['yellow', 4, 4, 8, 8], ['yellowL', 5, 5, 2, 3], ['yellowD', 7, 6, 2, 4]] },
  mao: { w: 18, h: 20, ops: [
    ['s2', 3, 0, 4, 9], ['#ffe3dc', 4, 1, 2, 2], ['s3', 3, 8, 4, 1],
    ['s2', 7, 6, 3, 4], ['s2', 10, 7, 3, 4], ['s2', 13, 8, 3, 4], ['s3', 10, 7, 1, 3], ['s3', 13, 8, 1, 3],
    ['s2', 2, 9, 14, 7], ['s2', 0, 10, 3, 4], ['s3', 0, 13, 3, 1],
    ['#f6d3b3', 4, 10, 3, 4], ['s3', 3, 15, 12, 1],
    ['white', 4, 16, 11, 3], ['greyL', 4, 18, 11, 1]] },
  /* cozinha: receita de arroz */
  arroz: { ops: [['white', 3, 4, 10, 11], ['cream', 3, 12, 10, 3], ['yellow', 4, 7, 8, 4], ['yellowD', 4, 10, 8, 1], ['white', 5, 8, 2, 2], ['white', 8, 8, 1, 1], ['brownL', 5, 2, 6, 2], ['brown', 6, 1, 4, 1]] },
  copoagua: { ops: [['glass', 4, 3, 8, 12], ['blueL', 4, 7, 8, 8], ['blue', 4, 13, 8, 2], ['white', 5, 4, 1, 3]] },
  oleo: { ops: [['yellowL', 5, 5, 6, 10], ['yellow', 5, 9, 6, 6], ['white', 6, 10, 2, 3], ['red', 6, 2, 4, 3], ['redD', 6, 4, 4, 1]] },
  alho: { ops: [['white', 3, 7, 10, 7], ['cream', 4, 8, 2, 5], ['cream', 8, 8, 2, 5], ['white', 6, 4, 4, 3], ['tan', 7, 2, 2, 2], ['tan', 6, 14, 4, 1]] },
  sal: { ops: [['white', 4, 5, 8, 10], ['blueL', 4, 9, 8, 3], ['greyL', 5, 2, 6, 3], ['greyD', 6, 3, 1, 1], ['greyD', 9, 3, 1, 1]] },
  escorredor: { ops: [['greyL', 1, 6, 14, 6], ['white', 2, 6, 12, 1], ['greyD', 3, 8, 1, 1], ['greyD', 6, 8, 1, 1], ['greyD', 9, 8, 1, 1], ['greyD', 12, 8, 1, 1], ['greyD', 4, 10, 1, 1], ['greyD', 7, 10, 1, 1], ['greyD', 10, 10, 1, 1], ['grey', 4, 12, 8, 2]] },
  colher: { ops: [['brownL', 7, 1, 2, 9], ['brownL', 5, 9, 6, 5], ['brown', 6, 10, 4, 3]] },
  tampa: { ops: [['greyL', 1, 9, 14, 3], ['white', 2, 9, 12, 1], ['grey', 3, 8, 10, 1], ['greyD', 7, 5, 2, 3]] },
  fogo: { ops: [['red', 4, 6, 8, 9], ['orange', 5, 4, 6, 10], ['yellow', 6, 8, 4, 6], ['yellowL', 7, 11, 2, 3], ['orange', 3, 9, 2, 5], ['orange', 11, 8, 2, 6]] },
  chocolate: { ops: [['brownD', 3, 2, 10, 12], ['brown', 4, 3, 3, 3], ['brown', 8, 3, 3, 3], ['brown', 4, 7, 3, 3], ['brown', 8, 7, 3, 3], ['red', 3, 11, 10, 4], ['yellow', 5, 12, 6, 1]] },
  meia: { ops: [['pink', 5, 1, 5, 9], ['pink', 5, 9, 9, 4], ['white', 5, 1, 5, 2], ['pinkD', 11, 10, 3, 3], ['white', 6, 5, 3, 1]] },
  sorvete: { ops: [['tan', 6, 9, 4, 6], ['brownL', 7, 10, 2, 1], ['pink', 4, 3, 8, 6], ['white', 5, 4, 2, 2], ['red', 7, 1, 2, 2]] },
  /* casa: arrumação */
  tenis: { ops: [['red', 2, 8, 10, 4], ['red', 9, 6, 4, 3], ['white', 1, 12, 14, 2], ['white', 4, 9, 2, 1], ['white', 7, 9, 2, 1], ['redD', 2, 11, 10, 1]] },
  bola: { ops: [['white', 4, 4, 9, 9], ['red', 4, 7, 9, 3], ['white', 7, 7, 3, 3], ['ink', 8, 8, 1, 1]] },
  camiseta: { ops: [['teal', 4, 4, 8, 11], ['teal', 1, 4, 3, 5], ['teal', 12, 4, 3, 5], ['tealD', 6, 4, 4, 1], ['white', 6, 8, 4, 2]] },
  dobrada: { ops: [['teal', 2, 7, 12, 7], ['tealD', 2, 9, 12, 1], ['tealD', 2, 12, 12, 1], ['white', 6, 8, 4, 1]] },
  estante: { ops: [['brown', 1, 1, 14, 14], ['brownD', 2, 2, 12, 5], ['brownD', 2, 9, 12, 5], ['purple', 3, 3, 2, 4], ['yellow', 5, 3, 2, 4], ['teal', 7, 3, 2, 4], ['red', 3, 10, 2, 4], ['blue', 5, 10, 3, 4]] },
  pia: { ops: [['greyL', 1, 7, 14, 6], ['grey', 2, 8, 12, 3], ['blueL', 3, 9, 10, 1], ['grey', 10, 2, 2, 5], ['grey', 7, 2, 5, 2], ['greyD', 2, 13, 12, 2]] },
  caixabrinq: { ops: [['tan', 1, 6, 14, 9], ['brownL', 1, 6, 14, 2], ['brown', 6, 9, 4, 2], ['red', 3, 3, 4, 3], ['blue', 9, 2, 3, 4]] },
};

/* ============================================================
   PERSONAGENS 16x24 — corpo-base + camadas
   letras: k contorno, S pele, C bochecha, T roupa, U sombra roupa,
   P calça, F sapato, H cabelo, A acessório 1, B acessório 2, V faixa refletiva, W branco, G luva
   ============================================================ */
const BODY = [
  '................',
  '................',
  '....kkkkkkkk....',
  '...kSSSSSSSSk...',
  '..kSSSSSSSSSSk..',
  '..kSSSSSSSSSSk..',
  '..kSSkSSSSkSSk..',
  '..kSSkSSSSkSSk..',
  '..kSCSSSSSSCSk..',
  '..kSSSSkkSSSSk..',
  '...kSSSSSSSSk...',
  '....kkSSSSkk....',
  '...kkTTTTTTkk...',
  '..kTTTTTTTTTTk..',
  '.kTTkTTTTTTkTTk.',
  '.kTTkTTTTTTkTTk.',
  '.kSSkTTTTTTkSSk.',
  '.kkkkUUUUUUkkkk.',
  '....kPPPPPPk....',
  '....kPPPPPPk....',
  '....kPPkkPPk....',
  '....kPPkkPPk....',
  '...kFFFkkFFFk...',
  '...kkkkkkkkkk...'
];
/* camadas: { linha: 'máscara' } — '.' mantém o que está embaixo */
const LAYERS = {
  short: { 1: '....kkkkkkkk....', 2: '...kHHHHHHHHk...', 3: '..kHHHHHHHHHHk..', 4: '..kHHHHHHHHHHk..', 5: '..kHSSSSSSSSHk..' },
  curly: { 0: '.....k.kk.k.....', 1: '...kkHkHHkHkk...', 2: '..kHHHHHHHHHHk..', 3: '..kHHHHHHHHHHk..', 4: '..kHHHHHHHHHHk..', 5: '..kHSHSSSSHSHk..' },
  long: { 1: '....kkkkkkkk....', 2: '...kHHHHHHHHk...', 3: '..kHHHHHHHHHHk..', 4: '.kHHHHHHHHHHHHk.', 5: '.kHHSSSSSSSSHHk.', 6: '.kH..........Hk.', 7: '.kH..........Hk.', 8: '.kH..........Hk.', 9: '.kH..........Hk.', 10: '.kHk........kHk.', 11: '.kHHk......kHHk.', 12: '.kkk........kkk.' },
  bun: { 0: '......kkkk......', 1: '.....kHHHHk.....', 2: '...kkHHHHHHkk...', 3: '..kHHHHHHHHHHk..', 4: '..kHHHHHHHHHHk..', 5: '..kHSSSSSSSSHk..' },
  afro: { 0: '...kkkkkkkkkk...', 1: '..kHHHHHHHHHHk..', 2: '.kHHHHHHHHHHHHk.', 3: '.kHHHHHHHHHHHHk.', 4: '.kHHHHHHHHHHHHk.', 5: '.kHHSSSSSSSSHHk.', 6: '.kH..........Hk.', 7: '.kk..........kk.' },
  braids: { 1: '....kkkkkkkk....', 2: '...kHHHHHHHHk...', 3: '..kHHHHHHHHHHk..', 4: '.kHHHHHHHHHHHHk.', 5: '.kHHSSSSSSSSHHk.', 6: '.kH..........Hk.', 7: '.kh..........hk.', 8: '.kH..........Hk.', 9: '.kh..........hk.', 10: '.kH.........kHk.', 11: '.kAk........kAk.', 12: '.kk..........kk.' },
  pony: { 1: '....kkkkkkkk....', 2: '...kHHHHHHHHk...', 3: '..kHHHHHHHHHHkk.', 4: '..kHHHHHHHHHHkHk', 5: '..kHSSSSSSSSHkHk', 6: '.............kHk', 7: '.............kHk', 8: '..............k.' },
  bald: { 4: '..kHS......SHk..', 5: '..kHS......SHk..', 6: '..kH........Hk..' },
  cap: { 1: '....kkkkkkkk....', 2: '...kAAAAAAAAk...', 3: '..kAAAAAAAAAAk..', 4: '..kBBBBBBBBBBBBk', 5: '..kHSSSSSSSSHkk.' },
  touca: { 0: '....kkkkkkkk....', 1: '...kWWWWWWWWk...', 2: '..kWWWWWWWWWWk..', 3: '..kWWWWWWWWWWk..', 4: '..kkkkkkkkkkkk..', 5: '..kHSSSSSSSSHk..' },
  helmet: { 0: '....kkkkkkkk....', 1: '...kAAAAAAAAk...', 2: '..kAAAABAAAAAk..', 3: '..kAAAABAAAAAk..', 4: '.kBBBBBBBBBBBBk.', 5: '..kkSSSSSSSSkk..' },
  hat: { 0: '.....kkkkkk.....', 1: '....kAAAAAAk....', 2: '....kABBBBAk....', 3: '.kkkkAAAAAAkkkk.', 4: 'kAAAAAAAAAAAAAAk', 5: '.kkkSSSSSSSSkkk.' },
  scarf: { 1: '....kkkkkkkk....', 2: '...kAAAAAAAAk...', 3: '..kAAAAAAAAAAk..', 4: '..kABABABABAAk..', 5: '..kASSSSSSSSAk..' },
  band: { 4: '.kAAAAAAAAAAAAk.' },
  greyhair: { 2: '...kHHHHHHHHk...' },
  glasses: { 6: '...kkkkkkkkkk...', 7: '...kGkSSSSkGk...' },
  mustache: { 9: '.....HHHHHH.....' },
  beard: { 8: '..kHSSSSSSSSHk..', 9: '..kHHSHkkHSHHk..', 10: '...kHHHHHHHHk...', 11: '....kkHHHHkk....' },
  earrings: { 9: '..kSSSSkkSSSSk..', 10: '..Ak........Ak..' },
  apron: { 13: '.....AAAAAA.....', 14: '.....AAAAAA.....', 15: '.....AAAAAA.....', 16: '.....AAAAAA.....', 17: '.....BBBBBB.....', 18: '.....AAAAAA.....', 19: '.....AAAAAA.....' },
  vest: { 13: '...AAA....AAA...', 14: '.....AA..AA.....', 15: '.....AA..AA.....', 16: '.....VVVVVV.....', 17: '.....AAAAAA.....' },
  stripes: { 15: '..VV.VVVVVV.VV..', 19: '.....VVVVVV.....' },
  badge: { 14: '..........B.....' },
  cross: { 14: '........BB......', 15: '.......BBBB.....', 16: '........BB......' },
  strap: { 12: '..........M.....', 13: '.........M......', 14: '........M.......', 15: '.......M........', 16: '......M.........', 17: '.....M..........' },
  straps2: { 12: '.....M....M.....', 13: '.....M....M.....', 14: '.....M....M.....', 15: '.....M....M.....' },
  gloves: { 16: '.kGGk......kGGk.' },
  overalls: { 14: '.....AAAAAA.....', 15: '.....AAAAAA.....', 16: '.....AAAAAA.....', 17: '.....AAAAAA.....', 13: '.....A....A.....' },
  skirt: { 18: '....kPPPPPPk....', 19: '...kPPPPPPPPk...', 20: '...kkkkkkkkkk...', 21: '....kSSkkSSk....' },
  smile: { 9: '..kSSSkkkkSSSk..' },
  freckles: { 8: '..kSCSkSSkSCSk..', 9: '..kSSSkkkkSSSk..' },
  open: { 9: '..kSSSkRRkSSSk..' },
  closed: { 6: '..kSSSSSSSSSSk..', 7: '..kSkkSSSSkkSk..' }
};

/* fichas dos personagens: pele, cabelo, roupa, camadas */
const LOOKS = {
  /* tons de pele distribuídos de forma equilibrada entre as profissões (3 de cada tom),
     idades variadas e nenhum padrão entre cor de pele e tipo de trabalho */
  cida: { S: 's2', H: '#6b3e26', T: 'teal', U: 'tealD', P: 'blue', F: 'brownD', A: 'yellow', layers: ['bun', 'earrings', 'smile'] },
  jorge: { S: 's1', H: '#3a2626', T: 'navy', U: 'ink', P: 'greyD', F: 'ink', B: 'yellow', layers: ['short', 'badge', 'smile'] },
  ze: { S: 's3', H: '#2b2233', T: 'white', U: 'greyL', P: 'greyD', F: 'ink', A: 'orange', B: 'orangeD', W: 'white', layers: ['touca', 'beard', 'apron', 'smile'] },
  katia: { S: 's1', H: '#b5562c', T: 'blueL', U: 'blue', P: 'navy', F: 'ink', G: 'yellow', A: 'pink', layers: ['pony', 'band', 'gloves', 'smile'] },
  lucia: { S: 's4', H: '#22161d', h: '#4a2c2c', T: 'white', U: 'greyL', P: 'navy', F: 'brownD', A: 'blue', V: 'blueL', M: 'brownD', layers: ['braids', 'vest', 'strap', 'smile'] },
  benedito: { S: 's2', H: '#1d1418', T: 'green', U: 'greenD', P: 'tan', F: 'brownD', G: 'glass', layers: ['curly', 'glasses', 'smile'] },
  zefa: { S: 's3', H: '#cfcfd6', T: 'red', U: 'redD', P: 'blueD', F: 'brown', A: 'tan', B: 'brownL', layers: ['long', 'hat', 'smile'] },
  rafa: { S: 's2', H: '#2b2233', T: 'yellow', U: 'yellowD', P: 'greyD', F: 'ink', A: 'teal', B: 'tealD', M: 'redD', V: 'white', layers: ['helmet', 'straps2', 'smile'] },
  marina: { S: 's4', H: '#2a1b1b', T: 'green', U: 'greenD', P: 'blueD', F: 'brownD', A: 'pink', G: 'orange', layers: ['afro', 'band', 'gloves', 'smile'] },
  joaquim: { S: 's3', H: '#e6e6ec', T: 'cream', U: 'tan', P: 'greenD', F: 'brownD', A: 'greenD', B: 'green', layers: ['bald', 'cap', 'beard', 'overalls', 'smile'] },
  denise: { S: 's1', H: '#e8c25a', T: 'orange', U: 'orangeD', P: 'orange', F: 'ink', A: 'orange', B: 'orangeD', V: 'vest', G: 'yellow', layers: ['pony', 'cap', 'stripes', 'gloves', 'smile'] },
  pedro: { S: 's4', H: '#1d1418', T: 'blueD', U: 'navy', P: 'navy', F: 'ink', A: 'white', B: 'greyL', V: 'vest', G: 'red', layers: ['helmet', 'stripes', 'gloves', 'smile'] },
  joana: { S: 's3', H: '#2b2233', T: 'redD', U: 'red', P: 'navy', F: 'ink', A: 'yellow', B: 'yellowD', V: 'yellowL', G: 'ink', layers: ['helmet', 'stripes', 'gloves', 'smile'] },
  carlos: { S: 's2', H: '#1d1418', T: 'blueD', U: 'navy', P: 'navy', F: 'ink', A: 'navy', B: 'ink', M: 'yellow', layers: ['short', 'cap', 'mustache', 'strap', 'smile'] },
  tania: { S: 's1', H: '#b5562c', T: 'blue', U: 'blueD', P: 'greyD', F: 'ink', A: 'white', B: 'greyL', V: 'orange', G: 'yellow', layers: ['helmet', 'vest', 'gloves', 'smile'] },
  /* figurantes */
  theo: { S: 's3', H: '#2b2233', T: 'red', U: 'redD', P: 'blue', F: 'white', layers: ['curly', 'smile'] },
  bia: { S: 's1', H: '#6b3e26', T: 'yellow', U: 'yellowD', P: 'purple', F: 'pink', A: 'purple', layers: ['long', 'band', 'skirt', 'smile'] },
  iara: { S: 's4', H: '#22161d', T: 'teal', U: 'tealD', P: 'pink', F: 'white', A: 'yellow', layers: ['afro', 'band', 'skirt', 'open'] },
  olimpia: { S: 's4', H: '#f2f2f5', T: 'pink', U: 'pinkD', P: 'navy', F: 'brown', G: 'glass', layers: ['bun', 'glasses', 'skirt', 'smile'] },
  neide: { S: 's2', H: '#bfbfc8', T: 'purple', U: 'purple', P: 'blueD', F: 'brown', layers: ['short', 'skirt', 'smile'] },
  davi: { S: 's1', H: '#e8c25a', T: 'green', U: 'greenD', P: 'blue', F: 'red', layers: ['curly', 'open'] },
  sono: { S: 's2', H: '#4a2a18', T: 'red', U: 'redD', P: 'blue', F: 'white', layers: ['curly', 'closed'] }
};

/* corpo andando (segundo quadro da animação) */
const BODY_WALK = BODY.slice(0, 18).concat([
  '....kPPPPPPk....',
  '....kPPkkPPk....',
  '...kPPk..kPPk...',
  '..kPPk....kPPk..',
  '.kFFFk....kFFFk.',
  '.kkkkk....kkkkk.'
]);

/* ---------- avatares criados pelos jogadores ---------- */
const AVATAR_OPTS = {
  skin: ['s1', 's2', 's3', 's4'],
  hair: ['short', 'curly', 'afro', 'long', 'pony', 'braids', 'bun', 'cap'],
  hairColor: ['#22161d', '#5a3520', '#b5562c', '#e8c25a', '#cfcfd6', '#8f5fb8'],
  shirt: ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'],
  bottom: ['pants', 'skirt'],
  bottomColor: ['blue', 'navy', 'greyD', 'brown', 'purple', 'greenD'],
  extra: ['none', 'glasses', 'band', 'freckles']
};
const SHADE = { red: 'redD', orange: 'orangeD', yellow: 'yellowD', green: 'greenD', teal: 'tealD', blue: 'blueD', purple: 'purpleL', pink: 'pinkD' };
function randomAvatar() { const r = a => a[Math.floor(Math.random() * a.length)]; const o = AVATAR_OPTS; return { skin: r(o.skin), hair: r(o.hair), hairColor: r(o.hairColor), shirt: r(o.shirt), bottom: r(o.bottom), bottomColor: r(o.bottomColor), extra: r(o.extra) }; }
function avatarId(av) {
  if (!av) return 'theo';
  const key = 'av_' + [av.skin, av.hair, av.hairColor, av.shirt, av.bottom, av.bottomColor, av.extra].join('_').replace(/#/g, '');
  if (!LOOKS[key]) {
    const layers = [av.hair === 'cap' ? 'short' : av.hair];
    if (av.hair === 'cap') layers.push('cap');
    if (av.extra === 'glasses') layers.push('glasses');
    if (av.extra === 'band' && av.hair !== 'cap') layers.push('band');
    if (av.bottom === 'skirt') layers.push('skirt');
    layers.push(av.extra === 'freckles' ? 'freckles' : 'smile');
    LOOKS[key] = { S: av.skin, H: av.hairColor, h: av.hairColor, T: av.shirt, U: SHADE[av.shirt] || av.shirt, P: av.bottomColor, F: 'ink', A: av.shirt === 'yellow' ? 'red' : 'yellow', B: av.shirt === 'yellow' ? 'redD' : 'yellowD', G: 'glass', layers };
  }
  return key;
}

function buildCharacter(id, walk) {
  const look = LOOKS[id];
  const grid = (walk ? BODY_WALK : BODY).map(r => r.split(''));
  for (const ln of look.layers) {
    const L = LAYERS[ln];
    for (const row in L) {
      const s = L[row];
      for (let x = 0; x < 16; x++) { const ch = s[x]; if (ch && ch !== '.') grid[row][x] = ch; }
    }
  }
  const c = mkCanvas(16, 24), ctx = c.getContext('2d');
  const map = { k: PAL.ink, S: col(look.S), C: '#e98b8b', T: col(look.T), U: col(look.U || look.T), P: col(look.P), F: col(look.F), H: col(look.H), h: col(look.h || look.H), A: col(look.A || 'red'), B: col(look.B || look.A || 'red'), V: col(look.V || 'vest'), W: col(look.W || 'white'), G: col(look.G || 'yellow'), M: col(look.M || 'brownD'), R: '#a8343f' };
  grid.forEach((row, y) => row.forEach((ch, x) => { if (ch !== '.' && map[ch]) { ctx.fillStyle = map[ch]; ctx.fillRect(x, y, 1, 1); } }));
  return c;
}

/* ---------- Faísca (vaga-lume guia) e a Névoa ---------- */
const FAISCA = [
  '................',
  '...kk......kk...',
  '..kGGk....kGGk..',
  '..kGGGk..kGGGk..',
  '...kGGGkkGGGk...',
  '....kkNNNNkk....',
  '...kNNNNNNNNk...',
  '..kNWkNNNNWkNk..',
  '..kNkkNNNNkkNk..',
  '..kNNNNRRNNNNk..',
  '...kNNNNNNNNk...',
  '....kOOOOOOk....',
  '...kYYYYYYYYk...',
  '...kYLLLLLLYk...',
  '....kYLLLLYk....',
  '.....kkkkkk.....'
];
function buildFaisca() {
  const c = mkCanvas(16, 16), ctx = c.getContext('2d');
  const map = { k: PAL.ink, G: '#dff3fb', N: '#3c4a85', W: '#ffffff', R: '#ff9fb6', O: PAL.orange, Y: PAL.yellow, L: '#fff6c4' };
  FAISCA.forEach((r, y) => r.split('').forEach((ch, x) => { if (map[ch]) { ctx.fillStyle = map[ch]; ctx.fillRect(x, y, 1, 1); } }));
  return c;
}
/* Névoa: nuvem sonolenta 34x20 (cinza) ou colorida (transformada) */
function buildNevoa(happy) {
  const base = mkCanvas(32, 18), ctx = base.getContext('2d');
  const body = happy ? '#f3f0ff' : '#b9b6c6', shade = happy ? '#d8cff7' : '#99959f';
  drawOps(ctx, [[body, 4, 7, 24, 10], [body, 7, 3, 9, 6], [body, 15, 1, 9, 8], [body, 1, 10, 4, 6], [body, 27, 9, 4, 7], [shade, 3, 14, 26, 3]]);
  const out = outlined(base, happy ? '#7a6bb0' : '#5f5b6e'), o = out.getContext('2d');
  if (happy) {
    drawOps(o, [['ink', 10, 9, 3, 1], ['ink', 20, 9, 3, 1], ['ink', 9, 10, 1, 1], ['ink', 13, 10, 1, 1], ['ink', 19, 10, 1, 1], ['ink', 23, 10, 1, 1], ['pink', 8, 12, 3, 1], ['pink', 22, 12, 3, 1], ['ink', 15, 12, 3, 1], ['ink', 14, 11, 1, 1], ['ink', 18, 11, 1, 1]]);
  } else {
    drawOps(o, [['ink', 9, 10, 4, 1], ['ink', 20, 10, 4, 1], ['#5f5b6e', 15, 13, 3, 1], ['#ffffff', 26, 3, 2, 1], ['#ffffff', 28, 1, 2, 1]]);
  }
  return out;
}

/* ---------- cache ---------- */
const SPR = {
  _c: {}, _u: {},
  canvas(name, mode) {
    const key = name + '|' + (mode || '');
    if (this._c[key]) return this._c[key];
    let c;
    if (mode === 'walk') c = LOOKS[name] ? buildCharacter(name, true) : this.canvas(name);
    else if (mode) c = filtered(this.canvas(name), mode);
    else if (name === 'faisca') c = buildFaisca();
    else if (name === 'nevoa') c = buildNevoa(false);
    else if (name === 'nevoaFeliz') c = buildNevoa(true);
    else if (LOOKS[name]) c = buildCharacter(name);
    else if (PROPS[name]) {
      const p = PROPS[name], b = mkCanvas(p.w || 16, p.h || 16);
      drawOps(b.getContext('2d'), p.ops);
      c = outlined(b);
      if (p.top) drawOps(c.getContext('2d'), p.top, 1, 1);
    } else { c = mkCanvas(16, 16); console.warn('sprite ausente', name); }
    this._c[key] = c; return c;
  },
  url(name, mode) {
    const key = name + '|' + (mode || '');
    if (!this._u[key]) this._u[key] = this.canvas(name, mode).toDataURL();
    return this._u[key];
  },
  img(name, mode, cls = 'px', alt = '') {
    return `<img class="${cls}" src="${this.url(name, mode)}" alt="${alt}" draggable="false">`;
  }
};
