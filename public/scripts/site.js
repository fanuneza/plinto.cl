let revealObserver;
let historyNavigation = false;

// Back/forward scroll restoration should jump, not glide: gate smooth
// scrolling off for history navigations only.
window.addEventListener("popstate", () => {
  historyNavigation = true;
  document.documentElement.style.scrollBehavior = "auto";
});

const menuButton = () => document.querySelector(".mobile-menu-mark");
const siteNav = () => document.querySelector("#site-nav");

const closeMenu = (reason) => {
  if (!document.body.classList.contains("is-menu-open")) return;
  document.body.classList.remove("is-menu-open");
  menuButton()?.setAttribute("aria-expanded", "false");
  menuButton()?.setAttribute("aria-label", "Abrir menú");
  if (reason !== "navigate") {
    menuButton()?.focus();
  }
};

// Registered once at module scope: these handlers only read DOM state at
// event time, so re-adding them on every astro:page-load would accumulate
// duplicate listeners across client-side navigations.
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("is-menu-open")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || !document.body.classList.contains("is-menu-open")) {
    return;
  }

  const nav = siteNav();
  const focusable = [
    ...(nav ? Array.from(nav.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')) : []),
    ...(menuButton() ? [menuButton()] : []),
  ];
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.matchMedia("(min-width: 810px)").addEventListener?.("change", (event) => {
  if (event.matches && document.body.classList.contains("is-menu-open")) {
    document.body.classList.remove("is-menu-open");
    menuButton()?.setAttribute("aria-expanded", "false");
    menuButton()?.setAttribute("aria-label", "Abrir menú");
  }
});

document.addEventListener("astro:page-load", () => {
  if (historyNavigation) {
    historyNavigation = false;
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = "";
    });
  }

  revealObserver?.disconnect();
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const button = menuButton();
  const nav = siteNav();

  button?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("is-menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    if (isOpen) {
      const firstLink = nav?.querySelector("a");
      firstLink?.focus();
    }
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu("navigate"));
  });

  document.querySelectorAll("[data-work-view]").forEach((view) => {
    const buttons = view.querySelectorAll("[data-view-button]");

    const setViewMode = (activeButton) => {
      const mode = activeButton.getAttribute("data-view-button");
      view.classList.toggle("work-page--list", mode === "list");
      buttons.forEach((btn) => {
        const isActive = btn === activeButton;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    };

    buttons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.classList.contains("is-active")));
      btn.addEventListener("click", () => setViewMode(btn));
    });
  });
});
