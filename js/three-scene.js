/**
 * INTERNWELL SLIET - 3D WebGL Technical Experience
 * Built with Three.js (r128)
 */

class TechScene3D {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // 3D Objects
    this.mainGroup = null;
    this.innerCore = null;
    this.outerSphere = null;
    this.orbitalRing1 = null;
    this.orbitalRing2 = null;
    this.satelliteNodes = [];
    this.particles = null;
    this.cyberGrid = null;

    // Interaction & State
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.currentMode = 'core'; // 'core', 'grid', 'constellation'
    this.isWireframe = true;
    this.speedMultiplier = 1.0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06090f, 0.025);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
    this.camera.position.z = 24;

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    this.scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x00f2fe, 3, 50);
    pointLightCyan.position.set(10, 10, 10);
    this.scene.add(pointLightCyan);

    const pointLightPurple = new THREE.PointLight(0x7928ca, 3, 50);
    pointLightPurple.position.set(-10, -10, 10);
    this.scene.add(pointLightPurple);

    // 5. Build 3D Core System
    this.buildCoreSystem();

    // 6. Build Cyber Wave Grid (for mode 2)
    this.buildCyberGrid();

    // 7. Build Particle Field
    this.buildParticles();

    // 8. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));

    // 9. Start Animation Loop
    this.animate();
  }

  buildCoreSystem() {
    this.mainGroup = new THREE.Group();
    // Offset slightly to the right on desktop for perfect balance with hero text
    if (window.innerWidth > 992) {
      this.mainGroup.position.x = 4.2;
    }
    this.scene.add(this.mainGroup);

    // A. Inner Torus Knot (Holographic core)
    const knotGeo = new THREE.TorusKnotGeometry(3.2, 0.9, 128, 32);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x006699,
      wireframe: this.isWireframe,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    this.innerCore = new THREE.Mesh(knotGeo, knotMat);
    this.mainGroup.add(this.innerCore);

    // B. Outer Polyhedral Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(6.2, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x4facfe,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    this.outerSphere = new THREE.Mesh(outerGeo, outerMat);
    this.mainGroup.add(this.outerSphere);

    // C. Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(8.2, 0.06, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.7
    });
    this.orbitalRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.orbitalRing1.rotation.x = Math.PI / 3;
    this.mainGroup.add(this.orbitalRing1);

    // D. Orbital Ring 2
    const ring2Geo = new THREE.TorusGeometry(9.6, 0.05, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x7928ca,
      transparent: true,
      opacity: 0.65
    });
    this.orbitalRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.orbitalRing2.rotation.y = Math.PI / 4;
    this.orbitalRing2.rotation.x = -Math.PI / 5;
    this.mainGroup.add(this.orbitalRing2);

    // E. Satellite Data Nodes orbiting along the rings
    for (let i = 0; i < 4; i++) {
      const satGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00f2fe : 0x00f5a0,
        emissive: i % 2 === 0 ? 0x00f2fe : 0x00f5a0,
        emissiveIntensity: 0.8
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = {
        radius: 8.2 + (i % 2) * 1.4,
        speed: 0.8 + (i * 0.25),
        angle: (i * Math.PI) / 2,
        ring: i % 2
      };
      this.satelliteNodes.push(sat);
      this.mainGroup.add(sat);
    }
  }

  buildCyberGrid() {
    // 3D undulating terrain mesh for "Quantum Grid" mode
    const gridGeo = new THREE.PlaneGeometry(60, 60, 48, 48);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    this.cyberGrid = new THREE.Mesh(gridGeo, gridMat);
    this.cyberGrid.rotation.x = -Math.PI / 2.3;
    this.cyberGrid.position.set(0, -7, 0);
    this.cyberGrid.visible = false;
    this.scene.add(this.cyberGrid);
  }

  buildParticles() {
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f2fe);
    const color2 = new THREE.Color(0x7928ca);
    const color3 = new THREE.Color(0x00f5a0);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      // Color variation
      const rand = Math.random();
      const chosenColor = rand < 0.5 ? color1 : (rand < 0.8 ? color2 : color3);
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.mainGroup) {
      this.mainGroup.position.x = width > 992 ? 4.2 : 0;
    }
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onScroll() {
    const scrollY = window.scrollY;
    if (this.mainGroup) {
      this.mainGroup.rotation.y = scrollY * 0.002;
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    if (mode === 'core') {
      this.mainGroup.visible = true;
      this.cyberGrid.visible = false;
      this.particles.material.size = 0.18;
    } else if (mode === 'grid') {
      this.mainGroup.visible = false;
      this.cyberGrid.visible = true;
      this.particles.material.size = 0.15;
    } else if (mode === 'constellation') {
      this.mainGroup.visible = false;
      this.cyberGrid.visible = false;
      this.particles.material.size = 0.35;
    }
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    if (this.innerCore) {
      this.innerCore.material.wireframe = this.isWireframe;
    }
    return this.isWireframe;
  }

  toggleSpeed() {
    this.speedMultiplier = this.speedMultiplier === 1.0 ? 2.5 : 1.0;
    return this.speedMultiplier;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Rotate Main Holographic Core
    if (this.mainGroup && this.mainGroup.visible) {
      this.innerCore.rotation.x += 0.4 * delta * this.speedMultiplier;
      this.innerCore.rotation.y += 0.6 * delta * this.speedMultiplier;

      this.outerSphere.rotation.x -= 0.15 * delta * this.speedMultiplier;
      this.outerSphere.rotation.z += 0.2 * delta * this.speedMultiplier;

      this.orbitalRing1.rotation.z += 0.5 * delta * this.speedMultiplier;
      this.orbitalRing2.rotation.z -= 0.4 * delta * this.speedMultiplier;

      // Animate Satellite Data Nodes
      this.satelliteNodes.forEach((sat) => {
        sat.userData.angle += sat.userData.speed * delta * this.speedMultiplier;
        const rad = sat.userData.radius;
        const a = sat.userData.angle;

        if (sat.userData.ring === 0) {
          sat.position.x = Math.cos(a) * rad;
          sat.position.y = Math.sin(a) * rad * Math.cos(Math.PI / 3);
          sat.position.z = Math.sin(a) * rad * Math.sin(Math.PI / 3);
        } else {
          sat.position.x = Math.cos(a) * rad * Math.cos(Math.PI / 4);
          sat.position.y = Math.sin(a) * rad;
          sat.position.z = Math.cos(a) * rad * Math.sin(Math.PI / 4);
        }
        sat.rotation.x += 0.02;
        sat.rotation.y += 0.02;
      });

      // Mouse Parallax on core
      this.mainGroup.rotation.y = this.mouseX * 0.5;
      this.mainGroup.rotation.x = -this.mouseY * 0.4;
    }

    // Animate Cyber Grid (if visible)
    if (this.cyberGrid && this.cyberGrid.visible) {
      const pos = this.cyberGrid.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const z = Math.sin(u * 0.3 + time * 2) * Math.cos(v * 0.3 + time * 1.5) * 1.8;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      this.cyberGrid.rotation.z += 0.05 * delta;
    }

    // Gentle Drift on Particles
    if (this.particles) {
      this.particles.rotation.y += 0.05 * delta * this.speedMultiplier;
      this.particles.rotation.x += 0.02 * delta;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.techScene = new TechScene3D();
});
