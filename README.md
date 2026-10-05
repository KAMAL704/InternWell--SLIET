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
- **📝 Production Student Registration & Induction System**:
  - Full data collection: Full Name, Roll No, Email, Phone, Department, Year/Semester, Domain, Skills, Internship details, Availability duration, Resume/Profile links, and Statement.
  - Real-time client-side validation for email formats, 10-digit mobile numbers, and required fields.
  - Serverless PostgreSQL backend powered by **Supabase** with automatic timestamps.
  - **Duplicate prevention**: Unique constraints on both College Roll Number and Email.
  - Real-time loading spinner with double-submission protection.
- **🛡️ Authenticated Admin Portal (`admin.html`)**:
  - Securely protected via Supabase Auth (JWT credentials).
  - Live KPI stats counters: Total Applications, Pending, Approved, Rejected.
  - Real-time search by name, roll no, email, or skill keywords.
  - Filtering by Department and Application Status.
  - Full dossier modal view with status updater (Pending -> Approved / Rejected / Completed).
  - One-click **Export to CSV** for offline spreadsheet analysis.
  - Strict Row Level Security (RLS): Public anonymous users can only submit registrations; only authenticated admins can view and modify student data.

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

## 🗄️ Backend & Database Setup (Supabase)

The backend uses **Supabase** (PostgreSQL + REST API + Row Level Security), which works directly with GitHub Pages without any server or backend maintenance.

### 1. Database Schema
Execute [`supabase_schema.sql`](file:///Users/kamal/internwell%20web/supabase_schema.sql) in your Supabase SQL Editor:
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (e.g. `uhnkxgocnihflutwshsg`)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**, paste the complete contents of `supabase_schema.sql`, and click **Run** (▶️)
5. This automatically generates the `registrations` table, indexes, triggers, and Row Level Security (RLS) policies.

### 2. Client Configuration
Your Supabase credentials are configured in [`js/supabase-config.js`](file:///Users/kamal/internwell%20web/js/supabase-config.js):
- **Project URL**: `https://uhnkxgocnihflutwshsg.supabase.co`
- **Anon Public Key**: Configured in `js/supabase-config.js` (safe for public frontend with RLS enabled)

### 3. Create Admin User
To access the Admin Portal (`/admin.html`):
1. In your Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add User** > **Create User**
3. Enter your admin email and secure password
4. You can now log into `/admin.html` with this account to view registrations, change applicant statuses, and export data to CSV.

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
