import { useCallback, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { crearCliente, crearOrden, listarClientes } from "../api"
import { Cargando, ErrorMensaje } from "../components/Estado"
import { useDatos } from "../hooks/useDatos"

const NUEVO = "nuevo"

export default function NuevaOrden() {
  const navigate = useNavigate()
  const { datos: clientes, error: errorCarga, cargando } = useDatos(listarClientes)

  const [clienteId, setClienteId] = useState(NUEVO)
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [equipo, setEquipo] = useState("")
  const [problema, setProblema] = useState("")
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // useRef: el <input type="file"> no puede ser controlado; se lee su valor al enviar
  const fotosRef = useRef(null)

  const enviar = useCallback(
    async (e) => {
      e.preventDefault()
      setError(null)

      const fotos = Array.from(fotosRef.current?.files ?? [])
      if (fotos.length > 3) {
        setError("Máximo 3 fotos.")
        return
      }

      setEnviando(true)
      try {
        let cliente = clienteId
        if (clienteId === NUEVO) {
          const creado = await crearCliente({ nombre: nombre.trim(), telefono: telefono.trim() })
          cliente = creado.id
        }
        const orden = await crearOrden({
          cliente,
          equipo: equipo.trim(),
          problema: problema.trim(),
          fotos,
        })
        navigate(`/ordenes/${orden.id}`)
      } catch (err) {
        setError(err.message)
        setEnviando(false)
      }
    },
    [clienteId, nombre, telefono, equipo, problema, navigate],
  )

  if (errorCarga) return <ErrorMensaje mensaje={errorCarga} />
  if (cargando && !clientes) return <Cargando />

  return (
    <>
      <h2>Recibir un equipo</h2>
      <form className="tarjeta" onSubmit={enviar}>
        <label>
          Cliente
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value={NUEVO}>— Cliente nuevo —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} · {c.telefono}
              </option>
            ))}
          </select>
        </label>

        {clienteId === NUEVO && (
          <>
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Teléfono
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </label>
          </>
        )}

        <label>
          Equipo
          <input
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            placeholder="Ej.: Laptop Lenovo IdeaPad 3"
            required
          />
        </label>

        <label>
          Problema
          <textarea value={problema} onChange={(e) => setProblema(e.target.value)} rows={4} required />
        </label>

        <label>
          Fotos (hasta 3)
          <input ref={fotosRef} type="file" accept="image/*" multiple />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primario" disabled={enviando}>
          {enviando ? "Guardando…" : "Registrar equipo"}
        </button>
      </form>
    </>
  )
}
