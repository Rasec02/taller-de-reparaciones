import { ETIQUETAS } from "../constants"

export default function Etapa({ estado }) {
  return <span className={`etapa etapa-${estado}`}>{ETIQUETAS[estado] ?? estado}</span>
}
