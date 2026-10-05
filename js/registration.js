/**
 * INTERNWELL SLIET - Registration, Authentication & Student Dashboard Controller
 * Supports:
 * 1. Account creation with password requirement
 * 2. Tab switching between Registration and Student Login
 * 3. Secure student login via Supabase Auth + local session caching
 * 4. Personalized Student Profile Dossier with live status & slip printing
 * 5. Sign-out functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationAndAuthSystem();
  initStudentDashboardSystem();
});

let currentStudentSession = null;

function initRegistrationAndAuthSystem() {
  const modal = document.getElementById('induction-modal');
  const regForm = document.getElementById('induction-form');
  const loginForm = document.getElementById('student-login-form');
  const tabBtnRegister = document.getElementById('tab-btn-register');
  const tabBtnLogin = document.getElementById('tab-btn-login');
  const linkSwitchToRegister = document.getElementById('link-switch-to-register');

  const regSubmitBtn = document.getElementById('induction-submit-btn');
  const loginSubmitBtn = document.getElementById('student-login-btn');
  const regAlertBox = document.getElementById('form-status-alert');
  const loginAlertBox = document.getElementById('login-status-alert');

  const modalTitle = document.getElementById('modal-heading-title');
  const modalSubtitle = document.getElementById('modal-heading-subtitle');
  const modalTagText = document.getElementById('modal-tag-text');

  // Input sanitizers
  const regEmailInput = document.getElementById('applicant-email');
  const regPhoneInput = document.getElementById('applicant-phone');
  const regRollInput = document.getElementById('applicant-roll');

  if (regEmailInput) {
    regEmailInput.addEventListener('input', () => {
      regEmailInput.value = regEmailInput.value.trim().toLowerCase();
    });
  }
  if (regRollInput) {
    regRollInput.addEventListener('input', () => {
      regRollInput.value = regRollInput.value.trim();
    });
  }
  if (regPhoneInput) {
    regPhoneInput.addEventListener('input', () => {
      regPhoneInput.value = regPhoneInput.value.replace(/[^\d+]/g, '');
    });
  }

  // 1. Tab Switching Logic
  function switchToRegisterTab() {
    if (tabBtnRegister) tabBtnRegister.classList.add('active');
    if (tabBtnLogin) tabBtnLogin.classList.remove('active');
    if (regForm) regForm.style.display = 'block';
    if (loginForm) loginForm.style.display = 'none';

    if (modalTitle) modalTitle.textContent = 'Join InternWell SLIET';
    if (modalSubtitle) modalSubtitle.textContent = 'Step into our socio-startup & upskilling forum. Fill out your details below to begin.';
    if (modalTagText) modalTagText.textContent = 'RECRUITMENT // INDUCTIONS';

    hideAlerts();
  }

  function switchToLoginTab() {
    if (tabBtnLogin) tabBtnLogin.classList.add('active');
    if (tabBtnRegister) tabBtnRegister.classList.remove('active');
    if (regForm) regForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';

    if (modalTitle) modalTitle.textContent = 'Student Portal Login';
    if (modalSubtitle) modalSubtitle.textContent = 'Sign in with your registered Email ID and password to access your induction dashboard.';
    if (modalTagText) modalTagText.textContent = 'STUDENT AUTHENTICATION';

    hideAlerts();

    const emailInp = document.getElementById('student-login-email');
    if (emailInp && !emailInp.value) {
      emailInp.focus();
    }
  }

  if (tabBtnRegister) tabBtnRegister.addEventListener('click', switchToRegisterTab);
  if (tabBtnLogin) tabBtnLogin.addEventListener('click', switchToLoginTab);
  if (linkSwitchToRegister) {
    linkSwitchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchToRegisterTab();
    });
  }

  window.openStudentLoginModal = function() {
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      switchToLoginTab();
      if (window.cyberAudio && typeof window.cyberAudio.playBlip === 'function') {
        window.cyberAudio.playBlip();
      }
    }
  };

  window.openStudentRegisterModal = function() {
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      switchToRegisterTab();
      if (window.cyberAudio && typeof window.cyberAudio.playBlip === 'function') {
        window.cyberAudio.playBlip();
      }
    }
  };

  // 2. Handle Registration Submission
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlerts();

      const fullName = document.getElementById('applicant-name')?.value.trim() || '';
      const rollNo = document.getElementById('applicant-roll')?.value.trim() || '';
      const email = document.getElementById('applicant-email')?.value.trim().toLowerCase() || '';
      const phone = document.getElementById('applicant-phone')?.value.trim() || '';
      const department = document.getElementById('applicant-dept')?.value || '';
      const yearSemester = document.getElementById('applicant-year')?.value || '';
      const domainInterest = document.getElementById('applicant-domain')?.value || '';
      const skills = document.getElementById('applicant-skills')?.value.trim() || '';
      const internshipDetails = document.getElementById('applicant-internship')?.value.trim() || '';
      const internshipDuration = document.getElementById('applicant-duration')?.value.trim() || '';
      const profileLinks = document.getElementById('applicant-links')?.value.trim() || '';
      const applicantNote = document.getElementById('applicant-note')?.value.trim() || '';
      const password = document.getElementById('applicant-password')?.value || '';

      // Validation
      const errorMsg = validateRegistrationData({
        fullName,
        rollNo,
        email,
        phone,
        department,
        yearSemester,
        domainInterest,
        password
      });

      if (errorMsg) {
        showRegAlert(errorMsg, 'error');
        if (window.cyberAudio) window.cyberAudio.playHover();
        return;
      }

      setRegLoading(true);

      const payload = {
        full_name: fullName,
        roll_no: rollNo,
        email: email,
        phone: phone,
        department: department,
        year_semester: yearSemester,
        domain_interest: domainInterest,
        skills: skills,
        internship_details: internshipDetails,
        internship_duration: internshipDuration,
        profile_links: profileLinks,
        resume_url: profileLinks,
        applicant_note: applicantNote,
        status: 'Pending',
        created_at: new Date().toISOString()
      };

      try {
        const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;

        if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
          // A. Attempt to create user in Supabase Auth
          try {
            await supabase.auth.signUp({
              email: email,
              password: password,
              options: {
                data: {
                  full_name: fullName,
                  roll_no: rollNo
                }
              }
            });
          } catch (authErr) {
            console.warn('[Supabase Auth SignUp notice]', authErr);
          }

          // B. Insert into public.registrations
          const { error: dbError } = await supabase
            .from('registrations')
            .insert([payload]);

          if (dbError) {
            handleSubmissionError(dbError);
            return;
          }
        } else {
          // Local demo storage fallback
          await submitToLocalStorage(payload);
        }

        // Cache local credentials for seamless login
        saveLocalCredentials(email, rollNo, password, payload);

        // Success Action:
        regForm.reset();
        showRegAlert(`✨ Registration successful! Welcome, ${fullName}. Please log in with your email & password below to access your dashboard.`, 'success');

        if (window.triggerConfetti) window.triggerConfetti();
        if (window.cyberAudio && window.cyberAudio.playSuccess) window.cyberAudio.playSuccess();

        // Switch to login tab and prefill email
        setTimeout(() => {
          switchToLoginTab();
          const loginEmail = document.getElementById('student-login-email');
          if (loginEmail) loginEmail.value = email;
          const loginPass = document.getElementById('student-login-password');
          if (loginPass) {
            loginPass.value = '';
            loginPass.focus();
          }
          showLoginAlert(`Registration recorded for ${fullName}! Please enter your password to enter your dashboard.`, 'success');
        }, 1600);

      } catch (err) {
        console.error('[Registration General Error]', err);
        showRegAlert('Unable to complete registration. Please check your network connection and try again.', 'error');
      } finally {
        setRegLoading(false);
      }
    });
  }

  // 3. Handle Student Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlerts();

      const emailOrRoll = (document.getElementById('student-login-email')?.value || '').trim().toLowerCase();
      const password = document.getElementById('student-login-password')?.value || '';

      if (!emailOrRoll || !password) {
        showLoginAlert('Please enter both your registered Email/Roll No and Password.', 'error');
        return;
      }

      setLoginLoading(true);

      try {
        const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
        let authenticatedProfile = null;

        // Method A: Check local credentials first
        const localCreds = getLocalCredentials();
        const matchesLocal = localCreds && 
          (localCreds.email.toLowerCase() === emailOrRoll || localCreds.rollNo.toLowerCase() === emailOrRoll) &&
          localCreds.passwordHash === btoa(password);

        if (matchesLocal) {
          authenticatedProfile = localCreds.profile;
        }

        // Method B: Authenticate with Supabase
        if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
          // If input is an email, try Supabase Auth
          if (emailOrRoll.includes('@')) {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email: emailOrRoll,
              password: password
            });

            if (!authError && authData && authData.user) {
              // Authenticated! Fetch latest registration record from database
              const { data: regRows } = await supabase
                .from('registrations')
                .select('*')
                .eq('email', emailOrRoll)
                .order('created_at', { ascending: false })
                .limit(1);

              if (regRows && regRows.length > 0) {
                authenticatedProfile = regRows[0];
              }
            }
          }

          // If not yet authenticated, try RPC status lookup if password matched local or basic check
          if (!authenticatedProfile && matchesLocal) {
            const { data: rpcRows } = await supabase.rpc('check_registration_status', {
              search_query: emailOrRoll
            });
            if (rpcRows && rpcRows.length > 0) {
              authenticatedProfile = rpcRows[0];
            }
          }
        }

        if (authenticatedProfile) {
          // Successful Login!
          loginForm.reset();
          loginStudentSession(authenticatedProfile);

          if (window.cyberAudio && window.cyberAudio.playSuccess) window.cyberAudio.playSuccess();
          if (typeof window.closeInductionModal === 'function') {
            window.closeInductionModal();
          }

          // Open Student Dashboard!
          setTimeout(() => {
            if (typeof window.openStudentProfileModal === 'function') {
              window.openStudentProfileModal(authenticatedProfile);
            }
          }, 300);

        } else {
          showLoginAlert('Invalid Email or Password. Please check your credentials or click "Submit New Application" to register.', 'error');
          if (window.cyberAudio && window.cyberAudio.playHover) window.cyberAudio.playHover();
        }

      } catch (err) {
        console.error('[Student Login Error]', err);
        showLoginAlert('An error occurred during authentication. Please try again.', 'error');
      } finally {
        setLoginLoading(false);
      }
    });
  }

  // Helpers
  function validateRegistrationData(data) {
    if (!data.fullName || data.fullName.length < 2) {
      return 'Please enter your complete Full Name (minimum 2 characters).';
    }
    if (!data.rollNo || data.rollNo.length < 3) {
      return 'Please enter a valid College Registration / Roll Number.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return 'Please enter a valid email address (e.g. name.roll@sliet.ac.in).';
    }
    const phoneClean = data.phone.replace(/[^\d]/g, '');
    if (!data.phone || phoneClean.length < 10 || phoneClean.length > 13) {
      return 'Please enter a valid 10-digit phone / WhatsApp number.';
    }
    if (!data.department) {
      return 'Please select your Department / Branch.';
    }
    if (!data.yearSemester) {
      return 'Please select your Year / Semester.';
    }
    if (!data.domainInterest) {
      return 'Please select your primary Domain of Interest.';
    }
    if (!data.password || data.password.length < 6) {
      return 'Please create a secure password (minimum 6 characters) so you can log into your student dashboard.';
    }
    return null;
  }

  function setRegLoading(isLoading) {
    if (!regSubmitBtn) return;
    if (isLoading) {
      regSubmitBtn.disabled = true;
      regSubmitBtn.setAttribute('data-original-html', regSubmitBtn.innerHTML);
      regSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Application...';
      regSubmitBtn.style.opacity = '0.75';
    } else {
      regSubmitBtn.disabled = false;
      const orig = regSubmitBtn.getAttribute('data-original-html');
      if (orig) regSubmitBtn.innerHTML = orig;
      regSubmitBtn.style.opacity = '1';
    }
  }

  function setLoginLoading(isLoading) {
    if (!loginSubmitBtn) return;
    if (isLoading) {
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.setAttribute('data-original-html', loginSubmitBtn.innerHTML);
      loginSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
      loginSubmitBtn.style.opacity = '0.75';
    } else {
      loginSubmitBtn.disabled = false;
      const orig = loginSubmitBtn.getAttribute('data-original-html');
      if (orig) loginSubmitBtn.innerHTML = orig;
      loginSubmitBtn.style.opacity = '1';
    }
  }

  function showRegAlert(msg, type = 'error') {
    if (!regAlertBox) return;
    regAlertBox.className = `form-status-alert ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
    regAlertBox.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    regAlertBox.style.display = 'flex';
  }

  function showLoginAlert(msg, type = 'error') {
    if (!loginAlertBox) return;
    loginAlertBox.className = `form-status-alert ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
    loginAlertBox.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    loginAlertBox.style.display = 'flex';
  }

  function hideAlerts() {
    if (regAlertBox) regAlertBox.style.display = 'none';
    if (loginAlertBox) loginAlertBox.style.display = 'none';
  }

  function handleSubmissionError(error) {
    console.error('[Supabase Insert Error]:', error);
    const isDuplicate =
      error.code === '23505' ||
      (error.message && error.message.toLowerCase().includes('unique')) ||
      (error.message && error.message.toLowerCase().includes('duplicate'));

    if (isDuplicate) {
      showRegAlert(
        '⚠️ Registration already exists with this Email or Roll Number. Click "Student Login" tab above to sign in.',
        'error'
      );
    } else {
      showRegAlert(error.message || 'Unable to submit registration. Please try again.', 'error');
    }
  }

  async function submitToLocalStorage(payload) {
    await new Promise((r) => setTimeout(r, 400));
    const key = 'iw_demo_registrations';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const isDupRoll = existing.some((r) => r.roll_no.toLowerCase() === payload.roll_no.toLowerCase());
    const isDupEmail = existing.some((r) => r.email.toLowerCase() === payload.email.toLowerCase());

    if (isDupRoll || isDupEmail) {
      throw { code: '23505', message: 'duplicate key' };
    }
    payload.id = 'demo-' + Date.now();
    existing.unshift(payload);
    localStorage.setItem(key, JSON.stringify(existing));
    return payload;
  }
}

/**
 * ============================================================================
 * STUDENT DASHBOARD & PROFILE CONTROLLER
 * ============================================================================
 */
