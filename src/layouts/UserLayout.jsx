import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Layout compartido para las páginas de usuario autenticado.
// Aquí va el diseño general (fondo, barra de navegación, etc.); cada página
// aporta su propio <main> con el ancho que necesite.
export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col gap-4 bg-slate-50">
      <Navbar />
      <main className="w-full px-4 lg:p-0 lg:w-4xl grow flex flex-col mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
