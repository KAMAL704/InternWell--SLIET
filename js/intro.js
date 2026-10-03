/**
 * INTERNWELL SLIET - Official SLIET Campus Drone Video Full-Screen Intro (4.5 Seconds)
 * Source: Official SLIET Longowal Drone Aerial Tour (assets/videos/sliet_drone.mp4)
 * Features:
 *  1. Native 100vw x 100vh full-screen video with zero lag and instant playback
 *  2. Exactly 4.5-second countdown & live campus altitude telemetry
 *  3. Dramatic end-of-video portal minimize warp & beginning-of-site epic zoom maximize animation
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
    this.totalDurationMs = 4500; // 4.5 seconds
    this.startTime = null;
    this.rafId = null;

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

    // Start 4.5-second countdown loop
    this.startCountdown();
  }

  startCountdown() {
    this.startTime = performance.now();

    const updateLoop = (now) => {
      if (this.isCompleted) return;

      const elapsed = now - this.startTime;
      const remainingMs = Math.max(0, this.totalDurationMs - elapsed);
      const remainingSec = (remainingMs / 1000).toFixed(1);

      // Update countdown UI
      if (this.countdownEl) {
        this.countdownEl.textContent = `${remainingSec}s`;
      }

      // Update altitude telemetry based on progress
      if (this.altEl) {
        const progress = Math.min(1, elapsed / this.totalDurationMs);
        const alt = Math.round(260 - progress * 150); // 260M down to 110M
        this.altEl.textContent = `${alt}M`;
      }

      // Dynamic telemetry status updates
      if (this.statusEl) {
        if (remainingMs <= 1800 && remainingMs > 800) {
          this.statusEl.textContent = 'CAMPUS AERIAL TOUR // SLIET LONGOWAL [ACADEMIC & SPORTS COMPLEX]';
        } else if (remainingMs <= 800) {
          this.statusEl.textContent = 'DRONE SHOW COMPLETE // INITIALIZING PORTAL WARP';
        }
      }

      // When 4.5 seconds expire, trigger smooth transition
      if (remainingMs <= 0) {
        this.closeIntro();
        return;
      }

      this.rafId = requestAnimationFrame(updateLoop);
    };

    this.rafId = requestAnimationFrame(updateLoop);
  }

  closeIntro(immediate = false) {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    if (immediate) {
      document.body.classList.remove('intro-active');
      document.body.classList.remove('intro-revealing');
      if (this.overlay) this.overlay.style.display = 'none';
      if (this.video) this.video.pause();
      document.body.style.overflow = 'auto';
      return;
    }

    // 1. Simultaneously trigger portal-minimize on the video overlay & epic maximize on main site
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-revealing');

    if (this.overlay) {
      this.overlay.classList.add('portal-minimize');
    }

    // 2. Play futuristic portal warp audio whoosh
    if (window.cyberAudio) {
      if (typeof window.cyberAudio.playPortalWarp === 'function') {
        window.cyberAudio.playPortalWarp();
      } else {
        window.cyberAudio.playSuccess();
      }
    }

    // 3. Complete transition after animation curve finishes
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      if (this.video) {
        this.video.pause();
      }
      document.body.style.overflow = 'auto';
      document.body.classList.remove('intro-revealing');
    }, 1000);
  }
}

// Start once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.slietDroneIntro = new SlietDroneIntro();
});
