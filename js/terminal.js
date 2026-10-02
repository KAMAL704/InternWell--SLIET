/**
 * INTERNWELL SLIET - Interactive Cyber Terminal
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
Available system commands:
  • <span style="color:#00f2fe">about</span>       - Learn about InternWell SLIET & mission
  • <span style="color:#00f2fe">domains</span>     - List technical domains & skill tracks
  • <span style="color:#00f2fe">events</span>      - Display flagship events & Coding Spardha
  • <span style="color:#00f2fe">projects</span>    - View innovation lab projects (CycleOne, etc.)
  • <span style="color:#00f2fe">stats</span>       - Inspect campus placement & member metrics
  • <span style="color:#00f2fe">sliet</span>       - Details about SLIET Longowal campus
  • <span style="color:#00f2fe">leads</span>       - Faculty advisor & core coordinators
  • <span style="color:#00f2fe">apply</span>       - Open the 2024-2025 induction application modal
  • <span style="color:#00f2fe">matrix</span>      - Trigger digital matrix cyber rain
  • <span style="color:#00f2fe">3d [mode]</span>   - Switch 3D scene: 'core', 'grid', or 'constellation'
  • <span style="color:#00f2fe">contact</span>     - Official email and Instagram handle
  • <span style="color:#00f2fe">clear</span>       - Clear the terminal screen
`,
      about: () => `
[INTERNWELL SLIET PROFILE]
InternWell is the premier technical & career acceleration cell of 
Sant Longowal Institute of Engineering & Technology (SLIET), Punjab.
• Founded under the aegis of Dean (Student-Faculty Welfare) & IIC SLIET
• Objective: Bridging collegiate academics and high-tier engineering careers
• Pillars: High-impact technical projects, internships, hackathons & community mentorship
`,
      domains: () => `
[TECHNICAL DOMAINS]
1. Full-Stack Web & Mobile Engineering (React, Next.js, Node, Go, Flutter)
2. Artificial Intelligence & Data Science (PyTorch, LLMs, Computer Vision)
3. Cloud, DevOps & Distributed Systems (Docker, Kubernetes, AWS, CI/CD)
4. UI/UX & Human-Computer Interaction (Figma, Design Systems, 3D Web)
5. Competitive Programming & Data Structures (C++, Codeforces, LeetCode)
6. Open-Source Software & Systems Engineering
`,
      events: () => `
[FLAGSHIP EVENTS]
• <span style="color:#00f5a0">Coding Spardha</span>: Annual multi-track hackathon (Web-O-Design, Code Manthan, Dark Code)
• <span style="color:#00f5a0">IW Talks</span>: Fireside tech chats with leaders at Google, Amazon, Microsoft & Unicorns
• <span style="color:#00f5a0">IW-SoC</span>: Open-Source Summer of Code for SLIET campus utilities
• <span style="color:#00f5a0">Internship Accelerator Bootcamp</span>: Resume reviews, referrals & mock interviews
`,
      projects: () => `
[INNOVATION LAB HIGHLIGHTS]
• <span style="color:#00f2fe">CycleOne IoT Telemetry</span>: Smart bike-sharing IoT platform (SLIET funded)
• <span style="color:#00f2fe">SLIET Campus Central</span>: Notes, pyqs, campus maps & academic resources
• <span style="color:#00f2fe">AlgoSpardha</span>: Automated contest leaderboard for SLIET programmers
• <span style="color:#00f2fe">InternRadar</span>: Aggregated tech internships & referral matching engine
`,
      stats: () => `
[INTERNWELL IMPACT METRICS]
• Active Student Members: 500+
• Tier-1 Internships Cracked: 50+
• Campus Hackathons & Sprints: 12+
• Industry Mentors & Alumni Network: 80+
• Placement Acceleration: 100% Student-Driven
`,
      sliet: () => `
[INSTITUTE DATA]
Sant Longowal Institute of Engineering & Technology (SLIET)
• Status: Deemed-to-be-University (Ministry of Education, Govt. of India)
• Coordinates: 30.2244° N, 75.6881° E | Longowal, Sangrur, Punjab 148106
• Campus: 451 acres lush green technological hub
`,
      leads: () => `
[LEADERSHIP & ADVISORY]
• Faculty Advisor: Dr. A. S. Arora (Professor, EIE Dept, SLIET)
• Student Coordinators: Technical Leads, Domain Mentors, PR & Design Heads
• Contact: internwellclub@gmail.com
`,
      apply: () => {
        setTimeout(() => {
          if (window.openInductionModal) window.openInductionModal();
        }, 300);
        return `<span style="color:#00f5a0">✓ Opening InternWell Induction Form...</span>`;
      },
      contact: () => `
[COMMUNICATION CHANNELS]
• Official Email: <a href="mailto:internwellclub@gmail.com" style="color:#00f2fe; text-decoration:underline;">internwellclub@gmail.com</a>
• Instagram: <a href="https://www.instagram.com/internwell.sliet" target="_blank" style="color:#00f2fe; text-decoration:underline;">@internwell.sliet</a>
• Location: SLIET Longowal, Sangrur, Punjab - 148106
`,
      clear: () => {
        this.body.innerHTML = '';
        return null;
      },
      matrix: () => {
        if (window.startMatrixRain) window.startMatrixRain();
        return `<span style="color:#00f5a0">⚡ Neural Matrix Digital Rain Initialized. Press ESC or click Exit to return.</span>`;
      },
      sudo: () => `<span style="color:#ff5f56">Permission denied: You are already in superuser student mode! 😉</span>`
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

    // Handle Quick Hint Pill clicks
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
    const arg = parts[1];

    // Print command user typed
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-output-line';
    promptLine.innerHTML = `<span style="color:#00f2fe">guest@internwell:~$</span> ${cmdLine}`;
    this.body.appendChild(promptLine);

    // 3D custom command handler
    if (mainCmd === '3d') {
      if (['core', 'grid', 'constellation'].includes(arg) && window.techScene) {
        window.techScene.setMode(arg);
        this.printOutput(`3D Scene mode switched to: <span style="color:#00f2fe">${arg}</span>`);
      } else {
        this.printOutput(`Usage: 3d [core | grid | constellation]`, 'error');
      }
      this.scrollToBottom();
      return;
    }

    // Standard commands
    if (this.commands[mainCmd]) {
      const result = this.commands[mainCmd]();
      if (result !== null) {
        this.printOutput(result);
      }
    } else {
      this.printOutput(`Command not recognized: "${mainCmd}". Type <span style="color:#00f2fe">help</span> for command list.`, 'error');
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
