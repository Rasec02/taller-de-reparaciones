import { Route, Routes } from "react-router"
import DetalleOrden from "./pages/DetalleOrden"
import Layout from "./pages/Layout"
import NoEncontrada from "./pages/NoEncontrada"
import NuevaOrden from "./pages/NuevaOrden"
import Ordenes from "./pages/Ordenes"
import Resumen from "./pages/Resumen"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Resumen />} />
        <Route path="ordenes" element={<Ordenes />} />
        <Route path="ordenes/nueva" element={<NuevaOrden />} />
        <Route path="ordenes/:id" element={<DetalleOrden />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
