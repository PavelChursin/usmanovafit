/* ============================================================
   Катя Усманова / GymTeam — vanilla JS
   ============================================================ */
(function () {
  "use strict";

  var BASE = "https://fs.getcourse.ru/fileservice/file/download/a/934144/";

  /* Фото-ленты оригинала.
     .heic/.heif в Chrome/Firefox не рендерятся — при ошибке загрузки
     img заменяется на градиентный плейсхолдер (см. onImgError). */
  var PHOTOS = {
    stats: [
      "sc/94/h/e343f4d439f4b13c84cb913077071cd3.heic",
      "sc/230/h/4cf84691bdd21dd0b41c2429d33ce41f.heic",
      "sc/255/h/72ba9dfec18d7aa5779fe30e50e96901.heic",
      "sc/85/h/690560420ca42fc7a6b317093fb821fb.jpg",
      "sc/139/h/5036c96213b02e41fb598f21fe15a8ae.heic",
      "sc/103/h/e6b1004aba9723d7297e885d7b7734c0.heic",
      "sc/252/h/d01b54d8feaf7279cbc7c4518c4e2847.heic",
      "sc/142/h/00a78a3ac2a08bb9d9f2908647e44d60.heic",
      "sc/301/h/02e95b9e4eb6e8e58efee5196132db0b.heic",
      "sc/374/h/1b12583b7b7cd12c7ab0b2bdee77c7ef.jpg",
      "sc/73/h/804bfecb9a8fcf5ec3f16ffaf93cda1e.jpg",
      "sc/250/h/7f0f4a2cf3c50d78a27e14245e4f8f7f.heic",
      "sc/180/h/50ca8ad355cd4719508bb540f710af3c.heic",
      "sc/327/h/c9bfc4705e9b3cbce6c13e9da01417c0.heic",
      "sc/216/h/2794e581ecdc6e9d862e8cb38e290f05.heic",
      "sc/431/h/f18aff64a8bbe076cb44b6771ae0eeea.heic"
    ],
    results: [
      "sc/237/h/2aa546db37de028e6ac3fb2786aa9452.jpg",
      "sc/38/h/015a42f6b21340f961a0e833b605ff95.jpg",
      "sc/495/h/b036e1e277a452313500ee564d32226e.jpg",
      "sc/249/h/dd8e197e7f36e1bee9bd7162290a108b.jpg",
      "sc/95/h/103262c11e49bf118407189cbc9f6fa7.jpg",
      "sc/391/h/c2e4edfc1f5e5b4954e6bc3615cf7d2d.jpg",
      "sc/117/h/17387c8056b84e63d149fbf2be7831f7.jpg",
      "sc/144/h/ee1a890d85ca6313ede946437c41b602.jpg",
      "sc/150/h/d5875e3b213d3591fd51ab2d1688f28c.jpg",
      "sc/55/h/559d6d0bef8e3d5970611b31f7125454.jpg",
      "sc/496/h/9da6fdbf3d6e9ecfe79438a24aef12be.jpg",
      "sc/103/h/119be526e615610de88bb989041dac57.jpg",
      "sc/328/h/924c8e30f9c3c1aafb26bdf08bec2182.jpg",
      "sc/361/h/2d2c02e946c10e6fb4d4e2d0ccc4da0d.jpg"
    ]
  };

  function onImgError(img) {
    /* при битой картинке (или .heic в неподдерживающем браузере) — плейсхолдер */
    if (img.dataset.failed) return;
    img.dataset.failed = "1";
    var ph = document.createElement("div");
    ph.className = "slider__photo slider__photo--ph";
    ph.textContent = "фото"; /* заменить на свой ассет */
    img.parentNode.replaceChild(ph, img);
  }

  function buildPhotos() {
    document.querySelectorAll("[data-photos]").forEach(function (track) {
      var list = PHOTOS[track.dataset.photos] || [];
      var frag = document.createDocumentFragment();
      list.forEach(function (path) {
        var img = document.createElement("img");
        img.className = "slider__photo";
        img.loading = "lazy";
        img.alt = "";
        img.src = BASE + path;
        img.addEventListener("error", function () { onImgError(img); });
        frag.appendChild(img);
      });
      track.appendChild(frag);
    });
  }

  /* ---------- Reveal при скролле ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Drag-to-scroll для слайдеров ---------- */
  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      var down = false, startX = 0, startScroll = 0, moved = false;

      slider.addEventListener("pointerdown", function (e) {
        down = true; moved = false;
        startX = e.clientX;
        startScroll = slider.scrollLeft;
        slider.classList.add("is-drag");
      });
      window.addEventListener("pointerup", function () {
        down = false;
        slider.classList.remove("is-drag");
      });
      slider.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        slider.scrollLeft = startScroll - dx;
      });
      /* не давать клику-перетаскиванию срабатывать как клик по ссылке */
      slider.addEventListener("click", function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    });
  }

  /* ---------- FAQ-аккордеон ---------- */
  function initAccordion() {
    document.querySelectorAll(".acc").forEach(function (acc) {
      var head = acc.querySelector(".acc__head");
      var body = acc.querySelector(".acc__body");
      head.addEventListener("click", function () {
        var open = acc.classList.toggle("is-open");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0";
      });
    });
  }

  /* ---------- Живой счётчик «тренируются сейчас» ---------- */
  function initCounter() {
    var el = document.querySelector("[data-counter]");
    if (!el) return;
    var n = 3696;
    function fmt(v) { return v.toLocaleString("ru-RU"); }
    el.textContent = fmt(n);
    setInterval(function () {
      n += Math.floor(Math.random() * 7) - 3; /* лёгкое колебание */
      if (n < 3650) n = 3650;
      if (n > 3760) n = 3760;
      el.textContent = fmt(n);
    }, 2500);
  }

  /* ---------- Cookie-баннер ---------- */
  function initCookie() {
    var bar = document.getElementById("cookie");
    var ok = document.getElementById("cookieOk");
    if (!bar || !ok) return;
    var KEY = "uf_cookie_ok";
    var stored;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = null; }
    if (!stored) {
      setTimeout(function () { bar.classList.add("is-show"); }, 700);
    }
    ok.addEventListener("click", function () {
      bar.classList.remove("is-show");
      try { window.localStorage.setItem(KEY, "1"); } catch (e) {}
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildPhotos();
    initReveal();
    initSliders();
    initAccordion();
    initCounter();
    initCookie();
  });
})();
