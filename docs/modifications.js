// Adaptations permanentes des recettes : colonne « Adaptations » de l'onglet Recettes du tableau
// « Base de recettes de la famille ». Claude traduit le texte de la colonne en changements
// ci-dessous à chaque synchronisation (tools/SYNC.md). Appliquées dans l'ordre, au chargement.
//
// text    : le texte de la colonne, tel quel (affiché sur la fiche)
// changes : action "Remplacer" | "Supprimer" | "Ajouter" | "Changer la quantité"
//           ing (ingrédient concerné), new (nouvel ingrédient), qty, unit, rayon (clé de window.RAYONS),
//           part ("Recette" par défaut, ou "Accompagnement")
window.MODIFICATIONS = {
  "blanquette": {
    text: "Sans champignons de Paris",
    changes: [{ action: "Supprimer", ing: "Champignons de Paris" }],
  },
  "bourguignon": {
    text: "Sans champignons de Paris",
    changes: [{ action: "Supprimer", ing: "Champignons de Paris" }],
  },
};
