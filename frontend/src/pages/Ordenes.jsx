import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { listarOrdenes } from "../api"
import { ETAPAS, ETIQUETAS } from "../constants"
import { Cargando, ErrorMensaje } from "../components/Estado"
import FilaOrden from "../components/FilaOrden"
import { useDatos } from "../hooks/useDatos"

export default function Ordenes() {
  const { datos: ordenes, error, cargando, recargar } = useDatos(listarOrdenes)
  const [parametros, setParametros] = useSearchParams()
  const [busqueda, setBusqueda] = useState("")

  const etapa = parametros.get("estado") ?? ""

  // useMemo: filtra una lista que puede ser larga; solo se recalcula si cambia algo de lo que depende
  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return (ordenes ?? []).filter((o) => {
      if (etapa && o.estado !== etapa) return false
      if (!texto) return true
      const c = o.expand?.cliente
      return [o.equipo, c?.nombre, c?.telefono].some((v) => v && v.toLowerCase().includes(texto))
    })
  }, [ordenes, etapa, busqueda])

  function elegirEtapa(valor) {
    setParametros(valor ? { estado: valor } : {})
  }

  if (error) return <ErrorMensaje mensaje={error} onReintentar={recargar} />
  if (cargando && !ordenes) return <Cargando />

  return (
    <>
      <h2>Órdenes</h2>
      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar por cliente, teléfono o equipo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={etapa} onChange={(e) => elegirEtapa(e.target.value)} aria-label="Etapa">
          <option value="">Todas las etapas</option>
          {ETAPAS.map((e) => (
            <option key={e} value={e}>
              {ETIQUETAS[e]}
            </option>
          ))}
        </select>
        <button onClick={recargar}>Actualizar</button>
      </div>

      {visibles.length === 0 ? (
        <p className="aviso">
          No hay órdenes con ese filtro. <Link to="/ordenes/nueva">Recibir un equipo</Link>
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Etapa</th>
              <th>Recibido</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((o) => (
              <FilaOrden key={o.id} orden={o} />
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
