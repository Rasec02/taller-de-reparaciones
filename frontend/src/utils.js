// El total NO se guarda: se calcula siempre a partir de mano de obra y piezas.
export function calcularTotal(manoObra, piezas) {
  const lista = Array.isArray(piezas) ? piezas : []
  const piezasTotal = lista.reduce(
    (suma, p) => suma + (Number(p.cantidad) || 0) * (Number(p.precio) || 0),
    0,
  )
  return Math.round(((Number(manoObra) || 0) + piezasTotal) * 100) / 100
}

export function dinero(n) {
  return Number(n || 0).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// PocketBase devuelve "2026-11-22 14:16:00.123Z"
export function fecha(texto) {
  if (!texto) return ""
  const d = new Date(texto.replace(" ", "T"))
  return d.toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })
}

export function urlFoto(orden, archivo, thumb) {
  const base = `/api/files/${orden.collectionId}/${orden.id}/${encodeURIComponent(archivo)}`
  return thumb ? `${base}?thumb=${thumb}` : base
}
