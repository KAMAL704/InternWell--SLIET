/**
 * INTERNWELL SLIET - Official SLIET Campus Drone Video Full-Screen Intro (5 Seconds)
 * Source: Official SLIET Longowal Drone Aerial Tour (assets/videos/sliet_drone.mp4)
 * Features:
 *  1. Native 100vw x 100vh full-screen video with zero lag and instant playback
 *  2. Real-time 5-second countdown & campus telemetry HUD
 *  3. Seamless cinematic fade-out transition into the main InternWell portal
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
    this.timeLeft = 5;
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

    // Lock body scrolling during the 5-second video intro
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

    // Start the 5-second countdown loop
    this.startCountdown();
  }

  startCountdown() {
    const altitudes = [260, 225, 190, 160, 135];

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
        const altIndex = Math.max(0, 5 - this.timeLeft - 1);
        this.altEl.textContent = `${altitudes[altIndex] || 150}M`;
      }

      // Status text updates
      if (this.statusEl) {
        if (this.timeLeft === 3) {
          this.statusEl.textContent = 'CAMPUS AERIAL TOUR // SLIET LONGOWAL [ACADEMIC & SPORTS COMPLEX]';
        } else if (this.timeLeft === 1) {
          this.statusEl.textContent = 'DRONE SHOW COMPLETE // WELCOME TO INTERNWELL SLIET';
        }
      }

      // When 5 seconds expire, close intro smoothly
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

    if (this.overlay) {
      if (immediate) {
        this.overlay.style.display = 'none';
        if (this.video) this.video.pause();
      } else {
        this.overlay.classList.add('fade-out');
        if (window.cyberAudio) window.cyberAudio.playSuccess();

        setTimeout(() => {
          this.overlay.style.display = 'none';
          if (this.video) this.video.pause();
        }, 750);
      }
    }

    document.body.style.overflow = 'auto';
  }
}

// Start once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.slietDroneIntro = new SlietDroneIntro();
});
