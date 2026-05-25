import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err.response ?? err)
);

export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUser = (id, data) => api.patch(`/admin/users/${id}`, data);
