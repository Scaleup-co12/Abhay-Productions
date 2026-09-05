/* ============================================================
   Souvenir Book promo popup
   Shows once per browsing session (sessionStorage), automatically
   and immediately on first load — decoupled from window 'load' so
   heavy hero media (video/YouTube) can't delay it. Asset paths are
   resolved relative to this script's own <script src> so the same
   file works whether it's loaded from the site root or a subfolder.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'jkvSouvenirPopupSeen';
  var SHOW_DELAY_MS = 250;
  var CLOSE_ANIM_MS = 650;

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
  } catch (err) {
    /* sessionStorage unavailable (privacy mode) — fall through and show once */
  }

  var scriptEl = document.currentScript;
  var scriptSrc = scriptEl ? scriptEl.getAttribute('src') || '' : '';
  var base = scriptSrc.replace(/js\/souvenir-popup\.js.*$/, '');

  var PDF_URL = base + 'assets/jkv-2026-souvenir-book.pdf';
  var COVER_URL = base + 'assets/jkv-2026-souvenir-cover.jpg';

  function markSeen() {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (err) { /* ignore */ }
  }

  function buildPopup() {
    var overlay = document.createElement('div');
    overlay.className = 'souvenir-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'souvenirPopupTitle');

    overlay.innerHTML =
      '<div class="souvenir-popup">' +
        '<button class="souvenir-popup__close" type="button" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '</button>' +
        '<div class="souvenir-popup__media">' +
          '<img src="' + COVER_URL + '" alt="Andhra Pradesh Janapadha Kalavaibhavam 2026 Souvenir Book cover" loading="eager" decoding="async" fetchpriority="high">' +
        '</div>' +
        '<div class="souvenir-popup__content">' +
          '<p class="eyebrow">Souvenir Book</p>' +
          '<h3 class="souvenir-popup__title" id="souvenirPopupTitle">Andhra Pradesh Janapadha Kalavaibhavam 2026</h3>' +
          '<p class="souvenir-popup__text">Check out the Souvenir Book of Andhra Pradesh Janapadha Kalavaibhavam 2026, where you can get a glimpse of the event. Download the PDF version of the book, read it, and share it with others to help our Janapadha art forms reach more people.</p>' +
          '<a class="btn btn--primary souvenir-popup__cta" href="' + PDF_URL + '" download="JKV-2026-Souvenir-Book.pdf">Download Souvenir Book</a>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.souvenir-popup__close');
    var downloadBtn = overlay.querySelector('.souvenir-popup__cta');

    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      markSeen();
      window.removeEventListener('keydown', onKeydown);
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, CLOSE_ANIM_MS);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    closeBtn.addEventListener('click', close);
    downloadBtn.addEventListener('click', function () {
      markSeen();
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    window.addEventListener('keydown', onKeydown);

    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }

  function schedule() {
    setTimeout(buildPopup, SHOW_DELAY_MS);
  }

  /* This script tag sits at the end of <body>, so the DOM is already
     parsed by the time it runs — no need to wait for DOMContentLoaded,
     and definitely not for window 'load' (hero video/YouTube can take
     many seconds, which would delay the popup and defeat "immediately"). */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
})();
