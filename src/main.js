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
