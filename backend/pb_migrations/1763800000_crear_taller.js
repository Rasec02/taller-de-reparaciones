/// <reference path="../pb_data/types.d.ts" />

// Esquema del taller: clientes -> ordenes -> eventos.
//
// Reglas de acceso (sin autenticación, así que no distinguen quién pide):
//   - null  = nadie puede por la API (solo superusuario, y aun así los hooks de
//             "eventos" lo bloquean).
//   - ""    = cualquiera.
// Lo que NUNCA debe ocurrir queda en null: borrar clientes/órdenes y
// crear/editar/borrar eventos (los eventos los escribe el servidor, en el hook
// de ordenes, dentro de la misma transacción que el cambio de etapa).

migrate(
  (app) => {
    // ---------- clientes ----------
    const clientes = new Collection({
      type: "base",
      name: "clientes",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: null,
      fields: [
        { type: "text", name: "nombre", required: true, min: 1, max: 120 },
        { type: "text", name: "telefono", required: true, min: 1, max: 40 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE INDEX idx_clientes_telefono ON clientes (telefono)"],
    })
    app.save(clientes)

    // ---------- ordenes ----------
    const ordenes = new Collection({
      type: "base",
      name: "ordenes",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: null, // las órdenes no se borran nunca
      fields: [
        {
          type: "relation",
          name: "cliente",
          required: true,
          collectionId: clientes.id,
          cascadeDelete: false,
          minSelect: 0,
          maxSelect: 1,
        },
        { type: "text", name: "equipo", required: true, min: 1, max: 200 },
        { type: "text", name: "problema", required: true, min: 1, max: 2000 },
        {
          type: "select",
          name: "estado",
          required: true,
          maxSelect: 1,
          values: [
            "solicitada",
            "en_diagnostico",
            "presupuestada",
            "aprobada",
            "rechazada",
            "en_reparacion",
            "lista",
            "entregada",
            "cancelada",
          ],
        },
        { type: "text", name: "diagnostico", max: 4000 },
        { type: "number", name: "manoObra", min: 0 },
        // lista de { descripcion, cantidad, precio }; la valida el hook
        { type: "json", name: "piezas", maxSize: 200000 },
        {
          type: "file",
          name: "fotos",
          maxSelect: 3,
          maxSize: 5242880, // 5 MB por foto
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          thumbs: ["120x120", "800x0"],
        },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_ordenes_estado ON ordenes (estado)",
        "CREATE INDEX idx_ordenes_cliente ON ordenes (cliente)",
      ],
    })
    app.save(ordenes)

    // ---------- eventos ----------
    const eventos = new Collection({
      type: "base",
      name: "eventos",
      listRule: "",
      viewRule: "",
      createRule: null, // solo los crea el hook del servidor
      updateRule: null, // inmutables
      deleteRule: null, // imborrables
      fields: [
        {
          type: "relation",
          name: "orden",
          required: true,
          collectionId: ordenes.id,
          cascadeDelete: false,
          minSelect: 0,
          maxSelect: 1,
        },
        { type: "text", name: "de", max: 40 },
        { type: "text", name: "a", required: true, max: 40 },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
      ],
      indexes: ["CREATE INDEX idx_eventos_orden ON eventos (orden)"],
    })
    app.save(eventos)
  },
  (app) => {
    for (const nombre of ["eventos", "ordenes", "clientes"]) {
      try {
        app.delete(app.findCollectionByNameOrId(nombre))
      } catch (_) {
        // ya no existe
      }
    }
  },
)
