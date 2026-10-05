/**
 * INTERNWELL SLIET - Admin Dashboard Controller
 * Powered by Supabase Authentication & PostgreSQL Database
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

let allRegistrations = [];
let currentApplicant = null;

async function initAdminDashboard() {
  const supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;

  const authView = document.getElementById('admin-auth-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const authAlert = document.getElementById('auth-alert');
  const userDisplay = document.getElementById('admin-user-display');

  // Search & Filter elements
  const searchInput = document.getElementById('admin-search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDept = document.getElementById('filter-dept');
  const refreshBtn = document.getElementById('btn-refresh-data');
  const exportBtn = document.getElementById('btn-export-csv');

  // Detail Modal elements
  const detailModal = document.getElementById('applicant-detail-modal');
  const closeDetailModalBtn = document.getElementById('btn-close-detail-modal');
  const statusUpdateForm = document.getElementById('status-update-form');
  const deleteBtn = document.getElementById('btn-delete-registration');

  // 1. Check Auth State
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        showDashboard(session.user.email);
        loadRegistrations();
      } else {
        showAuth();
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          showDashboard(session.user.email);
          loadRegistrations();
        } else {
          showAuth();
        }
      });
    } catch (err) {
      console.warn('[Admin] Session check fallback:', err);
      showAuth();
    }
  } else {
    // Demo Mode fallback
    console.info('[Admin] Running in demo mode without Supabase connection.');
    showDashboard('Demo Officer (Local Mode)');
    loadDemoRegistrations();
  }

  // 2. Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const submitBtn = document.getElementById('btn-login-submit');

      hideAuthAlert();

      if (!supabase) {
        // In demo fallback, any input logs in
        showDashboard(`Demo: ${email}`);
        loadDemoRegistrations();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          showAuthAlert(error.message || 'Invalid credentials. Please verify your admin email and password.');
        } else if (data && data.user) {
          showDashboard(data.user.email);
          loadRegistrations();
        }
      } catch (err) {
        console.error('[Admin Auth Error]', err);
        showAuthAlert('Network error during authentication. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Sign In to Dashboard';
      }
    });
  }

  // 3. Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (supabase) {
        await supabase.auth.signOut();
      }
      showAuth();
    });
  }

  // 4. UI Switchers
  function showDashboard(userEmail) {
    if (authView) authView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (userDisplay) userDisplay.textContent = userEmail || 'Admin Officer';
  }

  function showAuth() {
    if (authView) authView.style.display = 'flex';
    if (dashboardView) dashboardView.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  function showAuthAlert(msg) {
    if (!authAlert) return;
    authAlert.textContent = msg;
    authAlert.style.display = 'flex';
  }

  function hideAuthAlert() {
    if (authAlert) authAlert.style.display = 'none';
  }

  // 5. Load Registrations from Supabase
  async function loadRegistrations() {
    const tbody = document.getElementById('registrations-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-muted);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 12px; display: block; color: var(--blue-light);"></i>
            Fetching registered applicants from Supabase...
          </td>
        </tr>`;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Select Error]', error);
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center; padding: 36px; color: #fda4af;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
                Database query error: ${escapeHtml(error.message)}.<br>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Ensure you are signed in with an authorized user and that the RLS SELECT policy is active.</span>
              </td>
            </tr>`;
        }
        return;
      }

      allRegistrations = data || [];
      renderRegistrationsTable();
      updateStats();
    } catch (err) {
      console.error('[Load Error]', err);
    }
  }

  // Local storage demo fallback loader
  function loadDemoRegistrations() {
    const stored = localStorage.getItem('internwell_demo_registrations');
    allRegistrations = stored ? JSON.parse(stored) : [
      {
        id: 'demo-1',
        full_name: 'Aman Sharma',
        roll_no: '23101234',
        email: 'aman.23101234@sliet.ac.in',
        phone: '9876543210',
        department: 'Computer Science & Engineering (CSE)',
        year_semester: '2nd Year (Sem 3/4)',
        domain_interest: 'Full-Stack Web & Mobile',
        skills: 'React, Node.js, JavaScript, TailwindCSS, Git',
        internship_details: 'Frontend project intern',
        internship_duration: '3 Months',
        profile_links: 'https://github.com/kamal704',
        applicant_note: 'Enthusiastic about learning system design and open source collaboration with InternWell SLIET.',
        status: 'Pending',
        created_at: new Date().toISOString()
      }
    ];
    renderRegistrationsTable();
    updateStats();
  }

  // 6. Render Data Table
  function renderRegistrationsTable() {
    const tbody = document.getElementById('registrations-tbody');
    if (!tbody) return;

    const searchTerm = (searchInput?.value || '').trim().toLowerCase();
    const statusVal = filterStatus?.value || 'ALL';
    const deptVal = filterDept?.value || 'ALL';

    const filtered = allRegistrations.filter((item) => {
      // Status filter
      if (statusVal !== 'ALL' && item.status !== statusVal) return false;
      // Department filter
      if (deptVal !== 'ALL' && item.department !== deptVal) return false;
      // Search term
      if (searchTerm) {
        const hay = [
          item.full_name || '',
          item.roll_no || '',
          item.email || '',
          item.skills || '',
          item.domain_interest || ''
        ].join(' ').toLowerCase();
        if (!hay.includes(searchTerm)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 48px; color: var(--text-muted);">
            <i class="fa-regular fa-folder-open" style="font-size: 2rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
            No applications match the current filter or search criteria.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((app) => {
      const dateFormatted = app.created_at ? new Date(app.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'N/A';

      const statusClass = (app.status || 'pending').toLowerCase();

      return `
        <tr data-id="${escapeHtml(app.id)}">
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-secondary);">
            ${dateFormatted}
          </td>
          <td style="font-weight: 600; color: #fff;">
            ${escapeHtml(app.full_name)}
          </td>
          <td style="font-family: 'JetBrains Mono', monospace; color: var(--blue-light);">
            ${escapeHtml(app.roll_no)}
          </td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 500;">${escapeHtml(app.department)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(app.year_semester || '')}</div>
          </td>
          <td style="font-size: 0.85rem;">
            ${escapeHtml(app.domain_interest)}
          </td>
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem;">
            <a href="tel:${escapeHtml(app.phone)}" style="color: var(--text-secondary); text-decoration: none;">
              ${escapeHtml(app.phone)}
            </a>
          </td>
          <td>
            <span class="status-pill ${statusClass}">
              <i class="fa-solid ${getStatusIcon(app.status)}"></i> ${escapeHtml(app.status)}
            </span>
          </td>
          <td>
            <button class="btn-action-view btn-inspect-app" data-id="${escapeHtml(app.id)}">
              <i class="fa-solid fa-eye"></i> View
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row inspection handlers
    tbody.querySelectorAll('.btn-inspect-app').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const found = allRegistrations.find((r) => String(r.id) === String(id));
        if (found) openApplicantModal(found);
      });
    });
  }

  // 7. Update Stats Counters
  function updateStats() {
    const totalEl = document.getElementById('stat-total');
    const pendingEl = document.getElementById('stat-pending');
    const approvedEl = document.getElementById('stat-approved');
    const rejectedEl = document.getElementById('stat-rejected');

    const total = allRegistrations.length;
    const pending = allRegistrations.filter((r) => r.status === 'Pending').length;
    const approved = allRegistrations.filter((r) => r.status === 'Approved').length;
    const rejected = allRegistrations.filter((r) => r.status === 'Rejected').length;

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (approvedEl) approvedEl.textContent = approved;
    if (rejectedEl) rejectedEl.textContent = rejected;
  }

  // 8. Open Applicant Detail Modal
  function openApplicantModal(app) {
    currentApplicant = app;

    document.getElementById('modal-applicant-name').textContent = app.full_name || 'N/A';
    document.getElementById('modal-applicant-meta').textContent = `ID: ${app.id} | Submitted: ${new Date(app.created_at || Date.now()).toLocaleString()}`;

    document.getElementById('modal-detail-roll').textContent = app.roll_no || 'N/A';

    const emailEl = document.getElementById('modal-detail-email');
    emailEl.innerHTML = `<a href="mailto:${escapeHtml(app.email)}">${escapeHtml(app.email)}</a>`;

    const phoneEl = document.getElementById('modal-detail-phone');
    phoneEl.innerHTML = `<a href="tel:${escapeHtml(app.phone)}">${escapeHtml(app.phone)}</a>`;

    document.getElementById('modal-detail-dept').textContent = `${app.department || 'N/A'} • ${app.year_semester || ''}`;
    document.getElementById('modal-detail-domain').textContent = app.domain_interest || 'N/A';
    document.getElementById('modal-detail-duration').textContent = app.internship_duration || 'Not specified';
    document.getElementById('modal-detail-skills').textContent = app.skills || 'None provided';
    document.getElementById('modal-detail-internship').textContent = app.internship_details || 'Fresher / No prior formal internship listed';

    const linksEl = document.getElementById('modal-detail-links');
    if (app.profile_links) {
      linksEl.innerHTML = `<a href="${escapeHtml(app.profile_links)}" target="_blank" rel="noopener noreferrer">${escapeHtml(app.profile_links)} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i></a>`;
    } else {
      linksEl.textContent = 'None provided';
    }

    document.getElementById('modal-detail-note').textContent = app.applicant_note ? `"${app.applicant_note}"` : 'No statement provided.';

    document.getElementById('modal-record-id').value = app.id;
    document.getElementById('modal-update-status').value = app.status || 'Pending';
    document.getElementById('modal-admin-notes').value = app.admin_notes || '';

    if (detailModal) {
      detailModal.style.display = 'flex';
      detailModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeApplicantModal() {
    if (detailModal) {
      detailModal.style.display = 'none';
      detailModal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
    currentApplicant = null;
  }

  if (closeDetailModalBtn) {
    closeDetailModalBtn.addEventListener('click', closeApplicantModal);
  }

  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeApplicantModal();
    });
  }

  // 9. Update Status Handler
  if (statusUpdateForm) {
    statusUpdateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentApplicant) return;

      const recordId = document.getElementById('modal-record-id').value;
      const newStatus = document.getElementById('modal-update-status').value;
      const adminNotes = document.getElementById('modal-admin-notes').value.trim();
      const saveBtn = document.getElementById('btn-save-status');

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      try {
        if (supabase) {
          const { error } = await supabase
            .from('registrations')
            .update({
              status: newStatus,
              admin_notes: adminNotes,
              updated_at: new Date().toISOString()
            })
            .eq('id', recordId);

          if (error) {
            alert(`Failed to update status: ${error.message}`);
            return;
          }
        }

        // Update in-memory array
        currentApplicant.status = newStatus;
        currentApplicant.admin_notes = adminNotes;

        // In demo fallback, persist to localStorage
        if (!supabase) {
          localStorage.setItem('internwell_demo_registrations', JSON.stringify(allRegistrations));
        }

        renderRegistrationsTable();
        updateStats();
        closeApplicantModal();
      } catch (err) {
        console.error('[Update Error]', err);
        alert('An unexpected error occurred while saving the update.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Status';
      }
    });
  }

  // 10. Delete Registration Handler
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!currentApplicant) return;
      const confirmDelete = confirm(`Are you sure you want to delete application for ${currentApplicant.full_name} (${currentApplicant.roll_no})? This action cannot be undone.`);
      if (!confirmDelete) return;

      try {
        if (supabase) {
          const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', currentApplicant.id);

          if (error) {
            alert(`Failed to delete application: ${error.message}`);
            return;
          }
        }

        // Remove from in-memory list
        allRegistrations = allRegistrations.filter((r) => String(r.id) !== String(currentApplicant.id));

        if (!supabase) {
          localStorage.setItem('internwell_demo_registrations', JSON.stringify(allRegistrations));
        }

        renderRegistrationsTable();
        updateStats();
        closeApplicantModal();
      } catch (err) {
        console.error('[Delete Error]', err);
        alert('An unexpected error occurred while deleting.');
      }
    });
  }

  // 11. Search & Filter Listeners
  if (searchInput) {
    searchInput.addEventListener('input', () => renderRegistrationsTable());
  }
  if (filterStatus) {
    filterStatus.addEventListener('change', () => renderRegistrationsTable());
  }
  if (filterDept) {
    filterDept.addEventListener('change', () => renderRegistrationsTable());
  }
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (supabase) {
        loadRegistrations();
      } else {
        loadDemoRegistrations();
      }
    });
  }

  // 12. Export to CSV Handler
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportToCSV();
    });
  }

  function exportToCSV() {
    if (!allRegistrations || allRegistrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    const headers = [
      'ID',
      'Submission Timestamp',
      'Full Name',
      'Roll Number',
      'Email',
      'Phone',
      'Department',
      'Year / Semester',
      'Domain of Interest',
      'Skills',
      'Internship Details',
      'Duration',
      'Profile / Resume Links',
      'Status',
      'Admin Notes'
    ];

    const rows = allRegistrations.map((app) => [
      app.id || '',
      app.created_at || '',
      app.full_name || '',
      app.roll_no || '',
      app.email || '',
      app.phone || '',
      app.department || '',
      app.year_semester || '',
      app.domain_interest || '',
      app.skills || '',
      app.internship_details || '',
      app.internship_duration || '',
      app.profile_links || '',
      app.status || 'Pending',
      app.admin_notes || ''
    ]);

    const csvContent = [
      headers.map(escapeCSVField).join(','),
      ...rows.map((row) => row.map(escapeCSVField).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `internwell_sliet_registrations_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeCSVField(str) {
    const val = String(str || '').replace(/"/g, '""');
    return `"${val}"`;
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
