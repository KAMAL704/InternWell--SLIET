/**
 * INTERNWELL SLIET - Cinematic 3-5s SLIET Campus Drone View & Rocket/Jet Flyover Intro
 * Reference: SLIET Longowal Campus Drone Aerial View (https://youtu.be/ZaKe_QHThJk)
 * Features:
 *  1. Supersonic aircraft / rocket flyover across SLIET campus sky with afterburner flame & smoke trail
 *  2. Real SLIET drone footage embed + high-res drone photography backdrop
 *  3. Live altitude countdown & tactical HUD telemetry
 *  4. Smooth map minimization sequence revealing InternWell SLIET portal
 *  5. ESC key & Skip button support
 */

class SlietDroneIntro {
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

    // Lock body scrolling during the 4-second flyover
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
    const altReadout = document.getElementById('intro-altitude-val');
    const statusText = document.getElementById('intro-status-text');

    // Stage 1: 0s - 1.4s (Flyover Begins, Jet Streaks Across Sky)
    if (window.cyberAudio) window.cyberAudio.playHover();

    setTimeout(() => {
      if (this.isCompleted) return;
      if (statusText) statusText.textContent = 'SUPERSONIC FLYOVER // SLIET LONGOWAL CAMPUS';
      if (window.cyberAudio) window.cyberAudio.playBlip();
    }, 1300);

    // Altitude descent countdown
    let alt = 850;
    const altInterval = setInterval(() => {
      if (this.isCompleted) {
        clearInterval(altInterval);
        return;
      }
      alt = Math.max(120, alt - 65);
      if (altReadout) altReadout.textContent = `${alt}M`;
      if (alt <= 120) clearInterval(altInterval);
    }, 180);

    // Stage 2: 2.6s (Target Locked)
    setTimeout(() => {
      if (this.isCompleted) return;
      if (statusText) statusText.textContent = 'CAMPUS LOCK: 30.2244° N, 75.6881° E [LONGOWAL]';
    }, 2600);

    // Stage 3: 3.7s (Minimize Map & Open Main Portal)
    setTimeout(() => {
      if (this.isCompleted) return;
      const mapBox = document.getElementById('intro-map-wrapper');
      if (mapBox) {
        mapBox.classList.add('minimizing');
      }
      if (statusText) statusText.textContent = 'FLYOVER COMPLETE // ENTERING INTERNWELL';
      if (window.cyberAudio) window.cyberAudio.playSuccess();
    }, 3700);

    // Final Stage: 4.4s (Fade out overlay completely)
    setTimeout(() => {
      this.closeIntro();
    }, 4400);
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
  window.slietDroneIntro = new SlietDroneIntro();
});
