import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LAYERS, PRIORITY_COLORS, arcgisTileUrl, arcgisIdentifyUrl } from '../data/layers.js'

// Fond de carte vectoriel libre (OpenFreeMap, sans clé API).
const BASEMAP = 'https://tiles.openfreemap.org/styles/positron'
const CENTER = [-72.62, 46.30]
const ZOOM = 10.4

const priorityColorExpr = [
  'match',
  ['get', 'classe_priorite'],
  'Très élevée', PRIORITY_COLORS['Très élevée'],
  'Élevée', PRIORITY_COLORS['Élevée'],
  'Moyenne', PRIORITY_COLORS['Moyenne'],
  'Faible', PRIORITY_COLORS['Faible'],
  '#cccccc',
]

export default function MapView({ layers, onSelect }) {
  const ref = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const map = new maplibregl.Map({
      container: ref.current,
      style: BASEMAP,
      center: CENTER,
      zoom: ZOOM,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    const ro = new ResizeObserver(() => map.resize())
    ro.observe(ref.current)

    map.on('load', () => {
      LAYERS.forEach((l) => {
        const vis = l.visible ? 'visible' : 'none'

        if (l.type === 'arcgis-dynamic') {
          // Donnée réelle MELCCFP : export dynamique ArcGIS servi en tuiles raster.
          map.addSource(l.id, {
            type: 'raster',
            tiles: [arcgisTileUrl(l.url, l.layerId)],
            tileSize: 512,
            attribution: l.attribution,
          })
          map.addLayer({
            id: l.id,
            type: 'raster',
            source: l.id,
            minzoom: l.minzoom ?? 0,
            layout: { visibility: vis },
            paint: { 'raster-opacity': l.opacity ?? 1 },
          })
          return
        }

        map.addSource(l.id, { type: 'geojson', data: l.file })
        if (l.type === 'fill') {
          map.addLayer({
            id: l.id,
            type: 'fill',
            source: l.id,
            layout: { visibility: vis },
            paint: {
              'fill-color': l.legend === 'priority' ? priorityColorExpr : l.color,
              'fill-opacity': l.opacity ?? 0.6,
              'fill-outline-color': '#ffffff',
            },
          })
        } else if (l.type === 'line') {
          map.addLayer({
            id: l.id,
            type: 'line',
            source: l.id,
            layout: { visibility: vis, 'line-cap': 'round' },
            paint: { 'line-color': l.color, 'line-width': l.width ?? 2 },
          })
        } else if (l.type === 'circle') {
          map.addLayer({
            id: l.id,
            type: 'circle',
            source: l.id,
            layout: { visibility: vis },
            paint: {
              'circle-radius': 5,
              'circle-color': l.color,
              'circle-stroke-color': '#fff',
              'circle-stroke-width': 1.5,
            },
          })
        }
      })
    })

    // Clic unifié : d'abord une zone d'analyse, sinon identification du milieu humide réel.
    map.on('click', async (e) => {
      if (map.getLayer('zones')) {
        const hits = map.queryRenderedFeatures(e.point, { layers: ['zones'] })
        if (hits.length) {
          onSelect(hits[0].properties)
          return
        }
      }
      const mh = LAYERS.find((l) => l.id === 'mh_melccfp')
      const visible =
        map.getLayer('mh_melccfp') &&
        map.getLayoutProperty('mh_melccfp', 'visibility') !== 'none'
      if (!mh || !visible) return
      try {
        const c = map.getCanvas()
        const url = arcgisIdentifyUrl(
          mh.url, mh.layerId, e.lngLat.lng, e.lngLat.lat, map.getBounds(), c.width, c.height,
        )
        const r = await fetch(url)
        const j = await r.json()
        if (j.results && j.results.length) {
          onSelect({ __mh: true, ...j.results[0].attributes })
        }
      } catch (err) {
        console.warn('Identify MELCCFP a échoué', err)
      }
    })

    map.on('mousemove', (e) => {
      const over = map.getLayer('zones') && map.queryRenderedFeatures(e.point, { layers: ['zones'] }).length
      map.getCanvas().style.cursor = over ? 'pointer' : ''
    })

    return () => { ro.disconnect(); map.remove() }
  }, [onSelect])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    layers.forEach((l) => {
      if (map.getLayer(l.id)) {
        map.setLayoutProperty(l.id, 'visibility', l.visible ? 'visible' : 'none')
      }
    })
  }, [layers])

  return <div ref={ref} className="map" />
}
