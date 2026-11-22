// Datos de prueba: 2 clientes y 6 órdenes en etapas distintas.
// Usa SOLO la API pública, así que cada orden avanza por transiciones legales
// y el servidor genera su historial de eventos igual que en uso real.
//
//   node seed/seed.mjs            (PocketBase en http://127.0.0.1:8090)
//   API_URL=http://host:8090 node seed/seed.mjs

const API = process.env.API_URL ?? "http://127.0.0.1:8090"

async function pedir(ruta, opciones = {}) {
  const resp = await fetch(API + ruta, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  })
  const cuerpo = await resp.json().catch(() => null)
  if (!resp.ok) {
    throw new Error(`${opciones.method ?? "GET"} ${ruta} -> ${resp.status} ${JSON.stringify(cuerpo)}`)
  }
  return cuerpo
}

const crear = (coleccion, datos) =>
  pedir(`/api/collections/${coleccion}/records`, { method: "POST", body: JSON.stringify(datos) })

const cambiar = (id, datos) =>
  pedir(`/api/collections/ordenes/records/${id}`, { method: "PATCH", body: JSON.stringify(datos) })

const existentes = await pedir("/api/collections/ordenes/records?perPage=1")
if (existentes.totalItems > 0) {
  console.log(`Ya hay ${existentes.totalItems} órdenes; no se siembra nada.`)
  process.exit(0)
}

const ana = await crear("clientes", { nombre: "Ana Pérez", telefono: "+53 5 555 0101" })
const luis = await crear("clientes", { nombre: "Luis Gómez", telefono: "+53 5 555 0202" })

const nueva = (cliente, equipo, problema) =>
  crear("ordenes", { cliente: cliente.id, equipo, problema })

const presupuestar = (orden, diagnostico, manoObra, piezas) =>
  cambiar(orden.id, { estado: "presupuestada", diagnostico, manoObra, piezas })

// 1. Solo recibida
await nueva(ana, "Samsung Galaxy A12", "No carga; el conector parece flojo.")

// 2. En diagnóstico
const o2 = await nueva(luis, "Radio Sony XDR", "Suena con ruido y se corta.")
await cambiar(o2.id, { estado: "en_diagnostico" })

// 3. Presupuestada (esperando respuesta del cliente)
const o3 = await nueva(ana, "Laptop Lenovo IdeaPad 3", "Pantalla negra al encender.")
await cambiar(o3.id, { estado: "en_diagnostico" })
await presupuestar(o3, "Cable flex de pantalla dañado.", 25, [
  { descripcion: "Cable flex LCD", cantidad: 1, precio: 18.5 },
  { descripcion: "Tornillos M2", cantidad: 6, precio: 0.25 },
])

// 4. En reparación
const o4 = await nueva(luis, "TV LG 42 pulgadas", "Enciende y se apaga a los segundos.")
await cambiar(o4.id, { estado: "en_diagnostico" })
await presupuestar(o4, "Fuente de poder con condensadores hinchados.", 40, [
  { descripcion: "Condensador 470uF 35V", cantidad: 4, precio: 1.2 },
])
await cambiar(o4.id, { estado: "aprobada" })
await cambiar(o4.id, { estado: "en_reparacion" })

// 5. Entregada
const o5 = await nueva(ana, "iPhone 8", "Batería se descarga muy rápido.")
await cambiar(o5.id, { estado: "en_diagnostico" })
await presupuestar(o5, "Batería degradada al 62 %.", 15, [
  { descripcion: "Batería iPhone 8", cantidad: 1, precio: 30 },
])
await cambiar(o5.id, { estado: "aprobada" })
await cambiar(o5.id, { estado: "en_reparacion" })
await cambiar(o5.id, { estado: "lista" })
await cambiar(o5.id, { estado: "entregada" })

// 6. Cancelada
const o6 = await nueva(luis, "Tablet Huawei T3", "Pantalla rota.")
await cambiar(o6.id, { estado: "cancelada" })

console.log("Listo: 2 clientes y 6 órdenes (solicitada, en_diagnostico, presupuestada, en_reparacion, entregada, cancelada).")
