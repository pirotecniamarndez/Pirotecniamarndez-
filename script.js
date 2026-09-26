/* =========================================================
   PIROTECNIA MARNDEZ — script.js
   Toda la configuración editable vive en el objeto CONFIG.
   ========================================================= */

const CONFIG = {
  // Números de WhatsApp SIN "+" ni espacios (formato: código de país + número)
  whatsappNumbers: [
    "523332211305", // Número 1 — +52 33 3221 1305
    "523319081478"  // Número 2 — +52 33 1908 1478
  ],

  // Mensaje predeterminado que se envía al abrir WhatsApp
  defaultMessage: "Hola, vi su página web y me gustaría recibir más información.",

  // Mensajes personalizados por sección (opcional). Si una clave no existe,
  // se usa defaultMessage.
  messagesByContext: {
    "header":        "Hola, vi su página web y me gustaría recibir más información.",
    "hero":          "Hola, vi su página web y quiero cotizar un paquete de pirotecnia.",
    "producto":      "Hola, quiero pedir un paquete de pirotecnia. ¿Me pasan precios?",
    "paquete-chico": "Hola, me interesa el paquete de reunión familiar. ¿Cuánto cuesta?",
    "paquete-fiesta":"Hola, me interesa el paquete de fiesta completa. ¿Qué incluye y cuánto cuesta?",
    "paquete-mayoreo":"Hola, quiero cotizar un pedido de mayoreo. ¿Me pasan información?",
    "faq":           "Hola, tengo una duda antes de hacer mi pedido.",
    "cta-final":     "Hola, quiero hacer mi pedido de pirotecnia.",
    "footer":        "Hola, vi su página web y me gustaría recibir más información.",
    "flotante":      "Hola, vi su página web y me gustaría recibir más información."
  }
};

/* ---------------------------------------------------------
   Reparto alternado entre los dos números de WhatsApp.
   Cada clic en un botón de WhatsApp se turna entre el número 1
   y el número 2, en orden, para repartir parejo los pedidos.
   El contador se guarda en localStorage para mantener el turno
   entre visitas del mismo visitante.
   --------------------------------------------------------- */
function getNextWhatsappNumber(){
  let turn = 0;
  try{
    turn = parseInt(localStorage.getItem("marndez_wa_turn") || "0", 10) || 0;
  }catch(e){ /* localStorage no disponible: se usa el número 1 por defecto */ }

  const number = CONFIG.whatsappNumbers[turn % CONFIG.whatsappNumbers.length];

  try{
    localStorage.setItem("marndez_wa_turn", String(turn + 1));
  }catch(e){ /* si falla, simplemente no se persiste el turno */ }

  return number;
}

function buildWhatsappUrl(context){
  const number = getNextWhatsappNumber();
  const message = CONFIG.messagesByContext[context] || CONFIG.defaultMessage;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------------------------------
   Analítica simple (opcional). Registra el evento en consola;
   sustituir por gtag/Meta Pixel si se integra analítica real.
   --------------------------------------------------------- */
function trackEvent(name, detail){
  try{
    console.log("[analytics]", name, detail || "");
    if (typeof window.gtag === "function"){
      window.gtag("event", name, detail || {});
    }
  }catch(e){ /* no bloquear la navegación por un error de analítica */ }
}

/* ---------------------------------------------------------
   Enlaza todos los botones de WhatsApp (.js-wa)
   --------------------------------------------------------- */
function initWhatsappButtons(){
  const buttons = document.querySelectorAll(".js-wa");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const context = btn.dataset.waContext || "general";
      const url = buildWhatsappUrl(context);
      trackEvent("click_whatsapp", { context });
      trackEvent(`click_whatsapp_${context}`);
      window.open(url, "_blank", "noopener");
    });
  });
}

/* ---------------------------------------------------------
   Menú móvil
   --------------------------------------------------------- */
function initMobileMenu(){
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

/* ---------------------------------------------------------
   Acordeón de preguntas frecuentes
   --------------------------------------------------------- */
function initFaq(){
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const question = item.querySelector(".faq-item__q");
    const answer = item.querySelector(".faq-item__a");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Cierra las demás para mantener la lista limpia (opcional).
      items.forEach((other) => {
        if (other !== item){
          other.classList.remove("is-open");
          other.querySelector(".faq-item__q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-item__a").style.maxHeight = null;
        }
      });

      if (isOpen){
        item.classList.remove("is-open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

/* ---------------------------------------------------------
   Galería con lightbox
   --------------------------------------------------------- */
function initGallery(){
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  if (!lightbox || !lightboxImg || !closeBtn) return;

  document.querySelectorAll(".js-gallery-open").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImg.src = item.dataset.full;
      lightboxImg.alt = item.querySelector("img")?.alt || "Imagen del producto";
      lightbox.classList.add("is-open");
    });
  });

  const close = () => lightbox.classList.remove("is-open");
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------------------------------------------------------
   Botón "volver arriba"
   --------------------------------------------------------- */
function initBackToTop(){
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 640);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------------------------------------
   Revelado suave al hacer scroll (una sola vez por bloque)
   --------------------------------------------------------- */
function initReveal(){
  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || targets.length === 0){
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((t) => observer.observe(t));
}

/* ---------------------------------------------------------
   Encabezado: leve cambio de fondo al hacer scroll
   --------------------------------------------------------- */
function initHeaderScroll(){
  const header = document.getElementById("header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.style.boxShadow = window.scrollY > 8 ? "0 1px 0 rgba(0,0,0,0.05)" : "none";
  }, { passive: true });
}

/* ---------------------------------------------------------
   Año dinámico en el footer
   --------------------------------------------------------- */
function initYear(){
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  initWhatsappButtons();
  initMobileMenu();
  initFaq();
  initGallery();
  initBackToTop();
  initReveal();
  initHeaderScroll();
  initYear();
});
