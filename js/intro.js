/**
 * INTERNWELL SLIET - 3-5s Cinematic Satellite Intro Sequence
 * Satellite orbital view -> Zooming in to SLIET Longowal coordinates -> Minimizing map -> Revealing main portal
 */

class SatelliteIntro {
  constructor() {
    this.overlay = document.getElementById('cinematic-intro-overlay');
    this.skipBtn = document.getElementById('skip-intro-btn');
    if (!this.overlay) return;

    this.timer = null;
    this.isCompleted = false;

    this.init();
  }

  init() {
    // Only play on the homepage
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    if (!isHome) {
      this.closeIntro(true);
      return;
    }

    // Lock body scrolling during the 4-second intro
    document.body.style.overflow = 'hidden';

    // Hook Skip button & ESC key
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.closeIntro());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isCompleted) {
        this.closeIntro();
      }
    });

    // Start the cinematic progression
    this.runSequence();
  }

  runSequence() {
    const stage1 = document.getElementById('intro-stage-1');
    const stage2 = document.getElementById('intro-stage-2');
    const altReadout = document.getElementById('intro-altitude-val');
    const statusText = document.getElementById('intro-status-text');

    // Stage 1: 0s - 1.8s (Orbital Satellite Telemetry)
    setTimeout(() => {
      if (this.isCompleted) return;
      if (statusText) statusText.textContent = 'TARGET ACQUIRED: SLIET LONGOWAL, PUNJAB';
      if (window.cyberAudio) window.cyberAudio.playHover();
    }, 1200);

    // Stage 2: 1.8s - 3.4s (Descent & Tactical Campus Map)
    setTimeout(() => {
      if (this.isCompleted) return;
      if (stage1) stage1.style.opacity = '0';
      if (stage2) {
        stage2.style.opacity = '1';
        stage2.style.transform = 'scale(1)';
      }
      if (statusText) statusText.textContent = 'TACTICAL MAP: 30.2244° N, 75.6881° E [CAMPUS LOCK]';
      if (window.cyberAudio) window.cyberAudio.playBlip();

      // Animate altitude descent
      let alt = 485;
      const altInterval = setInterval(() => {
        alt = Math.max(0, alt - 55);
        if (altReadout) altReadout.textContent = `${alt}.0 KM`;
        if (alt <= 0) clearInterval(altInterval);
      }, 120);
    }, 1800);

    // Stage 3: 3.4s - 4.5s (Minimize Map & Reveal Portal)
    setTimeout(() => {
      if (this.isCompleted) return;
      const mapBox = document.getElementById('intro-map-wrapper');
      if (mapBox) {
        mapBox.classList.add('minimizing');
      }
      if (statusText) statusText.textContent = 'PORTAL INITIALIZED // ENTERING INTERNWELL';
      if (window.cyberAudio) window.cyberAudio.playSuccess();
    }, 3400);

    // Final Stage: 4.3s (Fade out overlay completely)
    setTimeout(() => {
      this.closeIntro();
    }, 4300);
  }

  closeIntro(immediate = false) {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (this.overlay) {
      if (immediate) {
        this.overlay.style.display = 'none';
      } else {
        this.overlay.classList.add('fade-out');
        setTimeout(() => {
          this.overlay.style.display = 'none';
        }, 600);
      }
    }

    document.body.style.overflow = 'auto';
  }
}

// Start once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.satelliteIntro = new SatelliteIntro();
});
