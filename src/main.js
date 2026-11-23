/* ============================================================
   INÍCIO
   ============================================================ */
'use strict';
(function boot() {
  applySettings();
  const wake = () => { Audio8.init(); };
  document.addEventListener('pointerdown', wake, { once: true });
  document.addEventListener('keydown', wake, { once: true });
  const sala = (new URLSearchParams(location.search).get('sala') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  if (sala.length === 4) { const q = new URLSearchParams(location.search).get('peer'); history.replaceState(null, '', location.pathname + (q ? '?peer=' + q : '')); go(screenOnlineJoin, sala); }
  else if (window.__visit) go(screenVisit, ...window.__visit); else go(screenTitle);
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
  /* tela cheia só quando o celular já está deitado (não gira a tela sozinho) */
  document.addEventListener('pointerup', () => {
    const d = document.documentElement;
    if (!matchMedia('(orientation: landscape)').matches || document.fullscreenElement || !d.requestFullscreen) return;
    d.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  }, { capture: true });
})();
