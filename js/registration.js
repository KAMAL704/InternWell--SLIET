/**
 * INTERNWELL SLIET - Registration Controller & Supabase Integration
 * Handles student registration, field validation, duplicate detection,
 * loading states, and database submission with graceful demo fallback.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegistrationSystem();
});

function initRegistrationSystem() {
  const form = document.getElementById('induction-form');
  const submitBtn = document.getElementById('induction-submit-btn') || form?.querySelector('button[type="submit"]');
  const alertBox = document.getElementById('form-status-alert');

  if (!form) return;

  // Real-time input sanitization & visual feedback
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
      // Allow only numbers and leading +
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
      resume_url: profileLinks, // also stored for resume reference
      applicant_note: applicantNote,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    try {
      const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;

      if (supabase && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
        // --- PRODUCTION SUPABASE CLOUD SUBMISSION ---
        const { data, error } = await supabase
          .from('registrations')
          .insert([payload])
          .select();

        if (error) {
          handleSubmissionError(error);
          return;
        }

        handleSubmissionSuccess(fullName);
      } else {
        // --- DEMO / LOCAL STORAGE MODE (Zero-configuration fallback) ---
        await submitToLocalStorage(payload);
        handleSubmissionSuccess(fullName, true);
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

  function handleSubmissionSuccess(fullName, isDemo = false) {
    form.reset();

    const successMsg = isDemo
      ? `Registration successful! Application recorded for ${fullName}. (Demo Mode: connect Supabase in js/supabase-config.js for live cloud DB)`
      : `Registration successful! Welcome to InternWell SLIET, ${fullName}!`;

    showAlert(`✨ ${successMsg}`, 'success');

    // Trigger celebration effects
    if (typeof window.triggerConfetti === 'function') {
      window.triggerConfetti();
    }
    if (window.cyberAudio && typeof window.cyberAudio.playSuccess === 'function') {
      window.cyberAudio.playSuccess();
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`✨ Registration Successful! Welcome, ${fullName}!`);
    }

    // Auto-close modal after student views confirmation
    setTimeout(() => {
      if (typeof window.closeInductionModal === 'function') {
        window.closeInductionModal();
      }
      hideAlert();
    }, 2400);
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
    await new Promise((r) => setTimeout(r, 600)); // simulate brief network latency
    const key = 'iw_demo_registrations';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');

    // Duplicate check
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
