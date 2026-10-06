#!/usr/bin/env python3
"""Genere RIVE-demo.html : version autonome (double-clic) du tableau de bord.
Milieux humides = DONNEE REELLE (service ArcGIS REST du MELCCFP, CMHPQ 2023),
rendue en direct + identification au clic. Zones d'analyse = demonstration inlinee.

Le panneau GeoLibre s'embarque par `?url=` : quand la page est servie a une URL
publique (GitHub Pages), le projet rive-trois-rivieres.geolibre.json se charge
automatiquement ; en local/file:// GeoLibre s'ouvre vide (chargement manuel).
"""
import json
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
d = root / "prototype" / "public" / "data"


def load(p):
    return json.load(open(p, encoding="utf-8"))


# couche methodologique ; les milieux humides sont distants (ArcGIS)
data = {"zones": load(d / "zones_analyse.geojson")}
DATA_JSON = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

HTML = (pathlib.Path(__file__).resolve().parent / "template.html").read_text(encoding="utf-8")
out = HTML.replace("__DATA__", DATA_JSON)
(root / "RIVE-demo.html").write_text(out, encoding="utf-8")
print("wrote RIVE-demo.html", len(out), "bytes")
