#!/usr/bin/env python3
"""Genere RIVE-demo.html : version autonome (double-clic) du tableau de bord RIVE.
Milieux humides = DONNEE REELLE (service ArcGIS REST du MELCCFP, CMHPQ 2023),
rendue en direct + identification au clic. Zones d'analyse = demonstration inlinee.
Le projet GeoLibre est injecte et pousse dans l'iframe via le pont postMessage.
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

# projet GeoLibre complet (pousse dans l'iframe par postMessage)
project = load(root / "prototype" / "public" / "rive-trois-rivieres.geolibre.json")
PROJECT_JSON = json.dumps(project, ensure_ascii=False, separators=(",", ":"))

HTML = (pathlib.Path(__file__).resolve().parent / "template.html").read_text(encoding="utf-8")
out = HTML.replace("__DATA__", DATA_JSON).replace("__GEOLIBRE_PROJECT__", PROJECT_JSON)
(root / "RIVE-demo.html").write_text(out, encoding="utf-8")
print("wrote RIVE-demo.html", len(out), "bytes")
