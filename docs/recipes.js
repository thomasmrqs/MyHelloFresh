// Recettes de la famille. Quantités pour un dîner de 4 (2 adultes, 2 enfants).
// Pour ajouter une recette : copier un bloc et adapter.
//
// Champs :
//   id        identifiant unique, sans espace
//   name      nom affiché
//   emoji     illustration de la carte
//   love      2 = plat réconfort / « j'aime beaucoup », 1 = « j'aime »
//   tags      fromage, poisson, poissonnier (poisson frais : vendredi ou week-end),
//             legumineuses, vege, viandeRouge
//   box       true si le plat se transporte et se réchauffe pour le midi
//   tool      appareil et temps actif
//   kid       remplacement pour la petite (optionnel)
//   note      astuce (optionnel)
//   ing       [nom, quantité, unité, rayon]  (quantité 0 = à vérifier au placard)
//
// Rayons : boucher, poissonnier, legumes, cremerie, frais, epicerie, surgeles, boulangerie, placard

window.RAYONS = {
  boucher: { label: "Boucher", hint: "Ouvert du mercredi au dimanche" },
  poissonnier: { label: "Poissonnier", hint: "Vendredi matin seulement" },
  legumes: { label: "Fruits et légumes" },
  cremerie: { label: "Crèmerie, œufs et fromages" },
  frais: { label: "Charcuterie et rayon frais" },
  boulangerie: { label: "Boulangerie" },
  epicerie: { label: "Épicerie" },
  surgeles: { label: "Surgelés" },
  placard: { label: "À vérifier dans les placards" },
  autre: { label: "Ajouts" },
};

const P = (name) => [name, 0, "", "placard"];

