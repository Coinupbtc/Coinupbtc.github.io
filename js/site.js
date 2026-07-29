/* Coinupbtc — site behaviour. No dependencies, no tracking, no build step. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── Scroll reveal ───────────────────────────────────────────── */
  var reveals = document.querySelectorAll(".reveal");

  if (reduced.matches || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ── Hero video: honour reduced motion, and don't burn cycles offscreen ── */
  var hero = document.querySelector(".hero-media video");
  if (hero) {
    if (reduced.matches) {
      hero.removeAttribute("autoplay");
      hero.pause();
    } else {
      hero.preload = "auto";
      hero.play().catch(function () { /* poster stands in; nothing to do */ });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { hero.play().catch(function () {}); }
            else { hero.pause(); }
          });
        }, { threshold: 0.01 }).observe(hero);
      }
    }
  }

  /* ── Reel: play on hover (pointer) or on tap (touch) ─────────── */
  document.querySelectorAll("video[data-hover]").forEach(function (v) {
    var load = function () {
      if (v.preload !== "auto") { v.preload = "auto"; v.load(); }
    };
    var play = function () { load(); v.play().catch(function () {}); };
    var stop = function () { v.pause(); v.currentTime = 0; };

    if (window.matchMedia("(hover: hover)").matches && !reduced.matches) {
      v.parentElement.addEventListener("mouseenter", play);
      v.parentElement.addEventListener("mouseleave", stop);
    }

    // Always tappable / clickable, hover or not.
    v.addEventListener("click", function () {
      if (v.paused) { play(); } else { v.pause(); }
    });
  });

  /* ── Lightbox ────────────────────────────────────────────────── */
  var lb = document.getElementById("lb");
  if (!lb) return;

  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var lbCount = document.getElementById("lb-count");
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var index = -1;
  var lastFocus = null;

  function show(i) {
    if (!shots.length) return;
    index = (i + shots.length) % shots.length;
    var btn = shots[index];
    var img = btn.querySelector("img");

    lbImg.src = btn.dataset.full;
    lbImg.alt = img ? img.alt : "";
    lbCap.textContent = btn.dataset.cap || "";
    lbCount.textContent = (index + 1) + " / " + shots.length;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector("[data-close]").focus();
  }

  function close() {
    lb.hidden = true;
    lbImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  shots.forEach(function (btn, i) {
    btn.addEventListener("click", function () { open(i); });
  });

  lb.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close") || e.target === lb ||
        e.target.classList.contains("lb-stage")) {
      close();
      return;
    }
    var step = e.target.getAttribute("data-step");
    if (step) show(index + Number(step));
  });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") { close(); }
    else if (e.key === "ArrowRight") { show(index + 1); }
    else if (e.key === "ArrowLeft") { show(index - 1); }
    else if (e.key === "Tab") {
      // Keep focus inside the viewer while it is open.
      var f = lb.querySelectorAll("button");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
