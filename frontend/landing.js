/* ==========================================================
   StoryDucks — Cinematic Auto-Play Landing
   Sequence:
     0.0s  Skip btn fades in
     0.2s  Phase 1: dark bg, SVG logo draws itself
     2.0s  Wordmark slides in
     3.2s  Phase 2: cream bloom, duck drops in
     4.0s  Books orbit in one-by-one
     5.8s  Title + tagline reveal
     6.8s  CTA pulses in
     7.5s  Hand slides in
     8.4s  Hand taps CTA (ripple + press)
     9.2s  White flash → redirect index.html
========================================================== */
(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  const ORBIT_R = Math.min(window.innerWidth, window.innerHeight) * 0.29;
  const BOOKS   = Array.from(document.querySelectorAll(".orb-book"));
  const N       = BOOKS.length; // 6

  /* ── Position books in a circle ─────────────────────── */
  function positionBooks() {
    const r = Math.min(window.innerWidth, window.innerHeight) * 0.29;
    BOOKS.forEach((book, i) => {
      const angle = (i / N) * 360;
      const rad   = (angle - 90) * (Math.PI / 180);
      const x     = Math.cos(rad) * r;
      const y     = Math.sin(rad) * r;
      // place relative to #orbitRing which is centred at duck
      gsap.set(book, {
        x: x - book.offsetWidth  / 2,
        y: y - book.offsetHeight / 2,
        rotation: 0,
      });
      book.innerHTML = `<span style="position:relative;z-index:1">${book.dataset.emoji}</span>`;
    });
  }

  /* ── Sparkles ────────────────────────────────────────── */
  function buildSparkles() {
    const field = $("sparkleField");
    if (!field) return;
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        --d:${2.5 + Math.random() * 3}s;
        --dl:${Math.random() * 3}s;
      `;
      field.appendChild(s);
    }
  }

  /* ── Skip / Enter ────────────────────────────────────── */
  function enterSite() {
    if (entering) return;
    entering = true;
    gsap.to($("transOverlay"), {
      opacity: 1, duration: 0.5, ease: "power2.in",
      onComplete: () => { window.location.href = "index.html"; },
    });
  }
  let entering = false;
  window.enterSite = enterSite;          // expose for inline onclick

  $("skipBtn").addEventListener("click", enterSite);

  /* ── Reduced-motion fast path ────────────────────────── */
  if (reduced) {
    gsap.set([$("phWorld")], { opacity: 1, pointerEvents: "auto" });
    gsap.set([$("duckCenter"), $("mainTitle"), $("mainTagline"), $("ctaBtn")],
      { opacity: 1, y: 0, scale: 1 });
    BOOKS.forEach(b => gsap.set(b, { opacity: 1, scale: 1 }));
    return;
  }

  /* ── Wait for GSAP ───────────────────────────────────── */
  if (typeof gsap === "undefined") {
    console.warn("GSAP not loaded");
    enterSite();
    return;
  }

  buildSparkles();
  positionBooks();

  /* ── SVG draw path lengths ───────────────────────────── */
  document.querySelectorAll(".lm-draw").forEach(el => {
    const len = el.getTotalLength ? el.getTotalLength() : 500;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  });

  /* ════════════════════════════════════════════════════════
     MASTER TIMELINE
  ════════════════════════════════════════════════════════ */
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  /* 0.0 — Skip btn */
  tl.to($("skipBtn"), { opacity: 1, duration: 0.4 }, 0);

  /* 0.2 — Phase 1 fades in */
  tl.to($("phLogo"), { opacity: 1, pointerEvents: "auto", duration: 0.5 }, 0.2);

  /* 0.4 – 1.8 — SVG paths draw on */
  tl.to(".lm-draw", {
    strokeDashoffset: 0,
    duration: 1.5,
    stagger: 0.12,
    ease: "power2.inOut",
  }, 0.4);

  /* 1.6 — fills appear */
  tl.to(".lm-fill", { opacity: 1, duration: 0.4, stagger: 0.1 }, 1.6);

  /* 2.0 — wordmark */
  tl.to($("logoWordmark"), { opacity: 1, y: 0, duration: 0.6 }, 2.0);

  /* 3.2 — Phase 1 fades out, cream blooms in */
  tl.to($("phLogo"), { opacity: 0, pointerEvents: "none", duration: 0.7 }, 3.2);
  tl.to($("phWorld"), { opacity: 1, pointerEvents: "auto", duration: 0.7 }, 3.2);

  /* 3.4 — duck drops in */
  tl.to($("duckCenter"), {
    opacity: 1, y: 0, scale: 1,
    duration: 0.85, ease: "back.out(1.6)",
  }, 3.4);

  /* 3.9 – 5.5 — books orbit in, one by one */
  BOOKS.forEach((book, i) => {
    tl.to(book, {
      opacity: 1, scale: 1,
      duration: 0.5, ease: "back.out(2)",
    }, 3.9 + i * 0.28);
  });

  /* 5.4 — start ring rotation (CSS does it, we just let CSS anim run) */
  tl.call(() => {
    $("orbitRing").style.animation = "orbit-spin 18s linear infinite";
    // counter-rotate each book to stay upright
    BOOKS.forEach(b => {
      b.style.animation = "counter-spin 18s linear infinite";
    });
  }, null, 5.4);

  /* 5.8 — title */
  tl.to($("mainTitle"), { opacity: 1, y: 0, duration: 0.7 }, 5.8);

  /* 6.2 — tagline */
  tl.to($("mainTagline"), { opacity: 1, y: 0, duration: 0.55 }, 6.2);

  /* 6.8 — CTA button */
  tl.to($("ctaBtn"), {
    opacity: 1, y: 0, scale: 1,
    duration: 0.55, ease: "back.out(1.4)",
  }, 6.8);

  /* 7.0 — CTA pulse ring */
  tl.to($("ctaPulse"), {
    opacity: 1, scale: 1.5, duration: 0.9,
    repeat: -1, yoyo: false,
    ease: "power2.out",
    keyframes: [
      { opacity: 0.6, scale: 1,   duration: 0 },
      { opacity: 0,   scale: 1.7, duration: 0.9 },
    ],
  }, 7.0);

  /* 7.5 — hand slides in */
  tl.to($("handWrap"), {
    opacity: 1, x: 0, rotation: -8,
    duration: 0.65, ease: "power3.out",
  }, 7.5);

  /* 8.2 — hand taps (presses down) */
  tl.to($("handWrap"), {
    y: -12, scale: 0.92,
    duration: 0.18, ease: "power2.in",
  }, 8.2);
  /* ripple burst */
  tl.to($("tapRipple"), {
    scale: 1.8, opacity: 0,
    duration: 0.5, ease: "power2.out",
    keyframes: [
      { scale: 0,   opacity: 0.7, duration: 0 },
      { scale: 1.8, opacity: 0,   duration: 0.5 },
    ],
  }, 8.2);
  /* hand lifts */
  tl.to($("handWrap"), {
    y: 0, scale: 1,
    duration: 0.22, ease: "power2.out",
  }, 8.4);

  /* 9.0 — white flash → redirect */
  tl.to($("transOverlay"), {
    opacity: 1, duration: 0.5, ease: "power2.in",
    onComplete: () => { window.location.href = "index.html"; },
  }, 9.0);

})();

/* Orbit CSS keyframes injected at runtime (avoids HTML clutter) */
(function injectOrbitCSS() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes orbit-spin {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }
    @keyframes counter-spin {
      from { transform: rotate(0deg);    }
      to   { transform: rotate(-360deg); }
    }
  `;
  document.head.appendChild(style);
})();
