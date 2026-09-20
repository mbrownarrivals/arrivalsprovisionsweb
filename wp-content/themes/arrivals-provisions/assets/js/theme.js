/* ============================================================
   theme.js — the ground turns
   ------------------------------------------------------------
   The site has ONE background colour, not a set of coloured
   sections. It starts bone and turns to night as you scroll, and
   every section inherits it through the --page-* tokens.

   The turn is placed across the THIRD photograph in the founder
   cascade, so the change happens under an image rather than in the
   middle of a page of type, where a shifting background is
   distracting. Everything from there down — the fork, the statement,
   the reviews, the footer — is night.

   Anything that hard-codes a section background will sit on top of
   this and break it. Sections should set no background at all.
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  /* [r, g, b, a] */
  var LIGHT = {
    'page-bg':     [244, 240, 232, 1],
    'page-fg':     [28, 25, 23, 1],
    'page-fg-mid': [70, 64, 58, 1],
    'page-fg-low': [138, 129, 114, 1],
    'page-line':   [28, 25, 23, 0.14],
    'page-veil':   [244, 240, 232, 0.86]
  };

  var NIGHT = {
    'page-bg':     [25, 23, 21, 1],
    'page-fg':     [244, 240, 232, 1],
    'page-fg-mid': [244, 240, 232, 0.68],
    'page-fg-low': [244, 240, 232, 0.5],
    'page-line':   [244, 240, 232, 0.16],
    'page-veil':   [25, 23, 21, 0.86]
  };

  function mix(a, b, t) {
    return 'rgba(' +
      Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
      Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
      Math.round(a[2] + (b[2] - a[2]) * t) + ',' +
      (a[3] + (b[3] - a[3]) * t).toFixed(3) + ')';
  }

  AP.initTheme = function () {
    var root = document.documentElement;
    var turn = document.querySelector('.founder__figure--turn') ||
               document.querySelector('.statement');
    if (!turn) return;

    function apply(t) {
      for (var key in LIGHT) {
        root.style.setProperty('--' + key, mix(LIGHT[key], NIGHT[key], t));
      }
      /* lets anything that needs to know which half it is in ask */
      document.body.classList.toggle('is-night', t > 0.5);
    }

    /* No GSAP, or reduced motion: skip the animation, but still land
       on night for the dark half so the reviews and footer are not
       ink-on-bone. */
    if (!window.gsap || !window.ScrollTrigger) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ScrollTrigger.create({
        trigger: turn,
        start: 'top 60%',
        onEnter: function () { apply(1); },
        onLeaveBack: function () { apply(0); }
      });
      return;
    }

    ScrollTrigger.create({
      trigger: turn,
      start: 'top bottom',
      end: 'top 35%',
      scrub: true,
      onUpdate: function (self) { apply(self.progress); }
    });
  };
})(window.AP);
