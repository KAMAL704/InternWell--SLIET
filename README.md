# 🌐 InternWell SLIET — 3D Animated Technical Website

> **Official Technical & Career Acceleration Cell**  
> *Sant Longowal Institute of Engineering & Technology (SLIET), Punjab*  
> Inspired by the high-tech aesthetics of **CycleOne** & modern WebGL cyber experiences.

---

## ⚡ Live Features

- **🌀 Interactive Three.js 3D WebGL Engine**:
  - Holographic Wireframe Core & Rotating Torus Knot
  - Dual Orbital Gimbal Rings with moving satellite data nodes
  - 1,400+ Particle Constellation field with mouse parallax and scroll rotation
  - Live HUD controls: switch between `CORE`, `GRID`, `STARS`, toggle `WIREFRAME`, and `BOOST` speed!
- **🔊 Procedural Web Audio SFX**:
  - Sci-fi blips, clicks, and success chords generated in real-time via HTML5 Web Audio API (zero audio files needed, instantly responsive!).
  - Mute/Unmute state toggle with live soundwave visualizer.
- **💻 Interactive Cyber Terminal (CLI)**:
  - Try commands: `help`, `about`, `domains`, `events`, `projects`, `stats`, `sliet`, `leads`, `matrix`, `apply`, `contact`, `clear`.
  - Type `matrix` to trigger full-screen digital rain!
- **🚀 College & Club Identity**:
  - **Coding Spardha** (Flagship annual hackathon: *Web-O-Design*, *Code Manthan*, *Dark Code*)
  - **IW Talks** (Keynotes & AMAs with tech leaders at Google, Amazon, Microsoft, and SLIET alumni)
  - **CycleOne Integration** (Highlighting SLIET's IIC-funded smart campus bicycle project)
  - **Domains**: Full-Stack, AI & Data Science, Cloud/DevOps, UI/UX, Competitive Programming, Open Source.
- **📝 Interactive Induction Application Modal**:
  - Interactive form for students to apply with domain selection and cyber confetti confirmation.

---

## 📦 Project Structure

```text
internwell-web/
├── index.html              # Main landing page with 3D canvas and sections
├── 404.html                # Custom cyber 404 fallback page
├── .nojekyll               # Ensures GitHub Pages serves all static assets
├── package.json            # Development preview scripts
├── README.md               # Documentation and deployment guide
├── css/
│   ├── style.css           # Core cyber dark-mode design system
│   └── components.css      # Glitch effects, 3D tilt, HUD, matrix rain
├── js/
│   ├── main.js             # Navigation, modals, tilt physics, toast alerts
│   ├── three-scene.js      # Three.js 3D WebGL scene controller
│   ├── terminal.js         # Interactive UNIX terminal engine
│   └── audio.js            # Procedural Web Audio synthesizer
└── assets/
    ├── favicon.svg         # Custom SVG vector monogram icon
    └── images/
        ├── logo.jpg        # InternWell SLIET official holographic logo
        ├── hackathon.jpg   # Campus hackathon innovation scene
        └── speaker.jpg     # IW Talks auditorium keynote stage
```

---

## 🚀 How to Upload & Deploy to GitHub Pages (2 Minutes)

This website uses **clean static HTML, CSS, JavaScript, and relative paths**, meaning it works **instantly on GitHub Pages** with zero build configuration!

### Option A: Using the Command Line (Git)

1. Open your terminal inside this folder:
   ```bash
   cd "/Users/kamal/internwell web"
   ```

2. Initialize git and commit files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: InternWell SLIET 3D technical website"
   ```

3. Create a new repository on GitHub (e.g. named `internwell-sliet` or `internwell.github.io`).

4. Link the repository and push to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

5. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on **Settings** (⚙️) tab at the top.
   - Click on **Pages** in the left sidebar.
   - Under **Build and deployment** > **Branch**:
     - Select branch: `main`
     - Select folder: `/ (root)`
     - Click **Save**.
   - Within 1–2 minutes, your website will be live at:  
     `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

### Option B: Upload via GitHub Web Interface (No Git CLI needed)

1. Go to [github.com/new](https://github.com/new) and create a repository (e.g. `internwell-web`).
2. Click **"uploading an existing file"**.
3. Drag and drop all files and folders (`index.html`, `404.html`, `.nojekyll`, `css`, `js`, `assets`) into the upload box.
4. Click **Commit changes**.
5. Go to **Settings > Pages**, set Source to `main` branch and `/ (root)` folder, then hit **Save**!

---

## 💻 Running Locally

You can preview the website locally using any of the following:

- **Using Node / npm**:
  ```bash
  npm start
  ```
- **Using Python 3**:
  ```bash
  python3 -m http.server 3000
  ```
  Open `http://localhost:3000` in your web browser.

---

## 📬 Contact & Links

- **Instagram**: [@internwell.sliet](https://www.instagram.com/internwell.sliet)
- **Email**: `internwellclub@gmail.com`
- **Campus**: Sant Longowal Institute of Engineering & Technology, Longowal, Sangrur, Punjab - 148106
