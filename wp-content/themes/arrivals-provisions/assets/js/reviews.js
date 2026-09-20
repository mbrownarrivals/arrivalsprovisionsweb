/* ============================================================
   reviews.js — hover card for the testimonial rows
   ------------------------------------------------------------
   Each row carries its own card. Hovering a row fades its card in,
   parked against the right margin and just clear of that row's own
   bottom edge. Keyboard focus does the same thing.

   Pointer-only. Touch and narrow screens render the cards inline
   from CSS, so this never runs there.
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  AP.initReviews = function () {
    var section = document.querySelector('.reviews');
    if (!section) return;

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var wide = window.matchMedia('(min-width: 901px)').matches;
    if (!fine || !wide) return;

    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rows = section.querySelectorAll('.review');

    var EDGE = 16;   /* keep this far off the viewport edge */

    var card = null;         /* the card currently shown */
    var activeRow = null;
    var target = { x: 0, y: 0 };
    var pos = { x: 0, y: 0 };
    var lastX = 0, lastY = 0;
    var scrollRaf = null;

    /* Vertically CENTRED on the row, always — "that same line", per
       the request this replaced.

       The card is tall (~540px). An earlier version tried to park it
       just below the row, flipping above when it didn't fit. But for
       any row in the middle of a long list there is rarely 540px of
       clear space either above OR below it within the viewport — so
       the flip logic kept degrading to "clamp to the top edge",
       which visually orphaned the card from whichever row was
       actually hovered. Centring on the row's own vertical midpoint
       fixes that directly: the card's centre now equals the row's
       centre by construction, and clamping only ever kicks in near
       the very top/bottom of the viewport (the first or last row),
       not for every row in between. */
    function aim(row, snap) {
      if (!card || !row) return;

      var w = card.offsetWidth;
      var h = card.offsetHeight;
      var r = row.getBoundingClientRect();
      var rowCentre = r.top + r.height / 2;

      /* sits further out on wide screens, where there is free margin */
      var margin = Math.max(32, Math.min(window.innerWidth * 0.04, 96));

      target.x = Math.max(EDGE, window.innerWidth - w - margin);
      target.y = Math.max(EDGE, Math.min(rowCentre - h / 2, window.innerHeight - h - EDGE));

      if (snap || still) {
        pos.x = target.x;
        pos.y = target.y;
        draw();
      }
    }

    function draw() {
      if (card) card.style.transform = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)';
    }

    (function loop() {
      if (card && !still) {
        pos.x += (target.x - pos.x) * 0.16;
        pos.y += (target.y - pos.y) * 0.16;
        draw();
      }
      requestAnimationFrame(loop);
    })();

    function open(row) {
      var next = row.querySelector('.review__card');
      if (!next) return;

      if (card && card !== next) card.classList.remove('is-on');

      /* snap when switching cards so it does not fly across the screen */
      var snap = card !== next;
      card = next;
      activeRow = row;
      aim(row, snap);
      card.classList.add('is-on');
    }

    function close(row) {
      var mine = row.querySelector('.review__card');
      if (!mine) return;
      mine.classList.remove('is-on');
      if (card === mine) { card = null; activeRow = null; }
    }

    function closeAny() {
      if (!card) return;
      card.classList.remove('is-on');
      card = null;
      activeRow = null;
    }

    for (var i = 0; i < rows.length; i++) {
      (function (row) {
        row.addEventListener('pointerenter', function (e) {
          lastX = e.clientX;
          lastY = e.clientY;
          open(row);
        });

        row.addEventListener('pointermove', function (e) {
          lastX = e.clientX;
          lastY = e.clientY;
        });

        row.addEventListener('pointerleave', function () { close(row); });

        row.addEventListener('focus', function () { open(row); });
        row.addEventListener('blur', function () { close(row); });
      })(rows[i]);
    }

    /* Keep the card honest while the page scrolls under a still cursor.
       This used to close on any scroll event, which glitched badly:
       Lenis keeps emitting scroll for the length of its momentum, so
       hovering a row right after scrolling opened the card and shut it
       again in the same breath. Instead, work out what is actually
       under the pointer now — pointerenter does not re-fire when the
       page moves beneath a stationary mouse. */
    window.addEventListener('scroll', function () {
      if (!card || scrollRaf) return;

      scrollRaf = requestAnimationFrame(function () {
        scrollRaf = null;
        if (!card) return;

        /* the card itself is pointer-events:none, so it is skipped */
        var under = document.elementFromPoint(lastX, lastY);
        var row = under && under.closest ? under.closest('.review') : null;

        if (!row) { closeAny(); return; }
        if (row !== activeRow) open(row);
        else aim(row, false);      /* the row moved; follow it */
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (activeRow) aim(activeRow, true);
    }, { passive: true });
  };
})(window.AP);
