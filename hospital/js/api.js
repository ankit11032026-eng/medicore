// js/api.js — Frontend API client for MediCore
// Replace localStorage calls with real Atlas-backed API

const API_BASE = 'https://medicore-hvkf.onrender.com'; // Change to your deployed URL in production

// ── Token helpers ─────────────────────────────────────────
const getToken = () => sessionStorage.getItem('medicore_token');
const setToken = (t) => sessionStorage.setItem('medicore_token', t);
const clearAuth = () => { sessionStorage.removeItem('medicore_token'); sessionStorage.removeItem('medicore_user'); };

// ── Core fetch wrapper ────────────────────────────────────
async function apiCall(path, method = 'GET', body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${getToken()}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ── AUTH ──────────────────────────────────────────────────
const Auth = {
  adminLogin: async (username, password) => {
    const data = await apiCall('/auth/admin/login', 'POST', { username, password });
    setToken(data.token);
    sessionStorage.setItem('medicore_user', JSON.stringify(data.user));
    return data;
  },
  staffLogin: async (username, password, department) => {
    const data = await apiCall('/auth/staff/login', 'POST', { username, password, department });
    setToken(data.token);
    sessionStorage.setItem('medicore_user', JSON.stringify(data.user));
    return data;
  },
  patientRegister: async (firstName, lastName, phone, email, password) => {
    const data = await apiCall('/auth/patient/register', 'POST', { firstName, lastName, phone, email, password });
    setToken(data.token);
    sessionStorage.setItem('medicore_patient', JSON.stringify(data.patient));
    return data;
  },
  patientLogin: async (phone, password) => {
    const data = await apiCall('/auth/patient/login', 'POST', { phone, password });
    setToken(data.token);
    sessionStorage.setItem('medicore_patient', JSON.stringify(data.patient));
    return data;
  },
  logout: () => {
    clearAuth();
    window.location.href = '../index.html';
  },
};

// ── APPOINTMENTS ─────────────────────────────────────────
const Appointments = {
  book: async (apptData) => {
    return apiCall('/appointments', 'POST', apptData);
  },
  getAll: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(`/appointments${qs ? '?' + qs : ''}`, 'GET', null, true);
  },
  getMy: async () => {
    return apiCall('/appointments/my', 'GET', null, true);
  },
  getStats: async () => {
    return apiCall('/appointments/stats', 'GET', null, true);
  },
  updateStatus: async (id, status, staffNotes = '') => {
    return apiCall(`/appointments/${id}/status`, 'PATCH', { status, staffNotes }, true);
  },
  delete: async (id) => {
    return apiCall(`/appointments/${id}`, 'DELETE', null, true);
  },
};

// ── DOCTORS ──────────────────────────────────────────────
const Doctors = {
  getAll: async (specialty = '') => {
    const qs = specialty ? `?specialty=${specialty}` : '';
    return apiCall(`/doctors${qs}`);
  },
  create: async (doctorData) => {
    return apiCall('/doctors', 'POST', doctorData, true);
  },
  update: async (id, data) => {
    return apiCall(`/doctors/${id}`, 'PATCH', data, true);
  },
  delete: async (id) => {
    return apiCall(`/doctors/${id}`, 'DELETE', null, true);
  },
};

// ── CONTACT ──────────────────────────────────────────────
const Contact = {
  send: async (formData) => {
    return apiCall('/contact', 'POST', formData);
  },
  getAll: async () => {
    return apiCall('/contact', 'GET', null, true);
  },
};

// Export for use in pages
window.MediCoreAPI = { Auth, Appointments, Doctors, Contact, getToken, clearAuth };
