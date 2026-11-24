# MyHelloFresh : menus et courses de la famille

Une petite app web (PWA) à installer sur l'écran d'accueil de l'iPhone :

- **Menu** : chaque semaine, l'app propose des plats un par un. Glisser à droite pour garder, à gauche pour passer. Quand il y a assez de dîners, elle les répartit sur la semaine (poisson frais le vendredi ou le week-end, plats qui ne se transportent pas la veille d'un jour sans boîte) et cale les midis sur les restes de la veille.
- **Courses** : la liste est calculée à partir du menu (dîners pour 4, boîtes du midi pour 2 adultes, et la petite du lundi au jeudi), rangée par rayon, avec le boucher et le poissonnier à part.
- **Partage** : « Partager la liste » envoie un lien (Messages, WhatsApp…). Le lien contient toute la liste et le menu : il s'ouvre sur l'autre iPhone sans compte, et les articles se cochent au fil des courses.
- **Recettes** : la liste des plats, avec la possibilité d'en mettre de côté. Les recettes Thermomix (Cookidoo) sont proposées en priorité dans le menu, avec un lien vers la recette. Les accompagnements et desserts Thermomix (purée, crêpes, cake…) s'ajoutent à la semaine pour que leurs ingrédients arrivent dans la liste de courses.
- **Tableau de recettes** : la base de recettes vit dans le tableau Claude « Base de recettes de la famille ». Les changements permanents (remplacer, supprimer un ingrédient, changer une quantité) s'écrivent dans la colonne Adaptations de l'onglet Recettes ; Claude les recopie dans l'app chaque samedi matin (voir [`tools/SYNC.md`](tools/SYNC.md)).
- **Adapter une recette pour ce menu** : en composant le menu, « ✎ Adapter la recette » change les ingrédients pour le menu en cours seulement, sans rien garder ; la liste de courses suit.

- **Menus équilibrés** : chaque plat est classé (légumes, féculents, poisson, viande rouge, volaille et porc, charcuterie, œufs, légumineuses, végétarien, fromage) à partir de ses ingrédients, voir [`docs/nutrition.js`](docs/nutrition.js). Règles de la semaine, inspirées du PNNS : des légumes au moins 5 soirs sur 7, du poisson 2 fois, des légumineuses au moins une fois, un soir végétarien, 2 viandes rouges et 3 plats avec charcuterie au plus. Quand il ne reste plus assez de plats à choisir pour respecter ces règles, l'app ne propose plus que des plats qui comblent ce qui manque. Sur le menu, un encadré propose des plats pour équilibrer, et la liste de courses demande une confirmation s'il manque des légumes.
- **Synchronisation** (☁️ en haut à droite) : le menu, la liste de courses et les articles cochés sont partagés entre les téléphones de la famille, en temps réel, grâce à une base Firebase gratuite.

Sans synchronisation, tout reste sur le téléphone : pas de serveur, pas de compte, gratuit. L'app marche aussi hors connexion (les changements sont envoyés au retour du réseau).

## Synchroniser les téléphones (une seule fois)

1. Sur https://console.firebase.google.com : **Créer un projet** (`myhellofresh`), puis **Créer → Realtime Database → Créer une base de données**, emplacement Belgique (europe-west1), mode verrouillé.
2. Onglet **Règles**, coller puis **Publier** :
   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "familles": { "$code": { ".read": "$code.length >= 20", ".write": "$code.length >= 20" } }
     }
   }
   ```
3. Mettre l'adresse de la base (onglet Données, `https://…firebasedatabase.app`) dans [`docs/sync-config.js`](docs/sync-config.js), ou la coller dans l'app (☁️).
4. Sur le premier iPhone : ☁️ → **Créer la synchro de la famille**, puis **Inviter un autre téléphone**. Sur l'autre iPhone, ouvrir l'app, ☁️, coller le code dans **Rejoindre**.

Seuls les téléphones qui ont le code de la famille (24 caractères, créé par l'app) peuvent lire ou écrire. Les catégories des plats sont recalculées à partir des ingrédients : la synchronisation du samedi avec le tableau de recettes ne change pas.

## Mise en ligne (une seule fois)

1. Sur GitHub, dans le dépôt : **Settings → General → Danger Zone → Change visibility → Public**.
2. **Settings → Pages** : Source « Deploy from a branch », branche `main`, dossier `/docs`, puis **Save**.
3. Après une minute, l'app est sur `https://thomasmrqs.github.io/MyHelloFresh/`.

## Installer sur iPhone

Ouvrir le lien dans **Safari**, toucher le bouton Partager, puis **Sur l'écran d'accueil**.

## Ajouter ou modifier une recette

Les recettes sont dans [`docs/recipes.js`](docs/recipes.js) et les adaptations permanentes dans [`docs/modifications.js`](docs/modifications.js), recopiées depuis le tableau de recettes. Les quantités sont pour un dîner à 4. Pour les recettes Thermomix, les quantités sont celles de Cookidoo (champ `serves`) et l'app les ramène à 4 couverts.
