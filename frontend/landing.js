// landing page animation
(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  let entering = false;

  function enterSite() {
    if (entering) return;
    entering = true;
    gsap.to($("transOverlay"), {
      opacity: 1, duration: 0.55, ease: "power2.in",
      onComplete: () => { window.location.href = "index.html"; },
    });
  }
  window.enterSite = enterSite;
  $("skipBtn").addEventListener("click", enterSite);

  const BOOKS = Array.from(document.querySelectorAll(".orb-book"));
  const N     = BOOKS.length;

  const SPINE_DATA = [
    { label: 'Ronja',   hue: 130 },
    { label: 'Emil',    hue: 42  },
    { label: 'Alfons',  hue: 205 },
    { label: 'Pippi',   hue: 8   },
    { label: 'Bamse',   hue: 162 },
    { label: 'Astrid',  hue: 270 },
  ];

  function positionBooks() {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const r = vmin * 0.36;
    BOOKS.forEach((book, i) => {
      const angle = (i / N) * 360;
      const rad   = (angle - 90) * (Math.PI / 180);
      const x     = Math.cos(rad) * r;
      const y     = Math.sin(rad) * r;
      const data  = SPINE_DATA[i] || { label: 'Book', hue: 130 };
      book.style.setProperty('--hue', data.hue);
      book.innerHTML = `<span>${data.label}</span>`;
      gsap.set(book, {
        x: x - book.offsetWidth  / 2,
        y: y - book.offsetHeight / 2,
        rotation: 0,
      });
    });
  }

  /* sparkles */
  function buildSparkles() {
    const field = $("sparkleField");
    if (!field) return;
    for (let i = 0; i < 32; i++) {
      const s = document.createElement("div");
      s.className = "sparkle";
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2.5+Math.random()*3.5}s;--dl:${Math.random()*4}s;`;
      field.appendChild(s);
    }
  }

  /* orbit animation keyframes */
  const style = document.createElement("style");
  style.textContent = `
    @keyframes orbit-spin    { to { transform: rotate(360deg);  } }
    @keyframes counter-spin  { to { transform: rotate(-360deg); } }
  `;
  document.head.appendChild(style);

  /* reduced motion */
  if (reduced) {
    gsap.set([$("phWorld")], { opacity: 1, pointerEvents: "auto" });
    gsap.set([$("duckCenter"), $("mainTitle"), $("mainTagline"), $("ctaBtn")],
      { opacity: 1, y: 0, scale: 1 });
    BOOKS.forEach(b => gsap.set(b, { opacity: 1, scale: 1 }));
    document.querySelectorAll(".feat-card").forEach(c => gsap.set(c, { opacity: 1, x: 0 }));
    return;
  }

  if (typeof gsap === "undefined") { enterSite(); return; }

  buildSparkles();
  positionBooks();

  /* SVG path lengths for stroke animation */
  document.querySelectorAll(".lm-draw").forEach(el => {
    const len = el.getTotalLength ? el.getTotalLength() : 500;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to($("skipBtn"), { opacity: 1, duration: 0.5 }, 0);
  tl.to($("phLogo"), { opacity: 1, pointerEvents: "auto", duration: 0.6 }, 0.2);

  tl.to(".lm-draw", {
    strokeDashoffset: 0,
    duration: 1.6, stagger: 0.1, ease: "power2.inOut",
  }, 0.4);

  tl.to(".lm-fill", { opacity: 1, duration: 0.4, stagger: 0.1 }, 1.6);
  tl.to($("logoWordmark"), { opacity: 1, y: 0, duration: 0.65 }, 2.0);
  tl.to($("logoTagline"), { opacity: 1, duration: 0.5 }, 2.5);

  tl.to($("phLogo"),  { opacity: 0, pointerEvents: "none", duration: 0.75 }, 3.4);
  tl.to($("phWorld"), { opacity: 1, pointerEvents: "auto", duration: 0.75 }, 3.4);

  tl.to($("duckCenter"), {
    opacity: 1, y: 0, scale: 1,
    duration: 0.9, ease: "back.out(1.8)",
  }, 3.6);

  BOOKS.forEach((book, i) => {
    tl.to(book, {
      opacity: 1, scale: 1,
      duration: 0.55, ease: "back.out(2.2)",
    }, 4.2 + i * 0.27);
  });

  tl.call(() => {
    const ring = $("orbitRing");
    if (ring) ring.style.animation = "orbit-spin 22s linear infinite";
    BOOKS.forEach(b => { b.style.animation = "counter-spin 22s linear infinite"; });
  }, null, 5.6);

  const featCards = [
    { sel: ".feat-tl", xFrom: -70 },
    { sel: ".feat-tr", xFrom:  70 },
    { sel: ".feat-bl", xFrom: -70 },
    { sel: ".feat-br", xFrom:  70 },
  ];
  featCards.forEach(({ sel, xFrom }, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    tl.to(el, { opacity: 1, x: 0, duration: 0.6 }, 5.8 + i * 0.15);
  });

  tl.to($("mainTitle"), { opacity: 1, y: 0, duration: 0.8 }, 7.0);
  tl.to($("mainTagline"), { opacity: 1, y: 0, duration: 0.6 }, 7.4);
  tl.to($("ctaBtn"), {
    opacity: 1, y: 0, scale: 1,
    duration: 0.6, ease: "back.out(1.4)",
  }, 8.0);

  /* 8.3 — CTA pulse ring (repeating) */
  tl.to($("ctaPulse"), {
    duration: 1,
    repeat: -1,
    keyframes: [
      { opacity: 0.6, scale: 1,   duration: 0 },
      { opacity: 0,   scale: 1.8, duration: 1 },
    ],
  }, 8.3);

  /* 13.5 — auto redirect */
  tl.to($("transOverlay"), {
    opacity: 1, duration: 0.65, ease: "power2.in",
    onComplete: () => { window.location.href = "index.html"; },
  }, 13.5);

  /* ── Window resize ─────────────────────────── */
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(positionBooks, 200);
  });

})();
