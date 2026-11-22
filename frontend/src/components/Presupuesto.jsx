import { calcularTotal, dinero } from "../utils"

// Muestra el presupuesto ya registrado (solo lectura). El total se calcula aquí.
export default function Presupuesto({ orden }) {
  const piezas = Array.isArray(orden.piezas) ? orden.piezas : []
  const total = calcularTotal(orden.manoObra, piezas)

  return (
    <section className="tarjeta">
      <h3>Presupuesto</h3>
      <p>
        <strong>Diagnóstico:</strong> {orden.diagnostico}
      </p>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mano de obra</td>
            <td></td>
            <td></td>
            <td className="num">{dinero(orden.manoObra)}</td>
          </tr>
          {piezas.map((p, i) => (
            <tr key={i}>
              <td>{p.descripcion ?? p["descripción"]}</td>
              <td className="num">{p.cantidad}</td>
              <td className="num">{dinero(p.precio)}</td>
              <td className="num">{dinero(p.cantidad * p.precio)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3}>Total</th>
            <th className="num">{dinero(total)}</th>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
