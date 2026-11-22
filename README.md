# Taller de reparaciones — React + PocketBase

Segundo parcial de Programación Web. Aplicación para reemplazar la libreta de un taller que repara equipos electrónicos.
Sin autenticación: el personal del taller es el único usuario.

```
backend/   PocketBase: pb_migrations (esquema) y pb_hooks (reglas del proceso)
frontend/  React + Vite + react-router, peticiones con fetch
seed/      script que carga 2 clientes y 6 órdenes de prueba
```

## Levantarlo desde cero

Requisitos: **Node 20+** y el ejecutable de **PocketBase** (probado con 0.36.x; cualquier 0.23+ debe servir).

### 1. Servidor

1. Descarga PocketBase para tu sistema desde <https://pocketbase.io/docs/> (o los *releases* de GitHub) y deja el ejecutable dentro de `backend/`.
2. Desde `backend/`:

   ```bash
   cd backend
   ./pocketbase serve        # en Windows: pocketbase.exe serve
   ```

   Al arrancar, PocketBase aplica solo `pb_migrations/` (crea `clientes`, `ordenes` y `eventos`) y carga `pb_hooks/`.
   API en `http://127.0.0.1:8090`. El panel de administración (`/_/`) es opcional: la app no lo necesita.

### 2. Datos de prueba (2 clientes, 6 órdenes)

Con el servidor encendido, desde la raíz del repositorio:

```bash
node seed/seed.mjs
```

El script usa **solo la API pública** y hace avanzar cada orden por transiciones legales, así que también genera sus eventos. Deja órdenes en: `solicitada`, `en_diagnostico`, `presupuestada`, `en_reparacion`, `entregada` y `cancelada`. Si ya hay órdenes, no hace nada (se puede repetir sin duplicar). Para empezar de cero: parar el servidor y borrar `backend/pb_data/`.

### 3. Interfaz

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

En desarrollo, Vite reenvía `/api` a `http://127.0.0.1:8090` (variable `VITE_PB_URL` para cambiarlo).

## Cómo cumple las garantías

| Garantía | Dónde |
|---|---|
| **Orden del proceso**: solo la etapa siguiente; salidas solo como indica la tabla | `pb_hooks/reglas.js` (`TRANSICIONES`) usado por el hook `onRecordUpdate` de `ordenes`. Se compara contra lo que hay guardado, releído dentro de la transacción. |
| **Historial**: un evento por cambio de etapa, con fecha, inmutable | El mismo hook crea el evento en la misma transacción que el cambio (o se guardan los dos o ninguno). La fecha es el campo autodate `created`. Las reglas `createRule/updateRule/deleteRule` de `eventos` son `null` y además hay hooks `...Request` que lanzan 403 incluso para superusuarios. |
| **Coherencia**: lo mostrado = lo guardado | Tras cada acción la interfaz vuelve a pedir los datos al servidor (`recargar`); no modifica estado local a mano. |
| Presupuesto inmutable | `validarActualizacion` solo permite escribir diagnóstico/manoObra/piezas en la transición `en_diagnostico → presupuestada`; en cualquier otro caso deben ser idénticos a lo guardado. |
| Órdenes cerradas no cambian | `rechazada`, `cancelada` y `entregada` rechazan cualquier actualización. |
| Cancelar solo en `solicitada` | Está en la tabla de transiciones. |
| Total calculado, no guardado | `calcularTotal` en `frontend/src/utils.js`; no existe campo `total`. |
| Órdenes y clientes no se borran | `deleteRule: null` + hook 403 en `ordenes`. |
| Una orden nace `solicitada` y sin presupuesto | Hook `onRecordCreate` de `ordenes`. |

Formato de `piezas`: `[{ "descripcion": "Cable flex", "cantidad": 1, "precio": 18.5 }]` (cantidad entera ≥ 1, precio ≥ 0).

## Pruebas rápidas con la API (curl)

```bash
API=http://127.0.0.1:8090/api/collections
# saltarse una etapa -> 400
curl -X PATCH $API/ordenes/records/ID -H 'Content-Type: application/json' -d '{"estado":"lista"}'
# editar o borrar un evento -> 403
curl -X DELETE $API/eventos/records/ID_EVENTO
# borrar una orden -> 403/404
curl -X DELETE $API/ordenes/records/ID
```

## Interfaz

Rutas (`react-router`): `/` resumen por etapa · `/ordenes` lista con filtro (`?estado=`) y búsqueda por cliente/teléfono/equipo · `/ordenes/nueva` recibir equipo (con hasta 3 fotos) · `/ordenes/:id` detalle (parámetro de ruta): datos, fotos, presupuesto, siguiente paso e historial · `*` página 404. `Layout` es el diseño anidado con `<Outlet />`.

Notas para la defensa: `useEffect` (con limpieza que aborta la petición) está en `hooks/useDatos.js`; `useRef` se usa para el `<input type="file">` y para los ids de las filas de piezas; `useMemo` en el resumen y en el filtro de la lista (recorren la lista completa); `useCallback` en el cargador del detalle porque es dependencia de un efecto.
