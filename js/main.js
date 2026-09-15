(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const slides = [...document.querySelectorAll(".slide")];
  const dots = [...document.querySelectorAll(".hero-dots button")];
  let i = 0;

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("is-open"))
  );

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-on", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("is-on", idx === i));
  }
  dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
  setInterval(() => show(i + 1), 5500);

  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tab");
      document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("is-on", b === btn));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("is-on", p.id === id));
    });
  });


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
      dotsR.forEach((d, idx) => d.classList.toggle("is-on", idx === r));
    };
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => showReview(r + 1), 6500);
    };
    prev.addEventListener("click", () => { showReview(r - 1); restart(); });
    next.addEventListener("click", () => { showReview(r + 1); restart(); });
    dotsR.forEach((d) =>
      d.addEventListener("click", () => {
        showReview(Number(d.getAttribute("data-review-dot")));
        restart();
      })
    );
    restart();
  }

})();
