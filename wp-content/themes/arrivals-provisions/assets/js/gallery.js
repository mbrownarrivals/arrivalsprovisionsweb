window.AP = window.AP || {};

(function (AP) {
  'use strict';

  function initOne(pin) {
    var track = pin.querySelector('.gallery__track');
    if (!track) return;

    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getDistance() {
      return Math.max(0, track.scrollWidth - pin.clientWidth);
    }

    gsap.to(track, {
      x: function () {
        return -getDistance();
      },
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: function () {
          return '+=' + getDistance();
        },
        pin: pin,
        pinSpacing: true,
        scrub: still ? true : 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 0
      }
    });
  }

  AP.initGallery = function () {
    var pins = document.querySelectorAll('.gallery__pin');
    if (!pins.length) return;

    var wide = window.matchMedia('(min-width: 901px)').matches;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!wide || !fine) return;

    if (!window.gsap || !window.ScrollTrigger) return;

    for (var i = 0; i < pins.length; i++) {
      initOne(pins[i]);
    }

    ScrollTrigger.refresh();
  };

})(window.AP);