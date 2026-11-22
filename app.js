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
})();
