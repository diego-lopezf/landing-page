/* =================================================================
   SCRIPT PRINCIPAL — JavaScript vanilla
   Módulos:
   1. Datos y renderizado de proyectos
   2. Menú móvil
   3. Navbar: sombra al hacer scroll + enlace activo
   4. Animaciones de entrada (IntersectionObserver)
   5. Formulario de contacto: validación + envío (Web3Forms)
   6. Utilidades (año del footer)
   ================================================================= */

(() => {
  "use strict";

  /* ===============================================================
     1. PROYECTOS
     Fuente de datos única. Para añadir un proyecto basta con
     agregar un objeto a este array.
     =============================================================== */
  /*
   * status: "built"   → proyecto real, con código y/o demo. Muestra sus botones.
   * status: "concept" → idea de servicio aún NO implementada. Sin "Ver Código";
   *                     el botón de acción queda deshabilitado ("Disponible bajo pedido").
   * code:    URL del repo, o null si es privado / no existe.
   * demo:    URL de la demo (para "built" con enlace externo).
   * details: clave de PROJECT_DETAILS → abre el modal "Detalles" en vez de un enlace.
   */
  const PROJECTS = [
    {
      title: "Sincronizador Virtuagym ↔ Google Sheets",
      category: "API Integration",
      status: "built",
      description:
        "Sistema de automatización para un estudio de baile: sincroniza reservas de clases y pagos desde Virtuagym a Google Sheets cada 2 horas, sin intervención manual. Incluye deduplicación automática y scheduling en la nube.",
      tech: ["Python", "Virtuagym API", "Google Sheets API", "GitHub Actions"],
      icon: "clock",
      code: null, // repositorio privado
      details: "virtuagym",
    },
    {
      title: "Sincronizador CRM ↔ Hojas de cálculo",
      category: "API Integration",
      status: "built",
      description:
        "Mantiene sincronizados los contactos y estados de venta entre un CRM y Google Sheets en tiempo casi real, eliminando la copia manual de datos.",
      tech: ["Python", "REST API", "Google Sheets API", "OAuth2"],
      icon: "sync",
      code: "https://github.com/diego-lopezf/crm-sheets-sync",
      demo: "#",
    },
    {
      title: "Bot de reportes automáticos",
      category: "Bot",
      status: "concept",
      description:
        "Genera y envía informes diarios de métricas a un canal de equipo, con gráficos y alertas cuando un KPI sale de rango.",
      tech: ["Python", "Telegram API", "Pandas", "Matplotlib"],
      icon: "bot",
    },
    {
      title: "Extractor de precios de la competencia",
      category: "Web Scraping",
      status: "concept",
      description:
        "Rastrea catálogos de varias tiendas, normaliza los datos y detecta variaciones de precio para tomar decisiones comerciales.",
      tech: ["Python", "Playwright", "BeautifulSoup", "SQLite"],
      icon: "scrape",
    },
    {
      title: "Pipeline de gestión de facturas",
      category: "Python",
      status: "concept",
      description:
        "Lee facturas en PDF desde el correo, extrae los campos clave con OCR y los vuelca a un sistema contable de forma estructurada.",
      tech: ["Python", "IMAP", "Tesseract OCR", "Regex"],
      icon: "invoice",
    },
    {
      title: "Integrador de reservas multicanal",
      category: "API Integration",
      status: "concept",
      description:
        "Unifica reservas procedentes de distintas plataformas en un único calendario y evita solapamientos (overbooking).",
      tech: ["Python", "FastAPI", "Webhooks", "PostgreSQL"],
      icon: "calendar",
    },
    {
      title: "Vigilante de despliegues",
      category: "Bot",
      status: "concept",
      description:
        "Supervisa el estado de los servicios tras cada despliegue y realiza rollback automático si los health checks fallan.",
      tech: ["Python", "Docker SDK", "Slack API", "Cron"],
      icon: "shield",
    },
  ];

  /* Iconos SVG reutilizables para la zona de preview de cada tarjeta */
  const ICONS = {
    sync: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />',
    bot: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />',
    scrape: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />',
    invoice: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
    calendar: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />',
    shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />',
    clock: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />',
  };

  /* ===============================================================
     1b. DETALLES DE PROYECTO (modal)
     Contenido para proyectos reales sin repositorio público.
     Describe solo el flujo técnico — sin datos reales de clientes.
     =============================================================== */
  const PROJECT_DETAILS = {
    virtuagym: `
      <span class="badge badge--live mb-4 inline-flex">API Integration · En producción</span>
      <h3 class="text-xl font-bold text-white">Sincronizador Virtuagym ↔ Google Sheets</h3>
      <p class="mt-3 text-sm leading-relaxed text-slate-300">
        Automatización a medida para un estudio de baile que gestiona clases y pagos
        en Virtuagym. El personal volcaba esos datos a mano en una hoja de cálculo
        para control interno y contabilidad: tarea repetitiva y con errores frecuentes.
      </p>

      <h4 class="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">El flujo</h4>
      <ol class="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
        <li><strong class="text-white">1. Extracción.</strong> Cada 2 horas, un job programado en GitHub Actions consulta la API de Virtuagym y recupera las reservas de clases y los pagos registrados.</li>
        <li><strong class="text-white">2. Deduplicación.</strong> Cada registro se compara con lo ya sincronizado por su identificador único; lo que ya existe se descarta para no duplicar filas.</li>
        <li><strong class="text-white">3. Normalización.</strong> Se unifican formatos de fecha, importes y nombres de clase.</li>
        <li><strong class="text-white">4. Carga.</strong> Solo las filas nuevas se añaden a Google Sheets mediante su API oficial, en pestañas separadas para reservas y pagos.</li>
        <li><strong class="text-white">5. Registro.</strong> Cada ejecución deja traza (filas nuevas, incidencias) en el log de la Action.</li>
      </ol>

      <h4 class="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Stack</h4>
      <p class="mt-2 text-sm text-slate-300">Python · Virtuagym API · Google Sheets API · GitHub Actions (cron)</p>

      <h4 class="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</h4>
      <p class="mt-2 text-sm text-slate-300">En producción, funcionando de forma autónoma. El repositorio es privado.</p>

      <p class="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
        Este resumen describe únicamente el flujo técnico. No se muestran datos reales de clientes.
      </p>
    `,
  };

  /**
   * Crea el HTML de una tarjeta de proyecto.
   * @param {object} p - datos del proyecto
   * @returns {string} markup de la tarjeta
   */
  const GITHUB_ICON = `<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.2 11.16.6.11.82-.25.82-.56v-2c-3.34.71-4.04-1.58-4.04-1.58-.55-1.36-1.33-1.73-1.33-1.73-1.09-.73.08-.72.08-.72 1.2.08 1.83 1.21 1.83 1.21 1.07 1.8 2.8 1.28 3.49.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 016 0c2.29-1.53 3.3-1.21 3.3-1.21.65 1.66.24 2.88.12 3.18.77.83 1.23 1.88 1.23 3.17 0 4.53-2.8 5.53-5.48 5.82.43.36.81 1.09.81 2.2v3.26c0 .31.22.68.83.56A12.03 12.03 0 0024 12.29C24 5.78 18.63.5 12 .5z" />
              </svg>`;
  const ARROW_ICON = `<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>`;

  const BTN_SECONDARY =
    "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-white/25 hover:bg-white/10";
  const BTN_PRIMARY =
    "inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5";
  const BTN_DISABLED =
    "inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-500";

  /** Botones de una tarjeta según su estado. */
  function renderProjectActions(p) {
    // Concepto: sin código, acción deshabilitada.
    if (p.status === "concept") {
      return `<button type="button" disabled class="${BTN_DISABLED}">Disponible bajo pedido</button>`;
    }

    // "Ver Código" solo si hay repositorio público.
    const codeBtn = p.code
      ? `<a href="${p.code}" target="_blank" rel="noopener noreferrer" class="${BTN_SECONDARY}">${GITHUB_ICON}Ver Código</a>`
      : "";

    // Acción principal: modal "Detalles" o enlace externo "Demo / Detalles".
    const mainBtn = p.details
      ? `<button type="button" data-details="${p.details}" class="${BTN_PRIMARY}">Detalles ${ARROW_ICON}</button>`
      : `<a href="${p.demo}" class="${BTN_PRIMARY}">Demo / Detalles ${ARROW_ICON}</a>`;

    return codeBtn + mainBtn;
  }

  function renderProjectCard(p) {
    const chips = p.tech.map((t) => `<span class="tech-chip">${t}</span>`).join("");
    const iconPath = ICONS[p.icon] || ICONS.sync;
    const isConcept = p.status === "concept";
    const badgeClass = isConcept ? "badge badge--concept" : "badge";
    const badgeText = isConcept ? `${p.category} · Concepto` : p.category;

    return `
      <article class="project-card flex flex-col${isConcept ? " project-card--concept" : ""}" data-animate>
        <!-- Preview / captura visual -->
        <div class="project-preview flex h-40 items-center justify-center border-b border-white/5">
          <svg class="project-preview-icon h-14 w-14 text-white/80" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            ${iconPath}
          </svg>
        </div>

        <div class="flex flex-1 flex-col p-5">
          <span class="${badgeClass} mb-3 self-start">${badgeText}</span>

          <h3 class="text-base font-bold text-white">${p.title}</h3>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-400">${p.description}</p>

          <!-- Tecnologías -->
          <div class="mt-4 flex flex-wrap gap-1.5">${chips}</div>

          <!-- Acciones -->
          <div class="mt-5 flex flex-wrap gap-3">${renderProjectActions(p)}</div>
        </div>
      </article>`;
  }

  /** Inserta todas las tarjetas en la cuadrícula. */
  function mountProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;
    grid.innerHTML = PROJECTS.map(renderProjectCard).join("");
  }

  /** Modal "Detalles" para proyectos reales sin repositorio público. */
  function initProjectModal() {
    const modal = document.getElementById("project-modal");
    const grid = document.getElementById("projects-grid");
    if (!modal || !grid) return;

    const contentEl = modal.querySelector("#project-modal-content");
    const closeBtn = modal.querySelector("[data-modal-close]");

    const open = (key) => {
      const html = PROJECT_DETAILS[key];
      if (!html) return;
      contentEl.innerHTML = html;
      if (typeof modal.showModal === "function") modal.showModal();
      else modal.setAttribute("open", "");
    };
    const close = () => {
      if (typeof modal.close === "function") modal.close();
      else modal.removeAttribute("open");
    };

    grid.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-details]");
      if (!trigger) return;
      e.preventDefault();
      open(trigger.dataset.details);
    });

    closeBtn.addEventListener("click", close);
    // Clic en el fondo oscuro (fuera del contenido) cierra el modal.
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  /* ===============================================================
     1c. CARRUSEL DE TESTIMONIOS
     Navegación manual (flechas + puntos + teclado). Sin autoplay.
     El marcado es estático en index.html; aquí solo se cablea la
     navegación. Con menos de 2 testimonios no hay nada que rotar:
     se deja como cita destacada y los controles siguen ocultos.
     =============================================================== */
  function initTestimonialCarousel() {
    const root = document.querySelector("[data-testimonial-carousel]");
    if (!root) return;

    const track = root.querySelector(".testimonials__track");
    const slides = Array.from(root.querySelectorAll(".testimonial-slide"));
    const controls = root.querySelector("[data-carousel-controls]");
    const dotsWrap = root.querySelector("[data-carousel-dots]");
    const prevBtn = root.querySelector("[data-carousel-prev]");
    const nextBtn = root.querySelector("[data-carousel-next]");
    const statusEl = root.querySelector("[data-carousel-status]");
    if (!track || slides.length === 0) return;

    if (slides.length < 2) {
      slides[0].setAttribute("aria-label", "1 de 1");
      return;
    }

    let index = 0;

    // Un punto por testimonio
    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonials__dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Ir al testimonio ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;

      slides.forEach((slide, i) => {
        const current = i === index;
        slide.setAttribute("aria-hidden", String(!current));
        slide.setAttribute("aria-label", `${i + 1} de ${slides.length}`);
        // El contenido oculto no debe ser alcanzable con el tabulador
        slide.querySelectorAll("a, button").forEach((el) => {
          el.tabIndex = current ? 0 : -1;
        });
      });
      dots.forEach((dot, i) =>
        dot.setAttribute("aria-selected", String(i === index))
      );
      statusEl.textContent = `Testimonio ${index + 1} de ${slides.length}`;
    }

    prevBtn.addEventListener("click", () => goTo(index - 1));
    nextBtn.addEventListener("click", () => goTo(index + 1));

    // Flechas del teclado cuando el foco está dentro del carrusel
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      }
    });

    controls.hidden = false;
    goTo(0);
  }

  /* ===============================================================
     2. MENÚ MÓVIL
     =============================================================== */
  function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const iconOpen = document.getElementById("icon-open");
    const iconClose = document.getElementById("icon-close");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("hidden", !open);
      iconOpen.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    // Cierra el menú al pulsar cualquier enlace
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  /* ===============================================================
     3. NAVBAR — sombra al hacer scroll + enlace activo por sección
     =============================================================== */
  function initNavbarBehavior() {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      const onScroll = () => {
        navbar.classList.toggle("shadow-lg", window.scrollY > 8);
        navbar.classList.toggle("shadow-black/30", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Resaltado del enlace de la sección visible
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ===============================================================
     4. ANIMACIONES DE ENTRADA (fadeIn al hacer scroll)
     =============================================================== */
  function initScrollAnimations() {
    const items = document.querySelectorAll("[data-animate]");
    if (!items.length) return;

    // Sin soporte de IntersectionObserver: mostrar todo directamente
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // anima una sola vez
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ===============================================================
     5. FORMULARIO DE CONTACTO — validación + envío
     ===============================================================
     El sitio es estático (sin servidor propio): el envío se delega en
     Web3Forms (https://web3forms.com). La "access key" es pública por
     diseño (viaja en el cliente) y solo permite entregar en el correo
     dado de alta para ese formulario.

     Si WEB3FORMS_ACCESS_KEY queda vacía, el formulario cae de forma
     elegante a abrir el cliente de correo del visitante (mailto), para
     que ningún mensaje se pierda.
     =============================================================== */
  // Access key de Web3Forms (https://web3forms.com): esta línea es el único
  // sitio donde se configura. Vacía → se usa el fallback mailto.
  const WEB3FORMS_ACCESS_KEY = "b49b4b02-43b2-46bf-ab35-b13e420d4234";
  const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
  const CONTACT_EMAIL = "lopezfreirediego@icloud.com";
  const CONTACT_PHONE = "+34 698 947 408";

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const statusEl = document.getElementById("form-status");
    const submitBtn = document.getElementById("contact-submit");
    const fields = {
      name: form.querySelector("#name"),
      email: form.querySelector("#email"),
      message: form.querySelector("#message"),
    };

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /** Devuelve el mensaje de error de un campo, o "" si es válido. */
    const validateField = (key) => {
      const value = fields[key].value.trim();
      switch (key) {
        case "name":
          if (!value) return "Indica tu nombre.";
          if (value.length < 2) return "El nombre es demasiado corto.";
          return "";
        case "email":
          if (!value) return "Necesito un email para responderte.";
          if (!EMAIL_RE.test(value)) return "Ese email no parece válido.";
          return "";
        case "message":
          if (!value) return "Escribe un mensaje.";
          if (value.length < 10) return "Cuéntame un poco más (mín. 10 caracteres).";
          return "";
        default:
          return "";
      }
    };

    /** Pinta o limpia el estado de error de un campo. */
    const showError = (key, msg) => {
      const input = fields[key];
      const errorEl = form.querySelector(`[data-error-for="${key}"]`);
      input.classList.toggle("is-invalid", Boolean(msg));
      input.setAttribute("aria-invalid", String(Boolean(msg)));
      if (errorEl) errorEl.textContent = msg;
    };

    /** Muestra el aviso de resultado (ok = verde, error = rojo). */
    const setStatus = (msg, ok) => {
      statusEl.textContent = msg;
      statusEl.className =
        "rounded-lg border px-4 py-3 text-sm " +
        (ok
          ? "border-green-500/30 bg-green-500/10 text-green-300"
          : "border-red-500/30 bg-red-500/10 text-red-300");
      statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const clearStatus = () => {
      statusEl.textContent = "";
      statusEl.className = "hidden";
    };

    /** Alternativa sin backend: abre el cliente de correo con todo escrito. */
    const mailtoFallback = () => {
      const subject = encodeURIComponent("Nuevo mensaje desde la landing");
      const body = encodeURIComponent(
        `Nombre: ${fields.name.value.trim()}\n` +
          `Email: ${fields.email.value.trim()}\n\n` +
          `${fields.message.value.trim()}\n`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    // Validación en vivo una vez que el campo pierde el foco
    Object.keys(fields).forEach((key) => {
      fields[key].addEventListener("blur", () => showError(key, validateField(key)));
      fields[key].addEventListener("input", () => {
        if (fields[key].classList.contains("is-invalid")) {
          showError(key, validateField(key));
        }
      });
    });

    let sending = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;
      clearStatus();

      // Honeypot: si el campo trampa está marcado, es un bot. Fingimos éxito.
      const honeypot = form.elements.botcheck;
      if (honeypot && honeypot.checked) {
        setStatus("✓ Mensaje enviado. Te respondo lo antes posible.", true);
        form.reset();
        return;
      }

      // Validación de todos los campos
      let firstInvalid = null;
      Object.keys(fields).forEach((key) => {
        const msg = validateField(key);
        showError(key, msg);
        if (msg && !firstInvalid) firstInvalid = fields[key];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Sin clave configurada → alternativa por correo, para no perder el mensaje.
      if (!WEB3FORMS_ACCESS_KEY) {
        console.warn(
          "[contacto] WEB3FORMS_ACCESS_KEY sin configurar. Se abre el cliente de correo como alternativa."
        );
        setStatus(
          `Se abrirá tu cliente de correo para completar el envío. Si no ocurre nada, escríbeme a ${CONTACT_EMAIL} o al ${CONTACT_PHONE}.`,
          true
        );
        mailtoFallback();
        return;
      }

      // Envío real vía Web3Forms
      sending = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando…";

      try {
        const res = await fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: "Nuevo mensaje desde la landing",
            from_name: fields.name.value.trim(),
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            message: fields.message.value.trim(),
          }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          form.reset();
          Object.keys(fields).forEach((key) => showError(key, ""));
          setStatus("✓ Mensaje enviado. Te respondo lo antes posible.", true);
        } else {
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } catch (err) {
        console.error("[contacto] Error al enviar el formulario:", err);
        setStatus(
          `No se pudo enviar el mensaje. Escríbeme directamente a ${CONTACT_EMAIL} o llámame al ${CONTACT_PHONE}.`,
          false
        );
      } finally {
        sending = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar mensaje";
      }
    });
  }

  /* ===============================================================
     6. UTILIDADES
     =============================================================== */
  function initMisc() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  /* ===============================================================
     ARRANQUE
     =============================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    mountProjects();            // 1. pinta las tarjetas antes de observarlas
    initProjectModal();         // 1b. modal "Detalles"
    initTestimonialCarousel();  // 1c. carrusel de testimonios
    initMobileMenu();           // 2
    initNavbarBehavior();     // 3
    initScrollAnimations();   // 4 (después de mountProjects)
    initContactForm();        // 5
    initMisc();               // 6
  });
})();
