(function() {
  var html = document.documentElement;
  if (!html.classList.contains('intro-pending')) return;
  var h1 = document.querySelector('h1.hero-name');
  if (!h1) { html.classList.remove('intro-pending'); return; }

  var full = h1.textContent.trim();
  h1.setAttribute('aria-label', full);
  h1.innerHTML = '<span class="name-ghost" aria-hidden="true"></span>' +
    '<span class="name-typed" aria-hidden="true"><span class="name-text"></span><span class="name-cursor"></span></span>';
  h1.querySelector('.name-ghost').textContent = full;
  var textEl = h1.querySelector('.name-text');

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    h1.removeAttribute('aria-label');
    h1.textContent = full;
    html.classList.remove('intro-pending');
  }

  var i = 0;
  function typeNext() {
    if (finished) return;
    if (i < full.length) {
      i++;
      textEl.textContent = full.slice(0, i);
      setTimeout(typeNext, full.charAt(i - 1) === ' ' ? 150 : 45 + Math.random() * 50);
    } else {
      setTimeout(finish, 650);
    }
  }
  setTimeout(typeNext, 600);
  setTimeout(finish, 8000); // safety net: never leave the page hidden
})();

(function() {
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  function applyTheme(mode) {
    if (mode === 'light') {
      root.setAttribute('data-theme', 'light');
      toggle.textContent = '●';
    } else {
      root.removeAttribute('data-theme');
      toggle.textContent = '◐';
    }
  }
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
  toggle.addEventListener('click', function() {
    var isLight = root.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  });
})();

/* ---------- Projects: cards + detail view ----------
   Content comes from projects.js (window.PROJECTS).
   NOTE: this block must stay ABOVE the resume and contact popup blocks. All three
   listen for Escape; this one runs first so that Escape closes a popup stacked on
   top of the project view before it closes the project view itself. */
