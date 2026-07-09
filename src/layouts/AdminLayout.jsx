import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Layout compartido para las páginas de administración.
// Mismo patrón que UserLayout, con un contenedor más ancho para las tablas.
const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col gap-4 bg-slate-50">
      <Navbar />
      <main className="w-full px-4 lg:p-0 lg:w-4xl grow flex flex-col mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
