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
    const inbox = "info@familymovers.lk";
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
    const enquiryBody = () => [
      "Family Movers quote request",
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
      fieldValue("goods"),
      "",
      "Special Remarks:",
      fieldValue("remarks") || "(none)"
    ].join("\n");

    const addWhatsAppFallback = (el) => {
      el.append(document.createTextNode(" You can still send the same details on "));
      const link = document.createElement("a");
      link.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(enquiryBody());
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "WhatsApp";
      el.append(link, document.createTextNode(", or call 0772 503040."));
    };

    let sending = false;
    quoteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending) return;

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

      const button = quoteForm.querySelector('button[type="submit"]');
      const buttonLabel = button.textContent;
      sending = true;
      button.disabled = true;
      button.textContent = "Sending…";
      showStatus("", (el) => {
        el.textContent = "Sending your enquiry…";
      });

      const payload = {
        name: fieldValue("name"),
        phone: fieldValue("phone"),
        email: fieldValue("email"),
        move_date: fieldValue("move_date"),
        loading_address: fieldValue("loading_address"),
        unloading_address: fieldValue("unloading_address"),
        goods: fieldValue("goods"),
        remarks: fieldValue("remarks")
      };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch("send-quote.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
          credentials: "same-origin"
        });
        let result = null;
        try {
          result = await response.json();
        } catch (parseError) {
          result = null;
        }
        if (!response.ok || !result || result.ok !== true) {
          const message = result && typeof result.error === "string" && result.error
            ? result.error
            : "We could not send your enquiry.";
          throw new Error(message);
        }
        quoteForm.reset();
        showStatus("success", (el) => {
          el.textContent = "Thank you. Your quote request has been sent to " + inbox + ". We will get back to you.";
        });
      } catch (error) {
        const message = error && error.name === "AbortError"
          ? "Sending timed out."
          : (error && error.message) || "We could not send your enquiry.";
        showStatus("error", (el) => {
          el.append(document.createTextNode(message));
          addWhatsAppFallback(el);
        });
      } finally {
        clearTimeout(timeout);
        sending = false;
        button.disabled = false;
        button.textContent = buttonLabel;
      }
    });
  }
})();
