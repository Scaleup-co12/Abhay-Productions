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

  /* ---------- Poster fill: blurred backdrop for letterboxed cards ----------
     .card__media uses object-fit: contain so posters never get cropped; any
     poster narrower/shorter than the A4 card shape leaves empty space, which
     this fills with a blurred, scaled-up copy of the same poster instead of
     plain background color. */
  Array.prototype.slice.call(document.querySelectorAll('.card__media img')).forEach(function (img) {
    function setFill() {
      img.parentElement.style.setProperty('--fill-bg', 'url("' + img.currentSrc + '")');
    }
    if (img.complete && img.currentSrc) setFill();
    else img.addEventListener('load', setFill);
  });

  /* ---------- Carousels (drag + arrow scroll + autoplay) ---------- */
  function initCarousel(wrap) {
    var track = wrap.querySelector('.carousel__track');
    var prevBtn = wrap.querySelector('.carousel__arrow--prev');
    var nextBtn = wrap.querySelector('.carousel__arrow--next');
    if (!track) return;

    /* Both the Events carousel and the Projects coverflow are fixed-end
       strips: arrows and autoplay stop at the last real card instead of
       looping back to the start. */
    function step() {
      var item = track.firstElementChild;
      if (!item) return 320;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || 24);
      return item.getBoundingClientRect().width + gap;
    }

    function atEnd() {
      return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      registerInteraction();
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (atEnd()) return;
      registerInteraction();
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });

    function updateArrowState() {
      if (prevBtn) prevBtn.style.opacity = track.scrollLeft <= 4 ? '.4' : '1';
      if (nextBtn) {
        var stopped = atEnd();
        nextBtn.style.opacity = stopped ? '.4' : '1';
        nextBtn.style.pointerEvents = stopped ? 'none' : '';
      }
    }
    track.addEventListener('scroll', updateArrowState, { passive: true });
    window.addEventListener('resize', updateArrowState);
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
        if (atEnd()) { stopAutoplay(); return; }
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

  /* ---------- Premiere countdowns ----------
     Drives any [data-premiere] element (hero card on the home page,
     the featured video card on an event page) — ISO datetime in the
     attribute, ticks every second, swaps to the live label once due. */
  var premiereEls = Array.prototype.slice.call(document.querySelectorAll('[data-premiere]'));
  if (premiereEls.length) {
    var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
    var formatCountdown = function (ms) {
      var totalSec = Math.max(0, Math.floor(ms / 1000));
      var d = Math.floor(totalSec / 86400);
      var h = Math.floor((totalSec % 86400) / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;
      if (d > 0) return d + 'd ' + pad2(h) + 'h ' + pad2(m) + 'm';
      return pad2(h) + 'h ' + pad2(m) + 'm ' + pad2(s) + 's';
    };
    var tickPremiere = function (el, target) {
      var diff = target - Date.now();
      if (diff <= 0) {
        el.textContent = el.getAttribute('data-live-text') || 'Live now — Watch on YouTube';
        el.classList.add('is-live');
        return false;
      }
      el.textContent = 'Premieres in ' + formatCountdown(diff);
      return true;
    };
    premiereEls.forEach(function (el) {
      var target = new Date(el.getAttribute('data-premiere')).getTime();
      if (isNaN(target)) return;
      if (!tickPremiere(el, target)) return;
      var timer = setInterval(function () {
        if (!tickPremiere(el, target)) clearInterval(timer);
      }, 1000);
    });
  }

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
