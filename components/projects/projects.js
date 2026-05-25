(function(){
/* ================================================= */
/* PROJECT SLIDER */
/* ================================================= */

const sliderTrack = document.querySelector(".slider-track");

const slides = document.querySelectorAll(".slide");

const nextBtn = document.querySelector(".next");

const prevBtn = document.querySelector(".prev");

/* ================================================= */
/* AUTO SLIDE */
/* ================================================= */

let autoSlideInterval;

/* ================================================= */
/* SLIDER */
/* ================================================= */

if (sliderTrack && slides.length) {
  let currentSlide = 0;

  /* ============================================= */
  /* UPDATE */
  /* ============================================= */

  function updateSlider() {
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  /* ============================================= */
  /* NEXT */
  /* ============================================= */

  function nextSlide() {
    currentSlide++;

    if (currentSlide >= slides.length) {
      currentSlide = 0;
    }

    updateSlider();
  }

  /* ============================================= */
  /* PREVIOUS */
  /* ============================================= */

  function prevSlide() {
    currentSlide--;

    if (currentSlide < 0) {
      currentSlide = slides.length - 1;
    }

    updateSlider();
  }

  /* ============================================= */
  /* START AUTO SLIDE */
  /* ============================================= */

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  /* ============================================= */
  /* STOP AUTO SLIDE */
  /* ============================================= */

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  /* ============================================= */
  /* RESTART */
  /* ============================================= */

  function restartAutoSlide() {
    stopAutoSlide();

    startAutoSlide();
  }

  /* ============================================= */
  /* START */
  /* ============================================= */

  startAutoSlide();

  /* ============================================= */
  /* BUTTONS */
  /* ============================================= */

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();

      restartAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();

      restartAutoSlide();
    });
  }

  /* ============================================= */
  /* PAUSE ON HOVER */
  /* ============================================= */

  const projectSlider = document.querySelector(".project-slider");

  if (projectSlider) {
    projectSlider.addEventListener("mouseenter", () => {
      stopAutoSlide();
    });

    projectSlider.addEventListener("mouseleave", () => {
      /* ========================= */
      /* CHECK FLIPPED */
      /* ========================= */

      const flippedCard = document.querySelector(".flip-card.flipped");

      if (!flippedCard) {
        startAutoSlide();
      }
    });
  }

  /* ================================================= */
  /* FLIP CARDS */
  /* ================================================= */

  const flipButtons = document.querySelectorAll(".flip-btn");

  flipButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const flipCard = button.closest(".flip-card");

      if (!flipCard) {
        return;
      }

      /* ===================================== */
      /* TOGGLE */
      /* ===================================== */

      flipCard.classList.toggle("flipped");

      /* ===================================== */
      /* STATE */
      /* ===================================== */

      const isFlipped = flipCard.classList.contains("flipped");

      /* ===================================== */
      /* STOP */
      /* ===================================== */

      if (isFlipped) {
        stopAutoSlide();
      } else {

      /* ===================================== */
      /* RESUME */
      /* ===================================== */
        startAutoSlide();
      }
    });
  });
}

/* ================================================= */
/* LIGHTBOX */
/* ================================================= */

const previewImages = document.querySelectorAll(".preview-image");

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightboxImage");

const closeLightbox = document.querySelector(".close-lightbox");

const lightboxPdf = document.getElementById("lightboxPdf");

const lightboxDocx = document.getElementById("lightboxDocx");

/* ================================================= */
/* OPEN LIGHTBOX */
/* ================================================= */

previewImages.forEach((image) => {
  image.addEventListener("click", () => {
    if (!lightbox) {
      return;
    }

    /* ===================================== */
    /* OPEN */
    /* ===================================== */

    lightbox.style.display = "flex";
    requestAnimationFrame(() => {
      lightbox.classList.add("active");
    });

    /* ===================================== */
    /* IMAGE */
    /* ===================================== */

    if (lightboxImage) {
      lightboxImage.src = image.src;
    }

    /* ===================================== */
    /* PDF */
    /* ===================================== */

    const pdf = image.dataset.pdf;

    if (lightboxPdf && pdf) {
      lightboxPdf.href = pdf;

      lightboxPdf.style.display = "inline-flex";
    } else if (lightboxPdf) {
      lightboxPdf.style.display = "none";
    }

    /* ===================================== */
    /* DOCX */
    /* ===================================== */

    const docx = image.dataset.docx;

    if (lightboxDocx && docx) {
      lightboxDocx.href = docx;

      lightboxDocx.style.display = "inline-flex";
    } else if (lightboxDocx) {
      lightboxDocx.style.display = "none";
    }
  });
});

/* ================================================= */
/* CLOSE BUTTON */
/* ================================================= */

function closeLightboxFn() {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  lightbox.addEventListener("transitionend", () => {
    if (!lightbox.classList.contains("active")) {
      lightbox.style.display = "none";
    }
  }, { once: true });
}

if (closeLightbox) {
  closeLightbox.addEventListener("click", closeLightboxFn);
}

/* ================================================= */
/* CLOSE OUTSIDE */
/* ================================================= */

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightboxFn();
    }
  });
}

/* ================================================= */
/* ESC KEY */
/* ================================================= */

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    lightbox &&
    lightbox.classList.contains("active")
  ) {
    closeLightboxFn();
  }
});

/* ================================================= */
/* READY */
/* ================================================= */

// console.log(
//     "Projects Loaded"
// );
})();
