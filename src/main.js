/* ============================================================
   INÍCIO
   ============================================================ */
'use strict';
(function boot() {
  applySettings();
  const wake = () => { Audio8.init(); };
  document.addEventListener('pointerdown', wake, { once: true });
  document.addEventListener('keydown', wake, { once: true });
  if (window.__visit) go(screenVisit, ...window.__visit); else go(screenTitle);
})();
/* celular: pedir para girar e, no Android, tela cheia na horizontal */
(function () {
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (!coarse) return;
  document.documentElement.classList.add('needrot');
  try { if (sessionStorage.getItem('rotOk')) document.documentElement.classList.add('rotok'); } catch (e) {}
  const el = document.createElement('div'); el.id = 'rotate';
  el.innerHTML = `<div class="in"><div class="phone" aria-hidden="true"></div><h2>Gire o celular!</h2><p>Deitado, a cidade fica maior e os botões ficam pertinho do seu dedo.</p><button class="skip" id="rotskip">Jogar em pé mesmo</button></div>`;
  document.body.appendChild(el);
  el.querySelector('#rotskip').onclick = () => { document.documentElement.classList.add('rotok'); try { sessionStorage.setItem('rotOk', '1'); } catch (e) {} };
  /* primeiro toque: tela cheia + travar na horizontal quando o navegador deixa (Android) */
  let tried = false;
  document.addEventListener('pointerup', () => {
    if (tried) return; tried = true;
    const d = document.documentElement;
    if (d.requestFullscreen && !document.fullscreenElement) d.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
  }, { capture: true });
})();
