import { createContext, useContext, useState, useEffect } from 'react';
import { validateSession } from '../api/auth';

const AuthContext = createContext(null);

// jsonwebtoken uses Node.js Buffer and cannot run in the browser.
// This decode-only helper parses the JWT payload without signature verification,
// which is safe here since we always confirm auth server-side via validateSession.
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 > Date.now();
}

function getStoredSession() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user && isTokenValid(token)) return user;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredSession);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    validateSession()
      .then(({ data }) => {
        if (!data?.auth) {
          clearSession();
        } else if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch(clearSession)
      .finally(() => setChecking(false));
  }, []);

  function clearSession() {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  const signIn = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
    // La respuesta de login no incluye `authority`; hidratamos el user completo
    // desde validateSession (fuente de verdad) para que el rol esté disponible
    // de inmediato (p.ej. la opción de admin), sin depender de un reload.
    validateSession()
      .then(({ data }) => {
        if (data?.auth && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      })
      .catch(() => {});
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const signOut = () => clearSession();

  return (
    <AuthContext.Provider value={{ user, checking, signIn, updateUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
