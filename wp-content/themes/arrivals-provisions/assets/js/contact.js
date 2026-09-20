/* ============================================================
   contact.js — the contact form
   ------------------------------------------------------------
   The role-based conditional fields (Host vs. Partner vs. Something
   Else) are pure CSS — see the :has() rules in contact.css — so
   that part works with JavaScript off. This file only handles
   submission.

   STOPGAP, NOT A REAL BACKEND. There is no server, no build step,
   and no form-processing decision made yet for this project (see
   the "Still to build" note in handoff.md — Formspree, Netlify
   Forms, or a real endpoint are the options on the table). Until
   one is wired up, submitting assembles the answers into a
   mailto: link and hands off to the visitor's own email client.
   That's a real, working way to reach the inbox today, not a dead
   end — but it depends on the visitor having a configured mail
   client, and it can't confirm delivery the way a real form
   backend could. Replace AP.initContactForm's submit handler with
   a fetch() to whichever service gets chosen, and everything else
   on this page (fields, validation, the conditional reveal) stays
   exactly as is.

   Self-initialising rather than added to main.js's boot list,
   since this page is the only one that needs it.
   ============================================================ */

window.AP = window.AP || {};

(function (AP) {
  'use strict';

  var FIELD_LABELS = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'I am a',
    location: 'Property location',
    propertyCount: 'Number of properties',
    packageInterest: 'Package interest',
    company: 'Company / organization',
    portfolioSize: 'Portfolio size',
    segment: 'Segment',
    message: 'Message'
  };

  var ROLE_LABELS = {
    host: 'Host',
    partner: 'Partner',
    other: 'Something else'
  };

  AP.initContactForm = function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var status = document.getElementById('formStatus');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var lines = [];

      data.forEach(function (value, key) {
        if (!value) return;
        var label = FIELD_LABELS[key] || key;
        var out = key === 'role' ? (ROLE_LABELS[value] || value) : value;
        lines.push(label + ': ' + out);
      });

      var name = data.get('name') || 'the website';
      var subject = encodeURIComponent('New inquiry from ' + name);
      var body = encodeURIComponent(lines.join('\n'));

      if (status) {
        status.textContent = 'Opening your email client to send this…';
      }

      /* WORDPRESS PORT: was a literal 'hello@arrivalsprovisions.com'.
         functions.php prints window.AP_CONTACT_EMAIL (from the ACF
         Options "Contact Email" field) in an inline script right
         before this file loads, so the address an editor sets there
         is where inquiries actually land — not just what the visible
         reach__direct link and the form's inert action= attribute
         show. Falls back to the original address if that's missing. */
      var email = window.AP_CONTACT_EMAIL || 'hello@arrivalsprovisions.com';
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AP.initContactForm);
  } else {
    AP.initContactForm();
  }
})(window.AP);
