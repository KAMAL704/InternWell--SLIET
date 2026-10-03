/**
 * INTERNWELL SLIET - Dynamic Moving Background Stars
 * Lightweight, high-performance cosmic starfield with drifting stars and subtle shooting meteors
 * Runs across all pages with zero performance lag
 */

class MovingStarfield {
  constructor() {
    this.canvas = document.getElementById('bg-stars-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'bg-stars-canvas';
      document.body.prepend(this.canvas);
    }

    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.meteors = [];
    this.starCount = window.innerWidth < 768 ? 140 : 280;

    this.init();
  }

  init() {
    this.resize();
    this.createStars();

    window.addEventListener('resize', () => {
      this.resize();
      this.createStars();
    });

    // Periodically spawn a shooting star
    setInterval(() => {
      if (Math.random() > 0.3) {
        this.spawnMeteor();
      }
    }, 6000);

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        vx: (Math.random() - 0.5) * 0.15, // gentle horizontal drift
        vy: -Math.random() * 0.2 - 0.05,  // slow upward cosmic float
        color: this.getRandomStarColor()
      });
    }
  }

  getRandomStarColor() {
    const colors = [
      '255, 255, 255',      // Pure white
      '147, 197, 253',      // Soft cyan-blue
      '191, 219, 254',      // Light sky blue
      '225, 29, 72'         // Rare subtle red spark
    ];
    const rand = Math.random();
    if (rand < 0.6) return colors[0];
    if (rand < 0.85) return colors[1];
    if (rand < 0.96) return colors[2];
    return colors[3];
  }

  spawnMeteor() {
    this.meteors.push({
      x: Math.random() * this.width * 0.8,
      y: Math.random() * (this.height * 0.4),
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 6,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg
      alpha: 1.0,
      decay: Math.random() * 0.02 + 0.015
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render & update moving stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      s.x += s.vx;
      s.y += s.vy;

      // Wrap around screen edges
      if (s.y < 0) s.y = this.height;
      if (s.x < 0) s.x = this.width;
      if (s.x > this.width) s.x = 0;

      // Twinkle effect
      s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.01;
      s.alpha = Math.max(0.1, Math.min(0.85, s.alpha));

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;
      this.ctx.fill();
    }

    // Render & update meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      const endX = m.x - Math.cos(m.angle) * m.length;
      const endY = m.y - Math.sin(m.angle) * m.length;

      const gradient = this.ctx.createLinearGradient(m.x, m.y, endX, endY);
      gradient.addColorStop(0, `rgba(56, 189, 248, ${m.alpha})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      this.ctx.beginPath();
      this.ctx.moveTo(m.x, m.y);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();

      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= m.decay;

      if (m.alpha <= 0 || m.x > this.width || m.y > this.height) {
        this.meteors.splice(i, 1);
      }
    }
  }
}

// Start Starfield once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.starfield = new MovingStarfield();
});
