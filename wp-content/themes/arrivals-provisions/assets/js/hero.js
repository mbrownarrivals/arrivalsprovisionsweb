/* ============================================================
   hero.js — "scroll through the doorway"
   ------------------------------------------------------------
   The hero is a tall section with a sticky 100vh stage. Inside it
   an arched aperture sits on a bone-coloured wall, showing a
   viewport-sized image behind. As you scroll, the aperture grows
   to fill the screen and its arch flattens, so you appear to walk
   through the door into the property rather than scroll past it.

   The wordmark splits and clears out of the way; the opening
   statement fades in once you are through.
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  AP.initHero = function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var aperture = document.getElementById('aperture');
    var img = document.getElementById('heroImg');
    var scrim = document.querySelector('.hero__scrim');
    var front = document.getElementById('heroFront');
    var words = front.querySelectorAll('.hero__word');
    var tagline = document.querySelector('.hero__tagline');
    var through = document.getElementById('heroThrough');
    var cue = document.getElementById('heroCue');
    var nav = document.getElementById('nav');

    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- static fallback: no motion, no GSAP ---------------- */
    if (still || !window.gsap || !window.ScrollTrigger) {
      hero.style.height = '100vh';
      aperture.style.width = '100%';
      aperture.style.height = '100%';
      aperture.style.borderRadius = '0';
      scrim.style.opacity = '1';
      through.style.opacity = '1';
      through.classList.add('is-live');
      front.style.display = 'none';
      nav.classList.add('is-light');
      return;
    }

    /* y only. This element is flex-centred inside a full-bleed overlay
       precisely so GSAP has no centring offset to capture — see the
       note on .hero__through in home.css. */
    gsap.set(through, { y: 28 });

    /* Bias the crop so the arch frames the lit part of the room
       rather than bare wall; it settles to centre once full-bleed. */
    gsap.set(img, { scale: 1.28, yPercent: 7 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          /* the statement only takes clicks once it is legible */
          through.classList.toggle('is-live', self.progress > 0.62);
        }
      }
    });

    tl
      /* the door opens */
      .to(aperture, {
        width: function () { return window.innerWidth; },
        height: function () { return window.innerHeight; },
        borderRadius: '0px 0px 0px 0px',
        ease: 'power1.inOut',
        duration: 0.55
      }, 0)

      /* slow push-in on the scene behind it */
      .to(img, { scale: 1.02, yPercent: 0, ease: 'none', duration: 0.85 }, 0)

      /* the wordmark clears out of the way */
      .to(words[0], { yPercent: -135, opacity: 0, ease: 'power2.in', duration: 0.30 }, 0)
      .to(words[1], { yPercent: 135, opacity: 0, ease: 'power2.in', duration: 0.30 }, 0)
      .to([tagline, cue], { opacity: 0, ease: 'none', duration: 0.16 }, 0)

      /* darken for legibility, then bring the statement through */
      .to(scrim, { opacity: 1, ease: 'none', duration: 0.40 }, 0.12)
      .to(through, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.22 }, 0.52);

    /* ---- nav colour across the whole hero ------------------- */
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: function (self) {
        nav.classList.toggle('is-light', self.progress > 0.2 && self.progress < 0.99);
      }
    });
  };
})(window.AP);
