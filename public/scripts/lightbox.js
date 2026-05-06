document.addEventListener("astro:page-load", () => {
  /** @type {HTMLDialogElement | null} */
  const dialog = document.querySelector("[data-lightbox-dialog]");
  const image = document.querySelector("[data-lightbox-image]");
  const caption = document.querySelector("[data-lightbox-caption]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const triggers = document.querySelectorAll("[data-lightbox-trigger]");

  if (!dialog || !image || !caption || !closeButton || typeof dialog.showModal !== "function") {
    return;
  }

  if (dialog.dataset.lightboxReady === "true") {
    return;
  }

  dialog.dataset.lightboxReady = "true";

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      image.src = trigger.dataset.src || "";
      image.alt = trigger.dataset.alt || "";
      caption.textContent = trigger.dataset.caption || "";

      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    image.alt = "";
    caption.textContent = "";
  });
});
