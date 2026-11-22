// Mensajes de carga y de error reutilizables
export function Cargando({ texto = "Cargando…" }) {
  return <p className="aviso">{texto}</p>
}

export function ErrorMensaje({ mensaje, onReintentar }) {
  return (
    <div className="aviso error" role="alert">
      <p>{mensaje}</p>
      {onReintentar && <button onClick={onReintentar}>Reintentar</button>}
    </div>
  )
}
