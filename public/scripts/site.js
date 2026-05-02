const menuButton = document.querySelector(".mobile-menu-mark");
const siteNav = document.querySelector("#site-nav");

const closeMenu = () => {
  document.body.classList.remove("is-menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.focus();
};

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("is-menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    const firstLink = siteNav?.querySelector("a");
    firstLink?.focus();
  }
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// Focus trap for mobile menu
document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || !document.body.classList.contains("is-menu-open")) {
    return;
  }

  const focusable = siteNav?.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
  if (!focusable || focusable.length === 0) return;

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

document.querySelectorAll("[data-work-view]").forEach((view) => {
  const buttons = view.querySelectorAll("[data-view-button]");

  const setViewMode = (activeButton) => {
    const mode = activeButton.getAttribute("data-view-button");
    view.classList.toggle("is-list", mode === "list");
    buttons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.addEventListener("click", () => setViewMode(button));
  });
});
