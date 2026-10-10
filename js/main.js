(function () {
  'use strict';

  /* ---------- Theme ---------- */

  var THEME_KEY = 'coinupbtc-theme';
  var THEME_COLORS = { dark: '#0c0e13', light: '#ece8df' };

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    syncThemeColor(theme);
  }

  function setTheme(next) {
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    document.dispatchEvent(new CustomEvent('coinupbtc:theme', { detail: { theme: next } }));
    drawHero();
  }

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  var saved = storedTheme();
  if (saved === 'dark' || saved === 'light') applyTheme(saved);
  else applyTheme(currentTheme());
  syncThemeColor(currentTheme());

  /* ---------- Hero still ---------- */

  var canvas = document.getElementById('hero-field');
  var heroCtx = canvas ? canvas.getContext('2d') : null;
  var SEED = 20261009;

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return '12,14,19';
    var n = parseInt(m[1], 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }

  function inkColor() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--ink');
    return hexToRgb(v || '#0c0e13');
  }

  function drawHero() {
    if (!canvas || !heroCtx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    heroCtx.clearRect(0, 0, w, h);

    var rgb = inkColor();
    var rand = mulberry32(SEED);
    var nodes = [];
    for (var i = 0; i < 70; i++) {
      nodes.push({ x: rand() * w, y: rand() * h, r: 0.8 + rand() * 1.4 });
    }

    // Thin lines between nearby nodes, alpha falls off with distance.
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x;
        var dy = nodes[a].y - nodes[b].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          var alpha = 0.12 * (1 - d / 150);
          heroCtx.strokeStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
          heroCtx.lineWidth = 1;
          heroCtx.beginPath();
          heroCtx.moveTo(nodes[a].x, nodes[a].y);
          heroCtx.lineTo(nodes[b].x, nodes[b].y);
          heroCtx.stroke();
        }
      }
    }

    for (var j = 0; j < nodes.length; j++) {
      heroCtx.fillStyle = 'rgba(' + rgb + ',0.35)';
      heroCtx.beginPath();
      heroCtx.arc(nodes[j].x, nodes[j].y, nodes[j].r, 0, Math.PI * 2);
      heroCtx.fill();
    }
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawHero, 150);
  }, { passive: true });

  drawHero();

  /* ---------- Back to top ---------- */

  var toTop = document.getElementById('to-top');
  if (toTop) {
    toTop.hidden = window.scrollY > 0.6 * window.innerHeight ? false : true;
    window.addEventListener('scroll', function () {
      toTop.hidden = !(window.scrollY > 0.6 * window.innerHeight);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  /* ---------- Nav spy ---------- */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav nav a[href^="#"]')
  ).filter(function (a) {
    return !a.hasAttribute('aria-current') &&
      document.getElementById(a.getAttribute('href').slice(1));
  });

  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navLinks.forEach(function (a) {
      spy.observe(document.getElementById(a.getAttribute('href').slice(1)));
    });
  }
})();