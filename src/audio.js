/* ============================================================
   SOM — música e efeitos gerados no navegador (sem arquivos)
   e leitura em voz alta (speechSynthesis, pt-BR)
   ============================================================ */
'use strict';

const Audio8 = {
  ctx: null, master: null, musicBus: null, sfxBus: null, leadBus: null, timer: null, cfg: null, step: 0, brightness: 0, energy: 0,
  vol: { music: .5, sfx: .7, mute: false },
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; lp.connect(this.master);
      this.musicBus = this.ctx.createGain(); this.musicBus.connect(lp);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
      /* eco suave só na melodia: deixa o som mais redondo e menos 'apito' */
      this.leadBus = this.ctx.createGain(); this.leadBus.connect(this.musicBus);
      const dl = this.ctx.createDelay(1); dl.delayTime.value = .27; const fb = this.ctx.createGain(); fb.gain.value = .28; const wet = this.ctx.createGain(); wet.gain.value = .22;
      const dlp = this.ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2600;
      this.leadBus.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(wet); wet.connect(this.musicBus);
      this.apply();
    } catch (e) { this.ctx = null; }
  },
  setVolumes(v) { Object.assign(this.vol, v); this.apply(); },
  apply() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.mute ? 0 : 1, t, .05);
    this.musicBus.gain.setTargetAtTime(this.vol.music * .13, t, .1);
    this.sfxBus.gain.setTargetAtTime(this.vol.sfx * .5, t, .02);
  },
  note(freq, start, dur, type = 'triangle', gain = .3, bus) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(gain, start + .015);
    g.gain.exponentialRampToValueAtTime(.0008, start + dur);
    o.connect(g); g.connect(bus || this.sfxBus); o.start(start); o.stop(start + dur + .05);
  },
  mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); },
  SCALES: { maj: [0, 2, 4, 7, 9, 12, 14, 16], pent: [0, 3, 5, 7, 10, 12, 15, 17], min: [0, 3, 5, 7, 8, 12, 15, 17] },
  /* música chiptune ALEGRE: 4 temas originais em tom maior, com bateria, baixo saltitante e melodia.
     brightness (0..1) acrescenta instrumentos conforme a cidade se ilumina. */
  SONGS: [
    { prog: [0, 4, 5, 3], mel: ['1 3 5 8 7 5 3 5', '2 5 7 5 9 - 7 -', '6 5 3 5 6 8 9 8', '4 3 4 6 5 - . .', '1 3 5 8 7 5 3 5', '2 5 7 9 A - 9 7', '8 7 6 5 6 - 5 3', '4 2 7 2 1 - . .'] },
    { prog: [0, 3, 0, 4], mel: ['5 . 5 6 5 . 3 .', '4 . 4 6 8 . 6 .', '5 . 5 6 5 3 1 3', '2 . 2 3 2 . 7 .', '5 . 5 6 5 . 8 .', '6 . 6 8 A . 8 .', '9 8 7 6 5 3 2 3', '1 - - . 1 . . .'] },
    { prog: [5, 3, 0, 4], mel: ['3 3 . 5 . 3 2 1', '4 4 . 6 . 4 3 2', '5 5 . 8 . 5 6 7', '9 - 8 - 7 - 5 .', '3 3 . 5 . 3 2 1', '4 4 . 6 . 8 9 A', 'B A 9 8 7 8 9 7', '8 - - - . . . .'] },
    { prog: [0, 4, 5, 3], mel: ['1 . 3 5 . 3 5 6', '5 . 7 9 . 7 5 .', '6 . 8 6 . 5 3 .', '4 . 6 8 . 6 4 .', '8 . 9 A . 9 8 6', '7 . 5 7 9 - . .', '8 6 5 3 5 6 5 3', '2 . 3 2 1 - . .'] }],
  MAJ: [0, 2, 4, 5, 7, 9, 11],
  deg(d) { const i = d - 1; return 12 * Math.floor(i / 7) + this.MAJ[((i % 7) + 7) % 7]; },
  noiseBuf() {
    if (this._nb) return this._nb;
    const c = this.ctx, b = c.createBuffer(1, c.sampleRate * .3, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return (this._nb = b);
  },
  hit(kind, t) {
    const c = this.ctx, g = c.createGain(); g.connect(this.musicBus);
    if (kind === 'kick') {
      const o = c.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); o.connect(g); o.start(t); o.stop(t + .2);
    } else {
      const s = c.createBufferSource(), f = c.createBiquadFilter(); s.buffer = this.noiseBuf();
      f.type = 'highpass'; f.frequency.value = kind === 'hat' ? 7000 : 1800; s.connect(f); f.connect(g);
      const d = kind === 'hat' ? .04 : .12; g.gain.setValueAtTime(kind === 'hat' ? .18 : .45, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      s.start(t); s.stop(t + d + .02);
    }
  },
  music(cfg, brightness = 0) {
    this.brightness = brightness;
    if (!this.ctx) { this.cfg = cfg; return; }
    if (this.cfg === cfg && this.timer) return;
    if (!cfg) { this.stopMusic(); return; }
    const songI = ((cfg.root || 60) + Math.round((cfg.tempo || 100) / 8)) % this.SONGS.length, sg = this.SONGS[songI];
    const cur = { song: sg, six: 60 / 132 / 4, key: 60 + (((cfg.root || 60) - 60) % 5), toks: sg.mel.map(b => b.split(' ')) };
    this.cfg = cfg;
    /* já tocando: troca no começo do próximo compasso, sem corte */
    if (this.timer) { this.pendingCur = cur; return; }
    this.cur = cur;
    let next = this.ctx.currentTime + .12; this.step = 0;
    this.timer = setInterval(() => {
      if (!this.ctx) return;
      while (next < this.ctx.currentTime + .3) {
        if (this.step % 16 === 0 && this.pendingCur) { this.cur = this.pendingCur; this.pendingCur = null; }
        const { song, six, key, toks } = this.cur;
        const s = this.step++, st = s % 16, bar = Math.floor(s / 16), chordDeg = song.prog[bar % 4] + 1;
        const rootN = key - 12 + this.deg(chordDeg), br = this.brightness, full = br >= .2, chorus = Math.floor(bar / 8) % 2 === 1, en = this.energy;
        const sw = st % 2 ? six * .14 : 0, t = next + sw, lead = this.leadBus || this.musicBus;
        /* bateria: verso leve, refrão cheio, virada a cada 8 compassos */
        const fill = bar % 8 === 7 && st >= 12;
        if (st % 8 === 0 || (st === 10 && (full || chorus))) this.hit('kick', t);
        if (((st === 4 || st === 12) && (full || chorus)) || (fill && st % 1 === 0 && st >= 12)) this.hit('snare', t);
        if (st % 2 === 0 || en || chorus) this.hit('hat', t);
        /* baixo saltitante */
        if (st % 2 === 0) this.note(this.mtof(rootN - 12 + (st % 4 ? 12 : 0)), t, six * 1.6, 'square', .085, this.musicBus);
        /* acorde: arpejo no refrão, pad suave no verso */
        if ((full || chorus) && st % 2 === 1) { const tri = [0, 2, 4][((st - 1) / 2) % 3]; this.note(this.mtof(key + this.deg(chordDeg + tri)), t, six * 1.2, 'triangle', .07, this.musicBus); }
        if (!chorus && st === 0) [0, 2, 4].forEach(o => this.note(this.mtof(key + this.deg(chordDeg + o)), t, six * 15, 'sine', .05, this.musicBus));
        /* melodia: verso com triângulo doce, refrão com quadrada + harmonia */
        if (st % 2 === 0) {
          const row = toks[bar % toks.length], tk = row[st / 2];
          if (tk && tk !== '.' && tk !== '-') {
            let len = 1; for (let j = st / 2 + 1; j < row.length && row[j] === '-'; j++) len++;
            const d = isNaN(+tk) ? 10 + 'ABC'.indexOf(tk) : +tk, f = this.mtof(key + 12 + this.deg(d));
            this.note(f, t, six * 2 * len * .95, chorus ? 'square' : 'triangle', chorus ? .075 : .16, lead);
            if (chorus) this.note(this.mtof(key + 12 + this.deg(d + 2)), t, six * 2 * len * .9, 'triangle', .06, lead);
            else this.note(f * 2, t + six * .5, six * 2 * len * .5, 'sine', .03, lead);
          }
        }
        next += six;
      }
    }, 80);
  },
  stopMusic() { if (this.timer) clearInterval(this.timer); this.timer = null; this.cfg = null; this.pendingCur = null; },
  sfx(name) {
    if (!this.ctx || this.vol.mute) return;
    const t = this.ctx.currentTime, m = this.mtof.bind(this);
    const seq = (notes, type = 'square', g = .18, d = .09) => notes.forEach((n, i) => n && this.note(m(n), t + i * d, d * 2.2, type, g));
    switch (name) {
      case 'click': seq([84], 'square', .06, .03); break;
      case 'select': seq([76, 81], 'square', .07, .04); break;
      case 'found': seq([79, 84, 88], 'triangle', .25, .07); break;
      case 'ok': seq([72, 76, 79, 84], 'triangle', .25, .07); break;
      case 'soft': seq([67, 64], 'sine', .25, .12); break;
      case 'step': seq([60, 67], 'triangle', .15, .05); break;
      case 'reveal': seq([67, 72, 76, 79, 0, 76, 79, 84], 'square', .14, .085); seq([55, 60, 64, 67, 0, 64, 67, 72], 'triangle', .18, .085); break; /* tema do herói */
      case 'villain': seq([50, 0, 49, 0, 46], 'sawtooth', .16, .16); seq([38, 0, 37, 0, 34], 'square', .14, .16); break; /* tema da vilã */
      case 'light': seq([88, 0, 91, 0, 96], 'sine', .3, .07); break;
      case 'medal': seq([72, 76, 79, 84, 79, 84, 88], 'square', .1, .07); break;
      case 'page': seq([90], 'sine', .1, .03); break;
      case 'win': seq([60, 64, 67, 72, 67, 72, 76, 79, 84, 88, 91, 96], 'triangle', .22, .08); break;
    }
  }
};

const Voice = {
  enabled: true, rate: .95, voice: null,
  ok() { return 'speechSynthesis' in window; },
  pick() {
    if (!this.ok()) return null;
    const vs = speechSynthesis.getVoices();
    this.voice = vs.find(v => /pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null;
    return this.voice;
  },
  speak(text) {
    if (!this.enabled || !this.ok() || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[•▸◂]/g, ''));
      u.lang = 'pt-BR'; u.rate = this.rate; if (this.voice || this.pick()) u.voice = this.voice;
      speechSynthesis.speak(u);
    } catch (e) { /* sem voz disponível */ }
  },
  stop() { try { if (this.ok()) speechSynthesis.cancel(); } catch (e) {} }
};
if ('speechSynthesis' in window) { try { speechSynthesis.onvoiceschanged = () => Voice.pick(); } catch (e) {} }
