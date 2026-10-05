/**
 * INTERNWELL SLIET - Main Application Controller
 * Handles Navigation, 3D Card Physics, Modals, FAQ, and Sound Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAudioControls();
  init3DCardTilt();
  initFaqAccordion();
  initInductionModal();
  initLiveTicker();
  initGlobalSFX();
});

/* ==========================================================================
   1. NAVBAR & NAVIGATION
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      if (window.cyberAudio) window.cyberAudio.playBlip();
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Active Link Tracking
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 140;
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (targetLink) targetLink.classList.add('active');
      } else {
        if (targetLink) targetLink.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   2. AUDIO CONTROLLER & UI
   ========================================================================== */
function initAudioControls() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundStatusText = document.getElementById('sound-status-text');

  if (!soundBtn) return;

  const isMuted = localStorage.getItem('iw_audio_muted') === 'true';
  if (!isMuted) {
    soundBtn.classList.add('active');
    if (soundStatusText) soundStatusText.textContent = 'SFX: ON';
  } else {
    soundBtn.classList.remove('active');
    if (soundStatusText) soundStatusText.textContent = 'SFX: OFF';
  }

  soundBtn.addEventListener('click', () => {
    if (window.cyberAudio) {
      const nowMuted = window.cyberAudio.toggleMute();
      if (!nowMuted) {
        soundBtn.classList.add('active');
        if (soundStatusText) soundStatusText.textContent = 'SFX: ON';
        showToast('🔊 Audio Effects Enabled');
      } else {
        soundBtn.classList.remove('active');
        if (soundStatusText) soundStatusText.textContent = 'SFX: OFF';
        showToast('🔇 Audio Effects Muted');
      }
    }
  });
}

/* ==========================================================================
   3. 3D CARD TILT EFFECT (Subtle & Smooth)
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.cyber-card, .project-card, .team-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/* ==========================================================================
   4. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });

      item.classList.toggle('active', !isOpen);
      if (window.cyberAudio) window.cyberAudio.playHover();
    });
  });
}

/* ==========================================================================
   5. INDUCTION APPLICATION MODAL & CONFETTI
   ========================================================================== */
function initInductionModal() {
  const modal = document.getElementById('induction-modal');
  const openBtns = document.querySelectorAll('.btn-open-induction');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('induction-form');

  window.openInductionModal = () => {
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (window.cyberAudio) window.cyberAudio.playBlip();
    }
  };

  window.closeInductionModal = () => {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  };

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openInductionModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeInductionModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeInductionModal();
      }
    });
  }

  // Form submission is handled by js/registration.js with Supabase backend
}

/* ==========================================================================
   6. CONFETTI GENERATOR
   ========================================================================== */
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#2563eb', '#38bdf8', '#e11d48', '#10b981', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.alpha -= 0.015;
      p.rotation += p.rotSpeed;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  renderConfetti();
}

/* ==========================================================================
   7. TOAST NOTIFICATION
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.cyber-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-message"></span>`;
    document.body.appendChild(toast);
  }

  const msgSpan = toast.querySelector('.toast-message');
  if (msgSpan) msgSpan.textContent = message;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   8. LIVE STATS PING
   ========================================================================== */
function initLiveTicker() {
  const pingEl = document.getElementById('live-ping');
  if (pingEl) {
    setInterval(() => {
      const ping = Math.floor(Math.random() * 8) + 12;
      pingEl.textContent = `${ping}ms`;
    }, 4000);
  }
}

/* ==========================================================================
   9. GLOBAL SOUND BINDINGS
   ========================================================================== */
function initGlobalSFX() {
  document.querySelectorAll('a, button, .terminal-hint-pill').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (window.cyberAudio) window.cyberAudio.playHover();
    });
    el.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playBlip();
    });
  });
}
