import { useCallback } from "react"
import { Link, useParams } from "react-router"
import { listarEventos, obtenerOrden } from "../api"
import { TERMINALES } from "../constants"
import { urlFoto } from "../utils"
import Acciones from "../components/Acciones"
import { Cargando, ErrorMensaje } from "../components/Estado"
import Etapa from "../components/Etapa"
import FormularioPresupuesto from "../components/FormularioPresupuesto"
import Historial from "../components/Historial"
import Presupuesto from "../components/Presupuesto"
import { useDatos } from "../hooks/useDatos"

// Ruta con parámetro: /ordenes/:id
export default function DetalleOrden() {
  const { id } = useParams()

  // useCallback: este cargador es dependencia del efecto de useDatos; sin él se crearía
  // uno nuevo en cada render y la página pediría los datos en bucle.
  const cargador = useCallback(
    async (signal) => {
      const [orden, eventos] = await Promise.all([obtenerOrden(id, signal), listarEventos(id, signal)])
      return { orden, eventos }
    },
    [id],
  )

  const { datos, error, cargando, recargar } = useDatos(cargador)

  if (error) {
    return (
      <>
        <ErrorMensaje mensaje={error} onReintentar={recargar} />
        <Link to="/ordenes">← Volver a las órdenes</Link>
      </>
    )
  }
  if (cargando && !datos) return <Cargando />

  const { orden, eventos } = datos
  const cliente = orden.expand?.cliente
  const tienePresupuesto = ["presupuestada", "aprobada", "rechazada", "en_reparacion", "lista", "entregada"].includes(
    orden.estado,
  )
  const cerrada = TERMINALES.includes(orden.estado)

  return (
    <>
      <p>
        <Link to="/ordenes">← Órdenes</Link>
      </p>
      <h2>
        {orden.equipo} <Etapa estado={orden.estado} />
      </h2>

      <section className="tarjeta">
        <p>
          <strong>Cliente:</strong> {cliente?.nombre} · {cliente?.telefono}
        </p>
        <p>
          <strong>Problema:</strong> {orden.problema}
        </p>
        {orden.fotos?.length > 0 && (
          <div className="fotos">
            {orden.fotos.map((f) => (
              <a key={f} href={urlFoto(orden, f)} target="_blank" rel="noreferrer">
                <img src={urlFoto(orden, f, "120x120")} alt={`Foto de ${orden.equipo}`} />
              </a>
            ))}
          </div>
        )}
      </section>

      {tienePresupuesto && <Presupuesto orden={orden} />}

      {orden.estado === "en_diagnostico" && <FormularioPresupuesto ordenId={orden.id} onGuardado={recargar} />}

      {!cerrada && <Acciones orden={orden} onCambio={recargar} />}
      {cerrada && <p className="aviso">Esta orden está cerrada y no cambia más.</p>}

      <section className="tarjeta">
        <h3>Historial</h3>
        <Historial recibida={orden.created} eventos={eventos} />
      </section>
    </>
  )
}
