// =========================================================
// StoryDucks — Cinematic Landing Page JS
// =========================================================
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ── Scroll progress bar ──────────────────────────────
  const bar = document.getElementById("scrollProgress");
  if (bar) {
    const updateBar = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", updateBar, { passive: true });
  }

  // ── Nav background on scroll ─────────────────────────
  const nav = document.getElementById("lNav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile burger ────────────────────────────────────
  const burger = document.getElementById("navBurger");
  const drawer = document.getElementById("navDrawer");
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-open");
      drawer.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      drawer.setAttribute("aria-hidden", !open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    // Close on link click
    drawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        burger.classList.remove("is-open");
        drawer.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      })
    );
  }

  // ── Reduced motion — just reveal everything ───────────
  if (prefersReducedMotion) {
    document.querySelectorAll("[data-anim]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    document.querySelectorAll(".deco-el").forEach((el) => {
      el.style.opacity = "0.6";
    });
    return;
  }

  // ── GSAP guard ───────────────────────────────────────
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll("[data-anim]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Helper: get initial transform for each anim type ─
  function getFrom(anim) {
    switch (anim) {
      case "fade-up":    return { opacity: 0, y: 40 };
      case "fade-left":  return { opacity: 0, x: -48 };
      case "fade-right": return { opacity: 0, x: 48 };
      case "scale-up":   return { opacity: 0, scale: 0.88, y: 28 };
      default:           return { opacity: 0, y: 30 };
    }
  }

  // ── Scene 1 — hero entrance (no scroll trigger) ───────
  const heroEls = document.querySelectorAll(
    "#s1 [data-anim]"
  );
  heroEls.forEach((el) => {
    const anim  = el.dataset.anim || "fade-up";
    const delay = parseFloat(el.dataset.delay || 0) / 1000;
    gsap.fromTo(el, getFrom(anim), {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 1.1,
      delay: 0.25 + delay,
      ease: "power3.out",
    });
  });

  // ── Scene 1 bg — slow ken burns ───────────────────────
  const s1bg = document.getElementById("s1Bg");
  if (s1bg) {
    gsap.fromTo(s1bg, { scale: 1.08 }, {
      scale: 1.02, duration: 10, ease: "power1.out",
    });
    // Parallax on scroll
    gsap.to(s1bg, {
      yPercent: 22,
      ease: "none",
      scrollTrigger: {
        trigger: "#s1",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // ── Scenes 2–7 — scroll-triggered animations ─────────
  const scenes = ["#s2","#s3","#s4","#s5","#s6","#s7"];

  scenes.forEach((id) => {
    const section = document.querySelector(id);
    if (!section) return;

    // Parallax on bg
    const bg = section.querySelector(".scene__bg");
    if (bg) {
      gsap.fromTo(bg,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // Animate each [data-anim] element
    section.querySelectorAll("[data-anim]").forEach((el) => {
      const anim  = el.dataset.anim || "fade-up";
      const delay = parseFloat(el.dataset.delay || 0) / 1000;
      gsap.fromTo(el, getFrom(anim), {
        opacity: 1, x: 0, y: 0, scale: 1,
        duration: 0.85,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });
  });

  // ── CTA deco floaters — reveal on scene enter ─────────
  const decoEls = document.querySelectorAll(".deco-el");
  if (decoEls.length) {
    gsap.to(decoEls, {
      opacity: 0.55,
      duration: 1.2,
      stagger: 0.18,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#s7",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  }

  // ── Scene 3 — extra: slow rotate on bg ───────────────
  const s3bg = document.getElementById("s3Bg");
  if (s3bg) {
    gsap.to(s3bg, {
      rotation: 2,
      duration: 14,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  // ── Scroll cue — fade out when user scrolls ───────────
  const cue = document.querySelector(".scene__scroll-cue");
  if (cue) {
    gsap.to(cue, {
      opacity: 0,
      scrollTrigger: {
        trigger: "#s1",
        start: "15% top",
        end: "35% top",
        scrub: true,
      },
    });
  }

  // ── Buttons — spring hover via GSAP ──────────────────
  document.querySelectorAll(".l-btn--primary, .l-btn--gold").forEach((btn) => {
    btn.addEventListener("mouseenter", () =>
      gsap.to(btn, { scale: 1.045, duration: 0.18, ease: "back.out(3)" })
    );
    btn.addEventListener("mouseleave", () =>
      gsap.to(btn, { scale: 1, duration: 0.22, ease: "power2.out" })
    );
  });

  // ── Mock cards — stagger reveal ───────────────────────
  const mockCards = document.querySelectorAll(".mock-card");
  if (mockCards.length) {
    gsap.fromTo(mockCards,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".mock-grid",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  // ── Feature pills — stagger reveal ───────────────────
  const pills = document.querySelectorAll(".feat-pill");
  if (pills.length) {
    gsap.fromTo(pills,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 1, scale: 1,
        duration: 0.45,
        stagger: 0.07,
        ease: "back.out(1.8)",
        scrollTrigger: {
          trigger: ".cta-features",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  // ── Refresh on resize ─────────────────────────────────
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
})();
