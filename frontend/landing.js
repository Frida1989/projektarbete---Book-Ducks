// ==========================================================
// StoryDucks — Cinematic Landing Page
// Pinned scroll hero: elements orbit the duck on scroll
// ==========================================================
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  // ── Scroll progress ──────────────────────────────────────
  const bar = document.getElementById("scrollProgress");
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar && max > 0) bar.style.width = (window.scrollY / max * 100) + "%";
  };
  window.addEventListener("scroll", updateBar, { passive: true });

  // ── Nav ─────────────────────────────────────────────────
  const nav = document.getElementById("lNav");
  window.addEventListener("scroll", () =>
    nav && nav.classList.toggle("is-scrolled", window.scrollY > 60), { passive: true });

  // ── Burger ──────────────────────────────────────────────
  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-open");
      drawer.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      burger.classList.remove("is-open");
      drawer.classList.remove("is-open");
      document.body.style.overflow = "";
    }));
  }

  // ── Reduced motion fallback ──────────────────────────────
  if (reduced) {
    document.querySelectorAll("[data-anim]").forEach(el => {
      el.style.opacity = "1"; el.style.transform = "none";
    });
    document.querySelectorAll(".hero-h1,.hero-tagline,.hero-sub,.hero-cta").forEach(el => {
      el.style.opacity = "1"; el.style.transform = "none";
    });
    document.querySelectorAll(".orb-el").forEach(el => el.style.opacity = ".6");
    document.querySelector(".hero-scroll-cue") && (document.querySelector(".hero-scroll-cue").style.opacity = "1");
    return;
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll("[data-anim],.hero-h1,.hero-tagline,.hero-sub,.hero-cta").forEach(el => {
      el.style.opacity = "1"; el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ══════════════════════════════════════════════════════════
  // HERO — Pinned scroll animation
  // Total scroll space = 4 × viewport height
  // ══════════════════════════════════════════════════════════

  const SCROLL_SPACE = window.innerHeight * 4;
  const pinWrap = document.getElementById("heroPinWrap");
  if (pinWrap) pinWrap.style.height = SCROLL_SPACE + "px";

  // Orbit positions (x%, y%) relative to viewport center
  // Each element starts FAR off-screen and lands in its orbit slot
  const orbitSlots = [
    // [targetX, targetY, startX, startY] (vw / vh offsets from center)
    { id:"ob1", tx:-38, ty:-30, sx:-120, sy:-80  },  // book TL
    { id:"ob2", tx: 38, ty:-32, sx: 120, sy:-80  },  // book TR
    { id:"ob3", tx:-42, ty: 10, sx:-130, sy:  0  },  // book ML
    { id:"ob4", tx: 42, ty: 12, sx: 130, sy:  0  },  // book MR
    { id:"ob5", tx:-30, ty: 34, sx:-100, sy: 100 },  // book BL
    { id:"ob6", tx: 30, ty: 36, sx: 100, sy: 100 },  // book BR
    { id:"os1", tx:  0, ty:-44, sx:   0, sy:-130 },  // star top
    { id:"os2", tx:-18, ty:-20, sx: -80, sy: -80 },  // star TL inner
    { id:"os3", tx: 18, ty:-22, sx:  80, sy: -80 },  // star TR inner
    { id:"os4", tx:  0, ty: 44, sx:   0, sy: 130 },  // star bottom
    { id:"od1", tx:-24, ty: 18, sx:-110, sy:  60 },  // duck L
    { id:"od2", tx: 24, ty: 18, sx: 110, sy:  60 },  // duck R
    { id:"om1", tx:-10, ty:-36, sx: -60, sy:-110 },  // bookmark TL
    { id:"om2", tx: 10, ty: 36, sx:  60, sy: 110 },  // bookmark BR
    { id:"oc1", tx: 48, ty:-18, sx: 140, sy: -60 },  // cloud TR
    { id:"oc2", tx:-48, ty: 22, sx:-140, sy:  60 },  // cloud BL
  ];

  const vw = () => window.innerWidth  * 0.01;
  const vh = () => window.innerHeight * 0.01;

  // Place elements at start positions
  orbitSlots.forEach(slot => {
    const el = document.getElementById(slot.id);
    if (!el) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    gsap.set(el, {
      x: cx + slot.sx * vw() - el.offsetWidth  / 2,
      y: cy + slot.sy * vh() - el.offsetHeight / 2,
      opacity: 0,
      scale: .6,
    });
  });

  // Main hero timeline (scrubbed to scroll)
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Phase 1 (progress 0→0.35): duck scales in + elements fly to orbit
  heroTl
    .fromTo("#heroDuck", { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .25 }, 0)
    .to(orbitSlots.map(s => "#" + s.id), {
      duration: .4,
      stagger: .015,
      opacity: 1,
      scale: 1,
      x: (i) => {
        const slot = orbitSlots[i];
        const el   = document.getElementById(slot.id);
        return window.innerWidth  / 2 + slot.tx * vw() - (el ? el.offsetWidth  / 2 : 0);
      },
      y: (i) => {
        const slot = orbitSlots[i];
        const el   = document.getElementById(slot.id);
        return window.innerHeight / 2 + slot.ty * vh() - (el ? el.offsetHeight / 2 : 0);
      },
    }, 0)

  // Phase 2 (0.35→0.55): title
    .fromTo("#heroTitle",   { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .25 }, ".3")

  // Phase 3 (0.5→0.7): tagline
    .fromTo("#heroTagline", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .2  }, ".45")

  // Phase 4 (0.62→0.78): sub
    .fromTo("#heroSub",     { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .18 }, ".58")

  // Phase 5 (0.72→0.88): CTA
    .fromTo("#heroCta",     { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .18 }, ".68")

  // Phase 6 (0.85→1): scroll cue
    .fromTo("#scrollCue",   { opacity: 0 },         { opacity: 1, duration: .12 },       ".82");

  // Pin the hero and scrub the timeline
  ScrollTrigger.create({
    trigger: "#heroPinWrap",
    start:   "top top",
    end:     "+=" + SCROLL_SPACE,
    pin:     "#heroScene",
    scrub:   1.4,
    animation: heroTl,
  });

  // Gentle idle float on orbiting elements after they arrive
  // (runs always, independent of scroll)
  function addIdleFloat(id, delay) {
    const el = document.getElementById(id);
    if (!el) return;
    gsap.to(el, {
      y: "-=14",
      duration: 3 + Math.random() * 2,
      repeat: -1, yoyo: true,
      ease: "sine.inOut",
      delay,
    });
  }
  orbitSlots.forEach((s, i) => addIdleFloat(s.id, i * .12 + 1));

  // Duck gentle pulse
  gsap.to("#heroDuck", {
    scale: 1.04, duration: 2.8,
    repeat: -1, yoyo: true, ease: "sine.inOut",
    delay: 1.2,
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 2–7: scroll-triggered reveals
  // ══════════════════════════════════════════════════════════

  // Parallax for image scenes
  ["#s2","#s3","#s4"].forEach(id => {
    const bg = document.querySelector(id + " .scene__bg");
    if (!bg) return;
    gsap.fromTo(bg, { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: id, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Animate [data-anim] elements
  document.querySelectorAll("[data-anim]").forEach(el => {
    const anim  = el.dataset.anim;
    const delay = parseFloat(el.dataset.delay || 0) / 1000;
    const from  = {
      "fade-up":    { opacity:0, y:38 },
      "fade-left":  { opacity:0, x:-46 },
      "fade-right": { opacity:0, x:46 },
      "scale-up":   { opacity:0, scale:.88, y:22 },
    }[anim] || { opacity:0, y:30 };

    gsap.fromTo(el, from, {
      opacity:1, x:0, y:0, scale:1,
      duration: .82, delay,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
    });
  });

  // CTA deco floaters reveal
  gsap.to(".cta-deco span", {
    opacity: .55, duration: 1.1, stagger: .15, ease: "power2.out",
    scrollTrigger: { trigger: "#s7", start: "top 80%", toggleActions: "play none none none" },
  });

  // Mock cards stagger
  gsap.fromTo(".mock-card",
    { opacity:0, y:18 },
    { opacity:1, y:0, duration:.48, stagger:.06, ease:"power2.out",
      scrollTrigger: { trigger:".mock-grid", start:"top 88%", toggleActions:"play none none none" } }
  );

  // Feature pills stagger
  gsap.fromTo(".feat-pill",
    { opacity:0, scale:.82 },
    { opacity:1, scale:1, duration:.4, stagger:.07, ease:"back.out(1.8)",
      scrollTrigger: { trigger:".cta-pills", start:"top 88%", toggleActions:"play none none none" } }
  );

  // Button spring hover
  document.querySelectorAll(".l-btn--primary,.l-btn--gold").forEach(btn => {
    btn.addEventListener("mouseenter", () => gsap.to(btn, { scale:1.05, duration:.18, ease:"back.out(3)" }));
    btn.addEventListener("mouseleave", () => gsap.to(btn, { scale:1,    duration:.22, ease:"power2.out" }));
  });

  // Resize: recalculate orbit positions
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (pinWrap) pinWrap.style.height = window.innerHeight * 4 + "px";
      ScrollTrigger.refresh();
    }, 200);
  });

})();
