/* ============================================================
   config.js — image manifest
   ------------------------------------------------------------
   PLACEHOLDER IMAGERY. Every URL in AP.images below is a free
   Unsplash photo, used so the layout reads as finished.

   TO SWAP IN REAL PHOTOS: drop a photo into assets/images/photos/,
   named EITHER after the key it replaces (e.g. "amenities.jpg") OR
   after the section heading as it actually reads on the page (e.g.
   "Welcome Amenities.jpg") — both work, in any of .jpg/.jpeg/.png/
   .webp (see EXTS below). The ALIASES map just below AP.images is
   the full list of section names it recognises. That's the whole
   job. AP.loadImages() tries every candidate name for a slot before
   falling back to the Unsplash URL on the same line — no code edit
   required, and nothing breaks for slots you haven't gotten to yet.

   Full filename list and what each shot is for:
   assets/images/photos/README.txt

   Art direction from the brief:
     · lifestyle, never product shots of the packages
     · warm light, desert sense of place
     · people enjoying the moment — "the feeling, not the box"
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  var CDN = 'https://images.unsplash.com/';
  var BIG = '?auto=format&fit=crop&w=2400&q=80';
  var MID = '?auto=format&fit=crop&w=1600&q=80';

  AP.images = {
    /* hero — the scene on the far side of the doorway */
    hero: CDN + 'photo-1771596378772-858323ca698f' + BIG,

    /* service 02 — welcome amenities · "The Morning After" */
    amenities: CDN + 'photo-1662038271111-5b1c0b4157e8' + MID,

    /* service 01 — in-property minibar */
    minibar: CDN + 'photo-1730635251742-73e997eeb110' + MID,

    /* How It Works — one scene behind each arch */
    step1: CDN + 'photo-1504150558240-0b4fd8946624' + MID,
    step2: CDN + 'photo-1583254211338-57f4b21ed0f5' + MID,
    step3: CDN + 'photo-1773188243416-d70055051e68' + MID,

    /* meet the founder — founder is Mayra's real portrait; founder2
       (figure "b", the preserves-jar shot between the two) was
       removed from the page on request. founder3 (figure "c") is
       still PLACEHOLDER */
    founder:  CDN + 'photo-1700217300042-0e6cd2371d32' + MID,
    founder3: CDN + 'photo-1648775270556-115b4076e54f' + MID,

    /* brand statement — full-bleed, no copy over it */
    provisions: CDN + 'photo-1732878946351-9b9a50c62ae3' + BIG
  };

  /* WORDPRESS PORT: functions.php prints `window.AP_IMAGES_OVERRIDE`
     — an object of the same slot keys — right before this file loads,
     built from whatever ACF Media Library images are actually set on
     the Home page. A slot ACF hasn't been given an image for simply
     isn't in the object, so it keeps its placeholder URL above
     unchanged. This only ever replaces the REMOTE fallback; a local
     file in assets/images/photos/ (see LOCAL_DIR below) still wins
     over both, exactly as it does on the static site. */
  if (window.AP_IMAGES_OVERRIDE) {
    for (var __k in window.AP_IMAGES_OVERRIDE) {
      if (window.AP_IMAGES_OVERRIDE[__k]) AP.images[__k] = window.AP_IMAGES_OVERRIDE[__k];
    }
  }

  /* Human-readable name(s) for each slot — matched EXACTLY as the
     section reads on the page, since that's what someone naming a
     file by eye will naturally type. A value can be one string or an
     array of a few. Deliberately kept lean: every extra candidate
     name is a real 404 round trip for any slot still on its
     placeholder — a first pass here tried 2-3 loose synonyms per slot
     and measured 184 same-origin requests just to load a page that's
     still mostly placeholders. One alias per slot roughly halved
     that. The one exception is "In-Property Minibar" — its hyphen is
     easy to type as a space instead ("In Property Minibar"), a real
     drop landed exactly that way, and unlike a loose synonym this is
     the SAME name, not a different guess — worth the one extra
     candidate. A slot with no single obvious heading (the individual
     photos inside a multi-image section) gets "<section> <number>". */
  var ALIASES = {
    hero:       'Hero',
    amenities:  'Welcome Amenities',
    minibar:    ['In-Property Minibar', 'In Property Minibar'],
    step1:      'Tell us about your guests',
    step2:      'We handle everything',
    step3:      'Your guests remember it',
    founder:    'Mayra Brown',
    founder3:   'Meet the Founder 3',
    provisions: ['family', 'Brand Statement']
  };

  /* WORDPRESS PORT: the static site hard-codes this as a page-relative
     path, which breaks the instant a page lives at a WordPress
     permalink instead of a flat *.html file (e.g. /hosts/ resolving
     "assets/..." against the wrong base). functions.php prints
     `window.AP_BASE_URL` (the theme's own asset root, via
     get_template_directory_uri()) in a small inline script right
     before this file loads. Falling back to the original relative
     path keeps this file harmless if that variable is ever missing. */
  var LOCAL_DIR = (window.AP_BASE_URL || 'assets/') + 'images/photos/';

  /* Tried in this order for every local candidate name. Whatever a
     photo editor or "save image as" happens to produce, one of these
     four will match — nobody has to rename a file to make a swap
     work, only to pick a recognised name (the key, or one of its
     ALIASES above). */
  var EXTS = ['jpg', 'jpeg', 'png', 'webp'];

  /* Every filename this slot will accept, before falling back to the
     Unsplash placeholder: the technical key itself, then its
     human-readable alias(es) if it has any — each tried in every
     extension. ALIASES values are a string or an array of strings. */
  function candidates(key) {
    var alias = ALIASES[key];
    var names = [key].concat(alias ? alias : []);
    var out = [];
    for (var n = 0; n < names.length; n++) {
      for (var e = 0; e < EXTS.length; e++) {
        out.push(names[n] + '.' + EXTS[e]);
      }
    }
    return out;
  }

  /* Local candidates in order, remote placeholder last. Each onerror
     step advances to the next candidate and replaces itself, so a
     genuinely missing file tries every name once, then falls back,
     and never loops. encodeURIComponent handles the spaces in names
     like "Welcome Amenities.jpg". */
  function setImage(img, key) {
    if (!AP.images[key]) return;
    img.setAttribute('decoding', 'async');

    var list = candidates(key);
    var i = 0;
    function tryNext() {
      if (i < list.length) {
        img.src = LOCAL_DIR + encodeURIComponent(list[i++]);
      } else {
        img.onerror = null;
        img.src = AP.images[key];
      }
    }
    img.onerror = tryNext;
    tryNext();
  }

  /* Paint every [data-img="key"] element from the manifest. */
  AP.loadImages = function () {
    var nodes = document.querySelectorAll('[data-img]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute('loading', 'lazy');
      setImage(nodes[i], nodes[i].getAttribute('data-img'));
    }

    var heroImg = document.getElementById('heroImg');
    if (heroImg) {
      heroImg.setAttribute('fetchpriority', 'high');
      setImage(heroImg, 'hero');
    }
  };
})(window.AP);
