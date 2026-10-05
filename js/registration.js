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

        // 3. Authenticate against Live Supabase Cloud Database FIRST
        if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
          let liveRecord = null;
          let dbErr = null;

          if (emailOrRoll.includes('@')) {
            const { data, error } = await supabase
              .from('registrations')
              .select('*')
              .ilike('email', emailOrRoll)
              .limit(1);
            if (error) dbErr = error;
            else if (data && data.length > 0) liveRecord = data[0];
          } else {
            const { data, error } = await supabase
              .from('registrations')
              .select('*')
              .ilike('roll_no', emailOrRoll)
              .limit(1);
            if (error) dbErr = error;
            else if (data && data.length > 0) liveRecord = data[0];
          }

          // If database query succeeded and returned 0 rows:
          // THE USER WAS DELETED IN SUPABASE BY ADMIN OR NEVER REGISTERED!
          if (!dbErr && !liveRecord) {
            purgeLocalStudentCredentials(emailOrRoll);
            showLoginAlert('⚠️ No active application found for this account. If you previously registered, your application has been removed or deleted by the administration. You do not have access to the dashboard.', 'error');
            if (window.cyberAudio && window.cyberAudio.playHover) window.cyberAudio.playHover();
            return;
          }

          if (liveRecord) {
            // Check password: local credential check or Supabase Auth
            const localCreds = getLocalCredentials();
            const passMatchesLocal = localCreds && 
              (localCreds.email.toLowerCase() === liveRecord.email.toLowerCase() ||
               localCreds.rollNo.toLowerCase() === liveRecord.roll_no.toLowerCase()) &&
              localCreds.passwordHash === btoa(password);

            let passMatchesAuth = false;
            if (liveRecord.email) {
              try {
                const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
                  email: liveRecord.email,
                  password: password
                });
                if (!authErr && authData && authData.user) {
                  passMatchesAuth = true;
                }
              } catch (e) {}
            }

            if (passMatchesLocal || passMatchesAuth || (!localCreds && !emailOrRoll.includes('@'))) {
              authenticatedProfile = liveRecord;
            } else {
              showLoginAlert('Incorrect password. Please verify your password or contact the InternWell team.', 'error');
              if (window.cyberAudio && window.cyberAudio.playHover) window.cyberAudio.playHover();
              return;
            }
          }
        } else {
          // Fallback demo mode check (only if Supabase is offline/unconfigured)
          const localCreds = getLocalCredentials();
          const matchesLocal = localCreds && 
            (localCreds.email.toLowerCase() === emailOrRoll || localCreds.rollNo.toLowerCase() === emailOrRoll) &&
            localCreds.passwordHash === btoa(password);

          if (matchesLocal) {
            authenticatedProfile = localCreds.profile;
          }
        }

        if (authenticatedProfile) {
          // Successful Login!
          loginForm.reset();
          saveLocalCredentials(authenticatedProfile.email, authenticatedProfile.roll_no, password, authenticatedProfile);
          if (typeof window.loginStudentSession === 'function') {
            window.loginStudentSession(authenticatedProfile);
          }

          if (window.cyberAudio && window.cyberAudio.playSuccess) window.cyberAudio.playSuccess();
          if (typeof window.closeInductionModal === 'function') {
            window.closeInductionModal();
          }

          // Open Student Dashboard with live status!
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

    renderProfileStaticData(profile);
    updateProfileStatusDisplay(profile.status);
    renderRoadmap(profile.status);

    profileModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.cyberAudio && typeof window.cyberAudio.playBlip === 'function') {
      window.cyberAudio.playBlip();
    }

    // Actively query Supabase for latest status set by admin!
    fetchLiveStudentStatus(profile);
  };

  function renderProfileStaticData(profile) {
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
  }

  function updateProfileStatusDisplay(status) {
    const statusPill = document.getElementById('profile-status-pill');
    if (!statusPill) return;
    const s = status || 'Pending';
    const statusClass = s.toLowerCase();
    statusPill.className = `status-pill ${statusClass}`;
    statusPill.innerHTML = `<i class="fa-solid ${getStatusIcon(s)}"></i> ${s}`;
  }

  // Dynamic 4-Stage Induction Progression Roadmap Renderer
  function renderRoadmap(status) {
    const track = document.getElementById('profile-roadmap-track');
    const counter = document.getElementById('profile-step-counter');
    const bannerWrap = document.getElementById('profile-status-banner-wrap');
    if (!track) return;

    const s = (status || 'pending').toLowerCase();

    if (s === 'completed') {
      if (counter) counter.textContent = 'Stage 4 of 4 (Completed)';
      if (bannerWrap) {
        bannerWrap.innerHTML = `
          <div class="profile-completed-banner">
            <i class="fa-solid fa-trophy" style="font-size: 1.6rem; color: #38bdf8;"></i>
            <div>
              <strong style="color: #fff; font-size: 0.95rem; display: block; margin-bottom: 2px;">🎉 INDUCTION COMPLETE // OFFICIAL CLUB MEMBER</strong>
              <p style="margin: 0; font-size: 0.8rem; color: #bae6fd;">Congratulations! You have completed all induction rounds and are officially inducted into InternWell SLIET.</p>
            </div>
          </div>
        `;
      }
      track.innerHTML = `
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>1. Application Submitted</strong>
            <span>Dossier successfully verified &amp; recorded.</span>
          </div>
        </div>
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>2. Domain Screening Cleared</strong>
            <span>Your skills matrix and profile were approved by domain leads.</span>
          </div>
        </div>
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>3. Interaction &amp; Mentorship Cleared</strong>
            <span>Technical discussion and club alignment completed.</span>
          </div>
        </div>
        <div class="roadmap-step step-done">
          <div class="roadmap-dot" style="background: #0284c7; border-color: #38bdf8; box-shadow: 0 0 12px rgba(56, 189, 248, 0.7);"><i class="fa-solid fa-star"></i></div>
          <div class="roadmap-content">
            <strong style="color: #38bdf8;">4. Welcomed to InternWell SLIET!</strong>
            <span>Official onboarding complete. You are assigned to active project sprints!</span>
          </div>
        </div>
      `;
    } else if (s === 'approved') {
      if (counter) counter.textContent = 'Stage 3 of 4 (Approved)';
      if (bannerWrap) {
        bannerWrap.innerHTML = `
          <div class="profile-completed-banner" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4);">
            <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; color: #34d399;"></i>
            <div>
              <strong style="color: #fff; font-size: 0.95rem; display: block; margin-bottom: 2px;">APPLICATION APPROVED &amp; SHORTLISTED</strong>
              <p style="margin: 0; font-size: 0.8rem; color: #a7f3d0;">Congratulations! You cleared domain screening. Check your email/WhatsApp for onboarding instructions.</p>
            </div>
          </div>
        `;
      }
      track.innerHTML = `
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>1. Application Submitted</strong>
            <span>Dossier successfully verified &amp; recorded.</span>
          </div>
        </div>
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>2. Domain Screening Cleared</strong>
            <span>Approved by domain leads.</span>
          </div>
        </div>
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>3. Interaction Round Cleared</strong>
            <span>Approved for club membership.</span>
          </div>
        </div>
        <div class="roadmap-step step-active">
          <div class="roadmap-dot"><i class="fa-solid fa-spinner fa-spin"></i></div>
          <div class="roadmap-content">
            <strong>4. Final Welcome &amp; Onboarding</strong>
            <span>Team credentials and project sprint assignment underway.</span>
          </div>
        </div>
      `;
    } else if (s === 'rejected') {
      if (counter) counter.textContent = 'Review Concluded';
      if (bannerWrap) {
        bannerWrap.innerHTML = `
          <div class="profile-completed-banner" style="background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.35);">
            <i class="fa-solid fa-circle-info" style="font-size: 1.5rem; color: #f87171;"></i>
            <div>
              <strong style="color: #fff; font-size: 0.95rem; display: block; margin-bottom: 2px;">SELECTION CYCLE CONCLUDED</strong>
              <p style="margin: 0; font-size: 0.8rem; color: #fca5a5;">Thank you for your interest in InternWell SLIET. Due to high volume, your application was not selected this cycle. We encourage you to upskill and reapply in the next recruitment round!</p>
            </div>
          </div>
        `;
      }
      track.innerHTML = `
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>1. Application Submitted</strong>
            <span>Dossier received and reviewed.</span>
          </div>
        </div>
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>2. Profile Reviewed</strong>
            <span>Application evaluated for the current intake.</span>
          </div>
        </div>
        <div class="roadmap-step">
          <div class="roadmap-dot" style="background: #334155; color: #94a3b8;"><i class="fa-solid fa-arrow-rotate-right"></i></div>
          <div class="roadmap-content">
            <strong>3. Upskill &amp; Reapply</strong>
            <span>Practice projects, build your portfolio, and apply for our next open intake!</span>
          </div>
        </div>
      `;
    } else {
      // Default: 'pending'
      if (counter) counter.textContent = 'Stage 2 of 4 (In Review)';
      if (bannerWrap) bannerWrap.innerHTML = '';
      track.innerHTML = `
        <div class="roadmap-step step-done">
          <div class="roadmap-dot"><i class="fa-solid fa-check"></i></div>
          <div class="roadmap-content">
            <strong>1. Application Submitted</strong>
            <span>Dossier successfully collected &amp; stored in database.</span>
          </div>
        </div>
        <div class="roadmap-step step-active">
          <div class="roadmap-dot"><i class="fa-solid fa-spinner fa-spin"></i></div>
          <div class="roadmap-content">
            <strong>2. Domain Screening</strong>
            <span>Domain leads are reviewing your skill matrix &amp; portfolio.</span>
          </div>
        </div>
        <div class="roadmap-step">
          <div class="roadmap-dot"><i class="fa-solid fa-comments"></i></div>
          <div class="roadmap-content">
            <strong>3. Interaction &amp; Mentorship Round</strong>
            <span>Technical interaction &amp; alignment call with club coordinators.</span>
          </div>
        </div>
        <div class="roadmap-step">
          <div class="roadmap-dot"><i class="fa-solid fa-award"></i></div>
          <div class="roadmap-content">
            <strong>4. Welcome to InternWell SLIET</strong>
            <span>Onboarding to active project sprints &amp; socio-startup teams.</span>
          </div>
        </div>
      `;
    }
  }

  // Actively fetch live status from Supabase so admin updates show immediately
  async function fetchLiveStudentStatus(profile) {
    if (!profile || (!profile.email && !profile.roll_no)) return;
    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (!supabase || !window.isSupabaseConfigured || !window.isSupabaseConfigured()) return;

    try {
      let liveRow = null;
      let dbChecked = false;

      if (profile.email) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .ilike('email', profile.email)
          .limit(1);
        if (!error) {
          dbChecked = true;
          if (data && data.length > 0) liveRow = data[0];
        }
      }

      if (!liveRow && profile.roll_no) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .ilike('roll_no', profile.roll_no)
          .limit(1);
        if (!error) {
          dbChecked = true;
          if (data && data.length > 0) liveRow = data[0];
        }
      }

      // If database query succeeded and returned 0 rows:
      // USER WAS DELETED IN SUPABASE BY ADMIN!
      if (dbChecked && !liveRow) {
        console.warn('[Live Status Sync] Record was deleted from Supabase by admin. Revoking session.');
        logoutStudentSession(true);
        return;
      }

      if (liveRow) {
        console.log('[Live Status Sync] Received updated status from database:', liveRow.status);
        profile.status = liveRow.status;
        profile.admin_notes = liveRow.admin_notes || profile.admin_notes;

        // Update local session
        localStorage.setItem('iw_student_logged_in', JSON.stringify(profile));
        localStorage.setItem('internwell_student_profile', JSON.stringify(profile));

        // Immediately update visual UI
        updateProfileStatusDisplay(liveRow.status);
        renderRoadmap(liveRow.status);
      }
    } catch (err) {
      console.warn('[Live Status Sync Notice]', err);
    }
  }

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
      logoutStudentSession(false);
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
  async function checkActiveStudentSession() {
    const raw = localStorage.getItem('iw_student_logged_in');
    if (!raw) return;

    let candidate = null;
    try {
      candidate = JSON.parse(raw);
    } catch (e) {
      localStorage.removeItem('iw_student_logged_in');
      return;
    }

    if (!candidate || (!candidate.email && !candidate.roll_no)) {
      localStorage.removeItem('iw_student_logged_in');
      return;
    }

    // Verify student STILL exists in Supabase live database
    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
      const email = candidate.email;
      const rollNo = candidate.roll_no;
      try {
        let liveRow = null;
        let dbChecked = false;

        if (email) {
          const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .ilike('email', email)
            .limit(1);
          if (!error) {
            dbChecked = true;
            if (data && data.length > 0) liveRow = data[0];
          }
        }

        if (!liveRow && rollNo) {
          const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .ilike('roll_no', rollNo)
            .limit(1);
          if (!error) {
            dbChecked = true;
            if (data && data.length > 0) liveRow = data[0];
          }
        }

        if (dbChecked && !liveRow) {
          // RECORD WAS DELETED FROM SUPABASE BY ADMIN!
          console.warn('[Session Verify] User record was deleted from Supabase. Revoking session & purging local data.');
          logoutStudentSession(true);
          return;
        }

        if (liveRow) {
          // Record exists! Update status in session
          currentStudentSession = liveRow;
          localStorage.setItem('iw_student_logged_in', JSON.stringify(liveRow));
          localStorage.setItem('internwell_student_profile', JSON.stringify(liveRow));
          updateNavToLoggedIn(liveRow);

          // If profile modal is open, re-render it
          if (profileModal && profileModal.classList.contains('open')) {
            renderProfileStaticData(liveRow);
            updateProfileStatusDisplay(liveRow.status);
            renderRoadmap(liveRow.status);
          }
          return;
        }
      } catch (err) {
        console.warn('[Session Verify network notice]', err);
      }
    }

    // Fallback if offline
    currentStudentSession = candidate;
    updateNavToLoggedIn(candidate);
  }

  // Real-time verification when tab is focused
  window.addEventListener('focus', () => {
    if (currentStudentSession) {
      checkActiveStudentSession();
    }
  });

  // Background polling every 20 seconds to catch admin deletions / approvals in real time
  setInterval(() => {
    if (currentStudentSession) {
      checkActiveStudentSession();
    }
  }, 20000);

  window.loginStudentSession = function(profile) {
    currentStudentSession = profile;
    localStorage.setItem('iw_student_logged_in', JSON.stringify(profile));
    updateNavToLoggedIn(profile);
  };

  function logoutStudentSession(wasRevoked = false) {
    const prev = currentStudentSession;
    currentStudentSession = null;
    localStorage.removeItem('iw_student_logged_in');
    localStorage.removeItem('internwell_student_profile');

    if (prev) {
      purgeLocalStudentCredentials(prev.email);
      purgeLocalStudentCredentials(prev.roll_no);
    }

    const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    if (navDashboardBtn) navDashboardBtn.style.display = 'none';
    if (navLoginBtn) navLoginBtn.style.display = 'inline-flex';

    window.closeStudentProfileModal();

    if (window.showToast) {
      if (wasRevoked) {
        window.showToast('⚠️ Your application has been removed by the administration. Dashboard access closed.');
      } else {
        window.showToast('Logged out of Student Dashboard.');
      }
    }
  }

  window.logoutStudentSession = logoutStudentSession;
  window.checkActiveStudentSession = checkActiveStudentSession;

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

// Global Credentials Storage & Session Purge Helpers
function purgeLocalStudentCredentials(query) {
  const keys = ['iw_student_logged_in', 'internwell_student_profile', 'iw_student_auth'];
  if (!query) {
    keys.forEach((k) => localStorage.removeItem(k));
    return;
  }
  const q = String(query).trim().toLowerCase();
  keys.forEach((k) => {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        const email = String(obj.email || obj.profile?.email || '').trim().toLowerCase();
        const roll = String(obj.roll_no || obj.rollNo || obj.profile?.roll_no || '').trim().toLowerCase();
        if (email === q || roll === q) {
          localStorage.removeItem(k);
        }
      } catch (e) {
        localStorage.removeItem(k);
      }
    }
  });
}
window.purgeLocalStudentCredentials = purgeLocalStudentCredentials;

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