function initStudentDashboardSystem() {
  const profileModal = document.getElementById('student-profile-modal');
  const closeProfileBtn = document.getElementById('profile-modal-close-btn');
  const doneProfileBtn = document.getElementById('btn-done-profile-view');
  const printProfileBtn = document.getElementById('btn-print-profile-slip');
  const studentLogoutBtn = document.getElementById('btn-student-logout');

  const navLoginBtn = document.getElementById('btn-student-login-nav');
  const navDashboardBtn = document.getElementById('btn-student-dashboard-nav');
  const navDashboardText = document.getElementById('nav-dashboard-name-text');

  // Check existing session on boot
  checkActiveStudentSession();

  // Open Profile Modal function
  window.openStudentProfileModal = function(profile) {
    if (!profileModal || !profile) return;

    const initials = (profile.full_name || 'IW')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'IW';

    const avatarEl = document.getElementById('profile-avatar-initials');
    if (avatarEl) avatarEl.textContent = initials;

    const nameEl = document.getElementById('profile-student-name');
    if (nameEl) nameEl.textContent = profile.full_name || 'SLIET Applicant';

    const rollEl = document.getElementById('profile-roll-badge');
    if (rollEl) rollEl.textContent = `ROLL: ${profile.roll_no || 'N/A'}`;

    const statusPill = document.getElementById('profile-status-pill');
    if (statusPill) {
      const status = profile.status || 'Pending';
      const statusClass = status.toLowerCase();
      statusPill.className = `status-pill ${statusClass}`;
      statusPill.innerHTML = `<i class="fa-solid ${getStatusIcon(status)}"></i> ${status}`;
    }

    const deptEl = document.getElementById('profile-dept-val');
    if (deptEl) deptEl.textContent = profile.department || 'N/A';

    const yearEl = document.getElementById('profile-year-val');
    if (yearEl) yearEl.textContent = profile.year_semester || 'N/A';

    const domainEl = document.getElementById('profile-domain-val');
    if (domainEl) domainEl.textContent = profile.domain_interest || 'General';

    const emailEl = document.getElementById('profile-email-val');
    if (emailEl) emailEl.textContent = profile.email || 'N/A';

    const phoneEl = document.getElementById('profile-phone-val');
    if (phoneEl) phoneEl.textContent = profile.phone || 'N/A';

    const durationEl = document.getElementById('profile-duration-val');
    if (durationEl) durationEl.textContent = profile.internship_duration || 'Standard Session';

    const linksEl = document.getElementById('profile-links-val');
    if (linksEl) {
      if (profile.profile_links) {
        linksEl.innerHTML = `<a href="${escapeHtml(profile.profile_links)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.profile_links)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.72rem;"></i></a>`;
      } else {
        linksEl.textContent = 'None provided';
      }
    }

    const skillsContainer = document.getElementById('profile-skills-tags');
    if (skillsContainer) {
      const skillsStr = profile.skills || '';
      if (skillsStr.trim()) {
        const skillsList = skillsStr.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
        skillsContainer.innerHTML = skillsList
          .map((s) => `<span class="skill-tag-pill">${escapeHtml(s)}</span>`)
          .join('');
      } else {
        skillsContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">No specific skills recorded</span>`;
      }
    }

    profileModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.cyberAudio && typeof window.cyberAudio.playBlip === 'function') {
      window.cyberAudio.playBlip();
    }
  };

  window.closeStudentProfileModal = function() {
    if (profileModal) {
      profileModal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  };

  if (closeProfileBtn) closeProfileBtn.addEventListener('click', window.closeStudentProfileModal);
  if (doneProfileBtn) doneProfileBtn.addEventListener('click', window.closeStudentProfileModal);
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) window.closeStudentProfileModal();
    });
  }

  // Print Slip
  if (printProfileBtn) {
    printProfileBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Sign Out
  if (studentLogoutBtn) {
    studentLogoutBtn.addEventListener('click', () => {
      logoutStudentSession();
    });
  }

  // Navbar Buttons
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      if (window.openStudentLoginModal) window.openStudentLoginModal();
    });
  }

  if (navDashboardBtn) {
    navDashboardBtn.addEventListener('click', () => {
      if (currentStudentSession) {
        window.openStudentProfileModal(currentStudentSession);
      } else {
        if (window.openStudentLoginModal) window.openStudentLoginModal();
      }
    });
  }

  // Session Management
  function checkActiveStudentSession() {
    const raw = localStorage.getItem('iw_student_logged_in');
    if (raw) {
      try {
        currentStudentSession = JSON.parse(raw);
        updateNavToLoggedIn(currentStudentSession);
      } catch (e) {
        currentStudentSession = null;
      }
    }
  }

  window.loginStudentSession = function(profile) {
    currentStudentSession = profile;
    localStorage.setItem('iw_student_logged_in', JSON.stringify(profile));
    updateNavToLoggedIn(profile);
  };

  function logoutStudentSession() {
    currentStudentSession = null;
    localStorage.removeItem('iw_student_logged_in');

    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    if (navDashboardBtn) navDashboardBtn.style.display = 'none';
    if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';

    window.closeStudentProfileModal();

    if (window.showToast) {
      window.showToast('Logged out of Student Dashboard.');
    }
  }

  function updateNavToLoggedIn(profile) {
    if (!profile) return;
    const firstName = (profile.full_name || 'Student').split(' ')[0];

    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navDashboardBtn) {
      navDashboardBtn.style.display = 'inline-flex';
      if (navDashboardText) navDashboardText.textContent = `${firstName} (Dashboard)`;
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getStatusIcon(status) {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'fa-circle-check';
      case 'rejected': return 'fa-circle-xmark';
      case 'completed': return 'fa-flag-checkered';
      default: return 'fa-clock';
    }
  }
}

// Local Credentials Storage Helpers
function saveLocalCredentials(email, rollNo, password, profile) {
  const creds = {
    email: email,
    rollNo: rollNo,
    passwordHash: btoa(password),
    profile: profile
  };
  localStorage.setItem('iw_student_auth', JSON.stringify(creds));
}

function getLocalCredentials() {
  const raw = localStorage.getItem('iw_student_auth');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
