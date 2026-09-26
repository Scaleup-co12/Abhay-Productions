/* ============================================================
   Gallery page renderer
   Reads window.GALLERY_DATA (js/gallery-data.js), renders the
   justified collage, wires the Events / Film Making filters and the
   lightbox. Runs before js/main.js so the rendered tiles pick up the
   shared scroll-reveal.
   ============================================================ */
(function () {
  'use strict';

  var PHOTOS = window.GALLERY_DATA || [];
  var collage = document.getElementById('collage');
  var countEl = document.getElementById('galleryCount');
  if (!collage) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- Collage ---------- */
  collage.innerHTML = PHOTOS.map(function (p, i) {
    var ratio = (p.w / p.h).toFixed(4);
    return (
      '<button type="button" class="collage__item reveal" style="--r:' + ratio + '" data-index="' + i + '" data-kind="' + esc(p.kind) + '" aria-label="' + esc(p.alt || p.title) + '">' +
        '<img src="' + esc(p.src) + '" alt="" width="' + p.w + '" height="' + p.h + '" loading="lazy" decoding="async">' +
        '<span class="collage__caption">' + esc(p.title) + '</span>' +
      '</button>'
    );
  }).join('');

  var tiles = Array.prototype.slice.call(collage.querySelectorAll('.collage__item'));
  var visible = PHOTOS.slice();

  tiles.forEach(function (tile) {
    tile.addEventListener('click', function () {
      var photo = PHOTOS[parseInt(tile.getAttribute('data-index'), 10)];
      openLightbox(visible.indexOf(photo));
    });
  });

  /* ---------- Filters ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.gallery-filter'));

  function applyFilter(kind) {
    visible = PHOTOS.filter(function (p) { return kind === 'all' || p.kind === kind; });
    tiles.forEach(function (tile) {
      tile.hidden = kind !== 'all' && tile.getAttribute('data-kind') !== kind;
    });
    filterBtns.forEach(function (btn) {
      var on = btn.getAttribute('data-filter') === kind;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (countEl) countEl.textContent = visible.length + ' photos';
  }
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { applyFilter(btn.getAttribute('data-filter')); });
  });
  applyFilter('all');

  /* ---------- Lightbox ---------- */
  var lightbox, lightboxImg, lightboxCounter, lightboxCaption;
  var lightboxIndex = 0;
  var lastFocus = null;

  function buildLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox lightbox--captioned';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Photo viewer');
    lightbox.innerHTML =
      '<button class="overlay-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<button class="overlay-arrow overlay-arrow--prev" aria-label="Previous image">' +
        '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<figure class="lightbox__figure"><img alt=""></figure>' +
      '<button class="overlay-arrow overlay-arrow--next" aria-label="Next image">' +
        '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<p class="lightbox__caption"></p>' +
      '<span class="lightbox__counter"></span>';
    document.body.appendChild(lightbox);

    lightboxImg = lightbox.querySelector('img');
    lightboxCounter = lightbox.querySelector('.lightbox__counter');
    lightboxCaption = lightbox.querySelector('.lightbox__caption');

    lightbox.querySelector('.overlay-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.overlay-arrow--prev').addEventListener('click', function () { stepLightbox(-1); });
    lightbox.querySelector('.overlay-arrow--next').addEventListener('click', function () { stepLightbox(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

    /* Swipe left / right on touch screens */
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    });
  }

  function openLightbox(index) {
    if (index < 0) return;
    if (!lightbox) buildLightbox();
    lastFocus = document.activeElement;
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.overlay-close').focus();
  }
  function updateLightbox() {
    var p = visible[lightboxIndex];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.alt || '';
    var source = p.href
      ? '<a href="' + esc(p.href) + '">' + esc(p.title) + ' &rarr;</a>'
      : '<span>' + esc(p.title) + '</span>';
    lightboxCaption.innerHTML = (p.alt ? esc(p.alt) + '<br>' : '') + source;
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + visible.length;
  }
  function stepLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + visible.length) % visible.length;
    updateLightbox();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });
})();
