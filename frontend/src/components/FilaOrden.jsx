import { Link } from "react-router"
import Etapa from "./Etapa"
import { fecha } from "../utils"

export default function FilaOrden({ orden }) {
  const cliente = orden.expand?.cliente
  return (
    <tr>
      <td>
        <Link to={`/ordenes/${orden.id}`}>{orden.equipo}</Link>
      </td>
      <td>{cliente?.nombre ?? "—"}</td>
      <td>{cliente?.telefono ?? "—"}</td>
      <td>
        <Etapa estado={orden.estado} />
      </td>
      <td>{fecha(orden.created)}</td>
    </tr>
  )
}
