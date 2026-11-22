import { NavLink, Outlet } from "react-router"

// Diseño anidado: la barra se queda fija y <Outlet /> pinta la página de la ruta hija.
export default function Layout() {
  return (
    <>
      <header className="barra">
        <h1>🔧 Taller de reparaciones</h1>
        <nav>
          <NavLink to="/" end>
            Resumen
          </NavLink>
          <NavLink to="/ordenes" end>
            Órdenes
          </NavLink>
          <NavLink to="/ordenes/nueva">Recibir equipo</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
