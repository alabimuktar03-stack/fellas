/**
 * fellaż – Improved script (works on all pages)
 */
document.addEventListener("DOMContentLoaded", () => {
  // Helper: safe element access
  const getEl = (id) => document.getElementById(id);
  const getSel = (sel) => document.querySelector(sel);

  // =============================================
  // 🔍 SEARCH OVERLAY
  // =============================================
  (function () {
    // Create overlay HTML
    const overlay = document.createElement("div");
    overlay.id = "searchOverlay";
    overlay.innerHTML = `
        <div class="search-overlay-content">
            <button id="searchClose" class="search-close">&times;</button>
            <form id="searchForm" class="search-form">
                <input type="text" id="searchInput" placeholder="Search for products..." autocomplete="off" />
                <button type="submit"><i class="fas fa-arrow-right"></i></button>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    // Add CSS for the overlay (inline or in styles.css)
    const style = document.createElement("style");
    style.textContent = `
        #searchOverlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(7, 5, 10, 0.95);
            backdrop-filter: blur(8px);
            z-index: 2000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        #searchOverlay.open { display: flex; }
        .search-overlay-content {
            width: 100%;
            max-width: 600px;
            position: relative;
        }
        .search-close {
            position: absolute;
            top: -60px;
            right: 0;
            background: none;
            border: none;
            color: #f4f1ea;
            font-size: 2.5rem;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .search-close:hover { transform: rotate(90deg); }
        .search-form {
            display: flex;
            gap: 10px;
            border-bottom: 2px solid #cba258;
        }
        .search-form input {
            flex: 1;
            background: transparent;
            border: none;
            padding: 16px 0;
            color: #f4f1ea;
            font-size: 1.4rem;
            font-family: 'Montserrat', sans-serif;
            outline: none;
        }
        .search-form input::placeholder {
            color: #b9b3c2;
            font-size: 1rem;
        }
        .search-form button {
            background: none;
            border: none;
            color: #cba258;
            font-size: 1.6rem;
            cursor: pointer;
            padding: 0 10px;
        }
        .search-form button:hover { color: #dbb768; }
        @media (max-width: 480px) {
            .search-form input { font-size: 1rem; }
            .search-close { top: -50px; font-size: 2rem; }
        }
    `;
    document.head.appendChild(style);

    // ---- Open/Close logic ----
    const searchToggle = document.querySelector(".search-toggle");
    const overlayEl = document.getElementById("searchOverlay");
    const closeBtn = document.getElementById("searchClose");
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.getElementById("searchForm");

    if (searchToggle) {
      searchToggle.addEventListener("click", function (e) {
        e.preventDefault();
        overlayEl.classList.add("open");
        setTimeout(() => searchInput.focus(), 100);
      });
    }

    closeBtn.addEventListener("click", function () {
      overlayEl.classList.remove("open");
      searchInput.value = "";
    });

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlayEl.classList.contains("open")) {
        overlayEl.classList.remove("open");
        searchInput.value = "";
      }
    });

    // Handle search submit
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length > 0) {
        // Redirect to shop page with query param
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
      }
    });
  })();

  // Toast
  const toast = getEl("toast");
  function showToast(msg, duration = 2500) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duration);
  }

  // Cart (only if elements exist)
  const cartCountEl = getSel(".cart-count");
  let cartCount = parseInt(localStorage.getItem("fellaz_cart")) || 0;
  if (cartCountEl) {
    const updateCartDisplay = () => {
      cartCountEl.textContent = cartCount;
      localStorage.setItem("fellaz_cart", cartCount);
    };
    updateCartDisplay();

    document.querySelectorAll(".btn-product, .quick-add-btn").forEach((btn) => {
      if (btn.disabled) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        cartCount++;
        updateCartDisplay();
        showToast("🔥 Added to bag!");
      });
    });
  }

  // Mobile menu
  const hamburger = getEl("hamburger");
  const mobileMenu = getEl("mobileMenu");
  const mobileMenuClose = getEl("mobileMenuClose");
  const allMobileLinks = document.querySelectorAll(".mobile-nav-link");
  function openMobileMenu() {
    mobileMenu?.classList.add("open");
    hamburger?.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeMobileMenu() {
    mobileMenu?.classList.remove("open");
    hamburger?.classList.remove("active");
    document.body.style.overflow = "";
  }
  hamburger?.addEventListener("click", openMobileMenu);
  mobileMenuClose?.addEventListener("click", closeMobileMenu);
  allMobileLinks.forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
  );

  // Header scroll effect
  const header = getEl("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) header?.classList.add("scrolled");
    else header?.classList.remove("scrolled");
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        if (mobileMenu?.classList.contains("open")) closeMobileMenu();
      }
    });
  });

  // Countdown (only if elements exist)
  const daysEl = getEl("days"),
    hoursEl = getEl("hours"),
    minutesEl = getEl("minutes"),
    secondsEl = getEl("seconds");
  if (daysEl && hoursEl && minutesEl && secondsEl) {
    const targetDate = new Date(2026, 4, 30, 18, 0, 0);
    function updateCountdown() {
      const distance = targetDate - new Date();
      if (distance < 0) {
        daysEl.textContent =
          hoursEl.textContent =
          minutesEl.textContent =
          secondsEl.textContent =
            "00";
        clearInterval(countdownInterval);
        showToast("🚀 The drop is live!");
        return;
      }
      daysEl.textContent = Math.floor(distance / 86400000)
        .toString()
        .padStart(2, "0");
      hoursEl.textContent = Math.floor((distance % 86400000) / 3600000)
        .toString()
        .padStart(2, "0");
      minutesEl.textContent = Math.floor((distance % 3600000) / 60000)
        .toString()
        .padStart(2, "0");
      secondsEl.textContent = Math.floor((distance % 60000) / 1000)
        .toString()
        .padStart(2, "0");
    }
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
  }

  // Newsletter (only if form exists)
  const newsletterForm = getSel("#newsletterForm");
  const newsletterEmail = getSel("#newsletterEmail");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = newsletterEmail?.value.trim() || "";
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (emailRegex.test(email)) {
      showToast("✅ You’re in, real one!");
      newsletterForm.reset();
    } else {
      showToast("⚠️ Enter a valid email address");
    }
  });

  const notifyBtn = getEl("notifyBtn");
  notifyBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    getSel(".newsletter-section")?.scrollIntoView({ behavior: "smooth" });
  });

  // Scroll reveal (works on any .reveal element, even on about page)
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -30px 0px" },
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // Footer year
  const yearSpan = getEl("currentYear");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Particles (only if cosmicBg exists)
  const cosmicBg = getEl("cosmicBg");
  if (
    cosmicBg &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none";
    cosmicBg.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let width,
      height,
      particles = [];
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    function createParticles() {
      particles = [];
      const count = Math.min(70, Math.floor((width * height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.8,
          speedX: (Math.random() - 0.5) * 0.25,
          speedY: (Math.random() - 0.5) * 0.25,
          color: `rgba(255,255,255,${Math.random() * 0.4 + 0.2})`,
        });
      }
    }
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        const pad = 20;
        if (p.x < -pad) p.x = width + pad;
        if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        if (p.y > height + pad) p.y = -pad;
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });
    resize();
    createParticles();
    draw();
  }

  console.log("🔥 fellaż — Sharp. Street. Smart.");
});
