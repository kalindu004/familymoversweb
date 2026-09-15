(function () {
  const FOUNDED = 1989;
  const years = Math.max(0, new Date().getFullYear() - FOUNDED);
  document.querySelectorAll("[data-years-since-1989]").forEach((el) => {
    el.textContent = String(years);
  });
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const slides = [...document.querySelectorAll(".slide")];
  const dots = [...document.querySelectorAll(".hero-dots button")];
  let i = 0;

  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  function show(n) {
    if (!slides.length) return;
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-on", idx === i));
    dots.forEach((d, idx) => {
      const on = idx === i;
      d.classList.toggle("is-on", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
  if (slides.length) setInterval(() => show(i + 1), 5500);

  const reviewRoot = document.querySelector("[data-review-carousel]");
  if (reviewRoot) {
    const cards = [...reviewRoot.querySelectorAll(".review-card")];
    const dotsR = [...reviewRoot.querySelectorAll("[data-review-dot]")];
    const prev = reviewRoot.querySelector(".review-prev");
    const next = reviewRoot.querySelector(".review-next");
    let r = 0;
    let timer;
    const showReview = (n) => {
      r = (n + cards.length) % cards.length;
      cards.forEach((c, idx) => {
        const on = idx === r;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-hidden", on ? "false" : "true");
      });
      dotsR.forEach((d, idx) => {
        const on = idx === r;
        d.classList.toggle("is-on", on);
        d.setAttribute("aria-selected", on ? "true" : "false");
      });
    };
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => showReview(r + 1), 6500);
    };
    if (prev) prev.addEventListener("click", () => { showReview(r - 1); restart(); });
    if (next) next.addEventListener("click", () => { showReview(r + 1); restart(); });
    dotsR.forEach((d) =>
      d.addEventListener("click", () => {
        showReview(Number(d.getAttribute("data-review-dot")));
        restart();
      })
    );
    restart();
  }
})();
