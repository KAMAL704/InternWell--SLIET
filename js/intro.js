/**
 * INTERNWELL SLIET - Official SLIET Campus Drone Video Full-Screen Intro (6 Seconds)
 * Source: Official SLIET Longowal Drone Aerial Tour (assets/videos/sliet_drone.mp4)
 * Features:
 *  1. Native 100vw x 100vh full-screen video with zero lag and instant playback
 *  2. 6-second countdown timer & campus telemetry HUD
 *  3. Hyperspace portal minimize transition for video & cinematic zoom maximize for main website
 *  4. ESC key & Skip button for instantaneous bypass
 */

class SlietDroneIntro {
  constructor() {
    this.overlay = document.getElementById('cinematic-intro-overlay');
    this.video = document.getElementById('intro-drone-video');
    this.skipBtn = document.getElementById('skip-intro-btn');
    this.countdownEl = document.getElementById('intro-countdown-num');
    this.altEl = document.getElementById('intro-altitude-val');
    this.statusEl = document.getElementById('intro-status-text');

    if (!this.overlay) return;

    this.isCompleted = false;
    this.timeLeft = 6; // Adjusted to optimal 6-second cinematic window (between 5-7s)
    this.timer = null;

    this.init();
  }

  init() {
    // Only run on the homepage
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    if (!isHome) {
      this.closeIntro(true);
      return;
    }

    // Prepare body & main site for reveal transition
    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    // Start video playback immediately
    if (this.video) {
      this.video.currentTime = 0;
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video auto-play restricted by browser policy:', err);
        });
      }
    }

    // Play subtle entry chime
    if (window.cyberAudio) {
      window.cyberAudio.playHover();
    }

    // Hook Skip button & ESC key
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.closeIntro());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isCompleted) {
        this.closeIntro();
      }
    });

    // Start the countdown loop
    this.startCountdown();
  }

  startCountdown() {
    const altitudes = [280, 240, 205, 170, 140, 115];

    this.timer = setInterval(() => {
      if (this.isCompleted) {
        clearInterval(this.timer);
        return;
      }

      this.timeLeft -= 1;

      // Update countdown display
      if (this.countdownEl) {
        this.countdownEl.textContent = `${this.timeLeft}s`;
      }

      // Update altitude telemetry
      if (this.altEl) {
        const altIndex = Math.max(0, 6 - this.timeLeft - 1);
        this.altEl.textContent = `${altitudes[altIndex] || 120}M`;
      }

      // Dynamic telemetry status updates
      if (this.statusEl) {
        if (this.timeLeft === 4) {
          this.statusEl.textContent = 'CAMPUS AERIAL TOUR // SLIET LONGOWAL [ACADEMIC & SPORTS COMPLEX]';
        } else if (this.timeLeft === 2) {
          this.statusEl.textContent = 'APPROACHING GROUND LEVEL // INITIATING PORTAL DEPLOYMENT';
        } else if (this.timeLeft === 1) {
          this.statusEl.textContent = 'DRONE SHOW COMPLETE // WELCOME TO INTERNWELL SLIET';
        }
      }

      // When countdown reaches 0, trigger smooth transition
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.closeIntro();
      }
    }, 1000);
  }

  closeIntro(immediate = false) {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (this.timer) {
      clearInterval(this.timer);
    }

    if (immediate) {
      document.body.classList.remove('intro-active');
      document.body.classList.remove('intro-revealing');
      if (this.overlay) this.overlay.style.display = 'none';
      if (this.video) this.video.pause();
      document.body.style.overflow = 'auto';
      return;
    }

    // 1. Simultaneously trigger portal-minimize on the video overlay & maximize zoom on main site
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-revealing');

    if (this.overlay) {
      this.overlay.classList.add('portal-minimize');
    }

    if (window.cyberAudio) {
      window.cyberAudio.playSuccess();
    }

    // 2. Complete transition after animation curve finishes
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      if (this.video) {
        this.video.pause();
      }
      document.body.style.overflow = 'auto';
      document.body.classList.remove('intro-revealing');
    }, 950);
  }
}

// Start once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.slietDroneIntro = new SlietDroneIntro();
});
