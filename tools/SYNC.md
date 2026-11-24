# Synchroniser le tableau de recettes avec l'app

Le tableau Claude Sheets « Base de recettes de la famille »
(https://claude.ai/artifact/DofHEKRUfpETQ1N5aDvoA4) est la référence :

- **Recettes** : une ligne par recette (proposée au menu, préférée, se transporte…) et la colonne
  **Adaptations (permanentes)**, écrite librement par la famille (« sans champignons ; butternut au lieu de potiron »)
- **Ingrédients** : les recettes d'origine (Cookidoo, 750g…)
- **Contrôle** (onglet caché) : une empreinte par onglet, pour savoir ce qui a changé sans tout relire

Dans le dépôt : `docs/recipes.js` (recettes d'origine) et `docs/modifications.js` (les adaptations,
traduites en changements d'ingrédients, appliquées au chargement de l'app).

Procédure (faite par Claude chaque samedi matin, ou sur demande) :

1. Lire `Contrôle!B2:B3` et comparer aux empreintes de `tools/sheet-fingerprint.json`. Rien de changé : s'arrêter.
2. Relire en entier les onglets dont l'empreinte a changé (`readCells`, ligne 1 comprise) et les mettre dans
   un `export.json` : `{"recettes": {...rows}, "ingredients": {...rows}}`.
3. `node tools/sync-from-sheet.js export.json`. Le script réécrit `docs/recipes.js`, retire de
   `docs/modifications.js` les adaptations effacées et liste les adaptations nouvelles ou changées.
4. Traduire chacune de ces adaptations dans `docs/modifications.js` (`text` = le texte exact de la colonne,
   `changes` = les changements d'ingrédients). En cas de doute sur ce que veut dire une adaptation, demander.
5. Vérifier le diff, tester l'app, mettre à jour `tools/sheet-fingerprint.json`, commiter et publier.

Les adaptations faites dans l'app (« ✎ Adapter la recette ») ne valent que pour le menu en cours et ne sont pas gardées.
