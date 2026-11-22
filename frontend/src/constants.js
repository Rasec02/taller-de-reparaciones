// Etapas y cambios permitidos. Es solo ayuda para la interfaz (qué botones mostrar):
// la autoridad es el servidor, que rechaza cualquier cambio fuera de esta tabla.

export const ETAPAS = [
  "solicitada",
  "en_diagnostico",
  "presupuestada",
  "aprobada",
  "en_reparacion",
  "lista",
  "entregada",
  "rechazada",
  "cancelada",
]

export const ETIQUETAS = {
  solicitada: "Solicitada",
  en_diagnostico: "En diagnóstico",
  presupuestada: "Presupuestada",
  aprobada: "Aprobada",
  en_reparacion: "En reparación",
  lista: "Lista",
  entregada: "Entregada",
  rechazada: "Rechazada",
  cancelada: "Cancelada",
}

export const TERMINALES = ["rechazada", "cancelada", "entregada"]

// Acciones simples (las que no piden datos). "en_diagnostico" -> "presupuestada" tiene su formulario.
export const ACCIONES = {
  solicitada: [
    { a: "en_diagnostico", texto: "Empezar diagnóstico" },
    { a: "cancelada", texto: "Cancelar orden", peligro: true, confirmar: "¿Cancelar esta orden a petición del cliente?" },
  ],
  presupuestada: [
    { a: "aprobada", texto: "El cliente aprueba" },
    { a: "rechazada", texto: "El cliente rechaza", peligro: true, confirmar: "¿Registrar que el cliente rechazó el presupuesto? La orden se cerrará." },
  ],
  aprobada: [{ a: "en_reparacion", texto: "Empezar reparación" }],
  en_reparacion: [{ a: "lista", texto: "Terminar reparación" }],
  lista: [{ a: "entregada", texto: "Entregar al cliente" }],
}
