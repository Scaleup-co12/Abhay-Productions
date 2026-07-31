(function () {
  'use strict';

  /* ---------- Page loader ---------- */
  var loader = document.querySelector('.page-loader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (loader) loader.classList.add('is-hidden');
    }, 250);
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero video sound toggle ---------- */
  var heroVideo = document.querySelector('.hero__video');
  var heroSoundToggle = document.getElementById('heroSoundToggle');
  if (heroVideo && heroSoundToggle) {
    heroSoundToggle.addEventListener('click', function () {
      heroVideo.muted = !heroVideo.muted;
      heroSoundToggle.classList.toggle('is-unmuted', !heroVideo.muted);
      heroSoundToggle.setAttribute('aria-pressed', String(!heroVideo.muted));
      heroSoundToggle.setAttribute('aria-label', heroVideo.muted ? 'Unmute video' : 'Mute video');
    });
  }

  /* ---------- Navbar: scrolled state + active link ---------- */
  var nav = document.getElementById('siteNav');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section[id], footer[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Active nav link via IntersectionObserver */
  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Mobile menu toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  var stats = Array.prototype.slice.call(document.querySelectorAll('.stat__num'));
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && stats.length) {
    var statsObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    stats.forEach(function (el) { statsObserver.observe(el); });
  }

  /* ---------- Carousels (drag + arrow scroll + autoplay) ---------- */
  function initCarousel(wrap) {
    var track = wrap.querySelector('.carousel__track');
    var prevBtn = wrap.querySelector('.carousel__arrow--prev');
    var nextBtn = wrap.querySelector('.carousel__arrow--next');
    if (!track) return;

    /* Clone the slide set once so autoplay can scroll forward forever
       with no visible seam: past the end of the originals, the clones
       are pixel-identical, and we silently rewind by one set-width
       right after the browser settles the scroll position. */
    var originalCount = track.children.length;
    var originalSlides = Array.prototype.slice.call(track.children);
    originalSlides.forEach(function (child) {
      var clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      Array.prototype.slice.call(clone.querySelectorAll('a, button')).forEach(function (el) {
        el.setAttribute('tabindex', '-1');
      });
      track.appendChild(clone);
    });

    var setWidth = 0;
    function measureSetWidth() {
      var firstClone = track.children[originalCount];
      setWidth = firstClone ? firstClone.offsetLeft - track.children[0].offsetLeft : 0;
    }
    measureSetWidth();

    function step() {
      var item = track.firstElementChild;
      if (!item) return 320;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || 24);
      return item.getBoundingClientRect().width + gap;
    }

    function wrapIfPastSet() {
      if (setWidth > 0 && track.scrollLeft >= setWidth - 2) {
        track.scrollLeft -= setWidth;
      }
    }
    var wrapTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(wrapTimer);
      wrapTimer = setTimeout(wrapIfPastSet, 120);
    }, { passive: true });

    if (prevBtn) prevBtn.addEventListener('click', function () {
      registerInteraction();
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      registerInteraction();
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    function updateArrowState() {
      if (prevBtn) prevBtn.style.opacity = track.scrollLeft <= 4 ? '.4' : '1';
    }
    track.addEventListener('scroll', updateArrowState, { passive: true });
    window.addEventListener('resize', function () {
      measureSetWidth();
      updateArrowState();
    });
    updateArrowState();

    /* Drag-to-scroll for desktop mouse users */
    var isDown = false, startX, scrollStart;
    track.addEventListener('mousedown', function (e) {
      isDown = true;
      track.classList.add('is-dragging');
      startX = e.pageX;
      scrollStart = track.scrollLeft;
      registerInteraction();
    });
    window.addEventListener('mouseup', function () {
      isDown = false;
      track.classList.remove('is-dragging');
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      track.scrollLeft = scrollStart - (e.pageX - startX);
    });

    /* ---------- Autoplay: advance one card every few seconds ---------- */
    var AUTOPLAY_DELAY = 4000;
    var RESUME_DELAY = 3000;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoplayTimer = null;
    var resumeTimer = null;
    var inView = false;
    var userPaused = false;

    function stopAutoplay() {
      if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }
    function startAutoplay() {
      if (reduceMotion || autoplayTimer || !inView || userPaused) return;
      autoplayTimer = setInterval(function () {
        if (document.hidden) return;
        track.scrollBy({ left: step(), behavior: 'smooth' });
      }, AUTOPLAY_DELAY);
    }
    function registerInteraction() {
      userPaused = true;
      stopAutoplay();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { userPaused = false; startAutoplay(); }, RESUME_DELAY);
    }

    wrap.addEventListener('mouseenter', function () {
      userPaused = true;
      stopAutoplay();
    });
    wrap.addEventListener('mouseleave', function () {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { userPaused = false; startAutoplay(); }, RESUME_DELAY);
    });
    track.addEventListener('touchstart', registerInteraction, { passive: true });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          if (inView) startAutoplay(); else stopAutoplay();
        });
      }, { threshold: 0.3 });
      io.observe(wrap);
    } else {
      inView = true;
      startAutoplay();
    }
  }
  Array.prototype.slice.call(document.querySelectorAll('.carousel, .coverflow')).forEach(initCarousel);

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
