const API = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/users/me'),
  updateProfile: (body) => request('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  getNotifications: () => request('/users/notifications'),

  getCategories: () => request('/services/categories'),
  getServices: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/services${q ? `?${q}` : ''}`);
  },
  getService: (slug) => request(`/services/${slug}`),
  getSlots: (slug, date) => request(`/services/${slug}/slots?date=${date}`),

  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getMyBookings: () => request('/bookings/my'),
  getBooking: (ref) => request(`/bookings/${ref}`),
  cancelBooking: (ref) => request(`/bookings/${ref}/cancel`, { method: 'PATCH' }),

  demoPay: (body) => request('/payments/demo-pay', { method: 'POST', body: JSON.stringify(body) }),

  adminStats: () => request('/admin/stats'),
  adminBookings: (status) => request(`/admin/bookings${status ? `?status=${status}` : ''}`),
  adminUpdateStatus: (ref, status) => request(`/admin/bookings/${ref}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminServices: () => request('/admin/services'),
  adminToggleService: (id) => request(`/admin/services/${id}/toggle`, { method: 'PATCH' }),
};
