/* Revolution of Civilization — interactions */
(function () {
  'use strict';

  /* ===== Mobile nav toggle ===== */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===== Sticky header shadow ===== */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ===== Auto-decorate sections for scroll reveal ===== */
  var revealTargets = document.querySelectorAll(
    '.section-head, .about-card, .mission-item, .vision-text, .vision-visual, ' +
    '.function-wrap, .donation-card, .membership-text, .membership-card, ' +
    '.gallery-item, .contact-card'
  );
  revealTargets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i, 6) * 60) + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ===== Year in footer ===== */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ===== Smooth scroll offset for sticky header ===== */
  document.querySelectorAll('a[href^="#"]:not(.js-donate)').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ===== Donation modal ===== */
  var modal = document.getElementById('donateModal');
  if (modal) {
    var lastFocus = null;

    var openModal = function () {
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('donate-modal-open');
      var firstOpt = modal.querySelector('.donate-option');
      if (firstOpt) {
        // delay focus until transition starts so screen readers see the dialog
        setTimeout(function () { firstOpt.focus(); }, 60);
      }
    };

    var closeModal = function () {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('donate-modal-open');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    };

    document.querySelectorAll('.js-donate').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        // close mobile nav if open
        if (nav && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
        openModal();
      });
    });

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Close after a PayPal option is clicked (it opens in a new tab)
    modal.querySelectorAll('.donate-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setTimeout(closeModal, 150);
      });
    });
  }
})();
