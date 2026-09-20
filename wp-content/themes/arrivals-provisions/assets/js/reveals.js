/* ============================================================
   reveals.js — scroll reveals, image parallax, horizontal pin
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  var still = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* ---- entrance reveals -----------------------------------
     Driven by ScrollTrigger rather than IntersectionObserver so
     that reveals, parallax and the pinned sections all read from
     the same scroll position that Lenis is animating. Mixing the
     two desyncs on programmatic jumps.
     ---------------------------------------------------------- */
  AP.initReveals = function () {
    var targets = document.querySelectorAll('[data-reveal], [data-lines], [data-clip]');
    var i;

    function show(el) { el.classList.add('is-in'); }

    if (still()) {
      for (i = 0; i < targets.length; i++) show(targets[i]);
      return;
    }

    if (window.gsap && window.ScrollTrigger) {
      for (i = 0; i < targets.length; i++) {
        (function (el) {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: function () { show(el); }
          });
        })(targets[i]);
      }
      return;
    }

    /* no-GSAP fallback */
    if (!('IntersectionObserver' in window)) {
      for (i = 0; i < targets.length; i++) show(targets[i]);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    for (i = 0; i < targets.length; i++) io.observe(targets[i]);
  };

  /* ---- image parallax ------------------------------------- */
  AP.initParallax = function () {
    if (still() || !window.gsap || !window.ScrollTrigger) return;

    /* `data-parallax="12"` sets the travel in percent of the image's
       own height; bare `data-parallax` means 5.

       Whatever the number, the image must be at least
       100 / (1 - 2 * amount/100) percent of its container and offset by
       half the overflow, or it slides off its own frame and exposes a
       gap. 5 needs 111%, 12 needs 136%. */
    gsap.utils.toArray('[data-parallax]').forEach(function (img) {
      var amount = parseFloat(img.getAttribute('data-parallax')) || 5;

      gsap.fromTo(img,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });
  };

})(window.AP);
