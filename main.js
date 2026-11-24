/**
 * Bâtikub — interactions: Lenis, GSAP ScrollTrigger, cursor, form, carousel
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const BUSINESS_EMAIL = "fakhreddinemarmouri@yahoo.fr";
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

/* -------------------------------------------------------------------------- */
/* Year                                                                       */
/* -------------------------------------------------------------------------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* -------------------------------------------------------------------------- */
/* Lenis + GSAP                                                               */
/* -------------------------------------------------------------------------- */
let lenis = null;

if (!prefersReduced) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/* -------------------------------------------------------------------------- */
/* Header glass + nav active                                                  */
/* -------------------------------------------------------------------------- */
const header = document.getElementById("site-header");
const navLinks = [...document.querySelectorAll("[data-nav]")];
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

ScrollTrigger.create({
  start: 24,
  onUpdate: (self) => {
    header?.classList.toggle("is-scrolled", self.scroll() > 24);
  },
});

sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onToggle: (self) => {
      if (!self.isActive) return;
      const id = `#${section.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === id);
      });
    },
  });
});

/* Mobile menu */
const nav = document.getElementById("navigation");
const toggle = document.querySelector(".nav-toggle");

const setMenu = (open) => {
  if (!nav || !toggle) return;
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
};

toggle?.addEventListener("click", () => {
  setMenu(toggle.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* -------------------------------------------------------------------------- */
/* Custom cursor + magnetic buttons                                           */
/* -------------------------------------------------------------------------- */
const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (!isTouch && !prefersReduced && cursor && cursorDot && cursorRing) {
  document.body.classList.add("has-custom-cursor");

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ring = { x: pos.x, y: pos.y };

  window.addEventListener(
    "pointermove",
    (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.set(cursorDot, { x: pos.x, y: pos.y });
    },
    { passive: true }
  );

  gsap.ticker.add(() => {
    ring.x += (pos.x - ring.x) * 0.18;
    ring.y += (pos.y - ring.y) * 0.18;
    gsap.set(cursorRing, { x: ring.x, y: ring.y });
  });

  document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
    el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
  });

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: x * 0.22, y: y * 0.22, duration: 0.35, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Line reveals                                                               */
/* -------------------------------------------------------------------------- */
function revealLines(scope = document) {
  scope.querySelectorAll(".split-lines").forEach((block) => {
    if (block.classList.contains("hero-title")) return;
    const lines = block.querySelectorAll(".line");
    if (!lines.length) return;

    gsap.fromTo(
      lines,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: prefersReduced ? 0.01 : 1.05,
        stagger: 0.1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: block,
          start: "top 90%",
          toggleActions: "play none none none",
          once: true,
        },
      }
    );
  });
}

revealLines();

/* Hero title plays on load */
const heroLines = document.querySelectorAll(".hero-title .line");
if (heroLines.length) {
  gsap.fromTo(
    heroLines,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: prefersReduced ? 0.01 : 1.15,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.2,
      clearProps: "transform",
    }
  );
}

gsap.from(".hero-copy .section-label, .hero-lead, .hero-actions, .hero-social", {
  opacity: 0,
  y: 24,
  duration: prefersReduced ? 0.01 : 0.9,
  stagger: 0.08,
  delay: 0.45,
  ease: "power2.out",
});

/* Watermark parallax */
const watermark = document.querySelector(".hero-watermark");
if (watermark && !prefersReduced) {
  gsap.to(watermark, {
    xPercent: -18,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

/* Mask reveals */
document.querySelectorAll(".reveal-mask").forEach((el) => {
  gsap.fromTo(
    el,
    { clipPath: "inset(100% 0 0 0)" },
    {
      clipPath: "inset(0% 0 0 0)",
      duration: prefersReduced ? 0.01 : 1.2,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    }
  );
});

/* Parallax images */
if (!prefersReduced) {
  document.querySelectorAll(".parallax-img").forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -12 },
      {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}

/* Arch cards cascade */
gsap.from(".arch-card", {
  y: 120,
  opacity: 0,
  rotation: 4,
  duration: prefersReduced ? 0.01 : 1,
  stagger: 0.12,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".arch-grid",
    start: "top 78%",
    once: true,
  },
});

/* Counters */
function animateCounter(el) {
  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix ?? "";
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: prefersReduced ? 0.01 : 1.6,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = `${Math.round(obj.v)}${suffix}`;
    },
  });
}

document.querySelectorAll("[data-count]").forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    once: true,
    onEnter: () => animateCounter(el),
  });
});

/* CTA pulse path draw + pin */
const pulsePath = document.getElementById("pulse-path");
const bubbles = document.querySelectorAll(".pulse-bubble");

if (pulsePath) {
  const length = pulsePath.getTotalLength();
  pulsePath.style.strokeDasharray = String(length);
  pulsePath.style.strokeDashoffset = String(length);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".cta-pin",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      pin: prefersReduced ? false : ".cta-pin-inner",
      pinSpacing: true,
    },
  });

  tl.to(pulsePath, { strokeDashoffset: 0, ease: "none" }, 0);

  bubbles.forEach((bubble, i) => {
    tl.to(
      bubble,
      { opacity: 1, duration: 0.15, ease: "none" },
      0.2 + i * 0.25
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Three.js (lazy-loaded)                                                     */
/* -------------------------------------------------------------------------- */
let sceneApi = {
  reduced: true,
  dispose() {},
  setScrollProgress() {},
  setPointer() {},
  resize() {},
};
let disposeMini = null;

async function initScene() {
  const canvas = document.getElementById("hero-canvas");
  const { createScene, createMiniBrickCanvas } = await import("./scene.js");
  sceneApi = createScene(canvas);
  disposeMini = createMiniBrickCanvas(document.getElementById("services-deco"));

  if (!sceneApi.reduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        sceneApi.setPointer(nx * 0.45, -ny * 0.35);
      },
      { passive: true }
    );

    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => sceneApi.setScrollProgress(self.progress),
    });

    window.addEventListener("resize", () => sceneApi.resize(), { passive: true });
  }
}

if ("requestIdleCallback" in window) {
  requestIdleCallback(() => initScene(), { timeout: 1200 });
} else {
  setTimeout(initScene, 200);
}

/* -------------------------------------------------------------------------- */
/* Reviews carousel                                                           */
/* -------------------------------------------------------------------------- */
const reviews = [
  {
    text: "Un travail soigné, des délais tenus et une équipe à l'écoute. Notre extension a été livrée dans les règles de l'art.",
    name: "Marie L.",
    photo: "/assets/client-1.svg",
  },
  {
    text: "Devis clair, chantier propre, finitions impeccables. Bâtikub a rénové notre façade avec un vrai sens du détail.",
    name: "Jean-Pierre D.",
    photo: "/assets/placeholder.svg",
  },
  {
    text: "Accompagnement du premier rendez-vous jusqu'à la réception. On recommande sans hésiter pour le gros œuvre.",
    name: "Sophie M.",
    photo: "/assets/artisan.svg",
  },
];

let reviewIndex = 0;
const reviewText = document.getElementById("review-text");
const reviewName = document.getElementById("review-name");
const reviewCounter = document.getElementById("review-counter");
const reviewPhoto = document.getElementById("review-photo");

function renderReview(i) {
  const r = reviews[i];
  if (!r) return;

  const update = () => {
    if (reviewText) reviewText.textContent = r.text;
    if (reviewName) reviewName.textContent = r.name;
    if (reviewCounter) {
      reviewCounter.textContent = `${String(i + 1).padStart(2, "0")}/${String(reviews.length).padStart(2, "0")}`;
    }
    if (reviewPhoto) {
      reviewPhoto.src = r.photo;
      reviewPhoto.alt = `Portrait de ${r.name} — emplacement photo détourée`;
    }
  };

  if (prefersReduced) {
    update();
    return;
  }

  gsap.to([reviewText, reviewName], {
    opacity: 0,
    y: 12,
    duration: 0.25,
    onComplete: () => {
      update();
      gsap.fromTo(
        [reviewText, reviewName],
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    },
  });
}

document.querySelector("[data-next]")?.addEventListener("click", () => {
  reviewIndex = (reviewIndex + 1) % reviews.length;
  renderReview(reviewIndex);
});

document.querySelector("[data-prev]")?.addEventListener("click", () => {
  reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
  renderReview(reviewIndex);
});

renderReview(0);

/* -------------------------------------------------------------------------- */
/* Contact form (mailto)                                                      */
/* -------------------------------------------------------------------------- */
const form = document.getElementById("devis-form");
const status = document.getElementById("form-status");

const fields = {
  nom: {
    el: document.getElementById("nom"),
    error: document.getElementById("nom-error"),
    validate(value) {
      if (!value.trim()) return "Indiquez votre nom.";
      return "";
    },
  },
  telephone: {
    el: document.getElementById("telephone"),
    error: document.getElementById("telephone-error"),
    validate(value) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) return "Indiquez un numéro à 10 chiffres au moins.";
      return "";
    },
  },
  email: {
    el: document.getElementById("email"),
    error: document.getElementById("email-error"),
    validate(value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return "Indiquez une adresse e-mail valide.";
      }
      return "";
    },
  },
  message: {
    el: document.getElementById("message"),
    error: document.getElementById("message-error"),
    validate(value) {
      if (value.trim().length < 8) return "Précisez votre projet en quelques mots.";
      return "";
    },
  },
};

const showError = (field, message) => {
  const invalid = Boolean(message);
  field.el?.closest(".field-line")?.classList.toggle("is-invalid", invalid);
  field.el?.setAttribute("aria-invalid", invalid ? "true" : "false");
  if (field.error) {
    field.error.hidden = !invalid;
    field.error.textContent = message;
  }
};

const validateField = (field) => {
  if (!field.el) return true;
  const message = field.validate(field.el.value);
  showError(field, message);
  return !message;
};

Object.values(fields).forEach((field) => {
  field.el?.addEventListener("blur", () => validateField(field));
  field.el?.addEventListener("input", () => {
    if (field.el.closest(".field-line")?.classList.contains("is-invalid")) {
      validateField(field);
    }
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const ok = Object.values(fields).every(validateField);
  const rgpd = document.getElementById("rgpd");
  if (rgpd && !rgpd.checked) {
    if (status) status.textContent = "Merci de cocher la case de consentement RGPD.";
    return;
  }
  if (!ok) {
    if (status) status.textContent = "Vérifiez les champs du formulaire.";
    return;
  }

  const body = [
    `Nom : ${fields.nom.el.value.trim()}`,
    `Téléphone : ${fields.telephone.el.value.trim()}`,
    `E-mail : ${fields.email.el.value.trim()}`,
    "",
    fields.message.el.value.trim(),
  ].join("\n");

  const href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
    "Demande de devis — Bâtikub"
  )}&body=${encodeURIComponent(body)}`;

  window.location.href = href;
  if (status) {
    status.textContent = "Ouverture de votre messagerie…";
  }
});

document.querySelector(".newsletter")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("newsletter-email");
  if (!input?.value.trim()) return;
  window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
    "Inscription newsletter Bâtikub"
  )}&body=${encodeURIComponent(`E-mail : ${input.value.trim()}`)}`;
});

/* Cleanup on page hide */
window.addEventListener("pagehide", () => {
  sceneApi.dispose?.();
  disposeMini?.();
  lenis?.destroy();
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
