/* ============================================================
   Shared overlays for event and project pages: the image lightbox
   and the video modal (local <video> or YouTube embed), plus their
   keyboard controls. Loaded on every page under /events/ and
   /projects/ before js/event.js / js/project.js, which call:

     SiteViewer.openLightbox(items, index)  items: [{ image, alt }]
     SiteViewer.openVideoModal(item)        { type: 'youtube', youtubeId, title }
                                            or { video, title } (local mp4)

   Both overlays are built on first use. Styles live in css/event.css.
   (gallery.html has its own captioned lightbox in js/gallery.js.)
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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

  window.SiteViewer = {
    openLightbox: openLightbox,
    openVideoModal: openVideoModal
  };
})();