window.RECIPES = [
  {
    id: "porc-caramel", name: "Porc au caramel, riz", emoji: "🍖", love: 2, tags: [], box: true,
    tool: "Cookeo, 15 min",
    ing: [["Échine de porc", 800, "g", "boucher"], ["Oignons", 2, "pc", "legumes"], ["Carottes", 4, "pc", "legumes"],
      ["Riz", 300, "g", "epicerie"], P("Sucre"), P("Sauce soja"), P("Ail")],
  },
  {
    id: "tartiflette", name: "Tartiflette", emoji: "🧀", love: 2, tags: ["fromage"], box: true,
    tool: "Four, 15 min", kid: "Reblochon au lait pasteurisé pour la petite",
    ing: [["Pommes de terre", 1200, "g", "legumes"], ["Reblochon (pasteurisé)", 1, "pc", "cremerie"], ["Lardons", 200, "g", "frais"],
      ["Oignons", 2, "pc", "legumes"], ["Crème fraîche", 20, "cl", "cremerie"], ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "mont-dor", name: "Mont d'Or au four, pommes de terre", emoji: "🫕", love: 2, tags: ["fromage"], box: false,
    tool: "Four, 10 min", kid: "Mont d'Or au lait cru : pommes de terre, jambon et emmental fondu pour la petite",
    ing: [["Mont d'Or", 1, "pc", "cremerie"], ["Pommes de terre", 1200, "g", "legumes"], ["Jambon blanc", 4, "tranches", "frais"],
      ["Emmental râpé", 50, "g", "cremerie"], ["Vin blanc", 1, "bouteille", "epicerie"]],
  },
  {
    id: "carbonara", name: "Pâtes carbonara", emoji: "🍝", love: 2, tags: ["fromage"], box: true,
    tool: "Cookeo, 10 min", note: "Version à la crème, œufs bien cuits",
    ing: [["Pâtes", 500, "g", "epicerie"], ["Lardons", 250, "g", "frais"], ["Crème fraîche", 20, "cl", "cremerie"],
      ["Œufs", 2, "pc", "cremerie"], ["Parmesan", 80, "g", "cremerie"], ["Petits pois surgelés", 400, "g", "surgeles"]],
  },
  {
    id: "quiche-lorraine", name: "Quiche lorraine, haricots verts", emoji: "🥧", love: 1, tags: ["fromage"], box: true,
    tool: "Thermomix + four, 10 min",
    ing: [["Pâte brisée", 1, "pc", "frais"], ["Lardons", 200, "g", "frais"], ["Œufs", 4, "pc", "cremerie"],
      ["Crème fraîche", 20, "cl", "cremerie"], ["Lait", 20, "cl", "cremerie"], ["Emmental râpé", 100, "g", "cremerie"],
      ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "quiche-pesto", name: "Quiche jambon-pesto", emoji: "🥧", love: 1, tags: ["fromage"], box: true,
    tool: "Thermomix + four, 10 min",
    ing: [["Pâte brisée", 1, "pc", "frais"], ["Jambon blanc", 4, "tranches", "frais"], ["Pesto", 1, "pot", "epicerie"],
      ["Œufs", 4, "pc", "cremerie"], ["Crème fraîche", 20, "cl", "cremerie"], ["Mozzarella", 1, "pc", "cremerie"],
      ["Courgettes", 2, "pc", "legumes"]],
  },
  {
    id: "couscous", name: "Couscous d'agneau", emoji: "🍲", love: 1, tags: ["legumineuses"], box: true,
    tool: "Cookeo, 20 min", kid: "Riz ou petites pâtes à la place de la semoule",
    ing: [["Épaule d'agneau", 1000, "g", "boucher"], ["Carottes", 4, "pc", "legumes"], ["Courgettes", 2, "pc", "legumes"],
      ["Navets", 2, "pc", "legumes"], ["Pois chiches", 1, "boîte", "epicerie"], ["Semoule", 400, "g", "epicerie"],
      ["Riz", 100, "g", "epicerie"], P("Épices à couscous")],
  },
  {
    id: "petit-sale", name: "Petit salé aux lentilles", emoji: "🥘", love: 1, tags: ["legumineuses"], box: true,
    tool: "Cookeo, 10 min",
    ing: [["Petit salé", 800, "g", "boucher"], ["Lentilles vertes", 400, "g", "epicerie"], ["Carottes", 4, "pc", "legumes"],
      ["Oignons", 1, "pc", "legumes"], P("Bouquet garni")],
  },
  {
    id: "parmentier-canard", name: "Parmentier de canard", emoji: "🦆", love: 1, tags: ["fromage"], box: true,
    tool: "Thermomix + four, 20 min", kid: "Pommes de terre en morceaux plutôt qu'en purée",
    ing: [["Confit de canard", 1, "boîte", "epicerie"], ["Pommes de terre", 1500, "g", "legumes"], ["Lait", 30, "cl", "cremerie"],
      ["Emmental râpé", 100, "g", "cremerie"], ["Oignons", 1, "pc", "legumes"], ["Haricots verts surgelés", 600, "g", "surgeles"], P("Beurre")],
  },
  {
    id: "hachis", name: "Hachis parmentier", emoji: "🥔", love: 1, tags: ["viandeRouge", "fromage"], box: true,
    tool: "Thermomix + four, 20 min", kid: "Pommes de terre en morceaux plutôt qu'en purée",
    ing: [["Bœuf haché", 600, "g", "boucher"], ["Pommes de terre", 1500, "g", "legumes"], ["Oignons", 1, "pc", "legumes"],
      ["Lait", 30, "cl", "cremerie"], ["Emmental râpé", 100, "g", "cremerie"], ["Carottes", 3, "pc", "legumes"], P("Beurre")],
  },
  {
    id: "lasagnes", name: "Lasagnes", emoji: "🍝", love: 1, tags: ["viandeRouge", "fromage"], box: true,
    tool: "Thermomix + four, 20 min", note: "Faire un grand plat : il couvre deux midis",
    ing: [["Bœuf haché", 500, "g", "boucher"], ["Pulpe de tomate", 2, "boîte", "epicerie"], ["Carottes", 2, "pc", "legumes"],
      ["Oignons", 1, "pc", "legumes"], ["Plaques de lasagnes", 1, "paquet", "epicerie"], ["Lait", 100, "cl", "cremerie"],
      ["Emmental râpé", 150, "g", "cremerie"], P("Farine"), P("Beurre")],
  },
  {
    id: "brandade", name: "Brandade de morue", emoji: "🐟", love: 1, tags: ["poisson", "poissonnier"], box: true,
    tool: "Thermomix + four, 20 min", kid: "Cabillaud et pommes de terre en morceaux pour la petite",
    note: "Morue à dessaler 24 h avant",
    ing: [["Morue salée", 600, "g", "poissonnier"], ["Pommes de terre", 1200, "g", "legumes"], ["Lait", 30, "cl", "cremerie"],
      ["Haricots verts surgelés", 600, "g", "surgeles"], P("Ail"), P("Huile d'olive")],
  },
  {
    id: "dinde-creme", name: "Dinde à la crème, riz", emoji: "🍗", love: 1, tags: [], box: true,
    tool: "Cookeo, 15 min",
    ing: [["Escalopes de dinde", 600, "g", "boucher"], ["Crème fraîche", 20, "cl", "cremerie"], ["Oignons", 1, "pc", "legumes"],
      ["Riz", 300, "g", "epicerie"], ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "bourguignon", name: "Bœuf bourguignon", emoji: "🍷", love: 1, tags: ["viandeRouge"], box: true,
    tool: "Cookeo, 20 min", note: "Sans champignons",
    ing: [["Bœuf à braiser", 1000, "g", "boucher"], ["Carottes", 5, "pc", "legumes"], ["Oignons", 2, "pc", "legumes"],
      ["Lardons", 150, "g", "frais"], ["Vin rouge", 1, "bouteille", "epicerie"], ["Pâtes", 400, "g", "epicerie"], P("Farine")],
  },
  {
    id: "pizza", name: "Pizza maison", emoji: "🍕", love: 1, tags: ["fromage"], box: true,
    tool: "Four, 15 min",
    ing: [["Pâte à pizza", 2, "pc", "frais"], ["Coulis de tomate", 1, "pot", "epicerie"], ["Mozzarella", 2, "pc", "cremerie"],
      ["Jambon blanc", 4, "tranches", "frais"], ["Emmental râpé", 100, "g", "cremerie"]],
  },
  {
    id: "burger", name: "Burger maison et frites", emoji: "🍔", love: 1, tags: ["viandeRouge", "fromage"], box: false,
    tool: "Poêle + four, 15 min", note: "Steaks bien cuits pour les enfants",
    ing: [["Steaks hachés", 4, "pc", "boucher"], ["Pains à burger", 4, "pc", "boulangerie"], ["Cheddar en tranches", 8, "tranches", "cremerie"],
      ["Frites surgelées", 1000, "g", "surgeles"], ["Oignons", 1, "pc", "legumes"]],
  },
  {
    id: "soupe-courgette", name: "Soupe de courgettes à la Vache qui rit", emoji: "🥣", love: 1, tags: ["vege", "fromage"], box: true,
    tool: "Thermomix, 10 min", note: "Se transporte en thermos",
    ing: [["Courgettes", 1500, "g", "legumes"], ["Vache qui rit", 8, "portions", "cremerie"], ["Oignons", 1, "pc", "legumes"],
      ["Baguette", 1, "pc", "boulangerie"], ["Emmental râpé", 100, "g", "cremerie"], P("Bouillon de légumes")],
  },
  {
    id: "tarte-courgette", name: "Tarte aux courgettes et chèvre", emoji: "🥧", love: 1, tags: ["vege", "fromage"], box: true,
    tool: "Four, 15 min",
    ing: [["Pâte brisée", 1, "pc", "frais"], ["Courgettes", 3, "pc", "legumes"], ["Œufs", 3, "pc", "cremerie"],
      ["Crème fraîche", 20, "cl", "cremerie"], ["Bûche de chèvre", 1, "pc", "cremerie"]],
  },
  {
    id: "ravioles", name: "Gratin de ravioles au comté", emoji: "🧀", love: 1, tags: ["vege", "fromage"], box: true,
    tool: "Four, 10 min",
    ing: [["Ravioles du Dauphiné", 2, "paquet", "frais"], ["Crème fraîche", 20, "cl", "cremerie"], ["Comté râpé", 150, "g", "cremerie"],
      ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "risotto", name: "Risotto au butternut et parmesan", emoji: "🎃", love: 1, tags: ["vege", "fromage"], box: true,
    tool: "Thermomix, 10 min",
    ing: [["Riz à risotto", 400, "g", "epicerie"], ["Butternut", 1, "pc", "legumes"], ["Parmesan", 80, "g", "cremerie"],
      ["Oignons", 1, "pc", "legumes"], P("Bouillon de légumes")],
  },
  {
    id: "croque", name: "Croque-monsieur gratinés, haricots verts", emoji: "🥪", love: 1, tags: ["fromage"], box: false,
    tool: "Thermomix + four, 10 min",
    ing: [["Pain de mie", 1, "paquet", "epicerie"], ["Jambon blanc", 8, "tranches", "frais"], ["Emmental râpé", 200, "g", "cremerie"],
      ["Lait", 50, "cl", "cremerie"], ["Haricots verts surgelés", 600, "g", "surgeles"], P("Farine"), P("Beurre")],
  },
  {
    id: "basquaise", name: "Poulet basquaise sans poivron, riz", emoji: "🍅", love: 1, tags: [], box: true,
    tool: "Cookeo, 15 min",
    ing: [["Hauts de cuisse de poulet", 1000, "g", "boucher"], ["Tomates concassées", 2, "boîte", "epicerie"],
      ["Courgettes", 2, "pc", "legumes"], ["Oignons", 2, "pc", "legumes"], ["Riz", 300, "g", "epicerie"]],
  },
  {
    id: "blanquette", name: "Blanquette de veau, riz", emoji: "🍲", love: 1, tags: [], box: true,
    tool: "Cookeo, 20 min", note: "Sans champignons",
    ing: [["Veau pour blanquette", 1000, "g", "boucher"], ["Carottes", 4, "pc", "legumes"], ["Oignons", 1, "pc", "legumes"],
      ["Crème fraîche", 20, "cl", "cremerie"], ["Citron", 1, "pc", "legumes"], ["Riz", 300, "g", "epicerie"], P("Farine")],
  },
  {
    id: "cabillaud", name: "Cabillaud en croûte de parmesan, pommes de terre vapeur", emoji: "🐟", love: 1,
    tags: ["poisson", "poissonnier", "fromage"], box: true,
    tool: "Thermomix (Varoma) + four, 15 min", note: "Pas de purée : pommes de terre vapeur",
    ing: [["Dos de cabillaud", 600, "g", "poissonnier"], ["Parmesan", 60, "g", "cremerie"], ["Pommes de terre", 1000, "g", "legumes"],
      ["Haricots verts surgelés", 600, "g", "surgeles"], P("Chapelure")],
  },
  {
    id: "parmentier-saumon", name: "Parmentier de saumon et poireaux", emoji: "🍣", love: 1,
    tags: ["poisson", "poissonnier", "fromage"], box: true,
    tool: "Thermomix + four, 20 min", kid: "Saumon et poireaux avec des pâtes pour la petite",
    ing: [["Pavés de saumon", 500, "g", "poissonnier"], ["Poireaux", 3, "pc", "legumes"], ["Pommes de terre", 1200, "g", "legumes"],
      ["Emmental râpé", 80, "g", "cremerie"], ["Crème fraîche", 20, "cl", "cremerie"], ["Pâtes", 100, "g", "epicerie"]],
  },
  {
    id: "soupe-oignon", name: "Soupe à l'oignon gratinée", emoji: "🧅", love: 1, tags: ["vege", "fromage"], box: true,
    tool: "Thermomix + four, 10 min", note: "Se transporte en thermos",
    ing: [["Oignons", 1000, "g", "legumes"], ["Baguette", 1, "pc", "boulangerie"], ["Comté râpé", 150, "g", "cremerie"],
      P("Bouillon de bœuf"), P("Farine")],
  },
  {
    id: "steak-hv", name: "Steak haché, haricots verts", emoji: "🥩", love: 1, tags: ["viandeRouge"], box: true,
    tool: "Poêle + Cookeo, 10 min", note: "Steaks bien cuits pour les enfants",
    ing: [["Steaks hachés", 4, "pc", "boucher"], ["Haricots verts surgelés", 800, "g", "surgeles"], ["Pommes de terre", 800, "g", "legumes"]],
  },
  {
    id: "coquillettes", name: "Coquillettes au jambon et emmental", emoji: "🧀", love: 1, tags: ["fromage"], box: true,
    tool: "Cookeo, 5 min",
    ing: [["Coquillettes", 500, "g", "epicerie"], ["Jambon blanc", 6, "tranches", "frais"], ["Emmental râpé", 150, "g", "cremerie"],
      ["Petits pois surgelés", 400, "g", "surgeles"]],
  },
  {
    id: "bolognaise", name: "Pâtes bolognaise", emoji: "🍝", love: 2, tags: ["viandeRouge", "fromage"], box: true,
    tool: "Thermomix, 10 min", note: "Se prépare en double et se congèle",
    ing: [["Bœuf haché", 500, "g", "boucher"], ["Pulpe de tomate", 2, "boîte", "epicerie"], ["Carottes", 2, "pc", "legumes"],
      ["Oignons", 1, "pc", "legumes"], ["Spaghetti", 500, "g", "epicerie"], ["Parmesan", 50, "g", "cremerie"]],
  },
  {
    id: "saucisses-lentilles", name: "Saucisses aux lentilles", emoji: "🌭", love: 1, tags: ["legumineuses"], box: true,
    tool: "Cookeo, 10 min",
    ing: [["Saucisses de Toulouse", 6, "pc", "boucher"], ["Lentilles vertes", 400, "g", "epicerie"], ["Carottes", 4, "pc", "legumes"],
      ["Oignons", 1, "pc", "legumes"]],
  },
  {
    id: "poisson-pane", name: "Poisson pané, riz, petits pois-carottes", emoji: "🐠", love: 2, tags: ["poisson"], box: true,
    tool: "Four + Cookeo, 10 min",
    ing: [["Poisson pané", 1, "boîte", "surgeles"], ["Riz", 300, "g", "epicerie"], ["Petits pois-carottes surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "omelette", name: "Omelette au fromage, pommes de terre sautées", emoji: "🍳", love: 1, tags: ["vege", "fromage"], box: true,
    tool: "Poêle + Cookeo, 10 min", note: "Œufs bien cuits",
    ing: [["Œufs", 8, "pc", "cremerie"], ["Emmental râpé", 150, "g", "cremerie"], ["Pommes de terre", 1000, "g", "legumes"],
      ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "poulet-roti", name: "Poulet rôti, pommes de terre au four", emoji: "🍗", love: 2, tags: [], box: true,
    tool: "Four, 10 min", note: "Plat du dimanche, les restes font les boîtes",
    ing: [["Poulet fermier", 1, "pc", "boucher"], ["Pommes de terre", 1200, "g", "legumes"], ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "riz-cantonais", name: "Riz cantonais", emoji: "🍚", love: 1, tags: [], box: true,
    tool: "Poêle, 15 min",
    ing: [["Riz", 400, "g", "epicerie"], ["Jambon blanc", 4, "tranches", "frais"], ["Œufs", 3, "pc", "cremerie"],
      ["Petits pois surgelés", 300, "g", "surgeles"]],
  },
];
