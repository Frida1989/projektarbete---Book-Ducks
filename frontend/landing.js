// =========================================================
// StoryDucks — Cinematic Landing Page
// GSAP + ScrollTrigger animations
// =========================================================

(function () {
  "use strict";

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ── Scroll progress bar ─────────────────────────────────
  const progressBar = document.getElementById("scrollProgress");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrolled =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      progressBar.style.width = Math.min(scrolled * 100, 100) + "%";
    });
  }

  // ── Sticky nav bg on scroll ────────────────────────────
  const nav = document.getElementById("landingNav");
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // If user prefers reduced motion, just reveal everything immediately
  if (prefersReducedMotion) {
    document
      .querySelectorAll(".gsap-fade, .gsap-fade-left, .gsap-fade-right, .gsap-scale")
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    document.querySelectorAll(".floater").forEach((el) => {
      el.style.opacity = "0.7";
    });
    return; // skip all GSAP
  }

  // ── Wait for GSAP ──────────────────────────────────────
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP not loaded — skipping animations");
    document
      .querySelectorAll(".gsap-fade, .gsap-fade-left, .gsap-fade-right, .gsap-scale")
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero — initial entrance ────────────────────────────
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .to("#scene-hero .scene__title", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: 0.3,
    })
    .to(
      "#scene-hero .scene__subtitle",
      { opacity: 1, y: 0, duration: 0.9 },
      "-=0.7"
    )
    .to(
      "#scene-hero .scene__body",
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    .to(
      "#scene-hero .scene__cta",
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.5"
    );

  // Hero floaters entrance
  gsap.to("#scene-hero .floater", {
    opacity: 0.75,
    duration: 1.4,
    stagger: 0.2,
    delay: 1.2,
    ease: "power2.out",
  });

  // ── Hero bg — slow parallax on scroll ─────────────────
  gsap.to("#heroBg", {
    yPercent: 25,
    ease: "none",
    scrollTrigger: {
      trigger: "#scene-hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // ── Hero bg — slow zoom in ────────────────────────────
  gsap.to("#heroBg", {
    scale: 1.0,
    duration: 8,
    ease: "power1.out",
    delay: 0.2,
  });

  // ── Scroll nudge fade ──────────────────────────────────
  const nudge = document.querySelector(".scroll-nudge");
  if (nudge) {
    gsap.to(nudge, {
      opacity: 0,
      scrollTrigger: {
        trigger: "#scene-hero",
        start: "20% top",
        end: "40% top",
        scrub: true,
      },
    });
  }

  // ── Helper: animate a scene on scroll ──────────────────
  function animateScene(sceneId, options = {}) {
    const scene = document.querySelector(sceneId);
    if (!scene) return;

    const {
      bgParallax = true,
      textClass = ".gsap-fade",
      textFrom = { opacity: 0, y: 40 },
      stagger = 0.12,
    } = options;

    // Parallax bg
    if (bgParallax) {
      const bg = scene.querySelector(".scene__bg");
      if (bg) {
        gsap.fromTo(
          bg,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: scene,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }

    // Text elements
    const els = scene.querySelectorAll(
      ".gsap-fade, .gsap-fade-left, .gsap-fade-right, .gsap-scale"
    );

    els.forEach((el) => {
      let from = { opacity: 0 };
      if (el.classList.contains("gsap-fade"))       from = { opacity: 0, y: 40 };
      if (el.classList.contains("gsap-fade-left"))  from = { opacity: 0, x: -50 };
      if (el.classList.contains("gsap-fade-right")) from = { opacity: 0, x: 50 };
      if (el.classList.contains("gsap-scale"))      from = { opacity: 0, scale: 0.88 };

      gsap.fromTo(el, from, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // Floaters
    const floaters = scene.querySelectorAll(".floater");
    floaters.forEach((f, i) => {
      gsap.to(f, {
        opacity: 0.72,
        duration: 1,
        delay: i * 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: scene,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    });
  }

  // ── Animate all scenes ─────────────────────────────────
  animateScene("#scene-discover");
  animateScene("#scene-adventure");
  animateScene("#scene-brand");
  animateScene("#scene-bookshelf");
  animateScene("#scene-cta");

  // Scene 6 (app) — no bg image parallax, just content
  animateScene("#scene-app", { bgParallax: false });

  // ── Brand scene — pulsing light glow ──────────────────
  const brandBg = document.querySelector("#scene-brand .scene__bg");
  if (brandBg) {
    gsap.to(brandBg, {
      filter: "brightness(1.08)",
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  // ── App preview — sequential card reveal ───────────────
  const miniBooks = document.querySelectorAll(".mini-book");
  if (miniBooks.length) {
    gsap.fromTo(
      miniBooks,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".app-preview__grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  // ── Brand sign-off reveal ──────────────────────────────
  const signoff = document.querySelector(".brand-signoff");
  if (signoff) {
    gsap.fromTo(
      signoff,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: signoff,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  // ── CTA buttons — hover glow pulse ────────────────────
  document.querySelectorAll(".cta-btn--primary, .cta-btn--accent").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { scale: 1.04, duration: 0.2, ease: "power1.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: 0.25, ease: "power1.out" });
    });
  });

  // ── Refresh ScrollTrigger on resize ───────────────────
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
})();
