/* ============================================================
   SOM — música e efeitos gerados no navegador (sem arquivos)
   e leitura em voz alta (speechSynthesis, pt-BR)
   ============================================================ */
'use strict';

const Audio8 = {
  ctx: null, master: null, musicBus: null, sfxBus: null, timer: null, cfg: null, step: 0, brightness: 0,
  vol: { music: .5, sfx: .7, mute: false },
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(this.master);
      this.musicBus = this.ctx.createGain(); this.musicBus.connect(lp);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
      this.apply();
    } catch (e) { this.ctx = null; }
  },
  setVolumes(v) { Object.assign(this.vol, v); this.apply(); },
  apply() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.mute ? 0 : 1, t, .05);
    this.musicBus.gain.setTargetAtTime(this.vol.music * .16, t, .1);
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
  /* música generativa calma; brightness 0..1 deixa mais alegre conforme a cidade se ilumina */
  music(cfg, brightness = 0) {
    this.brightness = brightness;
    if (!this.ctx) { this.cfg = cfg; return; }
    if (this.cfg === cfg && this.timer) return;
    this.stopMusic(); this.cfg = cfg; if (!cfg) return;
    const beat = 60 / cfg.tempo / 2; let next = this.ctx.currentTime + .1; this.step = 0;
    const prog = [0, 5, 3, 4];
    this.timer = setInterval(() => {
      if (!this.ctx) return;
      while (next < this.ctx.currentTime + .4) {
        const s = this.step++, bar = Math.floor(s / 8) % 4, chord = prog[bar];
        const scale = this.SCALES[this.brightness < .25 ? 'min' : cfg.scale] || this.SCALES.maj;
        const root = cfg.root + [0, -7, -3, -5][bar];
        if (s % 8 === 0) this.note(this.mtof(root - 12), next, beat * 7, 'sine', .55, this.musicBus);
        if (s % 4 === 2) this.note(this.mtof(root + scale[2] - 12), next, beat * 3, 'sine', .25, this.musicBus);
        const density = .35 + this.brightness * .35;
        if (Math.random() < density) {
          const idx = (chord + Math.floor(Math.random() * 5)) % scale.length;
          this.note(this.mtof(cfg.root + scale[idx]), next, beat * (1.5 + Math.random() * 2), cfg.wave, cfg.wave === 'square' ? .09 : .2, this.musicBus);
        }
        next += beat;
      }
    }, 120);
  },
  stopMusic() { if (this.timer) clearInterval(this.timer); this.timer = null; this.cfg = null; },
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
      case 'reveal': seq([60, 64, 67, 72, 76, 79, 84], 'triangle', .22, .06); break;
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
