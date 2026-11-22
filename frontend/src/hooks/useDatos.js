import { useCallback, useEffect, useState } from "react"

// Carga datos del servidor y los mantiene sincronizados con la pantalla.
// `cargador(signal)` debe ser estable (useCallback en quien lo llama): es una
// dependencia del efecto, y si cambiara en cada render se pediría todo en bucle.
export function useDatos(cargador) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const control = new AbortController()
    setEstado((e) => ({ ...e, cargando: true, error: null }))

    cargador(control.signal)
      .then((datos) => setEstado({ datos, error: null, cargando: false }))
      .catch((err) => {
        if (err.name === "AbortError") return
        setEstado({ datos: null, error: err.message, cargando: false })
      })

    // Limpieza: si se desmonta o cambia la dependencia, se cancela la petición vieja
    return () => control.abort()
  }, [cargador, version])

  // useCallback: se le pasa como prop a componentes hijos y así no cambia en cada render
  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return { ...estado, recargar }
}