(function() {
  var projects = window.PROJECTS || [];
  var byId = {};
  projects.forEach(function(p) { byId[p.id] = p; });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function statsNode(p) {
    var wrap = el('div', 'p-stats');
    (p.stats || []).forEach(function(st) {
      var box = el('div', 'p-stat');
      box.appendChild(el('span', 'p-stat-value', st.value));
      box.appendChild(el('span', 'p-stat-label', st.label));
      wrap.appendChild(box);
    });
    return wrap;
  }
  function tagsNode(p) {
    var wrap = el('div', 'project-stack');
    (p.tags || []).forEach(function(t) { wrap.appendChild(el('span', 'stack-tag', t)); });
    return wrap;
  }

  /* ----- cards on the main page ----- */
  var grid = document.getElementById('projectsGrid');
  if (grid) {
    grid.textContent = '';
    projects.forEach(function(p) {
      var card = el('article', 'p-card reveal');
      card.setAttribute('data-open', p.id);
      var head = el('div', 'p-card-head');
      head.appendChild(el('h3', 'p-title', p.title));
      if (p.badge) head.appendChild(el('span', 'badge', p.badge));
      card.appendChild(head);
      card.appendChild(el('p', 'p-oneliner', p.oneLiner));
      card.appendChild(statsNode(p));
      card.appendChild(tagsNode(p));
      var btn = el('button', 'p-open', 'Open project \u2192');
      btn.type = 'button';
      btn.setAttribute('data-open', p.id);
      btn.setAttribute('aria-label', 'Open ' + p.title + ' project details');
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  /* ----- detail view ----- */
  var backdrop = document.getElementById('detailBackdrop');
  if (!backdrop) return;
  var root = document.documentElement;
  var panel = document.getElementById('detailPanel');
  var scrollEl = document.getElementById('detailScroll');
  var titleEl = document.getElementById('detailTitle');
  var badgeEl = document.getElementById('detailBadge');
  var closeBtn = document.getElementById('detailClose');
  var statsHost = document.getElementById('detailStats');
  var textHost = document.getElementById('detailText');
  var stepsHost = document.getElementById('detailSteps');
  var tagsHost = document.getElementById('detailTags');
  var linksHost = document.getElementById('detailLinks');
  var toggleBtns = Array.prototype.slice.call(document.querySelectorAll('.mode-toggle button'));

  var currentId = null;
  var mode = 'simple';        // kept for the whole visit, so the choice sticks between projects
  var lastOpener = null;
  var openedViaApp = false;   // true when we pushed the #hash ourselves (so Back can close it)

  function isOpen() { return backdrop.classList.contains('open'); }
  function popupOpen() {
    var a = document.getElementById('modalBackdrop');
    var b = document.getElementById('resumeBackdrop');
    return !!((a && a.classList.contains('open')) || (b && b.classList.contains('open')));
  }

  function renderMode(p) {
    textHost.textContent = '';
    if (mode === 'simple') {
      textHost.appendChild(el('p', null, p.simple));
    } else {
      (p.technical || []).forEach(function(html) {
        var para = document.createElement('p');
        para.innerHTML = html;   // content is our own static data in projects.js
        textHost.appendChild(para);
      });
    }
    toggleBtns.forEach(function(b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });
  }

  function renderProject(p) {
    titleEl.textContent = p.title;
    badgeEl.textContent = p.badge || '';
    badgeEl.style.display = p.badge ? '' : 'none';

    statsHost.textContent = '';
    statsHost.appendChild(statsNode(p));

    renderMode(p);

    stepsHost.textContent = '';
    (p.steps || []).forEach(function(step, i) {
      var row = el('div', 'pipeline-step' + (step.planned ? ' planned' : ''));
      row.appendChild(el('span', 'pipeline-num', (i < 9 ? '0' : '') + (i + 1)));
      row.appendChild(el('span', 'pipeline-step-name', step.name));
      row.appendChild(el('span', 'pipeline-step-desc', step.desc));
      if (step.planned) row.appendChild(el('span', 'pipeline-tag', 'in progress'));
      stepsHost.appendChild(row);
    });

    tagsHost.textContent = '';
    tagsHost.appendChild(tagsNode(p));

    linksHost.textContent = '';
    (p.links || []).forEach(function(l) {
      var a = el('a', null, l.label);
      a.href = '#';
      a.setAttribute('data-contact', l.contact);
      linksHost.appendChild(a);
    });
  }

  function show(id) {
    var p = byId[id];
    if (!p) return;
    if (isOpen() && currentId === id) return;
    currentId = id;
    renderProject(p);
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    root.classList.add('detail-open');
    scrollEl.scrollTop = 0;
    closeBtn.focus();
  }

  function hide() {
    if (!isOpen()) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    root.classList.remove('detail-open');
    currentId = null;
    openedViaApp = false;
    if (lastOpener && document.body.contains(lastOpener)) lastOpener.focus();
    lastOpener = null;
  }

  // The URL hash is the source of truth: #geocoderz opens it, anything else closes it.
  function route() {
    var id = location.hash.slice(1);
    if (byId[id]) show(id); else hide();
  }
  window.addEventListener('hashchange', route);

  function openProject(id, opener) {
    if (!byId[id]) return;
    lastOpener = opener || null;
    if (location.hash.slice(1) !== id) {
      openedViaApp = true;
      location.hash = id;      // triggers hashchange -> route() -> show()
    } else {
      show(id);
    }
  }

  function requestClose() {
    if (!isOpen()) return;
    if (openedViaApp) {
      openedViaApp = false;
      history.back();          // pops our #hash entry; hashchange -> route() -> hide()
    } else {
      // opened straight from a shared link: just clear the hash without adding history
      try { history.replaceState(null, '', location.pathname + location.search); }
      catch (err) { location.hash = ''; }
      hide();
    }
  }

  document.addEventListener('click', function(e) {
    var t = e.target.closest ? e.target.closest('[data-open]') : null;
    if (!t) return;
    e.preventDefault();
    openProject(t.getAttribute('data-open'), t.querySelector ? (t.querySelector('.p-open') || t) : t);
  });
  closeBtn.addEventListener('click', requestClose);
  backdrop.addEventListener('click', function(e) { if (e.target === backdrop) requestClose(); });
  toggleBtns.forEach(function(b) {
    b.addEventListener('click', function() {
      mode = b.getAttribute('data-mode');
      if (byId[currentId]) renderMode(byId[currentId]);
    });
  });

  document.addEventListener('keydown', function(e) {
    if (!isOpen() || popupOpen()) return;
    if (e.key === 'Escape') {
      requestClose();
    } else if (e.key === 'Tab') {
      var items = panel.querySelectorAll('a[href], button:not([disabled])');
      if (!items.length) return;
      var first = items[0], lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus(); }
    }
  });

  route();   // a shared link like /#geocoderz opens straight into the project
})();

(function() {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

(function() {
  var navLinks = document.querySelectorAll('.nav-links a');
  var targets = [];
  navLinks.forEach(function(link) {
    var id = link.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) targets.push({ id: id, el: el, link: link });
  });
  if (targets.length === 0) return;

  function setActive() {
    var probeY = window.innerHeight * 0.3;
    var current = null;
    targets.forEach(function(t) {
      var rect = t.el.getBoundingClientRect();
      if (rect.top <= probeY) current = t;
    });
    var atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 2);
    if (atBottom) current = targets[targets.length - 1];
    navLinks.forEach(function(link) { link.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() { setActive(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
})();

(function() {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || items.length === 0) {
    items.forEach(function(el) { el.classList.add('in-view'); });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function(el) { io.observe(el); });
})();

(function() {
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  if (isMobile) document.body.classList.add('is-mobile-device');

  var trigger = document.getElementById('resumePreviewBtn');
  var dataLink = document.getElementById('resumeDataLink');
  var backdrop = document.getElementById('resumeBackdrop');
  var obj = document.getElementById('resumeObject');
  var fallbackLink = document.getElementById('resumeFallbackLink');
  var closeBtn = document.getElementById('resumeClose');
  var closeBtnMobile = document.getElementById('resumeCloseMobile');
  var downloadBtn = document.getElementById('resumeDownloadBtn');
  var downloadBtnMobile = document.getElementById('resumeDownloadBtnMobile');
  var openTabBtn = document.getElementById('resumeOpenTabBtn');
  var openTabBtnMobile = document.getElementById('resumeOpenTabBtnMobile');
  if (!trigger || !dataLink || !backdrop) return;

  var resumeUrl = dataLink.getAttribute('href');
  try {
    var b64 = resumeUrl.split(',')[1];
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    resumeUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  } catch (err) {}
  [downloadBtn, downloadBtnMobile].forEach(function(el) { if (el) el.setAttribute('href', resumeUrl); });
  [openTabBtn, openTabBtnMobile].forEach(function(el) { if (el) el.setAttribute('href', resumeUrl); });
  if (fallbackLink) fallbackLink.setAttribute('href', resumeUrl);

  function open() {
    if (!isMobile) obj.setAttribute('data', resumeUrl + '#page=1&zoom=page-fit&view=Fit&navpanes=0');
    backdrop.classList.add('open');
  }
  function close() {
    backdrop.classList.remove('open');
    if (obj) obj.removeAttribute('data');
  }

  trigger.addEventListener('click', function(e) {
    e.preventDefault();
    open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (closeBtnMobile) closeBtnMobile.addEventListener('click', close);
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
  });
})();

(function() {
  var backdrop = document.getElementById('modalBackdrop');
  var title = document.getElementById('modalTitle');
  var body = document.getElementById('modalBody');
  var confirmBtn = document.getElementById('modalConfirm');
  var cancelBtn = document.getElementById('modalCancel');
  var copyBtn = document.getElementById('modalCopy');
  var copyFeedback = document.getElementById('modalCopyFeedback');
  var pendingUrl = null;
  var pendingCopyValue = null;
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;

  var contacts = {
    github: {
      label: 'GitHub',
      url: 'https://github.com/Hrithik-Vish',
      body: 'Open <strong>github.com/Hrithik-Vish</strong> in a new tab?'
    },
    linkedin: {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/hrithik-vish',
      body: 'Open <strong>linkedin.com/in/hrithik-vish</strong> in a new tab?'
    },
    email: {
      label: 'Email',
      url: 'https://mail.google.com/mail/?extsrc=mailto&url=' + encodeURIComponent('mailto:hrithik.hv10@gmail.com'),
      body: 'Open Gmail to compose a message to <strong>hrithik.hv10@gmail.com</strong>?',
      mobileUrl: 'mailto:hrithik.hv10@gmail.com',
      mobileBody: 'Open your mail app to write to <strong>hrithik.hv10@gmail.com</strong>?',
      copyValue: 'hrithik.hv10@gmail.com'
    },
    phone: {
      label: 'Phone',
      url: 'tel:+918104288653',
      body: 'Call <strong>+91 81042 88653</strong>?',
      copyValue: '+91 81042 88653'
    },
    'geocoderz-demo': {
      label: 'live demo',
      url: 'https://place-name-queries.vercel.app/',
      body: 'Open the <strong>GeoCoderZ</strong> live demo in a new tab?'
    },
    'geocoderz-github': {
      label: 'GitHub',
      url: 'https://github.com/Hrithik-Vish/GeoCoderZ',
      body: 'Open the <strong>GeoCoderZ</strong> repo on GitHub?'
    },
    'scrollping-github': {
      label: 'GitHub',
      url: 'https://github.com/Hrithik-Vish/ScrollPing',
      body: 'Open the <strong>ScrollPing</strong> repo on GitHub?'
    }
  };

  function openModal(key) {
    var c = contacts[key];
    if (!c) return;
    pendingUrl = (isMobile && c.mobileUrl) ? c.mobileUrl : c.url;
    pendingCopyValue = c.copyValue || null;
    title.textContent = 'Leaving this page';
    body.innerHTML = (isMobile && c.mobileBody) ? c.mobileBody : c.body;
    copyBtn.style.display = pendingCopyValue ? '' : 'none';
    copyFeedback.style.display = 'none';
    backdrop.classList.add('open');
  }
  function closeModal() {
    backdrop.classList.remove('open');
    pendingUrl = null;
    pendingCopyValue = null;
  }

  document.addEventListener('click', function(e) {
    var el = e.target.closest ? e.target.closest('[data-contact]') : null;
    if (!el) return;
    e.preventDefault();
    openModal(el.getAttribute('data-contact'));
  });

  confirmBtn.addEventListener('click', function() {
    if (pendingUrl) {
      if (pendingUrl.indexOf('mailto:') === 0) window.location.href = pendingUrl;
      else window.open(pendingUrl, '_blank', 'noopener');
    }
    closeModal();
  });
  copyBtn.addEventListener('click', function() {
    if (!pendingCopyValue) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pendingCopyValue).then(function() {
        copyFeedback.style.display = '';
      }).catch(function() {});
    }
  });
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
})();
