import { animate, scroll, stagger } from "motion";

(() => {
  const BUSINESS_EMAIL = "fakhreddinemarmouri@yahoo.fr";
  const nav = document.getElementById("navigation");
  const toggle = document.querySelector(".nav-toggle");
  const form = document.getElementById("devis-form");
  const status = document.getElementById("form-status");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const setMenu = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };

  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setMenu(open);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

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
    field.el.parentElement.classList.toggle("is-invalid", invalid);
    field.el.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (field.error) {
      field.error.hidden = !invalid;
      field.error.textContent = message;
    }
  };

  const validateField = (field) => {
    const message = field.validate(field.el.value);
    showError(field, message);
    return !message;
  };

  Object.values(fields).forEach((field) => {
    field.el?.addEventListener("blur", () => validateField(field));
    field.el?.addEventListener("input", () => {
      if (field.el.parentElement.classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const ok = Object.values(fields).every(validateField);
    if (!ok) {
      const first = Object.values(fields).find((field) =>
        field.el.parentElement.classList.contains("is-invalid")
      );
      first?.el.focus();
      if (status) {
        status.textContent = "Vérifiez les champs indiqués, puis renvoyez.";
        status.classList.remove("is-ok");
      }
      return;
    }

    const nom = fields.nom.el.value.trim();
    const telephone = fields.telephone.el.value.trim();
    const email = fields.email.el.value.trim();
    const message = fields.message.el.value.trim();
    const subject = `Demande de devis — ${nom}`;
    const body = [
      `Nom : ${nom}`,
      `Téléphone : ${telephone}`,
      `E-mail : ${email}`,
      "",
      message,
    ].join("\n");

    const mailto = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    if (status) {
      status.textContent =
        "Ouverture de votre messagerie. Si rien ne s'affiche, écrivez à fakhreddinemarmouri@yahoo.fr.";
      status.classList.add("is-ok");
    }
  });

  const NS = "http://www.w3.org/2000/svg";
  const BRICK_FILLS = ["#2a2a2a", "#323232", "#242424", "#2e2a26"];
  const TROWEL_ORIGIN = { x: 334, y: 416 };

  const openings = [
    { x: 148, y: 268, w: 54, h: 46 },
    { x: 278, y: 268, w: 54, h: 46 },
    { x: 210, y: 358, w: 60, h: 80 },
  ];

  const overlaps = (x, y, w, h, hole) =>
    x < hole.x + hole.w && x + w > hole.x && y < hole.y + hole.h && y + h > hole.y;

  const layBricks = (group) => {
    const x0 = 128;
    const x1 = 352;
    const yTop = 236;
    const yBottom = 438;
    const bw = 30;
    const bh = 13;
    const gap = 2;
    let row = 0;

    for (let y = yBottom - bh; y >= yTop; y -= bh + gap) {
      const offset = (row % 2) * ((bw + gap) / 2);
      for (let x = x0 + offset; x + bw <= x1; x += bw + gap) {
        if (openings.some((hole) => overlaps(x, y, bw, bh, hole))) continue;
        const brick = document.createElementNS(NS, "rect");
        brick.setAttribute("x", String(x));
        brick.setAttribute("y", String(y));
        brick.setAttribute("width", String(bw));
        brick.setAttribute("height", String(bh));
        brick.setAttribute("rx", "0.7");
        brick.setAttribute("fill", BRICK_FILLS[(row + Math.round(x)) % BRICK_FILLS.length]);
        brick.classList.add("brick");
        group.appendChild(brick);
      }
      row += 1;
    }
  };

  const initHouseBuild = () => {
    const section = document.querySelector(".build");
    const label = document.getElementById("build-stage-label");
    const bar = document.querySelector(".build-progress-bar");
    const brickGroup = document.querySelector(".build-bricks");
    const scene = document.querySelector(".build-scene");
    const trowel = document.querySelector(".build-trowel");
    if (!section || !brickGroup || !scene) return;

    layBricks(brickGroup);

    const bricks = [...brickGroup.querySelectorAll(".brick")];
    const dust = [...section.querySelectorAll(".dust")];
    const soilPaths = [...section.querySelectorAll(".build-soil path")];
    const rafters = [...section.querySelectorAll(".build-rafter")];
    const ridge = [...section.querySelectorAll(".build-ridge")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stages = [
      { at: 0, text: "Préparation du terrain" },
      { at: 0.08, text: "Fondations" },
      { at: 0.18, text: "Pose des briques" },
      { at: 0.68, text: "Ouvertures" },
      { at: 0.8, text: "Charpente et toiture" },
      { at: 0.92, text: "Livraison" },
    ];

    const setStage = (progress) => {
      if (!label) return;
      let text = stages[0].text;
      stages.forEach((stage) => {
        if (progress >= stage.at) text = stage.text;
      });
      if (label.textContent !== text) label.textContent = text;
    };

    if (reduceMotion) {
      setStage(1);
      if (bar) bar.style.transform = "scaleX(1)";
      return;
    }

    const brickStart = 1.7;
    const brickSpan = 7.2;
    const lastBrick = Math.max(bricks.length - 1, 1);
    const openingsAt = brickStart + brickSpan + 0.25;
    const roofAt = openingsAt + 1.05;
    const finishAt = roofAt + 1.35;

    const sequence = [
      [scene, { y: [22, 0], scale: [0.96, 1] }, { duration: finishAt + 0.8, ease: "linear" }],
      [".build-soil", { opacity: [0, 1], y: [14, 0] }, { duration: 0.7, at: 0, ease: [0.22, 1, 0.36, 1] }],
      [
        soilPaths,
        { pathLength: [0, 1] },
        { duration: 0.85, at: 0, ease: "easeOut", delay: stagger(0.12) },
      ],
      [
        ".build-foundation",
        { opacity: [0, 1], y: [18, 0], scaleY: [0.28, 1] },
        { duration: 0.85, at: 0.7, ease: [0.16, 1, 0.3, 1] },
      ],
      [".build-scaffold", { opacity: [0, 1] }, { duration: 0.55, at: 1.2, ease: "easeOut" }],
    ];

    bricks.forEach((brick, index) => {
      const at = brickStart + (index / lastBrick) * brickSpan;
      sequence.push([
        brick,
        {
          opacity: [0, 1, 1],
          y: [-28, 3, 0],
          rotate: [-5, 1.2, 0],
        },
        {
          duration: 0.22,
          at,
          times: [0, 0.72, 1],
          ease: ["easeIn", "easeOut"],
        },
      ]);
    });

    sequence.push(
      [
        ".build-window",
        { opacity: [0, 1], scaleY: [0.12, 1] },
        { duration: 0.55, at: openingsAt, ease: [0.22, 1, 0.36, 1], delay: stagger(0.1) },
      ],
      [
        ".build-door",
        { opacity: [0, 1], y: [22, 0] },
        { duration: 0.55, at: openingsAt + 0.35, ease: [0.22, 1, 0.36, 1], delay: stagger(0.08) },
      ],
      [
        rafters,
        { opacity: [0, 0.55], pathLength: [0, 1], y: [-16, 0] },
        { duration: 0.9, at: roofAt, ease: [0.16, 1, 0.3, 1], delay: stagger(0.1) },
      ],
      [
        ridge,
        { opacity: [0, 1], pathLength: [0, 1], y: [-22, 0] },
        { duration: 1.05, at: roofAt + 0.25, ease: [0.16, 1, 0.3, 1], delay: stagger(0.12) },
      ],
      [".build-scaffold", { opacity: [1, 0.14] }, { duration: 0.7, at: finishAt, ease: "easeInOut" }],
      [".build-trowel", { opacity: [0, 1] }, { duration: 0.35, at: brickStart, ease: "easeOut" }]
    );

    if (bar) {
      sequence.push([bar, { scaleX: [0, 1] }, { duration: finishAt + 0.8, at: 0, ease: "linear" }]);
    }

    const timeline = animate(sequence);
    timeline.pause();
    const duration = timeline.duration || finishAt + 0.8;

    const moveTrowel = (progress) => {
      if (!trowel) return;
      const time = progress * duration;
      if (time < brickStart) {
        trowel.style.transform = "translate(0px, 12px)";
        return;
      }

      if (time > openingsAt) {
        const rest = Math.min(1, (time - openingsAt) / 1.2);
        trowel.style.transform = `translate(${(1 - rest) * -12}px, ${(1 - rest) * -8}px) rotate(${(1 - rest) * 8}deg)`;
        return;
      }

      const local = (time - brickStart) / brickSpan;
      const index = Math.min(bricks.length - 1, Math.floor(local * bricks.length));
      const brick = bricks[index];
      if (!brick) return;
      const x = Number(brick.getAttribute("x")) + Number(brick.getAttribute("width")) / 2;
      const y = Number(brick.getAttribute("y"));
      trowel.style.transform = `translate(${x - TROWEL_ORIGIN.x}px, ${y - TROWEL_ORIGIN.y - 6}px) rotate(-18deg)`;
    };

    const stopBuild = scroll(timeline, {
      target: section,
      offset: ["start start", "end end"],
    });

    const stopInfo = scroll(
      (progress) => {
        setStage(progress);
        moveTrowel(progress);
        dust.forEach((dot, i) => {
          const drift = (1 - progress) * (12 + i * 5);
          const sway = Math.sin((progress + i * 0.35) * 7) * 4;
          dot.style.transform = `translate(${sway}px, ${drift}px)`;
        });
      },
      { target: section, offset: ["start start", "end end"] }
    );

    window.addEventListener("pagehide", () => {
      stopBuild();
      stopInfo();
      timeline.stop();
    });
  };

  initHouseBuild();
})();
