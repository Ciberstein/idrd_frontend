import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import clsx from 'clsx';
import { Footer } from '../components/Footer';

// Layout compartido para las páginas de usuario autenticado.
// Aquí va el diseño general (fondo, barra de navegación, etc.); cada página
// aporta su propio <main> con el ancho que necesite.
export default function UserLayout() {
  return (
    <div className={clsx("min-h-screen flex flex-col lg:gap-4", 
      "bg-linear-to-b from-white to-slate-100")}>
      <Navbar />
      <main className={clsx(
        "w-full lg:w-4xl p-4 lg:p-0 mx-auto",
        "grow flex flex-col",
      )}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
