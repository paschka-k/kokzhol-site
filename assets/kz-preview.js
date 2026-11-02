/* Customer-view preview for the Platform section: the live demo of the customer portal in a modal iframe.
   The iframe is created on the first click only (the platform page is ~3 MB). The language follows <html lang>. */
(() => {
  'use strict';
  const BASE = window.KZ_PV_BASE || 'https://paschka-k.github.io/Olymp-Logistic-KZ/platform/';
  const FILE = { en: 'en.html', ru: 'index.html' };
  const T = {
    en: { btn: 'Preview customer view', note: 'Open the live demo of the customer portal here: book a shipment and see its status. Simulated data, nothing is sent.', title: 'Customer view', badge: 'demo', full: 'Open full screen', close: 'Close', loading: 'Loading the demo…', slow: 'The demo is taking long to load.', open: 'Open it in a new tab', frame: 'Customer portal demo' },
    ru: { btn: 'Предпросмотр клиентского вида', note: 'Откройте здесь живое демо клиентского портала: закажите перевозку и посмотрите статус. Данные симулируются, ничего не отправляется.', title: 'Клиентский вид', badge: 'демо', full: 'Открыть полностью', close: 'Закрыть', loading: 'Загружаем демо…', slow: 'Демо загружается долго.', open: 'Открыть в новой вкладке', frame: 'Демо клиентского портала' },
  };
  const lang = () => (document.documentElement.lang === 'ru' ? 'ru' : 'en');
  const url = l => BASE + FILE[l] + '?embed=customer&lang=' + l;
  const $ = (s, r) => (r || document).querySelector(s);
  const btn = $('[data-pv-open]');
  if (!btn) return;
  let modal, frame, loadedLang = '', timer, last, closeBtn, full;
  const focusables = () => [...modal.querySelectorAll('a[href],button')].filter(e => e.offsetParent !== null);
  const fill = () => {
    const t = T[lang()];
    btn.textContent = t.btn; const n = $('[data-pv-note]'); if (n) n.textContent = t.note;
    if (!modal) return;
    $('.pv-title b', modal).textContent = t.title; $('.pv-title small', modal).textContent = t.badge;
    full.textContent = t.full; closeBtn.textContent = t.close; frame.title = t.frame; $('[data-pv-wait]', modal).textContent = t.loading;
    $('[data-pv-slow-t]', modal).textContent = t.slow; $('[data-pv-slow-a]', modal).textContent = t.open;
    full.href = url(lang()); $('[data-pv-slow-a]', modal).href = url(lang());
  };
  const build = () => {
    modal = document.createElement('div'); modal.className = 'pv'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'pv-t');
    modal.innerHTML = '<span class="pv-sent" tabindex="0" data-pv-first></span><div class="pv-box"><div class="pv-bar"><div class="pv-title" id="pv-t"><b></b><small></small></div><a target="_blank" rel="noopener"></a><button type="button"></button></div>'
      + '<div class="pv-stage"><div class="pv-state" data-pv-loading role="status"><span data-pv-wait></span></div><div class="pv-state" data-pv-slow hidden><span data-pv-slow-t></span><a data-pv-slow-a target="_blank" rel="noopener"></a></div></div></div><span class="pv-sent" tabindex="0" data-pv-last></span>';
    document.body.appendChild(modal);
    full = $('.pv-bar a', modal); closeBtn = $('.pv-bar button', modal);
    frame = document.createElement('iframe'); frame.setAttribute('referrerpolicy', 'origin'); frame.setAttribute('allow', ''); $('.pv-stage', modal).insertBefore(frame, $('[data-pv-loading]', modal));
    frame.addEventListener('load', () => { clearTimeout(timer); if (frame.src && frame.src !== 'about:blank') $('[data-pv-loading]', modal).hidden = true; });
    closeBtn.addEventListener('click', close);
    modal.addEventListener('mousedown', e => { if (e.target === modal) close(); });
    $('[data-pv-first]', modal).addEventListener('focus', () => { const f = focusables(); f[f.length - 1].focus(); });
    $('[data-pv-last]', modal).addEventListener('focus', () => { focusables()[0].focus(); });
    fill();
  };
  const load = () => {
    const l = lang(); if (loadedLang === l) return; loadedLang = l;
    $('[data-pv-loading]', modal).hidden = false; $('[data-pv-slow]', modal).hidden = true;
    frame.src = url(l);
    clearTimeout(timer); timer = setTimeout(() => { if (!$('[data-pv-loading]', modal).hidden) { $('[data-pv-loading]', modal).hidden = true; $('[data-pv-slow]', modal).hidden = false; } }, 20000);
  };
  function show() { if (!modal) build(); last = document.activeElement; fill(); modal.hidden = false; document.documentElement.classList.add('pv-open'); load(); closeBtn.focus(); }
  function close() { if (!modal || modal.hidden) return; modal.hidden = true; document.documentElement.classList.remove('pv-open'); if (last && last.focus) last.focus(); }
  btn.addEventListener('click', show);
  document.addEventListener('keydown', e => {
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { const f = focusables(); if (!f.length) return; if (!modal.contains(document.activeElement)) { e.preventDefault(); f[0].focus(); } else if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });
  /* the portal asks to close on Escape while the focus is inside the frame */
  window.addEventListener('message', e => { if (modal && frame && e.source === frame.contentWindow && e.origin === new URL(BASE).origin && e.data && e.data.type === 'kz-embed' && e.data.action === 'close') close(); });
  new MutationObserver(() => { fill(); if (modal && !modal.hidden) load(); else if (modal) loadedLang = loadedLang === lang() ? loadedLang : ''; }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  fill();
})();
