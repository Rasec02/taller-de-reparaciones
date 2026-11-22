// Todas las peticiones al servidor, con fetch a pelo.

const BASE = import.meta.env.VITE_API_URL ?? ""

export class ErrorApi extends Error {
  constructor(mensaje, estado, datos) {
    super(mensaje)
    this.estado = estado
    this.datos = datos
  }
}

async function pedir(ruta, opciones = {}) {
  const resp = await fetch(BASE + ruta, opciones)
  const cuerpo = await resp.json().catch(() => null)
  if (!resp.ok) {
    // Los hooks devuelven el motivo en data.<campo>.message
    const detalle = cuerpo?.data && Object.values(cuerpo.data).map((d) => d?.message).filter(Boolean)[0]
    throw new ErrorApi(detalle || cuerpo?.message || `Error ${resp.status}`, resp.status, cuerpo?.data)
  }
  return cuerpo
}

const json = (metodo, datos) => ({
  method: metodo,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(datos),
})

// ---- lecturas ----

export async function listarOrdenes(signal) {
  const r = await pedir(
    "/api/collections/ordenes/records?perPage=500&sort=-created&expand=cliente",
    { signal },
  )
  return r.items
}

export function obtenerOrden(id, signal) {
  return pedir(`/api/collections/ordenes/records/${id}?expand=cliente`, { signal })
}

export async function listarEventos(ordenId, signal) {
  const filtro = encodeURIComponent(`orden="${ordenId}"`)
  const r = await pedir(
    `/api/collections/eventos/records?filter=${filtro}&sort=created&perPage=200`,
    { signal },
  )
  return r.items
}

export async function listarClientes(signal) {
  const r = await pedir("/api/collections/clientes/records?perPage=500&sort=nombre", { signal })
  return r.items
}

// ---- escrituras ----

export function crearCliente({ nombre, telefono }) {
  return pedir("/api/collections/clientes/records", json("POST", { nombre, telefono }))
}

// Las fotos viajan como multipart/form-data
export function crearOrden({ cliente, equipo, problema, fotos }) {
  const form = new FormData()
  form.append("cliente", cliente)
  form.append("equipo", equipo)
  form.append("problema", problema)
  for (const f of fotos) form.append("fotos", f)
  return pedir("/api/collections/ordenes/records", { method: "POST", body: form })
}

export function cambiarEtapa(id, estado) {
  return pedir(`/api/collections/ordenes/records/${id}`, json("PATCH", { estado }))
}

export function presupuestar(id, { diagnostico, manoObra, piezas }) {
  return pedir(
    `/api/collections/ordenes/records/${id}`,
    json("PATCH", { estado: "presupuestada", diagnostico, manoObra, piezas }),
  )
}
