/**
 * INTERNWELL SLIET - Main Application Controller
 * Handles Navigation, 3D Tilt, Modals, Matrix Rain, and Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAudioControls();
  init3DHudControls();
  init3DCardTilt();
  initFaqAccordion();
  initInductionModal();
  initMatrixDigitalRain();
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
    if (window.scrollY > 40) {
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

  // Initialize UI state
  const isMuted = localStorage.getItem('iw_audio_muted') === 'true';
  if (!isMuted) {
    soundBtn.classList.add('active');
    if (soundStatusText) soundStatusText.textContent = 'SFX: ON';
  } else {
    soundBtn.classList.remove('active');
    if (soundStatusText) soundStatusText.textContent = 'SFX: MUTED';
  }

  soundBtn.addEventListener('click', () => {
    if (window.cyberAudio) {
      const nowMuted = window.cyberAudio.toggleMute();
      if (!nowMuted) {
        soundBtn.classList.add('active');
        if (soundStatusText) soundStatusText.textContent = 'SFX: ON';
        showToast('🔊 Cyber Sound FX Enabled');
      } else {
        soundBtn.classList.remove('active');
        if (soundStatusText) soundStatusText.textContent = 'SFX: MUTED';
        showToast('🔇 Cyber Sound FX Muted');
      }
    }
  });
}

/* ==========================================================================
   3. 3D STAGE HUD CONTROLS
   ========================================================================== */
function init3DHudControls() {
  const modeBtns = document.querySelectorAll('.hud-ctrl-btn[data-mode]');
  const wireBtn = document.getElementById('ctrl-wireframe');
  const speedBtn = document.getElementById('ctrl-speed');

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      modeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (window.techScene) {
        window.techScene.setMode(mode);
      }
      if (window.cyberAudio) window.cyberAudio.playBlip();
    });
  });

  if (wireBtn) {
    wireBtn.addEventListener('click', () => {
      if (window.techScene) {
        const isWire = window.techScene.toggleWireframe();
        wireBtn.textContent = isWire ? 'WIREFRAME: ON' : 'WIREFRAME: OFF';
        wireBtn.classList.toggle('active', isWire);
      }
      if (window.cyberAudio) window.cyberAudio.playBlip();
    });
  }

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      if (window.techScene) {
        const spd = window.techScene.toggleSpeed();
        speedBtn.textContent = spd > 1 ? 'BOOST: 2.5X' : 'BOOST: 1.0X';
        speedBtn.classList.toggle('active', spd > 1);
      }
      if (window.cyberAudio) window.cyberAudio.playBlip();
    });
  }
}

/* ==========================================================================
   4. 3D CARD TILT EFFECT (Mouse Gyro / Physics)
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

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close other open items
      faqItems.forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });

      item.classList.toggle('active', !isOpen);
      if (window.cyberAudio) window.cyberAudio.playHover();
    });
  });
}

/* ==========================================================================
   6. INDUCTION APPLICATION MODAL & CONFETTI
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

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('applicant-name')?.value || 'Cadet';
      const domain = document.getElementById('applicant-domain')?.value || 'Tech';

      window.closeInductionModal();
      triggerConfetti();
      if (window.cyberAudio) window.cyberAudio.playSuccess();

      showToast(`⚡ Application Received! Welcome to InternWell SLIET, ${name}!`);
      form.reset();
    });
  }
}

/* ==========================================================================
   7. MATRIX DIGITAL RAIN OVERLAY
   ========================================================================== */
function initMatrixDigitalRain() {
  const canvas = document.getElementById('matrix-canvas');
  const exitBtn = document.getElementById('matrix-exit-btn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  const chars = '01INTERNWELLSLIETABCDEF0123456789$#@%&*+<>';
  let fontSize = 16;
  let columns = 0;
  let drops = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(6, 9, 15, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00f2fe';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    animationFrameId = requestAnimationFrame(drawMatrix);
  }

  window.startMatrixRain = () => {
    resizeCanvas();
    canvas.classList.add('active');
    if (exitBtn) exitBtn.classList.add('active');
    if (!animationFrameId) {
      drawMatrix();
    }
  };

  window.stopMatrixRain = () => {
    canvas.classList.remove('active');
    if (exitBtn) exitBtn.classList.remove('active');
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (exitBtn) {
    exitBtn.addEventListener('click', window.stopMatrixRain);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && canvas.classList.contains('active')) {
      window.stopMatrixRain();
    }
  });

  window.addEventListener('resize', () => {
    if (canvas.classList.contains('active')) resizeCanvas();
  });
}

/* ==========================================================================
   8. CONFETTI GENERATOR
   ========================================================================== */
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#00f2fe', '#4facfe', '#7928ca', '#00f5a0', '#ffffff'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.alpha -= 0.012;
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
   9. CYBER TOAST NOTIFICATION
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.cyber-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cyber-toast';
    toast.innerHTML = `<span class="toast-icon">⚡</span><span class="toast-message"></span>`;
    document.body.appendChild(toast);
  }

  const msgSpan = toast.querySelector('.toast-message');
  if (msgSpan) msgSpan.textContent = message;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   10. LIVE TICKER & METRICS
   ========================================================================== */
function initLiveTicker() {
  const pingEl = document.getElementById('live-ping');
  if (pingEl) {
    setInterval(() => {
      const ping = Math.floor(Math.random() * 12) + 14;
      pingEl.textContent = `${ping}ms`;
    }, 3500);
  }
}

/* ==========================================================================
   11. GLOBAL SOUND FX BINDINGS
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
