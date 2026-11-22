/// <reference path="../pb_data/types.d.ts" />

// ---------------------------------------------------------------------------
// Hooks de "ordenes": validan el proceso y escriben el historial.
// Corren en el servidor, así que valen aunque alguien se salte la interfaz.
// (Dentro de cada handler se usa e.app, no $app, para respetar la transacción.)
// ---------------------------------------------------------------------------

// Una orden nueva: siempre "solicitada" y sin presupuesto.
onRecordCreate((e) => {
  const reglas = require(`${__hooks}/reglas.js`)

  const motivo = reglas.validarCreacion(e.record)
  if (motivo) {
    throw new BadRequestError(motivo, {
      estado: { code: "validation_invalid_creation", message: motivo },
    })
  }

  e.record.set("estado", "solicitada")
  e.next()
}, "ordenes")

// Cualquier cambio: valida contra lo que HAY guardado (se vuelve a leer dentro de la
// transacción, así dos peticiones simultáneas no pueden saltarse una etapa) y, si la
// etapa cambió, escribe el evento en la misma transacción: o se guardan los dos o ninguno.
onRecordUpdate((e) => {
  const reglas = require(`${__hooks}/reglas.js`)

  const previo = e.app.findRecordById("ordenes", e.record.id)

  const motivo = reglas.validarActualizacion(previo, e.record)
  if (motivo) {
    throw new BadRequestError(motivo, {
      estado: { code: "validation_invalid_update", message: motivo },
    })
  }

  const de = previo.getString("estado")
  const a = e.record.getString("estado")

  e.next() // guarda la orden

  if (de !== a) {
    const eventos = e.app.findCollectionByNameOrId("eventos")
    const evento = new Record(eventos)
    evento.set("orden", e.record.id)
    evento.set("de", de)
    evento.set("a", a)
    e.app.save(evento)
  }
}, "ordenes")

// ---------------------------------------------------------------------------
// "eventos" es un registro histórico: nadie lo crea, edita ni borra por la API
// (ni siquiera un superusuario). Lo escribe únicamente el hook de arriba.
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  throw new ForbiddenError("Los eventos los registra el servidor; no se crean por la API.")
}, "eventos")

onRecordUpdateRequest((e) => {
  throw new ForbiddenError("Los eventos no se pueden editar.")
}, "eventos")

onRecordDeleteRequest((e) => {
  throw new ForbiddenError("Los eventos no se pueden borrar.")
}, "eventos")

// Las órdenes tampoco se borran (la regla deleteRule ya lo impide; esto cubre al superusuario).
onRecordDeleteRequest((e) => {
  throw new ForbiddenError("Las órdenes no se pueden borrar.")
}, "ordenes")
