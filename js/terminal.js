/**
 * INTERNWELL SLIET - Interactive Club Console (Terminal)
 */

class CyberTerminal {
  constructor() {
    this.body = document.getElementById('terminal-output');
    this.input = document.getElementById('terminal-input');
    this.history = [];
    this.historyIndex = -1;

    if (!this.input || !this.body) return;

    this.commands = {
      help: () => `
Available club commands:
  • <span style="color:#38bdf8">about</span>       - Learn about InternWell SLIET & socio-startup mission
  • <span style="color:#38bdf8">founders</span>    - Meet the founders (Sachin Korla & Ayush Thakur)
  • <span style="color:#38bdf8">events</span>      - View Coding Spardha, IW Talks & I-MAT
  • <span style="color:#38bdf8">domains</span>     - List technical & design skill tracks
  • <span style="color:#38bdf8">projects</span>    - View SME solutions and student platforms
  • <span style="color:#38bdf8">stats</span>       - Inspect student and placement metrics
  • <span style="color:#38bdf8">leads</span>       - Faculty advisor & student coordinators
  • <span style="color:#38bdf8">apply</span>       - Open the induction application form
  • <span style="color:#38bdf8">contact</span>     - Official email and Instagram handle
  • <span style="color:#38bdf8">clear</span>       - Clear the console screen
`,
      about: () => `
[INTERNWELL SLIET PROFILE]
InternWell is a Socio-Startup and upskilling technical forum at
Sant Longowal Institute of Engineering & Technology (SLIET), Punjab.
• Mission: Empowering SMEs with custom websites and mobile apps developed by talented interns.
• Upskilling: Providing students with real freelancing & industrial experience.
• Faculty Advisor: Dr. A. S. Arora (Professor, Department of EIE)
`,
      founders: () => `
[OUR FOUNDERS]
• Sachin Korla (Founder): Entrepreneurial CS engineer, Rex Karamveer Chakra awardee, Dell Campassador Season 4, Harvard US-India Initiative.
• Ayush Thakur (Founder & Design Head): Creative product designer, Internshala Gold Certificate, MyCampus Store designer.
`,
      domains: () => `
[TECHNICAL & CREATIVE DIVISIONS]
1. Full-Stack Web & App Development (React, Node.js, Next.js, Flutter)
2. Artificial Intelligence & Data Science (PyTorch, Python, Computer Vision)
3. Cloud & DevOps (Docker, Linux, AWS, CI/CD)
4. UI/UX & Creative Design (Figma, Design Systems, Motion Design)
5. Competitive Programming & DSA (C++, Algorithms, LeetCode)
6. Open Source & Event Management
`,
      events: () => `
[SIGNATURE EVENTS]
• <span style="color:#10b981">IW Talks</span>: Guidance and AMA sessions on career, life, and tech roadmaps.
• <span style="color:#10b981">Coding Spardha</span>: Annual hackathon with SSDC (Web-O-Design, Code Manthan, Dark Code).
• <span style="color:#10b981">I-MAT</span>: 100-question competitive mental ability and aptitude test.
• <span style="color:#10b981">Constitution Awareness</span>: Campus buzzer-round social and civic quizzes.
`,
      projects: () => `
[INTERNWELL INITIATIVES]
• <span style="color:#38bdf8">SME Digital Launchpad</span>: Live freelancing websites & web apps built for small enterprises.
• <span style="color:#38bdf8">AlgoSpardha Platform</span>: Automated live contest arena for campus coders.
• <span style="color:#38bdf8">IW Talks Archive</span>: Curated guidance notes and mentorship roadmaps.
• <span style="color:#38bdf8">I-MAT Prep Engine</span>: Objective aptitude question bank for placements.
`,
      stats: () => `
[IMPACT METRICS]
• Students Mentored: 500+
• Industry Internships Secured: 50+
• I-MAT Aptitude Challengers: 100+
• Model: 100% Student-Led Socio-Startup
`,
      leads: () => `
[LEADERSHIP & ADVISORY]
• Faculty Advisor: Dr. A. S. Arora (Professor, Dept of EIE, SLIET)
• Student Coordinators: Siddharth Tiwari, Abhigyan Prashar, Vishal Singh, Saumitra Dwivedi, Monendra Meena, Rajesh Kumar, Suraj Kumar
• Official Email: internwellclub@gmail.com
`,
      apply: () => {
        setTimeout(() => {
          if (window.openInductionModal) window.openInductionModal();
        }, 200);
        return `<span style="color:#10b981">✓ Opening InternWell Induction Form...</span>`;
      },
      contact: () => `
[OFFICIAL CONTACT]
• Email: <a href="mailto:internwellclub@gmail.com" style="color:#38bdf8; text-decoration:underline;">internwellclub@gmail.com</a>
• Instagram: <a href="https://www.instagram.com/internwell.sliet" target="_blank" style="color:#38bdf8; text-decoration:underline;">@internwell.sliet</a>
• Campus: SLIET Longowal, Sangrur, Punjab - 148106
`,
      clear: () => {
        this.body.innerHTML = '';
        return null;
      }
    };

    this.initListeners();
  }

  initListeners() {
    this.input.addEventListener('keydown', (e) => {
      if (window.cyberAudio) window.cyberAudio.playKeypress();

      if (e.key === 'Enter') {
        const raw = this.input.value.trim();
        if (raw) {
          this.executeCommand(raw);
          this.history.push(raw);
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      }
    });

    document.querySelectorAll('.terminal-hint-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const cmd = pill.getAttribute('data-cmd') || pill.textContent.trim();
        this.executeCommand(cmd);
        if (window.cyberAudio) window.cyberAudio.playBlip();
      });
    });
  }

  executeCommand(cmdLine) {
    const parts = cmdLine.toLowerCase().split(' ');
    const mainCmd = parts[0];

    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-output-line';
    promptLine.innerHTML = `<span style="color:#38bdf8">guest@internwell:~$</span> ${cmdLine}`;
    this.body.appendChild(promptLine);

    if (this.commands[mainCmd]) {
      const result = this.commands[mainCmd]();
      if (result !== null) {
        this.printOutput(result);
      }
    } else {
      this.printOutput(`Command not recognized: "${mainCmd}". Type <span style="color:#38bdf8">help</span> for list.`, 'error');
    }

    this.scrollToBottom();
  }

  printOutput(html, type = '') {
    const line = document.createElement('div');
    line.className = `terminal-output-line ${type}`;
    line.innerHTML = html;
    this.body.appendChild(line);
  }

  scrollToBottom() {
    this.body.scrollTop = this.body.scrollHeight;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.cyberTerminal = new CyberTerminal();
});
