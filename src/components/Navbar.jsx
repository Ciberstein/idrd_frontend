import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';

function fullName(user) {
  return [user?.first_name, user?.last_name1].filter(Boolean).join(' ');
}

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = [user?.first_name?.[0], user?.last_name1?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '??';

  const handleLogout = async () => {
    try { await logout(); } finally {
      signOut();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 p-3 w-full">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/home" className="text-3xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
          <img src="/favicon.svg" alt="Logo" className="size-8" />
          IRDR
        </Link>

        {/* User dropdown */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 rounded-full pr-2 p-1 hover:bg-slate-100 transition cursor-pointer focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 select-none">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden lg:block">
              {fullName(user)}
            </span>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 focus:outline-none data-closed:opacity-0 data-closed:scale-95 transition data-enter:duration-100 data-leave:duration-75"
          >
            {/* User info header */}
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-800 truncate">{fullName(user)}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            {user?.authority === 100 && (
              <MenuItem>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 data-focus:bg-indigo-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Administración
                </Link>
              </MenuItem>
            )}

            <MenuItem>
              <Link
                to="/settings"
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 data-focus:bg-slate-50 transition"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configuración
              </Link>
            </MenuItem>

            <MenuItem>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 data-focus:bg-red-50 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}

export default Navbar;
