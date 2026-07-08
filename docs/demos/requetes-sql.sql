-- ============================================================================
-- RIVE — Démo « SQL spatial dans le navigateur » (GeoLibre / DuckDB-WASM Spatial)
-- ----------------------------------------------------------------------------
-- Données : extrait réel de la Cartographie des milieux humides potentiels du
-- Québec (CMHPQ 2023, MELCCFP), région de Trois-Rivières — 768 polygones,
-- géométrie simplifiée (~50 m). Chargé par le projet rive-sql-demo.geolibre.json.
--
-- MODE D'EMPLOI
--   1. Panneau GeoLibre → bouton « Démo SQL » (charge le projet).
--   2. Menu Processing → SQL Workspace.
--   3. En haut du dialogue, GeoLibre liste les TABLES interrogeables (une par
--      couche vectorielle chargée). Repérez la table de la couche
--      « Milieux humides CMHPQ … » et, si son nom diffère de `mh_cmhpq_tr`
--      ci-dessous, remplacez-le dans les requêtes (idem `zones_analyse`).
--   4. Collez une requête, exécutez, puis « ajouter au résultat à la carte »
--      ou exporter en CSV / GeoParquet.
--
-- Tout s'exécute CÔTÉ NAVIGATEUR : aucun serveur, aucune base à installer.
-- ============================================================================


-- 1) SUPERFICIE DE MILIEUX HUMIDES PAR CLASSE  (le résultat vedette)
--    Vérification : ces chiffres doivent reproduire l'extrait (calcul de contrôle
--    RIVE sur les mêmes 768 polygones). Total attendu ≈ 4 304,8 ha.
--
--    classe                              ha_attendu   n
--    Eau peu profonde                       2118.3    89
--    Marécage                               1270.0   476
--    Tourbière ouverte ombrotrophe           740.5    75
--    Marais                                  109.7    84
--    Prairie humide                           32.4    12
--    Tourbière boisée                         30.8    27
--    Tourbière ouverte minérotrophe            3.0     5
SELECT classe,
       COUNT(*)                    AS n_polygones,
       ROUND(SUM(superficie_ha), 1) AS superficie_ha
FROM mh_cmhpq_tr
GROUP BY classe
ORDER BY superficie_ha DESC;


-- 2) FIABILITÉ DE LA DONNÉE : répartition par niveau de confiance
--    (attendu : Excellent 712, Moyen 46, Bon 10)
SELECT confiance, COUNT(*) AS n
FROM mh_cmhpq_tr
GROUP BY confiance
ORDER BY n DESC;


-- 3) LES 10 PLUS GRANDS MILIEUX HUMIDES DE L'EXTRAIT
SELECT classe, regime_trophique, ROUND(superficie_ha, 1) AS ha, confiance
FROM mh_cmhpq_tr
ORDER BY superficie_ha DESC
LIMIT 10;


-- 4) CIBLE « QUALITÉ DE L'EAU » : marais + marécages de confiance élevée
--    (milieux clés pour la filtration ; utile pour prioriser la protection)
SELECT ROUND(SUM(superficie_ha), 1) AS ha_filtration, COUNT(*) AS n
FROM mh_cmhpq_tr
WHERE classe IN ('Marais', 'Marécage')
  AND confiance IN ('Excellent', 'Bon');


-- 5) SUPERFICIE VÉRIFIÉE GÉOMÉTRIQUEMENT (ST_Area) vs attribut SUPERFICIE
--    Recalcule l'aire à partir de la géométrie (repro. en mètres) et la compare
--    à la valeur déclarée — un contrôle qualité que fait un vrai SIG.
SELECT classe,
       ROUND(SUM(ST_Area(ST_Transform(geom, 'EPSG:4326', 'EPSG:32618'))) / 10000.0, 1) AS ha_calcule,
       ROUND(SUM(superficie_ha), 1) AS ha_declare
FROM mh_cmhpq_tr
GROUP BY classe
ORDER BY ha_calcule DESC;


-- 6) JOINTURE SPATIALE INTER-COUCHES : milieux humides dans les unités
--    d'analyse PRIORITAIRES (« Très élevée »). Combien d'hectares de milieux
--    humides tombent dans les zones à protéger en premier ?
SELECT z.nom,
       z.classe_priorite,
       COUNT(*)                     AS n_mh,
       ROUND(SUM(m.superficie_ha), 1) AS ha_mh
FROM mh_cmhpq_tr m
JOIN zones_analyse z
  ON ST_Intersects(m.geom, z.geom)
WHERE z.classe_priorite = 'Très élevée'
GROUP BY z.nom, z.classe_priorite
ORDER BY ha_mh DESC;


-- ----------------------------------------------------------------------------
-- 7) PASSAGE À L'ÉCHELLE (production) — lecture d'un GeoParquet distant SANS le
--    télécharger : DuckDB streame par requêtes HTTP « range ». Remplacer l'URL
--    par le CMHPQ régional converti en GeoParquet et hébergé statiquement.
--    (Démonstration du modèle « cloud-native, zéro serveur » de RIVE.)
-- ----------------------------------------------------------------------------
-- SELECT classe, ROUND(SUM(superficie_ha), 1) AS ha
-- FROM read_parquet('https://<votre-hote>/mh_trois_rivieres.parquet')
-- GROUP BY classe
-- ORDER BY ha DESC;
