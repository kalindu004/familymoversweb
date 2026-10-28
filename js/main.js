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

  const quoteForm = document.querySelector("#quote-request");
  if (quoteForm) {
    const status = quoteForm.querySelector("#quote-status");
    const whatsappNumber = "94772503040";
    const requiredNames = ["name", "phone", "email", "move_date", "loading_address", "unloading_address", "goods"];

    const showStatus = (state, fill) => {
      status.replaceChildren();
      status.dataset.state = state;
      fill(status);
      status.focus({ preventScroll: true });
    };

    quoteForm.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("input", () => input.setCustomValidity(""));
    });

    const fieldValue = (name) => String(quoteForm.elements[name].value || "").trim();

    // Same shape as StoreIt's whatsappURL: greeting, one line per short field,
    // longer answers on the following line, optional fields only when filled.
    const enquiryLines = () => {
      const lines = [
        "Hello Family Movers, I would like to enquire about a move.",
        "",
        "Name: " + fieldValue("name"),
        "Contact Number: " + fieldValue("phone"),
        "Email: " + fieldValue("email"),
        "Date of Moving: " + fieldValue("move_date"),
        "",
        "Loading Address & Floor(s):",
        fieldValue("loading_address"),
        "",
        "Unloading Address & Floor(s):",
        fieldValue("unloading_address"),
        "",
        "Description of Goods:",
        fieldValue("goods")
      ];
      const remarks = fieldValue("remarks");
      if (remarks) lines.push("", "Special Remarks:", remarks);
      return lines;
    };
    const whatsappURL = () =>
      "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(enquiryLines().join("\n"));

    const addWhatsAppLink = (el, text) => {
      const link = document.createElement("a");
      link.href = whatsappURL();
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = text;
      el.append(document.createTextNode(" "), link);
    };

    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();

      requiredNames.forEach((name) => {
        const input = quoteForm.elements[name];
        input.setCustomValidity(String(input.value || "").trim() ? "" : "Please complete this field.");
      });
      const phone = quoteForm.elements.phone;
      if (!phone.validationMessage) {
        const digits = phone.value.replace(/\D/g, "");
        phone.setCustomValidity(
          digits.length >= 7 && digits.length <= 15
            ? ""
            : "Please enter a valid contact number."
        );
      }
      if (!quoteForm.reportValidity()) {
        showStatus("error", (el) => {
          el.textContent = "Please complete the required fields before sending.";
        });
        return;
      }

      // Opens a draft only. The visitor still chooses whether to send it.
      // Email sending through send-quote.php is switched off; see index.html.
      window.open(whatsappURL(), "_blank", "noopener,noreferrer");
      showStatus("", (el) => {
        el.append(document.createTextNode("Your WhatsApp draft is ready. Review it and tap Send in WhatsApp."));
        addWhatsAppLink(el, "Open WhatsApp if it did not open.");
      });
    });
  }
})();
