import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base : sur GitHub Pages, le site vit sous un sous-chemin (/<dépôt>/). Le
// workflow passe VITE_BASE (ex. « /RIVE_ecosystem_services/ ») pour que les
// assets ET les fetch de projets .geolibre.json résolvent en URL absolue —
// nécessaire aux liens de partage GeoLibre `?url=`. Défaut « ./ » (dev / host
// quelconque) : le prototype reste servable depuis n'importe où.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || './',
  // CORS ouvert : web.geolibre.app (iframe GeoLibre) doit pouvoir récupérer
  // les projets .geolibre.json servis par ce serveur (dev local).
  server: { cors: true },
  preview: { cors: true },
})
