document.documentElement.classList.add("js");

const menuButton = document.querySelector(".mobile-menu-mark");
const siteNav = document.querySelector("#site-nav");

const closeMenu = () => {
  document.body.classList.remove("is-menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
};

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("is-menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  const parallaxTargets = Array.from(document.querySelectorAll("[data-parallax]"));
  let ticking = false;

  const setParallax = () => {
    const viewportCenter = window.innerHeight / 2;

    parallaxTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const speed = Number.parseFloat(target.getAttribute("data-parallax-speed") || "0");
      const axis = target.getAttribute("data-parallax-axis") || "y";
      const distance = (rect.top + rect.height / 2 - viewportCenter) * speed;

      if (axis === "x") {
        target.style.setProperty("--parallax-x", `${distance.toFixed(2)}px`);
      } else {
        target.style.setProperty("--parallax-y", `${distance.toFixed(2)}px`);
      }
    });

    ticking = false;
  };

  const requestParallax = () => {
    if (!ticking) {
      window.requestAnimationFrame(setParallax);
      ticking = true;
    }
  };

  if (parallaxTargets.length) {
    setParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
  }
}

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
