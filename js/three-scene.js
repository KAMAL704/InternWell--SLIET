/**
 * INTERNWELL SLIET - Official 3D Rotating Logo Scene
 * Built with Three.js (r128)
 * Mounted directly inside #hero-logo-stage to ensure ZERO text overlap on mobile and desktop!
 */

class LogoScene3D {
  constructor() {
    this.container = document.getElementById('hero-logo-stage');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.emblemGroup = null;
    this.emblemMesh = null;
    this.orbitalRing = null;
    this.orbitalRing2 = null;

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

    // 2. Camera setup based on container dimensions
    const width = this.container.clientWidth || 320;
    const height = this.container.clientHeight || 260;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.z = window.innerWidth < 768 ? 13.5 : 12.0;

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting tailored for the official logo
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 10);
    this.scene.add(keyLight);

    const blueLight = new THREE.PointLight(0x2563eb, 2.0, 30);
    blueLight.position.set(-6, -4, 4);
    this.scene.add(blueLight);

    const redLight = new THREE.PointLight(0xe11d48, 1.8, 30);
    redLight.position.set(6, 4, 4);
    this.scene.add(redLight);

    // 5. Build 3D Official Logo Emblem
    this.buildLogoEmblem();

    // 6. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));

    // Initial scroll check
    this.onScroll();

    // 7. Start Animation Loop
    this.animate();
  }

  onScroll() {
    if (!this.container) return;
    const scrollY = window.scrollY;
    // As user scrolls past 50px, smoothly fade out the 3D logo
    if (scrollY > 50) {
      const opacity = Math.max(0, 1 - (scrollY - 50) / 260);
      this.container.style.opacity = opacity.toFixed(2);
      this.container.style.pointerEvents = opacity <= 0.05 ? 'none' : 'auto';
    } else {
      this.container.style.opacity = '1';
      this.container.style.pointerEvents = 'auto';
    }
  }

  buildLogoEmblem() {
    this.emblemGroup = new THREE.Group();
    this.scene.add(this.emblemGroup);

    // Load official logo texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      './assets/images/logo.png',
      (texture) => {
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const radius = window.innerWidth < 768 ? 2.6 : 3.2;
        const thickness = 0.3;
        const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

        // Materials:
        // Index 0: Rim (metallic dark slate)
        const rimMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.85,
          roughness: 0.25,
          emissive: 0x0f172a
        });

        // Index 1: Front Cap (Official Logo)
        const capMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.08,
          roughness: 0.35
        });

        this.emblemMesh = new THREE.Mesh(geometry, [rimMaterial, capMaterial, capMaterial]);
        // Rotate cylinder so caps face the camera
        this.emblemMesh.rotation.x = Math.PI / 2;
        this.emblemGroup.add(this.emblemMesh);

        // Accent outer rings (matching logo's blue & red)
        const ringGeo = new THREE.TorusGeometry(radius + 0.35, 0.035, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.7
        });
        this.orbitalRing = new THREE.Mesh(ringGeo, ringMat);
        this.orbitalRing.rotation.x = Math.PI / 2.8;
        this.emblemGroup.add(this.orbitalRing);

        const ring2Geo = new THREE.TorusGeometry(radius + 0.65, 0.02, 16, 100);
        const ring2Mat = new THREE.MeshBasicMaterial({
          color: 0xe11d48,
          transparent: true,
          opacity: 0.5
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

  onResize() {
    if (!this.camera || !this.renderer || !this.container) return;
    const width = this.container.clientWidth || 320;
    const height = this.container.clientHeight || 260;

    this.camera.aspect = width / height;
    this.camera.position.z = window.innerWidth < 768 ? 13.5 : 12.0;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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

    // Smooth 3D spinning rotation
    if (this.emblemMesh) {
      this.emblemMesh.rotation.z += 0.012;
      this.emblemMesh.position.y = Math.sin(time * 1.5) * 0.15;

      this.emblemGroup.rotation.y = this.mouseX * 0.25;
      this.emblemGroup.rotation.x = -this.mouseY * 0.2;
    }

    if (this.orbitalRing) {
      this.orbitalRing.rotation.z += 0.008;
    }
    if (this.orbitalRing2) {
      this.orbitalRing2.rotation.x += 0.006;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.logoScene = new LogoScene3D();
});
