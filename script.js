/* ==========================================================
   KLINK TECH LTD — SCRIPT
   Handles: theme toggle, language toggle, mobile menu,
   stat counters, automatic years in field, local testimonials,
   and EmailJS contact form submission.
   ========================================================== */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------------------------------------------------
     THEME TOGGLE (dark default, persisted in localStorage)
     --------------------------------------------------------- */
  var themeToggle = document.getElementById("themeToggle");
  var savedTheme = localStorage.getItem("klinktech-theme");
  var initialTheme = savedTheme === "light" ? "light" : "dark";
  root.setAttribute("data-theme", initialTheme);

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("klinktech-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------------------------------------------------------
     LANGUAGE TOGGLE (EN / FR, persisted in localStorage)
     --------------------------------------------------------- */
  var langToggle = document.getElementById("langToggle");
  var savedLang = localStorage.getItem("klinktech-lang");
  var initialLang = savedLang === "fr" ? "fr" : "en";

  function applyLanguage(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    localStorage.setItem("klinktech-lang", lang);

    var nodes = document.querySelectorAll("[data-en]");
    nodes.forEach(function (el) {
      var value = lang === "fr" ? el.getAttribute("data-fr") : el.getAttribute("data-en");
      if (value !== null) {
        el.innerHTML = value;
      }
    });

    if (langToggle) {
      var opts = langToggle.querySelectorAll(".lang-option");
      opts.forEach(function (opt) {
        opt.classList.toggle("is-active", opt.getAttribute("data-lang-opt") === lang);
      });
    }
  }
  applyLanguage(initialLang);

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-lang") || "en";
      applyLanguage(current === "en" ? "fr" : "en");
    });
  }

  /* ---------------------------------------------------------
     MOBILE MENU (hamburger toggle)
     --------------------------------------------------------- */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");

  function closeMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  /* ---------------------------------------------------------
     AUTOMATIC YEARS IN THE FIELD COUNTER (Starts May 2026)
     --------------------------------------------------------- */
  var yearsCounterEl = document.getElementById("yearsInFieldCount");
  if (yearsCounterEl) {
    var launchDate = new Date(2026, 4, 1); // May 2026 (Month 4 is May in JS)
    var today = new Date();
    
    var calculatedYears = today.getFullYear() - launchDate.getFullYear();
    var monthDifference = today.getMonth() - launchDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < launchDate.getDate())) {
      calculatedYears--;
    }
    
    var finalYears = Math.max(0, calculatedYears);
    yearsCounterEl.textContent = finalYears;
    yearsCounterEl.setAttribute("data-count", finalYears);
  }

  /* ---------------------------------------------------------
     STAT COUNTERS (animate once, when scrolled into view)
     --------------------------------------------------------- */
  var statNums = document.querySelectorAll(".stat-num");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && statNums.length) {
    var statObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(function (el) {
      statObserver.observe(el);
    });
  } else {
    statNums.forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ---------------------------------------------------------
     TESTIMONIALS LOCAL STORAGE SUBMISSION (Instant, No Database)
     --------------------------------------------------------- */
  var testimonialForm = document.getElementById("testimonialForm");
  var testimonialsGrid = document.getElementById("testimonialsGrid");

  if (testimonialForm && testimonialsGrid) {
    var userTestimonials = JSON.parse(localStorage.getItem("klink_custom_testimonials")) || [];

    // Render any previously saved local reviews on page load
    userTestimonials.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "testimonial-card";
      card.innerHTML = 
        '<p class="testimonial-quote">&ldquo;' + escapeHtml(item.text) + '&rdquo;</p>' +
        '<div class="testimonial-author">' +
          '<span class="author-name">' + escapeHtml(item.name) + '</span>' +
          '<span class="author-company">' + escapeHtml(item.company) + '</span>' +
        '</div>';
      testimonialsGrid.prepend(card);
    });

    testimonialForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("authorName").value.trim();
      var company = document.getElementById("authorCompany").value.trim();
      var text = document.getElementById("testimonialText").value.trim();

      if (!name || !company || !text) return;

      var newReview = { name: name, company: company, text: text };
      userTestimonials.unshift(newReview);
      localStorage.setItem("klink_custom_testimonials", JSON.stringify(userTestimonials));

      // Instantly inject card into grid
      var card = document.createElement("article");
      card.className = "testimonial-card";
      card.innerHTML = 
        '<p class="testimonial-quote">&ldquo;' + escapeHtml(text) + '&rdquo;</p>' +
        '<div class="testimonial-author">' +
          '<span class="author-name">' + escapeHtml(name) + '</span>' +
          '<span class="author-company">' + escapeHtml(company) + '</span>' +
        '</div>';
      testimonialsGrid.prepend(card);
      testimonialForm.reset();
    });

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  }

  /* ---------------------------------------------------------
     CONTACT FORM (EmailJS Integration)
     --------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  var EMAILJS_SERVICE_ID = "service_8naa22f";
  var EMAILJS_TEMPLATE_ID = "template_h3q0bjh";
  var EMAILJS_PUBLIC_KEY = "xRw3cmwvnWjjiWwEU";

  // Initialize EmailJS explicitly
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  function statusText(lang, key) {
    var strings = {
      sending: { en: "Sending…", fr: "Envoi en cours…" },
      success: {
        en: "Message sent — we'll get back to you shortly.",
        fr: "Message envoyé — nous vous répondrons rapidement."
      },
      error: {
        en: "Something went wrong. Please email us directly at klinktechltd@gmail.com.",
        fr: "Une erreur est survenue. Merci de nous écrire directement à klinktechltd@gmail.com."
      }
    };
    return strings[key][lang] || strings[key].en;
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var lang = root.getAttribute("data-lang") || "en";

      contactForm.classList.add("is-submitting");
      formStatus.className = "form-status";
      formStatus.textContent = statusText(lang, "sending");

      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
        .then(function () {
          formStatus.className = "form-status is-success";
          formStatus.textContent = statusText(lang, "success");
          contactForm.reset();
        })
        .catch(function (error) {
          console.error("EmailJS Error:", error);
          formStatus.className = "form-status is-error";
          formStatus.textContent = statusText(lang, "error");
        })
        .finally(function () {
          contactForm.classList.remove("is-submitting");
        });
    });
  }

  /* ---------------------------------------------------------
     NAVBAR — subtle background solidify on scroll
     --------------------------------------------------------- */
  var navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener(
      "scroll",
      function () {
        navbar.style.boxShadow =
          window.scrollY > 12 ? "0 8px 30px -20px rgba(0,0,0,.5)" : "none";
      },
      { passive: true }
    );
  }
})();