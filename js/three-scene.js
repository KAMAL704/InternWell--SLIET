/**
 * INTERNWELL SLIET - Official 3D Rotating Logo Scene
 * Built with Three.js (r128)
 * Features the authentic club emblem with smooth rotation and subtle lighting
 */

class LogoScene3D {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.emblemGroup = null;
    this.emblemMesh = null;
    this.orbitalRing = null;
    this.particles = null;

    // Interaction & State
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.z = window.innerWidth < 768 ? 20 : 16;

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Lighting tailored for the official logo
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 10);
    this.scene.add(keyLight);

    const blueBacklight = new THREE.PointLight(0x2563eb, 2.5, 30);
    blueBacklight.position.set(-6, -4, -4);
    this.scene.add(blueBacklight);

    const redAccentLight = new THREE.PointLight(0xe11d48, 2.0, 30);
    redAccentLight.position.set(6, -4, 4);
    this.scene.add(redAccentLight);

    // 5. Build 3D Official Logo Emblem
    this.buildLogoEmblem();

    // 6. Build Gentle Ambient Particle Field
    this.buildGentleParticles();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    // 8. Start Animation Loop
    this.animate();
  }

  buildLogoEmblem() {
    this.emblemGroup = new THREE.Group();

    // Position offset on desktop to align beside the hero text
    const isMobile = window.innerWidth < 992;
    this.emblemGroup.position.x = isMobile ? 0 : 3.8;
    this.emblemGroup.position.y = isMobile ? 1.5 : 0;
    this.scene.add(this.emblemGroup);

    // Load official logo texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      './assets/images/logo.png',
      (texture) => {
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        // 3D Medallion / Coin Geometry
        const radius = isMobile ? 3.0 : 3.8;
        const thickness = 0.35;
        const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

        // Materials:
        // Index 0: Rim (sleek metallic dark slate with blue highlight)
        const rimMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.85,
          roughness: 0.25,
          emissive: 0x0f172a
        });

        // Index 1: Front Cap (Official Logo)
        const frontMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.1,
          roughness: 0.4
        });

        // Index 2: Back Cap (Official Logo)
        const backMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.1,
          roughness: 0.4
        });

        this.emblemMesh = new THREE.Mesh(geometry, [rimMaterial, frontMaterial, backMaterial]);
        // Rotate cylinder so caps face the camera
        this.emblemMesh.rotation.x = Math.PI / 2;
        this.emblemGroup.add(this.emblemMesh);

        // Add an elegant glowing outer accent ring (matching logo's red & blue accents)
        const ringGeo = new THREE.TorusGeometry(radius + 0.45, 0.04, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.65
        });
        this.orbitalRing = new THREE.Mesh(ringGeo, ringMat);
        this.orbitalRing.rotation.x = Math.PI / 2.8;
        this.emblemGroup.add(this.orbitalRing);

        // Subtle secondary outer ring
        const ring2Geo = new THREE.TorusGeometry(radius + 0.85, 0.025, 16, 100);
        const ring2Mat = new THREE.MeshBasicMaterial({
          color: 0xe11d48,
          transparent: true,
          opacity: 0.45
        });
        this.orbitalRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
        this.orbitalRing2.rotation.y = Math.PI / 3;
        this.emblemGroup.add(this.orbitalRing2);
      },
      undefined,
      (err) => {
        console.warn('Could not load logo texture in Three.js:', err);
      }
    );
  }

  buildGentleParticles() {
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
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
    this.camera.position.z = width < 768 ? 20 : 16;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    if (this.emblemGroup) {
      const isMobile = width < 992;
      this.emblemGroup.position.x = isMobile ? 0 : 3.8;
      this.emblemGroup.position.y = isMobile ? 1.5 : 0;
    }
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth mouse interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Smooth continuous rotation of the official logo emblem
    if (this.emblemMesh) {
      // Rotate on Y axis (spinning like a coin/medal)
      this.emblemMesh.rotation.z += 0.012; // Z in cylinder local space corresponds to spinning face

      // Gentle floating elevation
      this.emblemMesh.position.y = Math.sin(time * 1.6) * 0.25;

      // Gentle tilt with mouse cursor
      this.emblemGroup.rotation.y = this.mouseX * 0.35;
      this.emblemGroup.rotation.x = -this.mouseY * 0.25;
    }

    // Orbit the outer rings
    if (this.orbitalRing) {
      this.orbitalRing.rotation.z += 0.008;
    }
    if (this.orbitalRing2) {
      this.orbitalRing2.rotation.x += 0.006;
    }

    // Subtle drift on particles
    if (this.particles) {
      this.particles.rotation.y += 0.002;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.logoScene = new LogoScene3D();
});
