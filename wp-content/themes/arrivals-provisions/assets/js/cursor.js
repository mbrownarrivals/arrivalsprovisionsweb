/* ============================================================
   cursor.js — custom cursor + magnetic buttons
   Pointer devices only. Disabled under reduced-motion.
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  AP.initCursor = function () {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) return;

    var cursor = document.querySelector('.cursor');
    var circle = cursor.querySelector('.cursor__circle');

    var target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var pos = { x: target.x, y: target.y };

    window.addEventListener('mousemove', function (e) {
      target.x = e.clientX;
      target.y = e.clientY;
      cursor.classList.add('is-active');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-active');
    });

    /* smoothed follow — the trailing lag is the whole effect */
    (function loop() {
      pos.x += (target.x - pos.x) * 0.15;
      pos.y += (target.y - pos.y) * 0.15;

      circle.style.transform =
        'translate3d(' + pos.x + 'px,' + pos.y + 'px,0) translate(-50%,-50%)';

      requestAnimationFrame(loop);
    })();

    AP.initMagnetic();
  };

  /* Buttons that lean toward the pointer. */
  AP.initMagnetic = function () {
    var strength = 0.32;
    var targets = document.querySelectorAll('[data-magnetic]');

    for (var i = 0; i < targets.length; i++) {
      (function (el) {
        var raf = null;

        function move(e) {
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function () {
            var r = el.getBoundingClientRect();
            var dx = e.clientX - (r.left + r.width / 2);
            var dy = e.clientY - (r.top + r.height / 2);
            el.style.transform =
              'translate3d(' + dx * strength + 'px,' + dy * strength + 'px,0)';
          });
        }

        function reset() {
          if (raf) cancelAnimationFrame(raf);
          el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
          el.style.transform = 'translate3d(0,0,0)';
          setTimeout(function () { el.style.transition = ''; }, 620);
        }

        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', reset);
      })(targets[i]);
    }
  };
})(window.AP);
