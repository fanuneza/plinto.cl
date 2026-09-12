document.addEventListener("astro:page-load", () => {
  /** @type {HTMLDialogElement | null} */
  const dialog = document.querySelector("[data-lightbox-dialog]");
  const image = document.querySelector("[data-lightbox-image]");
  const caption = document.querySelector("[data-lightbox-caption]");
  const counter = document.querySelector("[data-lightbox-counter]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const prevButton = document.querySelector("[data-lightbox-prev]");
  const nextButton = document.querySelector("[data-lightbox-next]");
  const triggers = Array.from(document.querySelectorAll("[data-lightbox-trigger]"));

  if (!dialog || !image || !caption || !closeButton || typeof dialog.showModal !== "function") {
    return;
  }

  if (dialog.dataset.lightboxReady === "true") {
    return;
  }

  dialog.dataset.lightboxReady = "true";

  let currentIndex = -1;
  /** @type {Element | null} */
  let lastTrigger = null;

  const render = (index) => {
    if (triggers.length === 0) return;
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    image.src = trigger.dataset.src || "";
    image.alt = trigger.dataset.alt || "";
    caption.textContent = trigger.dataset.caption || "";
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${triggers.length}`;
    }
  };

  const open = (trigger) => {
    lastTrigger = trigger;
    render(triggers.indexOf(trigger));
    dialog.showModal();
    closeButton.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => open(trigger));
  });

  prevButton?.addEventListener("click", () => render(currentIndex - 1));
  nextButton?.addEventListener("click", () => render(currentIndex + 1));

  closeButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      render(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      render(currentIndex + 1);
    }
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    image.alt = "";
    caption.textContent = "";
    if (counter) {
      counter.textContent = "";
    }
    if (lastTrigger && document.contains(lastTrigger)) {
      lastTrigger.focus();
    }
    lastTrigger = null;
  });
});
