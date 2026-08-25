/* ============================================================
   Project page renderer — reads window.PROJECT_DATA (one file
   per project under js/projects-data/) and populates the section
   containers in the project page template, then wires up the
   lightbox and video modal. Runs inline, before js/main.js, so the
   reveal / stat-counter observers in main.js see the final markup.
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.PROJECT_DATA;
  if (!DATA) return;

  var PLAY_ICON = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5l12 7-12 7z" fill="currentColor"/></svg>';
  var PLACEHOLDER_ICON = '<svg viewBox="0 0 24 24" width="30" height="30"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="10" r="1.6" fill="currentColor"/><path d="M4 16l4.5-4.5 3 3 3.5-4 5 5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function placeholderMedia(label) {
    return '<div class="media-placeholder"><span class="media-placeholder__icon">' + PLACEHOLDER_ICON + '</span><span class="media-placeholder__label">' + esc(label || 'Coming Soon') + '</span></div>';
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------- 1. Hero ---------- */
  function renderHero() {
    var h = DATA.hero;
    if (!h) return;

    if (DATA.meta && DATA.meta.title) document.title = DATA.meta.title;
    if (DATA.meta && DATA.meta.description) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', DATA.meta.description);
    }

    var mediaEl = document.getElementById('heroMedia');
    if (mediaEl) {
      mediaEl.innerHTML = h.media.placeholder
        ? placeholderMedia('Cover Image Coming Soon')
        : (h.media.type === 'video'
          ? '<video autoplay muted loop playsinline' + (h.media.poster ? ' poster="' + esc(h.media.poster) + '"' : '') + '><source src="' + esc(h.media.src) + '" type="video/mp4"></video>'
          : '<img src="' + esc(h.media.src) + '" alt="">');
      var heroSection = document.getElementById('project-hero');
      if (heroSection) heroSection.classList.toggle('has-placeholder-media', !!h.media.placeholder);
    }

    setText('heroBadge', h.badge);
    setText('heroTitle', h.name);
    setText('heroTagline', h.tagline);
    setText('heroMeta', h.date);
  }

  /* ---------- 2. Overview ---------- */
  function renderOverview() {
    var o = DATA.overview;
    if (!o) return;
    setText('overviewHeading', o.heading);
    setText('overviewText', o.text);
  }

  /* ---------- 3. Gallery ---------- */
  function renderGallery() {
    var grid = document.getElementById('galleryGrid');
    if (!grid) return;
    if (!DATA.gallery || !DATA.gallery.length) {
      var section = document.getElementById('gallery');
      if (section) section.style.display = 'none';
      return;
    }

    grid.innerHTML = DATA.gallery.map(function (item, i) {
      if (item.placeholder) {
        return (
          '<figure class="masonry-gallery__item masonry-gallery__item--placeholder" data-index="' + i + '">' +
            placeholderMedia(item.alt || 'Photo Coming Soon') +
          '</figure>'
        );
      }
      return (
        '<figure class="masonry-gallery__item reveal" data-index="' + i + '">' +
          '<img src="' + esc(item.image) + '" alt="' + esc(item.alt) + '" loading="lazy">' +
          '<span class="masonry-gallery__zoom" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 15.5L21 21M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>' +
        '</figure>'
      );
    }).join('');

    Array.prototype.slice.call(grid.querySelectorAll('.masonry-gallery__item')).forEach(function (fig) {
      if (fig.classList.contains('masonry-gallery__item--placeholder')) return;
      fig.addEventListener('click', function () {
        openLightbox(DATA.gallery, parseInt(fig.getAttribute('data-index'), 10));
      });
    });
  }

  /* ---------- 4. Video ----------
     Two schemas are supported: the newer DATA.videos = {featured, thumbs}
     (same shape as event pages, supports youtube-type items) used when a
     project has real videos, and the legacy single DATA.video = {video,
     title} (local mp4 only) still used by projects that only have a
     "Coming Soon" placeholder. */
  function renderVideo() {
    var v = DATA.video;
    var featuredEl = document.getElementById('videoFeatured');
    if (!featuredEl || !v) return;

    if (v.placeholder) {
      featuredEl.innerHTML = placeholderMedia(v.title || 'Video Coming Soon');
      return;
    }
    featuredEl.innerHTML =
      '<img src="' + esc(v.poster) + '" alt="' + esc(v.title) + '">' +
      '<div class="media-card__scrim"></div>' +
      '<button class="media-card__play" aria-label="Play ' + esc(v.title) + '">' + PLAY_ICON + '</button>' +
      '<div class="media-card__caption"><p class="media-card__title">' + esc(v.title) + '</p></div>';
    featuredEl.addEventListener('click', function () {
      openVideoModal(v);
    });
  }

  function renderVideos() {
    var v = DATA.videos;
    if (!v) return;

    var featuredEl = document.getElementById('videoFeatured');
    if (featuredEl && v.featured) {
      if (v.featured.placeholder) {
        featuredEl.innerHTML = placeholderMedia(v.featured.title || 'Video Coming Soon');
      } else {
        featuredEl.innerHTML =
          '<img src="' + esc(v.featured.poster) + '" alt="' + esc(v.featured.title) + '">' +
          '<div class="media-card__scrim"></div>' +
          '<button class="media-card__play" aria-label="Play ' + esc(v.featured.title) + '">' + PLAY_ICON + '</button>' +
          '<div class="media-card__caption"><p class="media-card__title">' + esc(v.featured.title) + '</p></div>';
        featuredEl.addEventListener('click', function () {
          openVideoModal(v.featured);
        });
      }
    }

    var thumbsEl = document.getElementById('videoThumbs');
    if (thumbsEl && (!v.thumbs || !v.thumbs.length)) thumbsEl.style.display = 'none';
    if (thumbsEl && v.thumbs && v.thumbs.length) {
      thumbsEl.innerHTML = v.thumbs.map(function (item, i) {
        return (
          '<article class="media-card" data-index="' + i + '">' +
            '<img src="' + esc(item.poster) + '" alt="' + esc(item.title) + '">' +
            '<div class="media-card__scrim"></div>' +
            '<button class="media-card__play" aria-label="Play ' + esc(item.title) + '">' + PLAY_ICON + '</button>' +
            '<div class="media-card__caption"><p class="media-card__title">' + esc(item.title) + '</p></div>' +
          '</article>'
        );
      }).join('');

      Array.prototype.slice.call(thumbsEl.querySelectorAll('.media-card')).forEach(function (card) {
        card.addEventListener('click', function () {
          var i = parseInt(card.getAttribute('data-index'), 10);
          openVideoModal(v.thumbs[i]);
        });
      });
    }
  }

  /* ---------- 5. Closing ---------- */
  function renderClosing() {
    var c = DATA.closing;
    if (!c) return;

    var mediaEl = document.getElementById('closingMedia');
    if (mediaEl) {
      mediaEl.innerHTML = c.media.placeholder
        ? placeholderMedia('Coming Soon')
        : (c.media.type === 'video'
          ? '<video autoplay muted loop playsinline><source src="' + esc(c.media.src) + '" type="video/mp4"></video>'
          : '<img src="' + esc(c.media.src) + '" alt="">');
    }

    var statementEl = document.getElementById('closingStatement');
    if (statementEl) statementEl.innerHTML = c.statement;

    var ctaEl = document.getElementById('closingCta');
    if (ctaEl) {
      ctaEl.textContent = c.ctaText;
      ctaEl.setAttribute('href', c.ctaHref);
    }
  }

  /* ---------- Lightbox (gallery images) ---------- */
  var lightbox, lightboxImg, lightboxCounter;
  var lightboxItems = [];
  var lightboxIndex = 0;

  function buildLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
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
      '<span class="lightbox__counter"></span>';
    document.body.appendChild(lightbox);

    lightboxImg = lightbox.querySelector('img');
    lightboxCounter = lightbox.querySelector('.lightbox__counter');

    lightbox.querySelector('.overlay-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.overlay-arrow--prev').addEventListener('click', function () { stepLightbox(-1); });
    lightbox.querySelector('.overlay-arrow--next').addEventListener('click', function () { stepLightbox(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  }

  function openLightbox(items, index) {
    if (!lightbox) buildLightbox();
    lightboxItems = items;
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function updateLightbox() {
    var item = lightboxItems[lightboxIndex];
    lightboxImg.src = item.image;
    lightboxImg.alt = item.alt || '';
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + lightboxItems.length;
  }
  function stepLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
    updateLightbox();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ---------- Video modal ---------- */
  var videoModal, videoModalFrame;

  function buildVideoModal() {
    videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.innerHTML =
      '<button class="overlay-close" aria-label="Close video">' +
        '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="video-modal__frame"></div>';
    document.body.appendChild(videoModal);

    videoModalFrame = videoModal.querySelector('.video-modal__frame');
    videoModal.querySelector('.overlay-close').addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', function (e) { if (e.target === videoModal) closeVideoModal(); });
  }

  /* Accepts either a youtube-type item ({ type: 'youtube', youtubeId, title })
     or a local-video item ({ video, title }) — same shape as event.js. */
  function openVideoModal(item) {
    if (!videoModal) buildVideoModal();
    if (item.type === 'youtube') {
      videoModalFrame.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + esc(item.youtubeId) + '?autoplay=1&rel=0" ' +
          'title="' + esc(item.title || 'Video') + '" frameborder="0" ' +
          'allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    } else {
      videoModalFrame.innerHTML = '<video controls playsinline autoplay aria-label="' + esc(item.title || 'Video') + '"><source src="' + esc(item.video) + '" type="video/mp4"></video>';
    }
    videoModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove('is-open');
    document.body.style.overflow = '';
    videoModalFrame.innerHTML = '';
  }

  /* ---------- Global overlay keyboard controls ---------- */
  document.addEventListener('keydown', function (e) {
    if (lightbox && lightbox.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    }
    if (videoModal && videoModal.classList.contains('is-open') && e.key === 'Escape') {
      closeVideoModal();
    }
  });

  /* ---------- Hero "Watch Trailer" button ---------- */
  function wireHeroButton() {
    var btn = document.getElementById('heroWatchBtn');
    var v = DATA.videos ? DATA.videos.featured : DATA.video;
    if (!btn || !v || v.placeholder) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openVideoModal(v);
    });
  }

  renderHero();
  renderOverview();
  renderGallery();
  if (DATA.videos) renderVideos(); else renderVideo();
  renderClosing();
  wireHeroButton();
})();
