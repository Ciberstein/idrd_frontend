import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptor to normalize error responses
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err.response ?? err)
);

// ── Catalog ───────────────────────────────────────────────────────────────────
export const getDocTypes = () =>
  api.get('/auth/doc-types');

export const getViaTypes = () =>
  api.get('/auth/via-types');

export const getGimnasios = () =>
  api.get('/auth/gimnasios');

// ── Addresses ─────────────────────────────────────────────────────────────────
export const getAddresses = () =>
  api.get('/me/addresses');

export const createAddress = (data) =>
  api.post('/me/addresses', data);

export const updateAddress = (id, data) =>
  api.patch(`/me/addresses/${id}`, data);

export const deleteAddress = (id) =>
  api.delete(`/me/addresses/${id}`);

export const setDefaultAddress = (id) =>
  api.patch(`/me/addresses/${id}/default`);

// ── Reservas ──────────────────────────────────────────────────────────────────
export const getReservas = () =>
  api.get('/me/reservas');

export const createReserva = (data, captcha_token) =>
  api.post('/me/reservas', { ...data, captcha_token });

export const updateReserva = (id, data) =>
  api.patch(`/me/reservas/${id}`, data);

export const deleteReserva = (id) =>
  api.delete(`/me/reservas/${id}`);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (email, password, captcha_token) =>
  api.post('/auth/login', { email, password, captcha_token });

export const register = (data) =>
  api.post('/auth/register', data);

export const verifyCode = (accountId, code) =>
  api.post('/auth/register/validation', { accountId: Number(accountId), code: Number(code) });

export const logout = () =>
  api.post('/auth/logout');

export const validateSession = () =>
  api.post('/auth/validate');

// ── User profile ──────────────────────────────────────────────────────────────
export const updateProfile = (data) =>
  api.patch('/me/profile', data);

// ── Password change (2-step) ──────────────────────────────────────────────────
export const requestPasswordChange = (password, new_password, new_password_repeat) =>
  api.patch('/auth/update/password', { password, new_password, new_password_repeat });

export const confirmPasswordChange = (code, password) =>
  api.patch('/auth/update/password/validation', { code: Number(code), password });

// ── Email change (2-step) ─────────────────────────────────────────────────────
export const requestEmailChange = (email_new, email_new_repeat) =>
  api.patch('/auth/update/email', { email_new, email_new_repeat });

export const confirmEmailChange = (code, email) =>
  api.patch('/auth/update/email/validation', { code: Number(code), email });

// ── Password recovery (2-step, unauthenticated) ───────────────────────────────
export const requestRecovery = (email) =>
  api.post('/auth/recovery', { email });

export const confirmRecovery = (accountId, code, password, password_repeat) =>
  api.post('/auth/recovery/validation', {
    accountId: Number(accountId),
    code: Number(code),
    password,
    password_repeat,
  });
