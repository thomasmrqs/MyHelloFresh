# Synchroniser le tableau de recettes avec l'app

Le tableau Claude Sheets « Base de recettes de la famille »
(https://claude.ai/artifact/DofHEKRUfpETQ1N5aDvoA4) est la référence :

- **Recettes** et **Ingrédients** : les recettes d'origine → `docs/recipes.js`
- **Modifications** : les changements permanents de la famille → `docs/modifications.js`, appliqués au chargement de l'app
- **Contrôle** (onglet caché) : une empreinte par onglet, pour savoir ce qui a changé sans tout relire

Procédure (faite par Claude) :

1. Lire `Contrôle!B2:B4` et comparer aux empreintes de `tools/sheet-fingerprint.json`.
2. Relire seulement les onglets dont l'empreinte a changé (`readCells`, toutes les lignes), et les mettre dans un `export.json` :
   `{"recettes": {...rows}, "ingredients": {...rows}, "modifications": {...rows}}`.
3. `node tools/sync-from-sheet.js export.json`, vérifier le diff, tester l'app.
4. Mettre à jour `tools/sheet-fingerprint.json`, commiter et publier.

Les adaptations faites dans l'app (« ✎ Adapter la recette ») ne valent que pour la semaine en cours
et passent par-dessus le tableau.
