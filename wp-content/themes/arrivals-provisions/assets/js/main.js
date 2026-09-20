/* ============================================================
   main.js — boot order, smooth scroll, nav, curtain
   ============================================================ */

(function (AP) {
  'use strict';

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;

  /* ---- smooth scroll, wired into GSAP's ticker ------------ */
  function initSmoothScroll() {
    if (still || typeof Lenis === 'undefined' || !window.gsap) return;

    gsap.registerPlugin(ScrollTrigger);

    lenis = new Lenis({
      duration: 1.15,
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    window.__lenis = lenis;   /* handle for tooling / debugging */
  }

  /* ---- nav: solid bar once the hero is behind us ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var hero = document.querySelector('.hero');

    if (!window.ScrollTrigger || !hero) {
      window.addEventListener('scroll', function () {
        nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.9);
      }, { passive: true });
      return;
    }

    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top',
      onEnter: function () { nav.classList.add('is-solid'); },
      onLeaveBack: function () { nav.classList.remove('is-solid'); }
    });
  }

  /* ---- mobile menu ---------------------------------------- */
  function initMenu() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('is-menu-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('is-locked', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('is-menu-open')) {
        toggle.click();
      }
    });
  }

  /* ---- curtain ------------------------------------------- */
  function raiseCurtain() {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  /* ---- resize: line breaks change, so re-split ------------ */
  function initResize() {
    var t = null;
    var lastWidth = window.innerWidth;

    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) return;   // ignore mobile URL-bar resize
      lastWidth = window.innerWidth;

      clearTimeout(t);
      t = setTimeout(function () {
        AP.initSplits();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, 220);
    }, { passive: true });
  }

  /* ---- boot ----------------------------------------------- */
  function boot() {
    try {
      run();
    } catch (err) {
      /* never let a broken module leave the curtain down */
      console.error('[Arrivals Provisions]', err);
      raiseCurtain();
    }
  }

  function run() {
    AP.loadImages();
    initSmoothScroll();
    AP.initSplits();

    /* initGallery() first: it pins the Locations We Serve carousel,
       and GSAP inserts a multi-thousand-pixel spacer div to hold that
       pin's scroll distance. Every ScrollTrigger created AFTER that
       spacer exists gets the correct final document height baked into
       its start/end pixel values; every one created BEFORE it (as
       initGallery used to run near the end of this list) caches
       positions against a document that's ~8000px too short, and nothing
       later ever fixes it — see the note on AP.initReveals in
       reveals.js. Order here is not stylistic, it is load-bearing. */
    AP.initGallery();

    AP.initReveals();
    AP.initParallax();
    AP.initHero();
    AP.initReviews();
    AP.initTheme();
    initNav();
    initMenu();
    AP.initCursor();
    initResize();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* wait for fonts + hero image so the first frame is correct */
  window.addEventListener('load', function () {
    var fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    fontsReady.then(function () {
      AP.initSplits();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      setTimeout(raiseCurtain, 180);
    });
  });

  /* safety net — never leave the curtain down */
  setTimeout(function () {
    if (document.body.classList.contains('is-loading')) raiseCurtain();
  }, 3500);
})(window.AP);
