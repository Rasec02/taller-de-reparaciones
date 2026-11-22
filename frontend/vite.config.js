import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// En desarrollo, /api se reenvía a PocketBase para no tener problemas de CORS
// y para que las URLs de las fotos (/api/files/...) funcionen igual.
const POCKETBASE = process.env.VITE_PB_URL ?? "http://127.0.0.1:8090"

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": POCKETBASE } },
  preview: { proxy: { "/api": POCKETBASE } },
})
