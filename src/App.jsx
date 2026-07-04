import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Home from './pages/Home';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<Verify />} />

          {/* Páginas de usuario autenticado — layout compartido */}
          <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Área de administración — layout propio, guard de admin */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
