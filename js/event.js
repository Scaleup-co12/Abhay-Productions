/* ============================================================
   Event page renderer — shared by every page under /events/. Each
   page loads its own js/events-data/<slug>.js (setting
   window.EVENT_DATA) before this script, which then populates the
   section containers and wires up the lightbox and video modal.
   Runs inline (no DOMContentLoaded wrapper needed: this script tag
   sits after the containers in the document, so they already exist)
   and BEFORE js/main.js, so the reveal / stat-counter observers in
   main.js see the final markup.
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.EVENT_DATA;
  if (!DATA) return;

  var PLAY_ICON = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5l12 7-12 7z" fill="currentColor"/></svg>';
  var PLACEHOLDER_ICON = '<svg viewBox="0 0 24 24" width="30" height="30"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="10" r="1.6" fill="currentColor"/><path d="M4 16l4.5-4.5 3 3 3.5-4 5 5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function placeholderMedia(label) {
    return '<div class="media-placeholder"><span class="media-placeholder__icon">' + PLACEHOLDER_ICON + '</span><span class="media-placeholder__label">' + esc(label || 'Coming Soon') + '</span></div>';
  }
  function hideSection(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  var ICONS = {
    circle: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    triangle: '<path d="M12 3l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    hexagon: '<path d="M12 2.5l8.3 4.8v9.4L12 21.5l-8.3-4.8V7.3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    diamond: '<path d="M12 2.5l9.5 9.5L12 21.5 2.5 12z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    wave: '<path d="M2.5 14l4-8 4 6 4-10 4 12 3-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    square: '<rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    star: '<path d="M12 2.8l2.4 6.2 6.6.4-5.1 4.3 1.7 6.4-5.6-3.6-5.6 3.6 1.7-6.4-5.1-4.3 6.6-.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
  };

  var STAT_ICONS = {
    audience: '<circle cx="9" cy="9" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.8 20c1-3.6 3.6-5.6 6.2-5.6s5.2 2 6.2 5.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="17" cy="8" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M15.5 20c.5-2.6 1.8-4.4 3.7-5.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    performances: '<rect x="3.5" y="5" width="17" height="15" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 9.5h17M7 5v4.5M17 5v4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    artists: '<rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 18v4M9 22h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    sponsors: '<path d="M8 12.5l2.6 2.6 5.4-5.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    'default': '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3.2 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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
      var heroSection = document.getElementById('event-hero');
      if (heroSection) heroSection.classList.toggle('has-placeholder-media', !!h.media.placeholder);
    }

    setText('heroBadge', h.badge);
    setText('heroTitle', h.name);
    setText('heroTagline', h.tagline);
    setText('heroMeta', h.location ? (h.date + ' · ' + h.location) : h.date);
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------- 2. Highlights ---------- */
  function renderHighlights() {
    var grid = document.getElementById('highlightsGrid');
    if (!grid) return;
    if (!DATA.highlights || !DATA.highlights.length) { hideSection('highlights'); return; }

    grid.innerHTML = DATA.highlights.map(function (item, i) {
      if (item.placeholder) {
        return (
          '<article class="highlight-card reveal" data-index="' + i + '" data-type="placeholder">' +
            placeholderMedia(item.title) +
          '</article>'
        );
      }
      var play = (item.type === 'video' || item.type === 'instagram')
        ? '<button class="highlight-card__play" aria-label="Play video">' + PLAY_ICON + '</button>'
        : '';
      return (
        '<article class="highlight-card reveal" data-index="' + i + '" data-type="' + item.type + '">' +
          '<img src="' + esc(item.image) + '" alt="' + esc(item.title) + '" loading="lazy">' +
          '<div class="highlight-card__scrim"></div>' +
          play +
          '<div class="highlight-card__caption">' +
            '<h3 class="highlight-card__title">' + esc(item.title) + '</h3>' +
            (item.tag ? '<span class="highlight-card__tag">' + esc(item.tag) + '</span>' : '') +
          '</div>' +
        '</article>'
      );
    }).join('');

    Array.prototype.slice.call(grid.querySelectorAll('.highlight-card')).forEach(function (card) {
      card.addEventListener('click', function () {
        var i = parseInt(card.getAttribute('data-index'), 10);
        var item = DATA.highlights[i];
        if (item.placeholder) return;
        if (item.watchUrl) {
          window.open(item.watchUrl, '_blank', 'noopener,noreferrer');
        } else if (item.type === 'video') {
          openVideoModal(item);
        } else {
          openLightbox([{ image: item.image, alt: item.title }], 0);
        }
      });
    });
  }

  /* ---------- 3. Videos ---------- */
  function renderVideos() {
    var v = DATA.videos;
    if (!v) return;

    var featuredEl = document.getElementById('videoFeatured');
    if (featuredEl && v.featured) {
      if (v.featured.placeholder) {
        featuredEl.innerHTML = placeholderMedia(v.featured.title || 'Video Coming Soon');
      } else {
        var isPremiere = v.featured.type === 'youtube-premiere';
        featuredEl.innerHTML =
          '<img src="' + esc(v.featured.poster) + '" alt="' + esc(v.featured.title) + '">' +
          '<div class="media-card__scrim"></div>' +
          '<button class="media-card__play" aria-label="Play ' + esc(v.featured.title) + '">' + PLAY_ICON + '</button>' +
          '<div class="media-card__caption">' +
            (isPremiere ? '<span class="premiere-badge"><span class="premiere-badge__dot" aria-hidden="true"></span>Premiere</span>' : '') +
            '<p class="media-card__title">' + esc(v.featured.title) + '</p>' +
            (isPremiere
              ? '<p class="premiere-countdown" data-premiere="' + esc(v.featured.premiereAt) + '" data-live-text="' + esc(v.featured.liveText || 'Live now — Watch on YouTube') + '">Premieres soon</p>'
              : '<span class="media-card__tag">' + esc(v.featured.meta) + '</span>') +
          '</div>';
        featuredEl.classList.toggle('media-card--premiere', isPremiere);
        featuredEl.setAttribute('aria-label', 'Watch ' + (v.featured.title || 'video') + (isPremiere ? ' on YouTube' : ''));
        featuredEl.addEventListener('click', function () {
          if (isPremiere && v.featured.watchUrl) {
            window.open(v.featured.watchUrl, '_blank', 'noopener,noreferrer');
          } else {
            openVideoModal(v.featured);
          }
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
            '<div class="media-card__caption">' +
              '<p class="media-card__title">' + esc(item.title) + '</p>' +
              (item.tag ? '<span class="media-card__tag">' + esc(item.tag) + '</span>' : '') +
            '</div>' +
          '</article>'
        );
      }).join('');

      Array.prototype.slice.call(thumbsEl.querySelectorAll('.media-card')).forEach(function (card) {
        card.addEventListener('click', function () {
          var i = parseInt(card.getAttribute('data-index'), 10);
          var item = v.thumbs[i];
          if (item.watchUrl) {
            window.open(item.watchUrl, '_blank', 'noopener,noreferrer');
          } else {
            openVideoModal(item);
          }
        });
      });
    }
  }

  /* ---------- 4. Gallery ---------- */
  function renderGallery() {
    var grid = document.getElementById('galleryGrid');
    if (!grid || !DATA.gallery) return;

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

    var viewAllBtn = document.getElementById('galleryViewAllBtn');
    var hasRealPhotos = DATA.gallery.some(function (item) { return !item.placeholder; });
    if (viewAllBtn) {
      if (!hasRealPhotos) viewAllBtn.style.display = 'none';
      else viewAllBtn.addEventListener('click', function () { openLightbox(DATA.gallery, 0); });
    }
  }

  /* ---------- 5. Stats ---------- */
  function renderStats() {
    var grid = document.getElementById('statsGrid');
    if (!grid) return;
    if (!DATA.stats || !DATA.stats.length) { hideSection('stats'); return; }

    grid.innerHTML = DATA.stats.map(function (s) {
      var key = String(s.label).toLowerCase();
      var icon = STAT_ICONS[key] || STAT_ICONS['default'];
      return (
        '<div class="event-stat">' +
          '<svg class="event-stat__icon" viewBox="0 0 24 24" width="28" height="28">' + icon + '</svg>' +
          '<p class="event-stat__value"><span class="stat__num" data-count="' + s.value + '">0</span>' + esc(s.suffix) + '</p>' +
          '<p class="event-stat__label">' + esc(s.label) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------- 6. Sponsors ---------- */
  function renderSponsors() {
    var track = document.getElementById('sponsorsTrack');
    if (!track) return;
    if (!DATA.sponsors || !DATA.sponsors.length) { hideSection('sponsors'); return; }

    var tiles = DATA.sponsors.map(function (s) {
      if (s.image) {
        return '<div class="logo-tile logo-tile--image"><span class="logo-tile__card"><img src="' + esc(s.image) + '" alt="' + esc(s.name) + '" loading="lazy"></span></div>';
      }
      var icon = ICONS[s.icon] || ICONS.circle;
      return (
        '<div class="logo-tile">' +
          '<svg viewBox="0 0 24 24" width="26" height="26">' + icon + '</svg>' +
          '<span>' + esc(s.name) + '</span>' +
        '</div>'
      );
    }).join('');

    track.innerHTML =
      '<div class="marquee__group">' + tiles + '</div>' +
      '<div class="marquee__group" aria-hidden="true">' + tiles + '</div>';
  }

  /* ---------- 7. Closing ---------- */
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

  /* ---------- Lightbox (gallery + highlight images) ---------- */
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

  /* ---------- Video modal (local <video> or YouTube embed) ---------- */
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

  /* ---------- Hero "Watch Highlights" button ---------- */
  function wireHeroButton() {
    var btn = document.getElementById('heroWatchBtn');
    if (!btn || !DATA.videos || !DATA.videos.featured || DATA.videos.featured.placeholder) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openVideoModal(DATA.videos.featured);
    });
  }

  /* ---------- Hero "View Project" button (optional, per event) ---------- */
  function wireProjectButton() {
    var btn = document.getElementById('heroProjectBtn');
    var link = DATA.hero && DATA.hero.projectLink;
    if (!btn || !link || !link.href) return;
    btn.textContent = link.label || 'View Project';
    btn.setAttribute('href', link.href);
    btn.style.display = '';
  }

  renderHero();
  renderHighlights();
  renderVideos();
  renderGallery();
  renderStats();
  renderSponsors();
  renderClosing();
  wireHeroButton();
  wireProjectButton();
})();
