import Etapa from "./Etapa"
import { fecha } from "../utils"

// `recibida` es la fecha de creación de la orden; los eventos son los cambios de etapa.
export default function Historial({ recibida, eventos }) {
  return (
    <ol className="historial">
      <li>
        <span className="fecha">{fecha(recibida)}</span> Equipo recibido
      </li>
      {eventos.map((ev) => (
        <li key={ev.id}>
          <span className="fecha">{fecha(ev.created)}</span> <Etapa estado={ev.de} /> → <Etapa estado={ev.a} />
        </li>
      ))}
    </ol>
  )
}
