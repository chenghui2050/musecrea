// API Client - Axios wrapper
const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for LLM calls
});

// Request interceptor - add auth token & lang header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('musecrea_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Lang'] = MuseCreaI18n.current;
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('musecrea_token');
        localStorage.removeItem('musecrea_user');
        window.location.hash = '#/login';
      }
      const msg = error.response.data?.detail || t('common.requestFailed');
      return Promise.reject(new Error(msg));
    }
    return Promise.reject(new Error(t('common.networkError')));
  }
);

// Auth API
const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', null, { params: data }),
};

// Upload API
const uploadApi = {
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImage: (productDbId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/upload/image/${productDbId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProductImages: () => api.get('/upload/product-images'),
  // Image Library
  getLibrary: () => api.get('/upload/image-library'),
  uploadToLibrary: (file, productId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (productId) formData.append('product_id', productId);
    return api.post('/upload/image-library/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  assignImage: (filename, productId) => {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('product_id', productId);
    return api.put('/upload/image-library/assign', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  unassignImage: (filename) => {
    const formData = new FormData();
    formData.append('filename', filename);
    return api.put('/upload/image-library/unassign', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (filename) => api.delete(`/upload/image-library/file/${filename}`),
};

// Evaluation API
const evalApi = {
  estimate: (data) => api.post('/evaluate/estimate', data),
  run: (uploadId, data) => api.post('/evaluate/run', data, { params: { upload_id: uploadId }, timeout: 600000 }),
  getHistory: (page = 1) => api.get('/evaluate/history', { params: { page } }),
  getDetail: (id) => api.get(`/evaluate/history/${id}`),
};

// Report API
const reportApi = {
  generate: (evalId) => {
    const token = localStorage.getItem('musecrea_token');
    return `${API_BASE}/report/generate/${evalId}?token=${encodeURIComponent(token || '')}`;
  },
  download: (evalId) => {
    const token = localStorage.getItem('musecrea_token');
    return `${API_BASE}/report/download/${evalId}?token=${encodeURIComponent(token || '')}`;
  },
};

// Billing API
const billingApi = {
  estimate: (count, llm) => api.post('/billing/estimate', null, { params: { evaluation_count: count, run_llm: llm } }),
  getBalance: () => api.get('/billing/balance'),
  redeemCoupon: (code) => api.post('/billing/redeem-coupon', { code }),
  getOrders: (page = 1) => api.get('/billing/orders', { params: { page } }),
  createOrder: (data) => api.post('/billing/order', data),
};

// Admin API
const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (page = 1) => api.get('/admin/users', { params: { page } }),
  toggleUser: (userId) => api.put(`/admin/users/${userId}/toggle-active`),
  updateCredits: (userId, credits) => api.put(`/admin/users/${userId}/credits`, null, { params: { credits } }),
  getApiLogs: (page = 1) => api.get('/admin/api-logs', { params: { page } }),
  createCoupon: (data) => api.post('/admin/coupons', data),
  getCoupons: (page = 1) => api.get('/admin/coupons', { params: { page } }),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
};

// Helper: auth state
function getUser() {
  const u = localStorage.getItem('musecrea_user');
  return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
  localStorage.setItem('musecrea_token', token);
  localStorage.setItem('musecrea_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('musecrea_token');
  localStorage.removeItem('musecrea_user');
}

function isLoggedIn() {
  return !!localStorage.getItem('musecrea_token');
}

// Dimension helpers
const DIM_LABELS = {
  'Novelty': '新颖度',
  'Usefulness': '有用性',
  'Affect': '情感性',
  'Aesthetics': '设计美学',
  'Cultural Values': '文化价值',
};

function getDimLabel(dim) {
  const map = {
    'Novelty': t('dim.novelty'),
    'Usefulness': t('dim.usefulness'),
    'Affect': t('dim.affect'),
    'Aesthetics': t('dim.aesthetics'),
    'Cultural Values': t('dim.cultural'),
  };
  return map[dim] || dim;
}

const DIM_COLORS = {
  'Novelty': '#667eea',
  'Usefulness': '#764ba2',
  'Affect': '#f093fb',
  'Aesthetics': '#4facfe',
  'Cultural Values': '#43e97b',
};
