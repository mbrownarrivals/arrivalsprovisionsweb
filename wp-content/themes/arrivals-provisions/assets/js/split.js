/* ============================================================
   split.js — line splitting for masked text reveals
   Wraps every rendered line in .line > .line__inner so the
   inner span can be translated out from behind a mask.
   Re-runs on resize because line breaks change with width.
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  var STORE = new WeakMap();

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Split an element's text into line-wrapped spans.
   * The original text is cached so the split is idempotent.
   */
  function splitLines(el) {
    if (!STORE.has(el)) {
      STORE.set(el, el.textContent.replace(/\s+/g, ' ').trim());
    }

    var text = STORE.get(el);
    var words = text.split(' ');

    // pass 1 — lay every word out individually so we can measure
    el.innerHTML = words
      .map(function (w) { return '<span data-w>' + escapeHTML(w) + '</span>'; })
      .join(' ');

    var nodes = el.querySelectorAll('[data-w]');
    var lines = [];
    var current = null;
    var lastTop = null;

    for (var i = 0; i < nodes.length; i++) {
      var top = Math.round(nodes[i].offsetTop);
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        lastTop = top;
        current = [];
        lines.push(current);
      }
      current.push(nodes[i].textContent);
    }

    // pass 2 — rebuild as masked lines
    el.innerHTML = lines
      .map(function (line) {
        return '<span class="line"><span class="line__inner">' +
          escapeHTML(line.join(' ')) +
          '</span></span>';
      })
      .join('');
  }

  function initSplits() {
    var targets = document.querySelectorAll('[data-lines]');
    for (var i = 0; i < targets.length; i++) splitLines(targets[i]);
  }

  AP.splitLines = splitLines;
  AP.initSplits = initSplits;
})(window.AP);
