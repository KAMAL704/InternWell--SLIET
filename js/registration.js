/**
 * INTERNWELL SLIET - Registration & Student Profile Dashboard Controller
 * Handles student registration, field validation, duplicate detection,
 * cloud database submission, and interactive Student Profile Dossier.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationSystem();
  initStudentProfileSystem();
});

function initRegistrationSystem() {
  const form = document.getElementById('induction-form');
  const submitBtn = document.getElementById('induction-submit-btn') || form?.querySelector('button[type="submit"]');
  const alertBox = document.getElementById('form-status-alert');

  if (!form) return;

  // Real-time input sanitization
  const emailInput = document.getElementById('applicant-email');
  const phoneInput = document.getElementById('applicant-phone');
  const rollInput = document.getElementById('applicant-roll');

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.value = emailInput.value.trim().toLowerCase();
    });
  }

  if (rollInput) {
    rollInput.addEventListener('input', () => {
      rollInput.value = rollInput.value.trim();
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^\d+]/g, '');
    });
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    // 1. Gather form values
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

    // 2. Client-side Validation
    const validationError = validateRegistrationData({
      fullName,
      rollNo,
      email,
      phone,
      department,
      yearSemester,
      domainInterest
    });

    if (validationError) {
      showAlert(validationError, 'error');
      if (window.cyberAudio) window.cyberAudio.playHover();
      return;
    }

    // 3. Set Loading State
    setLoadingState(true);

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
        // --- PRODUCTION SUPABASE CLOUD SUBMISSION ---
        // Using pure insert without .select() to strictly adhere to public insert-only RLS policy
        const { error } = await supabase
          .from('registrations')
          .insert([payload]);

        if (error) {
          handleSubmissionError(error);
          return;
        }

        handleSubmissionSuccess(fullName, false, payload);
      } else {
        // --- DEMO / LOCAL STORAGE MODE (Zero-configuration fallback) ---
        await submitToLocalStorage(payload);
        handleSubmissionSuccess(fullName, true, payload);
      }
    } catch (err) {
      console.error('[Registration Error]', err);
      showAlert(
        'Unable to submit registration. Please check your internet connection and try again.',
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  });

  // Helper Functions
  function validateRegistrationData(data) {
    if (!data.fullName || data.fullName.length < 2) {
      return 'Please enter your complete Full Name (minimum 2 characters).';
    }

    if (!data.rollNo || data.rollNo.length < 3) {
      return 'Please enter a valid College Registration / Roll Number.';
    }

    // Email regex format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      return 'Please enter a valid email address (e.g. name.roll@sliet.ac.in).';
    }

    // Phone regex format (10-13 digits)
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

    return null;
  }

  function setLoadingState(isLoading) {
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('data-original-html', submitBtn.innerHTML);
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Application...';
      submitBtn.style.opacity = '0.75';
      submitBtn.style.cursor = 'not-allowed';
    } else {
      submitBtn.disabled = false;
      const orig = submitBtn.getAttribute('data-original-html');
      if (orig) submitBtn.innerHTML = orig;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }
  }

  function handleSubmissionError(error) {
    console.error('[Supabase Insert Error]:', error);

    // Postgres 23505 = Unique violation
    const isDuplicate =
      error.code === '23505' ||
      (error.message && error.message.toLowerCase().includes('unique')) ||
      (error.message && error.message.toLowerCase().includes('duplicate'));

    if (isDuplicate) {
      showAlert(
        '⚠️ Registration already exists with this Email or Roll Number. If you need to make changes, please contact the InternWell team.',
        'error'
      );
    } else if (error.code === 'PGRST205' || (error.message && error.message.includes('schema cache'))) {
      showAlert(
        '⚠️ Database table "registrations" not created yet. Please execute `supabase_schema.sql` in your Supabase project SQL Editor.',
        'error'
      );
    } else if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('policy'))) {
      showAlert(
        'Database permission error. Please make sure the Supabase RLS INSERT policy from `supabase_schema.sql` has been executed.',
        'error'
      );
    } else {
      showAlert(
        error.message || 'Unable to submit registration. Please try again.',
        'error'
      );
    }
  }

  function handleSubmissionSuccess(fullName, isDemo = false, payload = null) {
    form.reset();

    // 1. Cache registered applicant profile locally
    if (payload) {
      localStorage.setItem('internwell_student_profile', JSON.stringify(payload));
    }

    const successMsg = `Registration successful! Welcome to InternWell SLIET, ${fullName}!`;
    showAlert(`✨ ${successMsg}`, 'success');

    // 2. Trigger celebration effects
    if (typeof window.triggerConfetti === 'function') {
      window.triggerConfetti();
    }
    if (window.cyberAudio && typeof window.cyberAudio.playSuccess === 'function') {
      window.cyberAudio.playSuccess();
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`✨ Registration Successful! Welcome, ${fullName}! Opening your profile...`);
    }

    // 3. Update top navigation profile badge
    if (typeof window.updateProfileNavState === 'function') {
      window.updateProfileNavState();
    }

    // 4. Smoothly transition from registration form to Student Profile Dossier
    setTimeout(() => {
      if (typeof window.closeInductionModal === 'function') {
        window.closeInductionModal();
      }
      hideAlert();

      if (payload && typeof window.openStudentProfileModal === 'function') {
        window.openStudentProfileModal(payload);
      }
    }, 1100);
  }

  function showAlert(message, type = 'error') {
    if (!alertBox) {
      if (typeof window.showToast === 'function') {
        window.showToast(message);
      } else {
        alert(message);
      }
      return;
    }

    alertBox.className = `form-status-alert ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation';
    alertBox.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    alertBox.style.display = 'flex';
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }
  }

  // Fallback demo storage in localStorage
  async function submitToLocalStorage(payload) {
    await new Promise((r) => setTimeout(r, 600));
    const key = 'iw_demo_registrations';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');

    const isDupRoll = existing.some((r) => r.roll_no.toLowerCase() === payload.roll_no.toLowerCase());
    const isDupEmail = existing.some((r) => r.email.toLowerCase() === payload.email.toLowerCase());

    if (isDupRoll || isDupEmail) {
      throw {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      };
    }

    payload.id = 'demo-' + Date.now();
    existing.unshift(payload);
    localStorage.setItem(key, JSON.stringify(existing));
    return payload;
  }
}

/**
 * ============================================================================
 * STUDENT PROFILE DOSSIER & APPLICATION TRACKER CONTROLLER
 * ============================================================================
 */
