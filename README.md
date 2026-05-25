# IDRD Frontend

Portal ciudadano del Instituto Distrital de Recreación y Deporte (IDRD) de Bogotá. Permite a los usuarios registrarse, gestionar su perfil y realizar reservas de gimnasios distritales.

## Tecnologías

| Paquete | Versión |
|---|---|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| HeadlessUI | 2 |
| Heroicons | 2 |
| React Hook Form | 7 |
| React Router DOM | 7 |
| Axios | 1 |

## Funcionalidades

- **Autenticación** — Registro, verificación por correo, inicio de sesión con código 2FA, recuperación de contraseña.
- **Perfil** — Actualización de nombres, documento de identidad, fecha de nacimiento y teléfono.
- **Seguridad** — Cambio de correo electrónico y contraseña con validación por código de verificación.
- **Direcciones** — Gestión de direcciones en formato colombiano (tipo de vía, número, cruce, placa, complemento, ciudad y departamento). Soporte para dirección principal.
- **Reservas** — Creación y eliminación de reservas de gimnasios distritales con selección de gimnasio, dirección, fecha y hora.
- **Notificaciones** — Snackbar global para confirmación de acciones exitosas y errores.
- **Navbar fija** — La barra de navegación permanece visible al hacer scroll.

## Estructura del proyecto

```
src/
├── api/            # Llamadas HTTP con Axios
├── components/     # Componentes reutilizables (Navbar, Comboboxes, ProtectedRoute)
├── context/        # AuthContext, ToastContext
├── data/           # Datos estáticos (departamentos y ciudades de Colombia)
├── pages/          # Páginas: Login, Register, Verify, Home, Settings, ForgotPassword
└── main.jsx
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app corre por defecto en `http://localhost:5173`.

## Build

```bash
npm run build
```

## Requisitos

- Node.js 18+
- Backend IDRD corriendo (ver `irdr_backend`)
