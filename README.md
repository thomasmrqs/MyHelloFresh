# MyHelloFresh : menus et courses de la famille

Une petite app web (PWA) à installer sur l'écran d'accueil de l'iPhone :

- **Menu** : chaque semaine, l'app propose des plats un par un. Glisser à droite pour garder, à gauche pour passer. Quand il y a assez de dîners, elle les répartit sur la semaine (poisson frais le vendredi ou le week-end, plats qui ne se transportent pas la veille d'un jour sans boîte) et cale les midis sur les restes de la veille.
- **Courses** : la liste est calculée à partir du menu (dîners pour 4, boîtes du midi pour 2 adultes, et la petite du lundi au jeudi), rangée par rayon, avec le boucher et le poissonnier à part.
- **Partage** : « Partager la liste » envoie un lien (Messages, WhatsApp…). Le lien contient toute la liste et le menu : il s'ouvre sur l'autre iPhone sans compte, et les articles se cochent au fil des courses.
- **Recettes** : la liste des plats, avec la possibilité d'en mettre de côté.

Tout reste sur le téléphone : pas de serveur, pas de compte, gratuit. L'app marche aussi hors connexion.

## Mise en ligne (une seule fois)

1. Sur GitHub, dans le dépôt : **Settings → General → Danger Zone → Change visibility → Public**.
2. **Settings → Pages** : Source « Deploy from a branch », branche `main`, dossier `/docs`, puis **Save**.
3. Après une minute, l'app est sur `https://thomasmrqs.github.io/myhellofresh/`.

## Installer sur iPhone

Ouvrir le lien dans **Safari**, toucher le bouton Partager, puis **Sur l'écran d'accueil**.

## Ajouter ou modifier une recette

Les recettes sont dans [`docs/recipes.js`](docs/recipes.js), avec les quantités pour un dîner à 4.