function initStudentProfileSystem() {
  const profileModal = document.getElementById('student-profile-modal');
  const closeProfileBtn = document.getElementById('profile-modal-close-btn');
  const doneProfileBtn = document.getElementById('btn-done-profile-view');
  const printProfileBtn = document.getElementById('btn-print-profile-slip');

  const navProfileBtn = document.getElementById('btn-my-profile-nav');
  const navProfileText = document.getElementById('nav-profile-name-text');
  const mobileProfileItem = document.getElementById('mobile-my-profile-item');
  const mobileProfileLink = document.getElementById('mobile-my-profile-link');

  const navTrackBtn = document.getElementById('btn-track-application-nav');
  const lookupModal = document.getElementById('lookup-application-modal');
  const lookupCloseBtn = document.getElementById('lookup-modal-close-btn');
  const lookupForm = document.getElementById('lookup-application-form');
  const lookupAlert = document.getElementById('lookup-status-alert');

  // 1. Initial Profile State Check
  updateProfileNavState();

  // 2. Open Profile Modal function
  window.openStudentProfileModal = function(profile) {
    if (!profileModal || !profile) return;

    // Set Initials
    const initials = (profile.full_name || 'IW')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'IW';

    const avatarEl = document.getElementById('profile-avatar-initials');
    if (avatarEl) avatarEl.textContent = initials;

    // Student Basic Info
    const nameEl = document.getElementById('profile-student-name');
    if (nameEl) nameEl.textContent = profile.full_name || 'SLIET Applicant';

    const rollEl = document.getElementById('profile-roll-badge');
    if (rollEl) rollEl.textContent = `ROLL: ${profile.roll_no || 'N/A'}`;

    // Status Pill
    const statusPill = document.getElementById('profile-status-pill');
    if (statusPill) {
      const status = profile.status || 'Pending';
      const statusClass = status.toLowerCase();
      statusPill.className = `status-pill ${statusClass}`;
      statusPill.innerHTML = `<i class="fa-solid ${getStatusIcon(status)}"></i> ${status}`;
    }

    // Telemetry stats
    const deptEl = document.getElementById('profile-dept-val');
    if (deptEl) deptEl.textContent = profile.department || 'N/A';

    const yearEl = document.getElementById('profile-year-val');
    if (yearEl) yearEl.textContent = profile.year_semester || 'N/A';

    const domainEl = document.getElementById('profile-domain-val');
    if (domainEl) domainEl.textContent = profile.domain_interest || 'General';

    // Details Table
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

    // Skills Tags
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

    // Open Modal
    profileModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.cyberAudio && typeof window.cyberAudio.playBlip === 'function') {
      window.cyberAudio.playBlip();
    }
  };

  // Close Profile Modal
  window.closeStudentProfileModal = function() {
    if (profileModal) {
      profileModal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  };

  if (closeProfileBtn) {
    closeProfileBtn.addEventListener('click', window.closeStudentProfileModal);
  }
  if (doneProfileBtn) {
    doneProfileBtn.addEventListener('click', window.closeStudentProfileModal);
  }
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

  // Update Navbar Button State
  window.updateProfileNavState = function() {
    const cachedStr = localStorage.getItem('internwell_student_profile');
    if (!cachedStr) return;

    try {
      const profile = JSON.parse(cachedStr);
      if (profile && profile.full_name) {
        const firstName = profile.full_name.split(' ')[0] || 'My';

        if (navProfileBtn && navProfileText) {
          navProfileText.textContent = `${firstName} (Profile)`;
          navProfileBtn.style.display = 'inline-flex';
        }
        if (mobileProfileItem) {
          mobileProfileItem.style.display = 'block';
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached profile:', e);
    }
  };

  // Click on "My Profile" button in navbar
  if (navProfileBtn) {
    navProfileBtn.addEventListener('click', () => {
      const cached = localStorage.getItem('internwell_student_profile');
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          window.openStudentProfileModal(profile);
          return;
        } catch (e) {}
      }
      // If no profile cached, open lookup modal
      openLookupModal();
    });
  }

  if (mobileProfileLink) {
    mobileProfileLink.addEventListener('click', (e) => {
      e.preventDefault();
      const cached = localStorage.getItem('internwell_student_profile');
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          window.openStudentProfileModal(profile);
          return;
        } catch (e) {}
      }
      openLookupModal();
    });
  }

  // Track Application Button in Navbar
  if (navTrackBtn) {
    navTrackBtn.addEventListener('click', () => {
      openLookupModal();
    });
  }

  function openLookupModal() {
    if (!lookupModal) return;
    hideLookupAlert();
    lookupModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.cyberAudio && typeof window.cyberAudio.playHover === 'function') {
      window.cyberAudio.playHover();
    }
  }

  function closeLookupModal() {
    if (lookupModal) {
      lookupModal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  }

  if (lookupCloseBtn) {
    lookupCloseBtn.addEventListener('click', closeLookupModal);
  }
  if (lookupModal) {
    lookupModal.addEventListener('click', (e) => {
      if (e.target === lookupModal) closeLookupModal();
    });
  }

  // 3. Handle Application Lookup Submission
  if (lookupForm) {
    lookupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideLookupAlert();

      const queryInput = document.getElementById('lookup-query');
      const submitBtn = document.getElementById('btn-lookup-submit');
      const query = (queryInput?.value || '').trim().toLowerCase();

      if (!query) return;

      // 1. Fast local check if user already registered on this device
      const localStr = localStorage.getItem('internwell_student_profile');
      if (localStr) {
        try {
          const localProfile = JSON.parse(localStr);
          const rollMatch = localProfile.roll_no && localProfile.roll_no.toLowerCase() === query;
          const emailMatch = localProfile.email && localProfile.email.toLowerCase() === query;
          if (rollMatch || emailMatch) {
            closeLookupModal();
            window.openStudentProfileModal(localProfile);
            return;
          }
        } catch (err) {}
      }

      // 2. Query Supabase RPC `check_registration_status`
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Database...';

      try {
        const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
        let foundProfile = null;

        if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
          const { data, error } = await supabase.rpc('check_registration_status', {
            search_query: query
          });

          if (!error && data && data.length > 0) {
            foundProfile = data[0];
          }
        }

        if (foundProfile) {
          localStorage.setItem('internwell_student_profile', JSON.stringify(foundProfile));
          window.updateProfileNavState();
          closeLookupModal();
          window.openStudentProfileModal(foundProfile);
        } else {
          showLookupAlert('No registered application found matching this Roll Number or Email. Please verify your details or submit a new application.');
        }
      } catch (err) {
        console.error('[Lookup Error]', err);
        showLookupAlert('Network error during lookup. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> View Application Profile';
      }
    });
  }

  function showLookupAlert(msg) {
    if (!lookupAlert) return;
    lookupAlert.textContent = msg;
    lookupAlert.style.display = 'flex';
  }

  function hideLookupAlert() {
    if (lookupAlert) {
      lookupAlert.style.display = 'none';
      lookupAlert.textContent = '';
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
