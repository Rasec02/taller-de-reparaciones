import { useState } from "react"
import { cambiarEtapa } from "../api"
import { ACCIONES } from "../constants"

// Botones del siguiente paso según la etapa. Tras cada cambio se vuelve a pedir
// todo al servidor (onCambio), así la pantalla nunca muestra algo que no esté guardado.
export default function Acciones({ orden, onCambio }) {
  const [error, setError] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const acciones = ACCIONES[orden.estado] ?? []

  if (acciones.length === 0) return null

  async function ejecutar(accion) {
    if (accion.confirmar && !window.confirm(accion.confirmar)) return
    setError(null)
    setOcupado(true)
    try {
      await cambiarEtapa(orden.id, accion.a)
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
      onCambio()
    }
  }

  return (
    <section className="tarjeta">
      <h3>Siguiente paso</h3>
      <div className="acciones">
        {acciones.map((a) => (
          <button
            key={a.a}
            className={a.peligro ? "peligro" : "primario"}
            disabled={ocupado}
            onClick={() => ejecutar(a)}
          >
            {a.texto}
          </button>
        ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
