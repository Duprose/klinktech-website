/* ==========================================================
   KLINK TECH LTD — SCRIPT
   Type: Space Grotesk (display) / Inter (body) / JetBrains Mono (data)
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
    var launchDate = new Date(2026, 4, 1);
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
     TESTIMONIALS (Global Supabase Integration with Star Ratings)
     --------------------------------------------------------- */
  var SUPABASE_URL = 'https://njzimjmppzcowuafiysy.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_bd0wvz2bq-PEw_7ZUkWZ1A_bcFnGvlj';
  var _supabase = (typeof supabase !== "undefined") ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  var testimonialsGrid = document.getElementById("testimonialsGrid");
  var testimonialForm = document.getElementById("testimonialForm");

  async function loadGlobalTestimonials() {
    if (!testimonialsGrid || !_supabase) return;

    var { data: reviews, error } = await _supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading testimonials from Supabase:", error);
      return;
    }

    testimonialsGrid.innerHTML = "";

    if (!reviews || reviews.length === 0) {
      testimonialsGrid.innerHTML = '<p style="color:var(--text-muted);">No testimonials yet. Be the first to share your experience!</p>';
      return;
    }

    reviews.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "testimonial-card";
      
      var ratingVal = parseInt(item.rating, 10) || 5;
      var starsStr = "★★★★★".substring(0, ratingVal) + "☆☆☆☆☆".substring(0, 5 - ratingVal);

      card.innerHTML = 
        '<div class="testimonial-stars" style="color: #f59e0b; font-size: 0.9rem; margin-bottom: 0.5rem;" aria-label="' + ratingVal + ' out of 5 stars">' + starsStr + '</div>' +
        '<p class="testimonial-quote">&ldquo;' + escapeHtml(item.quote || item.text || '') + '&rdquo;</p>' +
        '<div class="testimonial-author">' +
          '<span class="author-name">' + escapeHtml(item.name || '') + '</span>' +
          '<span class="author-company">' + escapeHtml(item.company || 'Client') + '</span>' +
        '</div>';
      testimonialsGrid.appendChild(card);
    });
  }

  if (testimonialsGrid && _supabase) {
    loadGlobalTestimonials();
  }

  if (testimonialForm && _supabase) {
    testimonialForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var name = document.getElementById("authorName").value.trim();
      var company = document.getElementById("authorCompany").value.trim();
      var rating = document.getElementById("testimonialRating").value;
      var quote = document.getElementById("testimonialText").value.trim();

      if (!name || !company || !quote) return;

      var submitBtn = testimonialForm.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.textContent = "Publishing...";
        submitBtn.disabled = true;
      }

      var { error } = await _supabase
        .from('testimonials')
        .insert([{ 
          name: name, 
          company: company, 
          rating: parseInt(rating, 10), 
          quote: quote 
        }]);

      if (submitBtn) {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }

      if (error) {
        console.error("Supabase Insert Error:", error);
        alert("Failed to submit testimonial globally. Please try again.");
      } else {
        alert("Thank you! Your testimonial has been published globally.");
        testimonialForm.reset();
        loadGlobalTestimonials();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  /* ---------------------------------------------------------
     CONTACT FORM (EmailJS Integration via explicit emailjs.send)
     --------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  var EMAILJS_SERVICE_ID = "service_8naa22f";
  var EMAILJS_TEMPLATE_ID = "template_h3q0bjh";
  var EMAILJS_PUBLIC_KEY = "xRw3cmwvnWjjiWwEU";

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

      // Explicit parameter mapping for emailjs.send()
      var templateParams = {
        from_name: document.getElementById("name") ? document.getElementById("name").value : "",
        reply_to: document.getElementById("email") ? document.getElementById("email").value : "",
        phone: document.getElementById("phone") ? document.getElementById("phone").value : "",
        service: document.getElementById("service") ? document.getElementById("service").value : "",
        message: document.getElementById("message") ? document.getElementById("message").value : ""
      };

      // Crucial: emailjs.send() uses the custom payload object instead of sendForm()
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
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