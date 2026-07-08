#!/usr/bin/env python3
"""Genere les projets GeoLibre (.geolibre.json) de RIVE, au format officiel.

Trois projets, tous poussables dans l'iframe GeoLibre via le pont postMessage :
  1. rive-trois-rivieres.geolibre.json  — projet principal (MH en tuiles ArcGIS + zones)
  2. rive-sql-demo.geolibre.json        — extrait reel CMHPQ (768 polygones) + zones,
                                           interrogeable dans le SQL Workspace (DuckDB)
  3. rive-storymap-cop15.geolibre.json  — carte-recit COP15 / 30x30 (chapitres)

Reproductible : relit les GeoJSON de prototype/public/data/ a chaque execution.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / "prototype" / "public"
DATA = PUB / "data"

BASEMAP = "https://tiles.openfreemap.org/styles/positron"
MH_SERVICE = "https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer"
MH_EXPORT = (MH_SERVICE + "/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857"
             "&size=256,256&dpi=96&format=png32&transparent=true&layers=show:0&f=image")
ATTR = "© Gouvernement du Québec — MELCCFP, CMHPQ 2023"

# Couleurs officielles CMHPQ par classe (reprises du service ArcGIS).
CLASSE_COLORS = [
    ("Eau peu profonde", "#6677cd"),
    ("Prairie humide", "#f5f57a"),
    ("Marais", "#ff8f7f"),
    ("Marécage", "#a3ff73"),
    ("Tourbière boisée", "#5c8944"),
    ("Tourbière ouverte indifférenciée", "#ffebaf"),
    ("Tourbière ouverte minérotrophe", "#f5ca7a"),
    ("Tourbière ouverte ombrotrophe", "#cdaa66"),
    ("Complexe palsique", "#df7fc2"),
    ("Milieu humide indifférencié", "#cccccc"),
]
PRIORITE_COLORS = [
    ("Très élevée", "#7a0177"),
    ("Élevée", "#c51b8a"),
    ("Moyenne", "#f768a1"),
    ("Faible", "#fbb4b9"),
]


def style(**over):
    s = {
        "minZoom": 0, "maxZoom": 24,
        "fillColor": "#3b82f6", "strokeColor": "#1e40af",
        "strokeWidth": 1, "strokeWidthUnit": "pixels",
        "fillOpacity": 0.6, "circleRadius": 6,
        "vectorStyleMode": "single", "vectorStyleProperty": "",
        "vectorStyleClassCount": 5, "vectorStyleColorRamp": "viridis",
        "vectorStyleClassificationScheme": "equal-interval",
        "vectorStyleStops": [{"value": 0, "color": "#dbeafe"}, {"value": 1, "color": "#2563eb"}],
        "vectorStyleExpression": "",
        "rasterBrightnessMin": 0, "rasterBrightnessMax": 1,
        "rasterSaturation": 0, "rasterContrast": 0, "rasterHueRotate": 0,
    }
    s.update(over)
    return s


def categorized(prop, pairs, **over):
    return style(
        vectorStyleMode="categorized", vectorStyleProperty=prop,
        vectorStyleClassCount=len(pairs),
        vectorStyleStops=[{"value": v, "color": c, "label": v} for v, c in pairs],
        **over,
    )


def load(name):
    return json.load(open(DATA / name, encoding="utf-8"))


def geojson_layer(lid, name, fc, st, **kw):
    layer = {
        "id": lid, "name": name, "type": "geojson",
        "source": {"type": "geojson"}, "visible": True, "opacity": 1,
        "style": st, "metadata": kw.get("metadata", {}), "geojson": fc,
    }
    return layer


def raster_export_layer(lid, name):
    return {
        "id": lid, "name": name, "type": "xyz",
        "source": {"type": "raster", "tiles": [MH_EXPORT], "tileSize": 256,
                   "url": MH_EXPORT, "attribution": ATTR, "minzoom": 9},
        "visible": True, "opacity": 0.8, "style": style(),
        "metadata": {"sourceService": MH_SERVICE,
                     "note": "Donnée réelle CMHPQ 2023, tuiles d'export ArcGIS. Masquée au-delà du 1:600 000."},
    }


def preferences():
    return {"map": {"restrictBounds": False, "bounds": [-180, -85, 180, 85],
                    "minZoom": 0, "maxZoom": 24, "maxPitch": 85, "renderWorldCopies": True},
            "environmentVariables": []}


def project(name, layers, center, zoom, extra=None):
    styles = {l["id"]: l["style"] for l in layers}
    p = {"version": "0.1.0", "name": name,
         "mapView": {"center": center, "zoom": zoom, "bearing": 0, "pitch": 0},
         "basemapStyleUrl": BASEMAP, "basemapVisible": True, "basemapOpacity": 1,
         "layers": layers, "styles": styles, "preferences": preferences(),
         "metadata": {"producer": "RIVE — services écosystémiques Trois-Rivières"}}
    if extra:
        p.update(extra)
    return p


def centroid(feature):
    xs, ys = [], []

    def walk(c):
        if c and isinstance(c[0], (int, float)):
            xs.append(c[0]); ys.append(c[1])
        else:
            for x in c:
                walk(x)
    walk(feature["geometry"]["coordinates"])
    return [round(sum(xs) / len(xs), 4), round(sum(ys) / len(ys), 4)]


def write(name, obj):
    out = PUB / name
    out.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    # copie dans project/ pour le partage hors-app
    (ROOT / "project" / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {name}  ({out.stat().st_size // 1024} KB)")


def main():
    zones = load("zones_analyse.geojson")
    mh = load("mh_trois_rivieres.geojson")

    zones_style = categorized("classe_priorite", PRIORITE_COLORS, fillOpacity=0.55,
                              strokeColor="#ffffff", strokeWidth=1)
    mh_style = categorized("classe", CLASSE_COLORS, fillOpacity=0.7,
                           strokeColor="#3d566e", strokeWidth=0.4)

    # 1) Projet principal : MH en tuiles ArcGIS + zones
    write("rive-trois-rivieres.geolibre.json", project(
        "RIVE — Services écosystémiques · Trois-Rivières",
        [raster_export_layer("mh-melccfp", "Milieux humides potentiels — MELCCFP 2023"),
         geojson_layer("zones-analyse", "Unités d'analyse — priorisation 30x30 (démo)",
                       zones, zones_style,
                       metadata={"note": "Cadre méthodologique de démonstration."})],
        center=[-72.62, 46.30], zoom=10.4))

    # 2) Démo SQL : extrait réel CMHPQ (vecteur, interrogeable) + zones
    write("rive-sql-demo.geolibre.json", project(
        "RIVE — Démo SQL spatial · Milieux humides CMHPQ (extrait réel)",
        [geojson_layer("mh-cmhpq-tr", "Milieux humides CMHPQ — extrait Trois-Rivières (768 polygones)",
                       mh, mh_style,
                       metadata={"note": "Donnée réelle MELCCFP CMHPQ 2023, extrait borné + simplifié (~50 m). "
                                         "Interroger dans Processing → SQL Workspace.",
                                 "source": "https://www.donneesquebec.ca/recherche/fr/dataset/milieux-humides-potentiels"}),
         geojson_layer("zones-analyse", "Unités d'analyse — priorisation 30x30 (démo)",
                       zones, categorized("classe_priorite", PRIORITE_COLORS,
                                          fillOpacity=0.25, strokeColor="#7a0177", strokeWidth=1.5))],
        center=[-72.60, 46.31], zoom=10.6))

    # 3) Carte-récit COP15 / 30x30
    order = ["Rives du lac Saint-Pierre", "Delta / marais têtes du lac",
             "Confluence Saint-Maurice", "Massif forestier périurbain",
             "Centre-ville Trois-Rivières"]
    zf = {f["properties"]["nom"]: f for f in zones["features"]}
    texts = {
        "Rives du lac Saint-Pierre":
            "Réserve de la biosphère de l'UNESCO et plus grande plaine inondable du Saint-Laurent. "
            "Régulation des crues et habitat : cœur de la <strong>cible 3 (30x30)</strong> du Cadre de Kunming-Montréal.",
        "Delta / marais têtes du lac":
            "Marais et hauts-fonds à la tête du lac Saint-Pierre — filtration de l'eau et frayères. "
            "Priorité <strong>très élevée</strong> : à protéger et restaurer (<strong>cible 2</strong>).",
        "Confluence Saint-Maurice":
            "Jonction Saint-Maurice / Saint-Laurent, corridor écologique et récréatif structurant. "
            "Maintien des services écosystémiques en milieu périurbain (<strong>cible 11</strong>).",
        "Massif forestier périurbain":
            "Grand massif boisé en lisière urbaine : stockage du carbone et connectivité. "
            "Un espace vert et bleu à consolider (<strong>cible 12</strong>).",
        "Centre-ville Trois-Rivières":
            "Tissu urbain sous forte pression : la priorité se joue ici sur la renaturalisation "
            "et l'accès aux espaces bleus (<strong>cible 12</strong>).",
    }

    def chapter(nom, i):
        f = zf[nom]
        pr = f["properties"]
        return {
            "id": f"ch{i}", "title": nom,
            "description": (f"<p>{texts[nom]}</p><p><em>Priorité {pr['classe_priorite']} · "
                            f"score services {pr['score_se']}/100 · pression {pr['pression']}/100 · "
                            f"{pr['superficie_ha']} ha</em></p>"),
            "alignment": "left", "hidden": False,
            "location": {"center": centroid(f), "zoom": 12.2, "pitch": 35, "bearing": 0},
            "mapAnimation": "flyTo", "rotateAnimation": False,
            "onChapterEnter": [{"layerId": "zones-analyse", "opacity": 0.75, "duration": 800},
                               {"layerId": "mh-melccfp", "opacity": 0.85, "duration": 800}],
            "onChapterExit": [],
        }

    storymap = {
        "title": "Trois-Rivières & le 30x30",
        "subtitle": "Prioriser les services écosystémiques selon le Cadre de Kunming-Montréal (COP15)",
        "byline": "RIVE — démonstration",
        "footer": "Sources : MELCCFP (CMHPQ 2023), unités d'analyse RIVE (démo). Cadre CBD/COP15.",
        "theme": "dark", "showMarkers": True, "markerColor": "#c51b8a",
        "inset": True, "insetPosition": "bottom-right",
        "hideChapterNav": False, "startSlide": "global", "endSlide": "none",
        "chapters": [chapter(n, i) for i, n in enumerate(order, 1)],
    }
    write("rive-storymap-cop15.geolibre.json", project(
        "RIVE — Carte-récit COP15 / 30x30",
        [raster_export_layer("mh-melccfp", "Milieux humides potentiels — MELCCFP 2023"),
         geojson_layer("zones-analyse", "Unités d'analyse — priorisation 30x30",
                       zones, categorized("classe_priorite", PRIORITE_COLORS,
                                          fillOpacity=0.55, strokeColor="#ffffff", strokeWidth=1))],
        center=[-72.62, 46.28], zoom=9.6, extra={"storymap": storymap}))


if __name__ == "__main__":
    main()
