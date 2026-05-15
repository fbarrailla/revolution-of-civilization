/* Revolution of Civilization — interactions */
(function () {
  'use strict';

  /* ===== Language switcher ===== */
  var STORAGE_KEY = 'roc-lang';
  var getLang = function () {
    var current = document.documentElement.getAttribute('lang');
    return current === 'en' ? 'en' : 'id';
  };
  var setLang = function (lang) {
    if (lang !== 'en' && lang !== 'id') return;
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.langSet === lang);
      btn.setAttribute('aria-pressed', String(btn.dataset.langSet === lang));
    });
    // Update <title> to match language
    var titles = {
      id: 'Revolution of Civilization — Membangun Peradaban, Menebar Kebaikan',
      en: 'Revolution of Civilization — Building Civilization, Spreading Kindness'
    };
    document.title = titles[lang];
  };
  // Init from current attribute (set by inline script before DOM parse)
  setLang(getLang());
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.dataset.langSet); });
  });

  /* ===== Mobile nav toggle ===== */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  var backdrop = document.getElementById('navBackdrop');

  var setNavOpen = function (open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.body.classList.toggle('nav-open', open);
    if (backdrop) {
      if (open) {
        backdrop.hidden = false;
        // force reflow so the opacity transition kicks in
        backdrop.offsetWidth;
        backdrop.classList.add('is-open');
      } else {
        backdrop.classList.remove('is-open');
        setTimeout(function () {
          if (!nav.classList.contains('is-open')) backdrop.hidden = true;
        }, 280);
      }
    }
  };

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNavOpen(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNavOpen(false); });
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', function () { setNavOpen(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      setNavOpen(false);
    }
  });

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
    '.function-wrap, .focus-card, .focus-allocation, ' +
    '.donation-card, .donors-stats, .donor-card, ' +
    '.membership-text, .membership-card, .leader-card, ' +
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

    /* ----- Tabs ----- */
    var tabs = modal.querySelectorAll('.donate-tab');
    var panels = modal.querySelectorAll('.donate-tab-panel');
    var activateTab = function (name) {
      tabs.forEach(function (t) {
        var on = t.dataset.tab === name;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        var on = p.id === 'tab-' + name;
        p.classList.toggle('is-active', on);
        if (on) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { activateTab(t.dataset.tab); });
      t.addEventListener('keydown', function (e) {
        var order = ['paypal', 'bank', 'crypto'];
        var idx = order.indexOf(t.dataset.tab);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          var next = order[(idx + 1) % order.length];
          activateTab(next);
          modal.querySelector('[data-tab="' + next + '"]').focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          var prev = order[(idx - 1 + order.length) % order.length];
          activateTab(prev);
          modal.querySelector('[data-tab="' + prev + '"]').focus();
        }
      });
    });

    /* ----- Copy buttons ----- */
    modal.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.querySelector(btn.dataset.copyTarget);
        if (!target) return;
        var text = target.textContent.trim();
        var done = function () {
          btn.classList.add('is-copied');
          setTimeout(function () { btn.classList.remove('is-copied'); }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {
            // fallback
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            done();
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });

    /* ----- Internal links that should close the modal & jump ----- */
    modal.querySelectorAll('[data-close-after]').forEach(function (link) {
      link.addEventListener('click', function () {
        closeModal();
      });
    });
  }
})();
