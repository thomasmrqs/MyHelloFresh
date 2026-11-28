// Adaptations permanentes des recettes : colonne « Adaptations » de l'onglet Recettes du tableau
// « Base de recettes de la famille ». Claude traduit le texte de la colonne en changements
// ci-dessous à chaque synchronisation (tools/SYNC.md). Appliquées dans l'ordre, au chargement.
//
// text    : le texte de la colonne, tel quel (affiché sur la fiche)
// changes : action "Remplacer" | "Supprimer" | "Ajouter" | "Changer la quantité"
//           ing (ingrédient concerné), new (nouvel ingrédient), qty, unit, rayon (clé de window.RAYONS),
//           part ("Recette" par défaut, ou "Accompagnement")
window.MODIFICATIONS = {
  "petit-sale": {
    text: "enléve la saucisse de morteau. morcreau de porc = jaret et poiterine",
    changes: [
      { action: "Supprimer", ing: "Saucisse de Morteau" },
      { action: "Remplacer", ing: "Petit salé", new: "Jarret de porc demi-sel", qty: 200, unit: "g", rayon: "boucher" },
      { action: "Ajouter", new: "Poitrine de porc demi-sel", qty: 200, unit: "g", rayon: "boucher" },
    ],
  },
  "basquaise": {
    text: "sans poivrons",
    changes: [{ action: "Supprimer", ing: "Poivron vert" }, { action: "Supprimer", ing: "Poivron rouge" }],
  },
  "soupe-courgette": {
    text: "ajoute du saint moret dans les ingrdients",
    changes: [{ action: "Ajouter", new: "Saint Môret", qty: 50, unit: "g", rayon: "cremerie" }],
  },
  "porc-caramel": {
    text: "sans pistache",
    changes: [{ action: "Supprimer", ing: "Pistaches non salées" }],
  },
  "fondant-framboise": {
    text: "Enléve le coulis de framboise, ajoute 1 oeuf supplémentaire et un demi sachet de levure chimique",
    changes: [
      { action: "Supprimer", ing: "Framboises" },
      { action: "Changer la quantité", ing: "Œufs", qty: 4 },
      { action: "Ajouter", new: "Levure chimique", qty: 0.5, unit: "sachet", rayon: "epicerie" },
    ],
  },
  "blanquette": {
    text: "Sans champignons de Paris",
    changes: [{ action: "Supprimer", ing: "Champignons de Paris" }],
  },
};
