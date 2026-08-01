/* Coinupbtc — wow pass interactions. Vanilla, dependency-free. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ── Theme toggle ─────────────────────────────────────── */
  const themeBtn = document.getElementById('theme-toggle');
  function syncTheme() {
    const dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').setAttribute('content',
      dark ? '#0e1013' : '#e8e4dc');
  }
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('coinupbtc-theme', next); } catch (e) {}
    syncTheme();
    field?.reskin();            // hero recolors without a rebuild
  });
  syncTheme();

  /* ── Hero brand: staggered char entrance ─────────────── */
  const brandMark = document.querySelector('.brand mark');
  if (brandMark && !reduceMotion) {
    const text = brandMark.textContent;
    brandMark.textContent = '';
    const frag = document.createDocumentFragment();
    Array.from(text).forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.style.setProperty('--ord', i);
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      frag.appendChild(s);
    });
    brandMark.appendChild(frag);

    // kick off after the underline draw-in completes
    requestAnimationFrame(() => {
      brandMark.classList.add('go');
      // ensure chars settle before they can be re-read by reveal logic
      setTimeout(() => brandMark.classList.add('settled'), 1400);
    });
  }

  /* ── Reveal on scroll (sections) ──────────────────────── */
  const revealEls = [
    document.querySelector('.systems'),
    document.querySelector('.hub'),
    document.querySelector('.gallery'),
    document.querySelector('.proof'),
  ].filter(Boolean);
  revealEls.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ── Gallery cascade reveal ───────────────────────────── */
  const artTiles = Array.from(document.querySelectorAll('.art-item'));
  artTiles.forEach((el, i) => {
    el.style.setProperty('--ord', i);
    if (reduceMotion) el.classList.add('in');
  });
  if (!reduceMotion && 'IntersectionObserver' in window && artTiles.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    artTiles.forEach((el) => io.observe(el));
  }

  /* ── Count-up: systems numbers ────────────────────────── */
  (function countUp() {
    if (reduceMotion) return;
    const nums = Array.from(document.querySelectorAll('.sys-cell .num'));
    if (!nums.length) return;
    const fmt = (v, dec) =>
      dec ? v.toFixed(dec).replace(/\./, '.') : Math.round(v).toString();
    const tick = (el, t) => {
      const count = parseFloat(el.dataset.count || '0');
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const val = count * t;
      el.textContent = fmt(val, dec) + (el.dataset.suffix || '');
    };
    const settle = (el) => {
      const count = parseFloat(el.dataset.count || '0');
      const dec = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = fmt(count, dec) + (el.dataset.suffix || '');
    };
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const dur = 900;
      const t0 = performance.now();
      (function frame(now) {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        nums.forEach((el) => tick(el, eased));
        if (p < 1) requestAnimationFrame(frame);
        else nums.forEach(settle);
      })(t0);
    };
    const sysSec = document.querySelector('.systems');
    if (sysSec && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { start(); io.disconnect(); } });
      }, { threshold: 0.5 });
      io.observe(sysSec);
    } else start();
  })();

  /* ── Magnetic CTAs ────────────────────────────────────── */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strong = el.classList.contains('primary') ? 10 : 6;
      el.addEventListener('mousemove', (ev) => {
        const r = el.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2);
        const dy = ev.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx / strong}px, ${dy / strong}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ── Lightbox ─────────────────────────────────────────── */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  const lbCount = document.getElementById('lb-count');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const artItems = Array.from(document.querySelectorAll('.art-btn'));
  let lbIndex = 0;
  let lastFocus = null;

  function openLb(i) {
    lbIndex = (i + artItems.length) % artItems.length;
    const btn = artItems[lbIndex];
    lbImg.src = btn.dataset.full;
    lbImg.alt = btn.querySelector('img').alt;
    lbCap.textContent = btn.dataset.caption;
    lbCount.textContent = `${lbIndex + 1} / ${artItems.length}`;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    lbClose.focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus();
  }
  artItems.forEach((btn, i) => btn.addEventListener('click', () => openLb(i)));
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => openLb(lbIndex - 1));
  lbNext.addEventListener('click', () => openLb(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); openLb(lbIndex - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); openLb(lbIndex + 1); }
  });

  /* ── Hero parallax depth on scroll ────────────────────── */
  (function parallax() {
    if (reduceMotion) return;
    const hero = document.querySelector('.hero');
    const stage = document.querySelector('.stage');
    const vignette = document.querySelector('.hero-vignette');
    if (!hero || !stage) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = hero.getBoundingClientRect();
        // scroll past is negative; content drifts up slower than viewport
        const p = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height * 0.6)));
        if (stage) stage.style.transform = `translateY(${p * 26}px)`;
        if (vignette) vignette.style.transform = `translateY(${p * 14}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ── Generative hero field ────────────────────────────── */
  const canvas = document.getElementById('hero-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const field = (() => {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let nodes = [];
    let colors = { node: '', link: '', pointer: '', glow: '' };
    const pointer = { x: -9999, y: -9999, active: false };
    const NODE_N = reduceMotion ? 140 : 92;
    const LINK_D = 150;      // max distance to draw a link
    const P_RADIUS = 170;    // pointer influence radius
    const P_STRENGTH = 0.6;  // pull toward pointer (0..1+)

    function cssVar(name) {
      return getComputedStyle(root).getPropertyValue(name).trim();
    }
    function hexToRgb(h) {
      h = h.replace('#', '');
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function rgba(hex, a) {
      const { r, g, b } = hexToRgb(hex);
      return `rgba(${r},${g},${b},${a})`;
    }

    function reskin() {
      const ink = cssVar('--ink');
      const acid = cssVar('--acid');
      colors = {
        node: rgba(ink, reduceMotion ? 0.5 : 0.32),
        link: rgba(ink, 0.10),
        linkHot: rgba(acid, 0.4),
        pointer: rgba(acid, 0.16),
      };
      draw();
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width * DPR));
      H = Math.max(1, Math.floor(r.height * DPR));
      canvas.width = W;
      canvas.height = H;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
      reskin();
    }

    function seed() {
      const w = W / DPR, h = H / DPR;
      nodes = Array.from({ length: NODE_N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: 0.8 + Math.random() * 1.6,
      }));
    }

    function step() {
      const w = W / DPR, h = H / DPR;
      const n = nodes.length;

      for (let i = 0; i < n; i++) {
        const p = nodes[i];
        // gentle drift
        p.x += p.vx; p.y += p.vy;
        if (Math.random() < 0.01) { p.vx += (Math.random() - 0.5) * 0.08; p.vy += (Math.random() - 0.5) * 0.08; }
        const sp = Math.hypot(p.vx, p.vy), MAX = 0.35;
        if (sp > MAX) { p.vx = (p.vx / sp) * MAX; p.vy = (p.vy / sp) * MAX; }
        // wrap edges
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        // pointer attraction
        if (pointer.active) {
          const dx = pointer.x - p.x, dy = pointer.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < P_RADIUS * P_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const f = ((P_RADIUS - d) / P_RADIUS) * P_STRENGTH * 0.04;
            p.x += (dx / d) * f * d;
            p.y += (dy / d) * f * d;
          }
        }
      }
      draw();
      if (!reduceMotion) requestAnimationFrame(step);
    }

    function draw() {
      const w = W / DPR, h = H / DPR;
      ctx.clearRect(0, 0, w, h);
      const n = nodes.length;

      // links (spatial proximity)
      for (let i = 0; i < n; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < n; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_D * LINK_D) continue;
          const t = 1 - Math.sqrt(d2) / LINK_D;
          let hot = false;
          if (pointer.active) {
            const px = (a.x + b.x) / 2 - pointer.x, py = (a.y + b.y) / 2 - pointer.y;
            hot = (px * px + py * py) < 70 * 70;
          }
          ctx.strokeStyle = hot ? colors.linkHot : colors.link;
          ctx.globalAlpha = t;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // pointer halo
      if (pointer.active) {
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, P_RADIUS);
        g.addColorStop(0, colors.pointer);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, P_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      ctx.fillStyle = colors.node;
      for (let i = 0; i < n; i++) {
        const p = nodes[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // inactive coordinates are fine — canvas unscaled draw uses CSS px after setTransform
      void w; void h;
    }

    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    });
    canvas.addEventListener('pointerleave', () => { pointer.active = false; });
    canvas.addEventListener('pointerdown', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    });

    window.addEventListener('resize', () => { resize(); if (reduceMotion) seedAndDraw(); });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !reduceMotion) { seed(); step(); }
    });

    function seedAndDraw() { seed(); draw(); }

    resize();
    if (reduceMotion) { seedAndDraw(); } else { step(); }
    return { reskin };
  })();
})();
