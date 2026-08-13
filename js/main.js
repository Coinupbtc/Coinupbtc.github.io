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

  /* ── Prefers-reduced-motion: freezes the hero backplate video ─ */
  if (reduceMotion) {
    const heroVideo = document.querySelector('.hero-media video');
    if (heroVideo) { heroVideo.pause(); heroVideo.removeAttribute('autoplay'); heroVideo.src = ''; }
  } else {
    /* reliability: kick the muted loop if the HTML autoplay attribute was deferred */
    const heroVideo = document.querySelector('.hero-media video');
    if (heroVideo) {
      const kick = () => { if (heroVideo.paused) heroVideo.play().catch(() => {}); };
      if (document.readyState === 'complete') kick();
      else window.addEventListener('load', kick, { once: true });
    }
  }

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

  /* ── Magnetic CTAs (spring-physics, shared rAF loop) ── */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('spring-mag'); // drop CSS transform transitions so the spring owns them
    const magnets = Array.from(document.querySelectorAll('[data-magnetic]'));
    const state = new Map();
    let raf = null;
    magnets.forEach((el) => {
      const strong = el.classList.contains('primary') ? 10 : 6;
      state.set(el, { tx: 0, ty: 0, cx: 0, cy: 0, vx: 0, vy: 0, strong });
      el.addEventListener('mousemove', (ev) => {
        const r = el.getBoundingClientRect();
        const s = state.get(el);
        s.tx = (ev.clientX - (r.left + r.width / 2)) / s.strong;
        s.ty = (ev.clientY - (r.top + r.height / 2)) / s.strong;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener('mouseleave', () => {
        const s = state.get(el);
        s.tx = 0; s.ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
    function loop() {
      raf = null;
      let live = false;
      state.forEach((s, el) => {
        // critically-damped spring toward the pointer target
        s.vx += (s.tx - s.cx) * 0.14;
        s.vy += (s.ty - s.cy) * 0.14;
        s.vx *= 0.62;
        s.vy *= 0.62;
        s.cx += s.vx;
        s.cy += s.vy;
        if (Math.abs(s.cx - s.tx) > 0.06 || Math.abs(s.cy - s.ty) > 0.06) live = true;
        else { s.cx = s.tx; s.cy = s.ty; }
        el.style.transform = `translate(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px)`;
      });
      if (live) raf = requestAnimationFrame(loop);
    }
  }

  /* ── Lightbox (images + H3 video) ───────────────────── */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbVideo = document.getElementById('lb-video');
  const lbCap = document.getElementById('lb-cap');
  const lbCount = document.getElementById('lb-count');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const artItems = Array.from(document.querySelectorAll('.art-btn'));
  let lbIndex = 0;
  let lastFocus = null;

  function stopLbVideo() {
    if (lbVideo && !lbVideo.hidden) {
      lbVideo.pause();
      lbVideo.hidden = true;
    }
  }

  function openLb(i) {
    lbIndex = (i + artItems.length) % artItems.length;
    const btn = artItems[lbIndex];
    const isVideo = btn && btn.hasAttribute('data-video');
    // swap image/video in the stage
    lbImg.hidden = isVideo;
    if (lbVideo) lbVideo.hidden = !isVideo;
    if (isVideo) {
      lbVideo.src = btn.dataset.video;
      lbVideo.poster = btn.dataset.poster || '';
      lbVideo.currentTime = 0;
      lbVideo.play().catch(() => {});
      lbCap.textContent = btn.dataset.caption || '';
    } else {
      lbImg.src = btn.dataset.full;
      lbImg.alt = btn.querySelector('img') ? btn.querySelector('img').alt : '';
      lbCap.textContent = btn.dataset.caption || '';
      if (lbVideo) { lbVideo.pause(); lbVideo.src = ''; }
    }
    lbCount.textContent = `${lbIndex + 1} / ${artItems.length}`;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    lbClose.focus();
  }
  function closeLb() {
    lb.hidden = true;
    stopLbVideo();
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

  /* ── H3 gallery tiles: hover-to-play, poster-first, lazy ─ */
  (function wireHover() {
    if (reduceMotion) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        // pause off-screen video tiles to spare the GPU
        if (!en.isIntersecting) { v.pause(); }
      });
    }, { rootMargin: '120px' });

    artItems.forEach((btn) => {
      const v = btn && btn.querySelector('video[data-hover]');
      if (!v) return;
      const setPlay = (on) => {
        btn.classList.toggle('is-playing', on);
        if (on) { v.play().catch(() => {}); } else { v.pause(); v.currentTime = 0; }
      };
      // hover (fine pointer): play in place
      btn.addEventListener('mouseenter', () => setPlay(true));
      btn.addEventListener('mouseleave', () => setPlay(false));
      btn.addEventListener('focus', () => setPlay(true));
      btn.addEventListener('blur', () => setPlay(false));
      io.observe(v);
    });
  })();

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

  /* ══════════════════════════════════════════════════════
     VAST-IMPROVEMENT PASS — look + feel kinetics
     ══════════════════════════════════════════════════════ */

  /* ── Scroll progress + back to top ──────────────────── */
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('to-top');
  if (progress || toTop) {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress && max > 0) progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
      if (toTop) {
        const show = y > window.innerHeight * 0.6;
        if (show) toTop.hidden = false;
        requestAnimationFrame(() => toTop.classList.toggle('show', show));
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ── Telemetry readout: live local time ─────────────── */
  const tele = document.getElementById('telemetry');
  if (tele) {
    const base = 'coinupbtc / local';
    const tickT = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      tele.textContent = `${base} · ${hh}:${mm}:${ss}`;
    };
    tickT();
    setInterval(tickT, 1000);
  }

  /* ── Generative cursor spark trail ──────────────────── */
  (function sparks() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const cvs = document.createElement('canvas');
    cvs.className = 'sparks';
    const hero = document.querySelector('.hero');
    if (!hero) return;
    hero.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = null;
    const parts = [];
    const COL = { acid: '200,245,74', ink: '' };

    function resize() {
      const r = cvs.getBoundingClientRect();
      W = r.width; H = r.height;
      cvs.width = W * DPR; cvs.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function color() {
      const ink = getComputedStyle(root).getPropertyValue('--ink').trim();
      const hex = ink.replace('#', '');
      const n = parseInt(hex, 16);
      COL.ink = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    }
    function spawn(x, y) {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.4 + Math.random() * 1.1;
        parts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1, dec: 0.012 + Math.random() * 0.02,
          r: 0.6 + Math.random() * 1.4,
          ink: Math.random() < 0.3,
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life -= p.dec;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const rgb = p.ink ? COL.ink : COL.acid;
        ctx.fillStyle = `rgba(${rgb},${Math.max(0, p.life)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (parts.length) raf = requestAnimationFrame(frame);
      else raf = null;
    }
    const onMove = (e) => {
      const r = cvs.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    cvs.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    resize(); color();
  })();

  /* ── Hero 3D brand tilt (pointer-follow) ────────────── */
  (function tilt() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const hero = document.querySelector('.hero');
    const stage = document.getElementById('stage');
    if (!hero || !stage) return;
    let raf = null;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        const maxY = Math.max(2, Math.min(9, r.width * 0.004));
        stage.style.transform = `perspective(900px) rotateY(${(nx * maxY).toFixed(2)}deg) rotateX(${(-ny * maxY).toFixed(2)}deg)`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.classList.add('tilt');
      requestAnimationFrame(() => {
        stage.style.transform = '';
        setTimeout(() => hero.classList.remove('tilt'), 520);
      });
    });
  })();

  /* ── Art tiles: 3D tilt + glare + caption overlay ───── */
  (function artTiles() {
    const items = Array.from(document.querySelectorAll('.art-item'));
    if (!items.length || reduceMotion || !window.matchMedia('(pointer: fine)').matches) {
      // still add captions (no motion variant) so reduced-motion users see them
      document.querySelectorAll('.art-btn').forEach((b) => {
        if (!b.querySelector('.art-cap') && b.dataset.caption) {
          const c = document.createElement('div');
          c.className = 'art-cap';
          c.textContent = b.dataset.caption;
          b.appendChild(c);
        }
        const img = b.querySelector('img');
        if (img) img.classList.add('tile-img');
      });
      return;
    }
    items.forEach((item) => {
      const btn = item.querySelector('.art-btn');
      const img = btn?.querySelector('img');
      if (!btn || !img) return;
      if (!btn.querySelector('.art-cap') && btn.dataset.caption) {
        const c = document.createElement('div');
        c.className = 'art-cap';
        c.textContent = btn.dataset.caption;
        btn.appendChild(c);
      }
      img.classList.add('tile-img');
      let raf = null;
      btn.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r = btn.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          const ry = nx * 10, rx = -ny * 10;
          btn.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
          if (img) img.style.transform = `scale(1.06) translate(${(nx * -6).toFixed(2)}px, ${(ny * -6).toFixed(2)}px)`;
        });
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
        if (img) img.style.transform = '';
      });
    });
  })();

  /* ── Lightbox: zoom / pan / preload / .open class ───── */
  (function lbZoom() {
    const stageImg = document.getElementById('lb-img');
    const zIn = document.getElementById('lb-zoom-in');
    const zOut = document.getElementById('lb-zoom-out');
    if (!stageImg) return;
    let scale = 1, tx = 0, ty = 0;
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

    function apply() {
      stageImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      stageImg.classList.toggle('pan', scale > 1);
      stageImg.classList.toggle('dragging', dragging);
    }
    function reset() {
      scale = 1; tx = 0; ty = 0;
      apply();
    }
    function zoomBy(f, cx, cy) {
      const before = scale;
      scale = Math.min(6, Math.max(1, scale * f));
      if (cx !== undefined && cy !== undefined && before > 1) {
        // zoom toward pointer
        const k = scale / before;
        tx = cx - (cx - tx) * k;
        ty = cy - (cy - ty) * k;
      }
      apply();
    }
    zIn?.addEventListener('click', () => zoomBy(1.35));
    zOut?.addEventListener('click', () => { zoomBy(1 / 1.35); if (scale === 1) reset(); });
    stageImg.addEventListener('wheel', (e) => {
      if (!lb.hidden) {
        e.preventDefault();
        const r = stageImg.getBoundingClientRect();
        zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
      }
    }, { passive: false });
    stageImg.addEventListener('pointerdown', (e) => {
      if (scale <= 1) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY; ox = tx; oy = ty;
      stageImg.setPointerCapture(e.pointerId);
    });
    stageImg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      tx = ox + (e.clientX - sx);
      ty = oy + (e.clientY - sy);
      apply();
    });
    stageImg.addEventListener('pointerup', () => { dragging = false; apply(); });
    stageImg.addEventListener('pointercancel', () => { dragging = false; apply(); });
    stageImg.addEventListener('dblclick', () => { if (scale > 1) reset(); else zoomBy(2); });

    // preload neighbours so next/prev is instant (image tiles only)
    function preload(i) {
      [i + 1, i - 1, i + 2, i - 2].forEach((n) => {
        const b = artItems[((n % artItems.length) + artItems.length) % artItems.length];
        if (b && b.dataset.full) { const im = new Image(); im.src = b.dataset.full; }
      });
    }

    // hook open/close: add .open class, reset zoom, preload, directional slide-in
    const origOpen = window.__origOpenLb || openLb;
    const lbSwap = (dir) => {
      lbImg.style.setProperty('--dir', dir);
      lbImg.classList.remove('lb-swap');
      void lbImg.offsetWidth; // reflow so the animation restarts
      lbImg.classList.add('lb-swap');
    };
    openLb = (i) => {
      const prev = lbIndex;
      origOpen(i);
      lb.classList.add('open'); reset(); preload(i);
      lbSwap(i === prev ? 0 : (i > prev ? 1 : -1));
    };
    const origClose = closeLb;
    closeLb = () => { origClose(); lb.classList.remove('open'); reset(); };
  })();

  /* ══════════════════════════════════════════════════════
     KINETIC PASS (2026-08-03) — trace / spotlight / spring
     ══════════════════════════════════════════════════════ */

  /* ── Plate signal trace: scroll-linked draw + pulse ──── */
  (function plateTrace() {
    const line = document.querySelector('.plate-trace .trace-line');
    const pulse = document.querySelector('.plate-trace .trace-pulse');
    const plate = document.querySelector('.plate');
    if (!line || !plate) return;
    const len = line.getTotalLength();
    line.style.strokeDasharray = String(len);
    const draw = (p) => {
      const q = Math.min(1, Math.max(0, p));
      line.style.strokeDashoffset = String(len * (1 - q));
      if (pulse) {
        const pt = line.getPointAtLength(len * q);
        pulse.setAttribute('cx', pt.x.toFixed(1));
        pulse.setAttribute('cy', pt.y.toFixed(1));
      }
    };
    if (reduceMotion) { draw(1); return; } // static full route, no pulse
    const hero = document.querySelector('.hero');
    if (!hero) { draw(1); return; }
    let raf = null, inView = true;
    const update = () => {
      raf = null;
      if (!inView) return;
      const r = hero.getBoundingClientRect();
      // 0 while the hero top sits at the viewport top; 1 once ~45% of the
      // hero height has scrolled up — the packet reaches Freegle as the plate leaves.
      const span = Math.max(1, r.height * 0.45);
      draw((-r.top) / span);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { inView = e.isIntersecting; if (inView) update(); });
      }, { rootMargin: '0px 0px 40% 0px' });
      io.observe(plate);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

  /* ── Cursor-follow acid spotlight (cards + art tiles) ── */
  (function spotlight() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const targets = Array.from(document.querySelectorAll('.card, .art-btn'));
    if (!targets.length) return;
    targets.forEach((el) => {
      const s = document.createElement('span');
      s.className = 'spot';
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
    let raf = null, lastEl = null;
    const grids = Array.from(document.querySelectorAll('.card-grid, .art-grid'));
    grids.forEach((grid) => {
      if (!grid) return;
      grid.addEventListener('pointermove', (e) => {
        const t = e.target.closest('.card, .art-btn');
        if (t !== lastEl) {
          if (lastEl) lastEl.classList.remove('spot-on');
          lastEl = t;
          if (t) t.classList.add('spot-on');
        }
        if (!t || raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r = t.getBoundingClientRect();
          t.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(1)}px`);
          t.style.setProperty('--my', `${(e.clientY - r.top).toFixed(1)}px`);
        });
      });
      grid.addEventListener('pointerleave', () => {
        if (lastEl) lastEl.classList.remove('spot-on');
        lastEl = null;
      });
    });
  })();

  /* ── Nav: mark the section you're in so the page is usable ── */
  (function navSpy() {
    const links = Array.from(document.querySelectorAll('.site-nav nav a[href^="#"]'));
    if (!links.length) return;
    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) map.set(el, a);
    });
    const setCurrent = (link) => {
      links.forEach((a) => a.removeAttribute('aria-current'));
      if (link) link.setAttribute('aria-current', 'true');
    };
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(map.get(visible.target));
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.25, 0.5] });
    map.forEach((_, el) => io.observe(el));
  })();
})();
