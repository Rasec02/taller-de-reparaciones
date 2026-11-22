import { useMemo } from "react"
import { Link } from "react-router"
import { listarOrdenes } from "../api"
import { ETAPAS, ETIQUETAS, TERMINALES } from "../constants"
import { Cargando, ErrorMensaje } from "../components/Estado"
import { useDatos } from "../hooks/useDatos"

// listarOrdenes vive fuera del componente, así que su referencia ya es estable
export default function Resumen() {
  const { datos: ordenes, error, cargando, recargar } = useDatos(listarOrdenes)

  // useMemo: recorre todas las órdenes para contar por etapa; solo se rehace si cambian las órdenes
  const { porEtapa, pendientes } = useMemo(() => {
    const conteo = Object.fromEntries(ETAPAS.map((e) => [e, 0]))
    let abiertas = 0
    for (const o of ordenes ?? []) {
      conteo[o.estado] += 1
      if (!TERMINALES.includes(o.estado)) abiertas += 1
    }
    return { porEtapa: conteo, pendientes: abiertas }
  }, [ordenes])

  if (error) return <ErrorMensaje mensaje={error} onReintentar={recargar} />
  if (cargando && !ordenes) return <Cargando />

  return (
    <>
      <h2>Resumen del taller</h2>
      <p>
        <strong>{pendientes}</strong> {pendientes === 1 ? "orden en curso" : "órdenes en curso"} de{" "}
        {ordenes.length} en total.
      </p>
      <div className="cuadricula">
        {ETAPAS.map((etapa) => (
          <Link key={etapa} to={`/ordenes?estado=${etapa}`} className={`contador etapa-${etapa}`}>
            <span className="cifra">{porEtapa[etapa]}</span>
            <span>{ETIQUETAS[etapa]}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
