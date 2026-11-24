// Modifications permanentes des recettes : copie de l'onglet « Modifications » du tableau
// « Base de recettes de la famille ». Appliquées dans l'ordre, au chargement de l'app.
// Les adaptations faites dans l'app pour une semaine passent par-dessus.
//
// action : "Remplacer" | "Supprimer" | "Ajouter" | "Changer la quantité"
// ing    : ingrédient concerné (Remplacer, Supprimer, Changer la quantité)
// new    : nouvel ingrédient (Remplacer, Ajouter)
// qty, unit, rayon : facultatifs (rayon = clé de window.RAYONS)
// part   : "Recette" ou "Accompagnement"
window.MODIFICATIONS = [
  {id: "bourguignon", action: "Supprimer", ing: "Champignons de Paris", part: "Recette", why: "Safia n'aime pas les champignons"},
  {id: "blanquette", action: "Supprimer", ing: "Champignons de Paris", part: "Recette", why: "Safia n'aime pas les champignons"},
];
