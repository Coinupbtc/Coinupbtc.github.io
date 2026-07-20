/* ============================================================
   COINUPBTC PORTFOLIO — SCRIPTS. No libraries, no network requests.
   Sections:
     1. Theme toggle (persisted in localStorage only)
     2. Scroll-reveal + scroll progress
     3. Ambient dust canvas, cursor-reactive (off under reduced motion)
     4. Count-up stats
     5. Magnetic buttons
     6. Utilities (year stamp)
   ============================================================ */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1. Theme toggle ---------- */
  var THEME_KEY = "portfolio-theme";
  var toggle = document.getElementById("theme-toggle");

  function currentTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* private mode */ }
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    docEl.setAttribute("data-theme", theme);
    if (toggle) {
      // aria-pressed means "light mode is on"
      toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      var label = toggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = theme === "light" ? "Dark" : "Light";
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f3efe7" : "#0b0d12");
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = docEl.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* fine without */ }
    });
  }

  /* ---------- 2. Scroll-reveal + progress ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var progress = document.getElementById("scroll-progress");
  if (progress && !reducedMotion.matches) {
    var progressPending = false;
    var updateProgress = function () {
      progressPending = false;
      var max = docEl.scrollHeight - innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ")";
    };
    addEventListener("scroll", function () {
      if (!progressPending) {
        progressPending = true;
        requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

  /* ---------- 3. Ambient dust canvas ----------
     A sparse field of slow-drifting motes that lean gently away from
     the cursor, with faint light-lines to motes near it. Deliberately
     quiet: capped particle count, pauses when the tab is hidden, and
     never runs if the visitor prefers reduced motion. */
  var canvas = document.getElementById("dust");
  if (canvas && !reducedMotion.matches) {
    var ctx = canvas.getContext("2d");
    var motes = [];
    var running = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointer = { x: -1e4, y: -1e4 };          // offscreen until first move
    var LINK_RADIUS = 160;                        // px (CSS pixels)

    function accentColor() {
      return getComputedStyle(docEl).getPropertyValue("--accent-soft").trim() || "#8fa8ff";
    }

    function resize() {
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      var count = Math.min(70, Math.floor((innerWidth * innerHeight) / 26000));
      motes = [];
      for (var i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: (Math.random() * 1.4 + 0.4) * dpr,
          vx: (Math.random() - 0.5) * 0.12 * dpr,
          vy: (Math.random() - 0.5) * 0.12 * dpr,
          a: Math.random() * 0.35 + 0.08
        });
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var color = accentColor();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      var px = pointer.x * dpr, py = pointer.y * dpr;
      var linkR = LINK_RADIUS * dpr;

      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];

        // Gentle repulsion from the cursor
        var dx = m.x - px, dy = m.y - py;
        var d2 = dx * dx + dy * dy;
        if (d2 < linkR * linkR && d2 > 1) {
          var d = Math.sqrt(d2);
          var push = (1 - d / linkR) * 0.06 * dpr;
          m.vx += (dx / d) * push;
          m.vy += (dy / d) * push;
          // Faint light-line to motes near the cursor
          ctx.globalAlpha = (1 - d / linkR) * 0.18;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Speed cap keeps the field calm after repeated cursor passes
        m.vx = Math.max(-0.4 * dpr, Math.min(0.4 * dpr, m.vx * 0.995));
        m.vy = Math.max(-0.4 * dpr, Math.min(0.4 * dpr, m.vy * 0.995));

        m.x += m.vx; m.y += m.vy;
        if (m.x < 0) m.x = canvas.width;  else if (m.x > canvas.width) m.x = 0;
        if (m.y < 0) m.y = canvas.height; else if (m.y > canvas.height) m.y = 0;

        ctx.globalAlpha = m.a;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX; pointer.y = e.clientY;
    }, { passive: true });
    window.addEventListener("pointerleave", function () {
      pointer.x = -1e4; pointer.y = -1e4;
    });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(tick);
    });
    reducedMotion.addEventListener("change", function (e) {
      running = !e.matches;
      canvas.style.display = e.matches ? "none" : "";
      if (running) requestAnimationFrame(tick);
    });
    requestAnimationFrame(tick);
  }

  /* ---------- 4. Count-up stats ----------
     Numbers rise to their measured value when the strip scrolls into
     view. Reduced motion (or no IntersectionObserver): set instantly. */
  var statNums = document.querySelectorAll(".stat-num");
  function setStat(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    el.textContent = target.toFixed(decimals);
  }
  if (statNums.length) {
    if ("IntersectionObserver" in window && !reducedMotion.matches) {
      var statIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          statIo.unobserve(entry.target);
          var el = entry.target;
          var target = parseFloat(el.getAttribute("data-count"));
          var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
          var t0 = performance.now(), DUR = 1200;
          (function step(t) {
            var p = Math.min((t - t0) / DUR, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (p < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: 0.4 });
      statNums.forEach(function (el) { statIo.observe(el); });
    } else {
      statNums.forEach(setStat);
    }
  }

  /* ---------- 5. Magnetic buttons ----------
     Buttons lean a few pixels toward the cursor. Skipped for touch
     devices and under reduced motion. */
  if (!reducedMotion.matches && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      var PULL = 0.25, MAX = 8;
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = (e.clientX - (r.left + r.width / 2)) * PULL;
        var my = (e.clientY - (r.top + r.height / 2)) * PULL;
        mx = Math.max(-MAX, Math.min(MAX, mx));
        my = Math.max(-MAX, Math.min(MAX, my));
        btn.style.transform = "translate(" + mx + "px," + my + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- 6. Utilities ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
