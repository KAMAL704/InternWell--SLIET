/**
 * INTERNWELL SLIET - Cosmic Background Animation Engine
 * Features:
 *  1. Drifting, multi-hued starfield with twinkling
 *  2. Occasional shooting meteors with light trails
 *  3. Tumbling 3D wireframe mini-boxes (holographic data cubes)
 *  4. 1-2 Orbital satellites traversing across space with solar panels,
 *     blinking beacon lights, communication dishes, and telemetry tags
 * Zero lag, mobile responsive, running on lightweight 2D canvas.
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
    this.miniBoxes = [];
    this.satellites = [];
    this.isMobile = window.innerWidth < 768;
    this.starCount = this.isMobile ? 120 : 260;

    this.init();
  }

  init() {
    this.resize();
    this.createStars();
    this.createMiniBoxes();
    this.createSatellites();

    window.addEventListener('resize', () => {
      this.resize();
      this.isMobile = window.innerWidth < 768;
      this.starCount = this.isMobile ? 120 : 260;
      this.createStars();
      this.createMiniBoxes();
    });

    // Periodically spawn shooting stars
    setInterval(() => {
      if (Math.random() > 0.35) {
        this.spawnMeteor();
      }
    }, 5500);

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /* ==========================================================================
     1. COSMIC STARS & METEORS
     ========================================================================== */
  createStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.25,
        alpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        vx: (Math.random() - 0.5) * 0.12, // subtle drift
        vy: -Math.random() * 0.22 - 0.06, // upward cosmic drift
        color: this.getRandomStarColor()
      });
    }
  }

  getRandomStarColor() {
    const colors = [
      '255, 255, 255',      // Pure white
      '147, 197, 253',      // Soft cyan-blue
      '191, 219, 254',      // Light sky blue
      '225, 29, 72'         // Rare subtle crimson pulse
    ];
    const rand = Math.random();
    if (rand < 0.60) return colors[0];
    if (rand < 0.85) return colors[1];
    if (rand < 0.96) return colors[2];
    return colors[3];
  }

  spawnMeteor() {
    this.meteors.push({
      x: Math.random() * this.width * 0.85,
      y: Math.random() * (this.height * 0.4),
      length: Math.random() * 80 + 50,
      speed: Math.random() * 9 + 7,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
      alpha: 1.0,
      decay: Math.random() * 0.02 + 0.015
    });
  }

  /* ==========================================================================
     2. TUMBLING 3D MINI BOXES (Holographic Data Cubes)
     ========================================================================== */
  createMiniBoxes() {
    const boxCount = this.isMobile ? 4 : 7;
    this.miniBoxes = [];

    // Base unit cube vertices: 8 corners centered at origin
    this.cubeVertices = [
      [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
      [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1]
    ];

    // 12 edges connecting vertices
    this.cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // front face
      [4, 5], [5, 6], [6, 7], [7, 4], // back face
      [0, 4], [1, 5], [2, 6], [3, 7]  // connecting ribs
    ];

    for (let i = 0; i < boxCount; i++) {
      this.miniBoxes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 9 + 8, // 8px to 17px half-size (16px to 34px cube)
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.15, // float upwards
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.016,
        speedY: (Math.random() - 0.5) * 0.016,
        speedZ: (Math.random() - 0.5) * 0.012,
        alpha: Math.random() * 0.28 + 0.22,
        glowColor: Math.random() > 0.3 ? '56, 189, 248' : '37, 99, 235'
      });
    }
  }

  /* ==========================================================================
     3. 1-2 ORBITAL SATELLITES
     ========================================================================== */
  createSatellites() {
    this.satellites = [
      // Satellite 1: High-orbit Primary Orbiter (Traversing Left to Right)
      {
        id: 'SAT-01',
        name: 'IW-SAT // 01',
        x: -80,
        y: this.height * 0.18,
        vx: 0.42,
        vy: 0.06,
        scale: 0.85,
        angle: 0.14, // ~8 degrees downward glide
        beaconColor: '#e11d48', // Red blinking telemetry LED
        beaconInterval: 1400,
        dishAngle: -0.4,
        trail: []
      },
      // Satellite 2: Mid-orbit Secondary Telemetry Probe (Traversing Right to Left)
      {
        id: 'SAT-02',
        name: 'IW-SAT // 02',
        x: this.width + 90,
        y: this.height * 0.62,
        vx: -0.32,
        vy: -0.04,
        scale: 0.68,
        angle: Math.PI + 0.12, // glide leftwards
        beaconColor: '#10b981', // Emerald green blinking LED
        beaconInterval: 1800,
        dishAngle: 0.3,
        trail: []
      }
    ];
  }

  /* ==========================================================================
     4. RENDER LOOP
     ========================================================================== */
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Stars
    this.renderStars();

    // 2. Draw Meteors
    this.renderMeteors();

    // 3. Draw Moving Mini Boxes (Tumbling Wireframe Data Cubes)
    this.renderMiniBoxes();

    // 4. Draw 1-2 Satellites Moving in Background
    this.renderSatellites();
  }

  renderStars() {
    const time = Date.now();
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      s.x += s.vx;
      s.y += s.vy;

      if (s.y < 0) s.y = this.height;
      if (s.x < 0) s.x = this.width;
      if (s.x > this.width) s.x = 0;

      s.alpha += Math.sin(time * s.twinkleSpeed) * 0.01;
      s.alpha = Math.max(0.12, Math.min(0.9, s.alpha));

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${s.color}, ${s.alpha})`;
      this.ctx.fill();
    }
  }

  renderMeteors() {
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

  renderMiniBoxes() {
    this.miniBoxes.forEach((box) => {
      box.x += box.vx;
      box.y += box.vy;

      // Wrap-around
      if (box.y < -40) {
        box.y = this.height + 40;
        box.x = Math.random() * this.width;
      }
      if (box.x < -40) box.x = this.width + 40;
      if (box.x > this.width + 40) box.x = -40;

      // Rotate box in 3D
      box.rotX += box.speedX;
      box.rotY += box.speedY;
      box.rotZ += box.speedZ;

      const cosX = Math.cos(box.rotX), sinX = Math.sin(box.rotX);
      const cosY = Math.cos(box.rotY), sinY = Math.sin(box.rotY);
      const cosZ = Math.cos(box.rotZ), sinZ = Math.sin(box.rotZ);

      // Project vertices to 2D
      const projected = this.cubeVertices.map(([vx, vy, vz]) => {
        const x0 = vx * box.size;
        const y0 = vy * box.size;
        const z0 = vz * box.size;

        // Rotation around X
        const y1 = y0 * cosX - z0 * sinX;
        const z1 = y0 * sinX + z0 * cosX;

        // Rotation around Y
        const x2 = x0 * cosY + z1 * sinY;
        const z2 = -x0 * sinY + z1 * cosY;

        // Rotation around Z
        const x3 = x2 * cosZ - y1 * sinZ;
        const y3 = x2 * sinZ + y1 * cosZ;

        return [box.x + x3, box.y + y3];
      });

      // Draw wireframe edges
      this.ctx.beginPath();
      this.cubeEdges.forEach(([p1, p2]) => {
        this.ctx.moveTo(projected[p1][0], projected[p1][1]);
        this.ctx.lineTo(projected[p2][0], projected[p2][1]);
      });
      this.ctx.strokeStyle = `rgba(${box.glowColor}, ${box.alpha})`;
      this.ctx.lineWidth = 1.1;
      this.ctx.stroke();

      // Subtle vertex glowing pins
      this.ctx.fillStyle = `rgba(255, 255, 255, ${box.alpha * 1.2})`;
      projected.forEach(([px, py]) => {
        this.ctx.beginPath();
        this.ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });
  }

  renderSatellites() {
    const time = Date.now();

    this.satellites.forEach((sat) => {
      sat.x += sat.vx;
      sat.y += sat.vy;

      // Wrap around when crossing beyond viewport
      if (sat.vx > 0 && sat.x > this.width + 120) {
        sat.x = -100;
        sat.y = Math.random() * (this.height * 0.45) + 40;
        sat.trail = [];
      } else if (sat.vx < 0 && sat.x < -120) {
        sat.x = this.width + 100;
        sat.y = Math.random() * (this.height * 0.45) + (this.height * 0.35);
        sat.trail = [];
      }

      // Record faint orbit trail
      if (Math.random() > 0.4) {
        sat.trail.push({ x: sat.x, y: sat.y, alpha: 0.35 });
        if (sat.trail.length > 25) sat.trail.shift();
      }

      // 1. Draw subtle orbit trajectory trail
      for (let j = 0; j < sat.trail.length; j++) {
        const pt = sat.trail[j];
        pt.alpha -= 0.012;
        if (pt.alpha > 0) {
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(56, 189, 248, ${pt.alpha})`;
          this.ctx.fill();
        }
      }

      // 2. Draw Satellite Structure
      this.ctx.save();
      this.ctx.translate(sat.x, sat.y);
      this.ctx.rotate(sat.angle);
      this.ctx.scale(sat.scale, sat.scale);

      // --- Solar Array Arms (Connecting struts) ---
      this.ctx.strokeStyle = '#64748b';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-28, 0);
      this.ctx.lineTo(28, 0);
      this.ctx.stroke();

      // --- Left Solar Panel Array ---
      const panelGradientLeft = this.ctx.createLinearGradient(-48, -12, -14, 12);
      panelGradientLeft.addColorStop(0, '#0284c7');
      panelGradientLeft.addColorStop(0.5, '#0369a1');
      panelGradientLeft.addColorStop(1, '#075985');
      this.ctx.fillStyle = panelGradientLeft;
      this.ctx.fillRect(-48, -11, 26, 22);

      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-48, -11, 26, 22);

      // Left panel grid cells
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.moveTo(-35, -11); this.ctx.lineTo(-35, 11);
      this.ctx.moveTo(-48, 0); this.ctx.lineTo(-22, 0);
      this.ctx.stroke();

      // --- Right Solar Panel Array ---
      const panelGradientRight = this.ctx.createLinearGradient(14, -12, 48, 12);
      panelGradientRight.addColorStop(0, '#0284c7');
      panelGradientRight.addColorStop(0.5, '#0369a1');
      panelGradientRight.addColorStop(1, '#075985');
      this.ctx.fillStyle = panelGradientRight;
      this.ctx.fillRect(22, -11, 26, 22);

      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      this.ctx.strokeRect(22, -11, 26, 22);

      // Right panel grid cells
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.moveTo(35, -11); this.ctx.lineTo(35, 11);
      this.ctx.moveTo(22, 0); this.ctx.lineTo(48, 0);
      this.ctx.stroke();

      // --- Central Satellite Bus / Body ---
      const busGradient = this.ctx.createLinearGradient(-11, -8, 11, 8);
      busGradient.addColorStop(0, '#334155');
      busGradient.addColorStop(0.5, '#1e293b');
      busGradient.addColorStop(1, '#0f172a');
      this.ctx.fillStyle = busGradient;
      this.ctx.fillRect(-11, -8, 22, 16);

      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 1.2;
      this.ctx.strokeRect(-11, -8, 22, 16);

      // Gold foil insulation accent on central chassis
      this.ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
      this.ctx.fillRect(-8, -5, 16, 10);

      // --- Communication Dish & Sensor Mast ---
      this.ctx.strokeStyle = '#cbd5e1';
      this.ctx.lineWidth = 1.4;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -8);
      this.ctx.lineTo(0, -18);
      this.ctx.stroke();

      // Parabolic radar dish
      this.ctx.beginPath();
      this.ctx.arc(0, -19, 7, Math.PI * 0.85, Math.PI * 0.15, true);
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.stroke();

      // --- Ion Thruster Exhaust Flare (Rear) ---
      const flarePulse = Math.random() * 4 + 7;
      const thrusterGrad = this.ctx.createLinearGradient(0, 8, 0, 8 + flarePulse);
      thrusterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      thrusterGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      this.ctx.fillStyle = thrusterGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(-3, 8);
      this.ctx.lineTo(3, 8);
      this.ctx.lineTo(0, 8 + flarePulse);
      this.ctx.closePath();
      this.ctx.fill();

      // --- Blinking Telemetry Beacon Light ---
      const isBeaconOn = (time % sat.beaconInterval) < 320;
      if (isBeaconOn) {
        this.ctx.beginPath();
        this.ctx.arc(0, -2, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = sat.beaconColor;
        this.ctx.shadowColor = sat.beaconColor;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // reset
      }

      this.ctx.restore();

      // --- Telemetry Identification Callsign ---
      this.ctx.font = '9px "JetBrains Mono", monospace';
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      this.ctx.fillText(sat.name, sat.x - 28, sat.y - 24);
    });
  }
}

// Start moving starfield with mini boxes & satellites once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.starfield = new MovingStarfield();
});
