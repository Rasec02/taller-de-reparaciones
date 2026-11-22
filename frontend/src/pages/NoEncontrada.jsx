import { Link } from "react-router"

export default function NoEncontrada() {
  return (
    <>
      <h2>Página no encontrada</h2>
      <p>La dirección que buscas no existe.</p>
      <Link to="/">Ir al resumen</Link>
    </>
  )
}
