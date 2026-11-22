// Reglas del taller en un módulo puro (sin acceso a la base de datos).
// Los hooks lo cargan con require(`${__hooks}/reglas.js`).
// Cada función devuelve null si todo está bien, o un texto con el motivo del rechazo.

// Cambios de etapa permitidos. Ninguno más.
const TRANSICIONES = {
  solicitada: ["en_diagnostico", "cancelada"],
  en_diagnostico: ["presupuestada"],
  presupuestada: ["aprobada", "rechazada"],
  aprobada: ["en_reparacion"],
  en_reparacion: ["lista"],
  lista: ["entregada"],
  // rechazada, cancelada y entregada no tienen salida
}

const TERMINALES = ["rechazada", "cancelada", "entregada"]

// Lee el campo JSON "piezas" como arreglo. Devuelve null si no es un arreglo válido.
function leerPiezas(record) {
  const raw = record.get("piezas")
  if (raw === null || raw === undefined) return []
  const txt = typeof raw === "string" ? raw : toString(raw)
  if (!txt || txt === "null" || txt === '""') return []
  let valor
  try {
    valor = JSON.parse(txt)
  } catch (_) {
    return null
  }
  return Array.isArray(valor) ? valor : null
}

// Forma canónica de una lista de piezas (para comparar y para validar).
function normalizarPiezas(piezas) {
  return piezas.map((p) => ({
    descripcion: String((p && (p.descripcion ?? p["descripción"])) ?? "").trim(),
    cantidad: Number(p && p.cantidad),
    precio: Number(p && p.precio),
  }))
}

function validarPiezas(piezas) {
  if (piezas === null) return "piezas debe ser una lista de {descripcion, cantidad, precio}."
  const norm = normalizarPiezas(piezas)
  for (let i = 0; i < norm.length; i++) {
    const p = norm[i]
    const n = i + 1
    if (!p.descripcion) return `Pieza ${n}: falta la descripción.`
    if (!Number.isInteger(p.cantidad) || p.cantidad < 1) {
      return `Pieza ${n}: la cantidad debe ser un entero mayor o igual que 1.`
    }
    if (!Number.isFinite(p.precio) || p.precio < 0) {
      return `Pieza ${n}: el precio debe ser un número mayor o igual que 0.`
    }
  }
  return null
}

function leerPresupuesto(record) {
  const piezas = leerPiezas(record)
  return {
    diagnostico: record.getString("diagnostico").trim(),
    manoObra: record.getFloat("manoObra"),
    piezas,
    piezasNorm: piezas === null ? null : normalizarPiezas(piezas),
  }
}

function presupuestoVacio(p) {
  return p.diagnostico === "" && p.manoObra === 0 && p.piezas !== null && p.piezas.length === 0
}

function mismoPresupuesto(a, b) {
  return (
    a.diagnostico === b.diagnostico &&
    a.manoObra === b.manoObra &&
    JSON.stringify(a.piezasNorm) === JSON.stringify(b.piezasNorm)
  )
}

// Al crear: la orden siempre nace "solicitada" y sin presupuesto.
function validarCreacion(record) {
  const estado = record.getString("estado")
  if (estado !== "" && estado !== "solicitada") {
    return 'Una orden nueva siempre empieza en la etapa "solicitada".'
  }
  if (!presupuestoVacio(leerPresupuesto(record))) {
    return "El presupuesto se registra al presupuestar, no al crear la orden."
  }
  return null
}

// Al actualizar: `previo` es la orden tal como está guardada ahora, `nuevo` lo que se quiere guardar.
function validarActualizacion(previo, nuevo) {
  const de = previo.getString("estado")
  const a = nuevo.getString("estado")

  if (TERMINALES.includes(de)) {
    return `La orden está ${de} y no admite más cambios.`
  }

  if (nuevo.getString("cliente") !== previo.getString("cliente")) {
    return "No se puede cambiar el cliente de una orden."
  }

  if (a !== de) {
    const permitidas = TRANSICIONES[de] || []
    if (!permitidas.includes(a)) {
      return `Cambio de etapa no permitido: ${de} → ${a || "(vacío)"}.`
    }
  }

  const antes = leerPresupuesto(previo)
  const despues = leerPresupuesto(nuevo)

  if (de === "en_diagnostico" && a === "presupuestada") {
    // Único momento en que se registra el presupuesto
    if (!despues.diagnostico) return "Falta el diagnóstico."
    if (!Number.isFinite(despues.manoObra) || despues.manoObra < 0) {
      return "La mano de obra debe ser un número mayor o igual que 0."
    }
    return validarPiezas(despues.piezas)
  }

  if (!mismoPresupuesto(antes, despues)) {
    return "El presupuesto solo se registra al presupuestar y no se puede modificar después."
  }
  return null
}

module.exports = {
  TRANSICIONES,
  TERMINALES,
  validarCreacion,
  validarActualizacion,
}
