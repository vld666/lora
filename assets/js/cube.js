(function () {
  "use strict";

  var TOTAL = 10;
  var wrapper = document.getElementById("cube-wrapper");
  var currentNumEl = document.getElementById("current-num");
  var navList = document.getElementById("nav-list");
  var currentIndex = 0;
  var isTransitioning = false;

  function getFaces() {
    return wrapper ? wrapper.querySelectorAll(".cube-face") : [];
  }

  function applyActive() {
    var faces = getFaces();
    for (var i = 0; i < faces.length; i++) {
      var face = faces[i];
      face.classList.remove("cube-face--active", "cube-face--leaving", "cube-face--entering");
      if (i === currentIndex) {
        face.classList.add("cube-face--active");
      }
    }
    if (currentNumEl) currentNumEl.textContent = currentIndex + 1;
    if (navList) {
      var links = navList.querySelectorAll(".page-nav__link");
      for (var j = 0; j < links.length; j++) {
        links[j].classList.toggle("page-nav__link--active", j === currentIndex);
        links[j].setAttribute("aria-current", j === currentIndex ? "step" : null);
      }
    }
    window.location.hash = "#" + (currentIndex + 1);
  }

  function goTo(index) {
    index = Math.max(0, Math.min(TOTAL - 1, index));
    if (index === currentIndex) return;
    if (isTransitioning) return;
    isTransitioning = true;

    var faces = getFaces();
    var prevIndex = currentIndex;
    var nextIndex = index;

    faces[prevIndex].classList.remove("cube-face--active");
    faces[prevIndex].classList.add("cube-face--leaving");

    faces[nextIndex].classList.add("cube-face--entering");

    if (currentNumEl) currentNumEl.textContent = nextIndex + 1;
    var links = navList ? navList.querySelectorAll(".page-nav__link") : [];
    for (var k = 0; k < links.length; k++) {
      links[k].classList.toggle("page-nav__link--active", k === nextIndex);
      links[k].setAttribute("aria-current", k === nextIndex ? "step" : null);
    }
    window.location.hash = "#" + (nextIndex + 1);

    function onTransitionEnd() {
      faces[prevIndex].classList.remove("cube-face--leaving");
      faces[nextIndex].classList.remove("cube-face--entering");
      faces[nextIndex].classList.add("cube-face--active");
      currentIndex = nextIndex;
      isTransitioning = false;
      faces[prevIndex].removeEventListener("transitionend", onTransitionEnd);
    }

    faces[prevIndex].addEventListener("transitionend", onTransitionEnd);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function initFromHash() {
    var hash = window.location.hash;
    if (/^#\d+$/.test(hash)) {
      var n = parseInt(hash.slice(1), 10);
      if (n >= 1 && n <= TOTAL) currentIndex = n - 1;
    }
    applyActive();
  }

  var prevBtn = document.querySelector(".cube-nav-btn--prev");
  var nextBtn = document.querySelector(".cube-nav-btn--next");
  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  var nav = navList ? navList.closest(".page-nav") : null;
  var navBurger = document.getElementById("nav-burger");

  function closeNavMenu() {
    if (nav) nav.classList.remove("page-nav--open");
    document.body.classList.remove("page-nav--open");
    if (navBurger) navBurger.setAttribute("aria-expanded", "false");
  }

  function openNavMenu() {
    if (nav) nav.classList.add("page-nav--open");
    document.body.classList.add("page-nav--open");
    if (navBurger) navBurger.setAttribute("aria-expanded", "true");
  }

  function toggleNavMenu() {
    var isOpen = nav && nav.classList.contains("page-nav--open");
    if (isOpen) closeNavMenu();
    else openNavMenu();
  }

  if (navBurger) {
    navBurger.addEventListener("click", toggleNavMenu);
  }

  if (navList) {
    navList.addEventListener("click", function (e) {
      var link = e.target.closest(".page-nav__link[data-slide]");
      if (e.target === navList) {
        closeNavMenu();
        return;
      }
      if (!link) return;
      e.preventDefault();
      var slide = parseInt(link.getAttribute("data-slide"), 10);
      if (!isNaN(slide)) goTo(slide);
      closeNavMenu();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      prev();
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === " ") {
      next();
      e.preventDefault();
    }
  });

  /* Lightbox: click pe imagine = fullscreen */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox__img") : null;
  var lightboxBackdrop = lightbox ? lightbox.querySelector(".lightbox__backdrop") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox__close") : null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  if (lightbox) {
    document.querySelectorAll(".slide__figure img").forEach(function (img) {
      img.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(img.src, img.alt);
      });
    });
    if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox && !lightbox.hasAttribute("hidden")) {
        closeLightbox();
      }
    });
  }

  window.addEventListener("hashchange", initFromHash);
  initFromHash();

  var yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
