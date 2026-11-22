import { useRef, useState } from "react"
import { presupuestar } from "../api"
import { calcularTotal, dinero } from "../utils"

// Formulario controlado para presupuestar una orden que está en diagnóstico.
export default function FormularioPresupuesto({ ordenId, onGuardado }) {
  const [diagnostico, setDiagnostico] = useState("")
  const [manoObra, setManoObra] = useState("0")
  const [piezas, setPiezas] = useState([])
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // useRef: contador de ids estables para las filas. No debe provocar renders ni
  // reiniciarse, y usar el índice como key rompería la lista al borrar una fila del medio.
  const siguienteId = useRef(1)

  function agregarPieza() {
    const id = siguienteId.current++
    setPiezas((lista) => [...lista, { id, descripcion: "", cantidad: "1", precio: "0" }])
  }

  function cambiarPieza(id, campo, valor) {
    setPiezas((lista) => lista.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)))
  }

  function quitarPieza(id) {
    setPiezas((lista) => lista.filter((p) => p.id !== id))
  }

  const total = calcularTotal(manoObra, piezas)

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await presupuestar(ordenId, {
        diagnostico: diagnostico.trim(),
        manoObra: Number(manoObra),
        piezas: piezas.map((p) => ({
          descripcion: p.descripcion.trim(),
          cantidad: Number(p.cantidad),
          precio: Number(p.precio),
        })),
      })
      onGuardado()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <h3>Proponer presupuesto</h3>
      <p className="nota">Una vez guardado, el presupuesto no se puede modificar.</p>

      <label>
        Diagnóstico
        <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} required rows={3} />
      </label>

      <label>
        Mano de obra
        <input type="number" min="0" step="0.01" value={manoObra} onChange={(e) => setManoObra(e.target.value)} required />
      </label>

      <fieldset>
        <legend>Piezas</legend>
        {piezas.length === 0 && <p className="nota">Sin piezas.</p>}
        {piezas.map((p) => (
          <div className="fila-pieza" key={p.id}>
            <input
              placeholder="Descripción"
              value={p.descripcion}
              onChange={(e) => cambiarPieza(p.id, "descripcion", e.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              step="1"
              aria-label="Cantidad"
              value={p.cantidad}
              onChange={(e) => cambiarPieza(p.id, "cantidad", e.target.value)}
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              aria-label="Precio"
              value={p.precio}
              onChange={(e) => cambiarPieza(p.id, "precio", e.target.value)}
              required
            />
            <button type="button" onClick={() => quitarPieza(p.id)}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" onClick={agregarPieza}>
          + Añadir pieza
        </button>
      </fieldset>

      <p className="total">Total: {dinero(total)}</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="primario" disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar presupuesto"}
      </button>
    </form>
  )
}
