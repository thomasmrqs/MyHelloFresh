// Recettes de la famille. Quantités pour un dîner de 4 (2 adultes, 2 enfants),
// sauf si « serves » est donné : les quantités sont alors celles de la recette
// d'origine (Thermomix) et l'app les ramène à 4 couverts.
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
//   --- champs des recettes Thermomix (optionnels) ---
//   tmx       numéro de la recette Cookidoo (ex. "r59035") : la recette est faite au Thermomix
//   serves    nombre de portions de la recette d'origine (les quantités de ing sont pour ce nombre)
//   side      accompagnement conseillé, quantités pour 4 (non mis à l'échelle)
//   kind      "plat" (par défaut), "accompagnement", "dessert" ou "base" ;
//             seuls les plats sont proposés dans le menu, les autres s'ajoutent à la semaine
//   defaultOff true : pas proposé dans le menu tant qu'on ne l'a pas réactivé
//   url, source, rating  recette trouvée sur un site (ex. 750g), avec sa note ; proposée en priorité
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
    id: "dinde-creme", name: "Dinde à la crème, riz", emoji: "🍗", love: 1, tags: [], box: true,
    tool: "Cookeo, 15 min",
    ing: [["Escalopes de dinde", 600, "g", "boucher"], ["Crème fraîche", 20, "cl", "cremerie"], ["Oignons", 1, "pc", "legumes"],
      ["Riz", 300, "g", "epicerie"], ["Haricots verts surgelés", 600, "g", "surgeles"]],
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

  // ---------- Plats mijotés au Cookeo (750g.com, 4 étoiles ou plus et plus de 20 avis) ----------
  // Quantités de la recette d'origine (voir « serves ») ; l'app les ramène à un dîner de 4.
  {
    id: "bourguignon", name: "Bœuf bourguignon", emoji: "🍷", love: 1, tags: ["viandeRouge"], box: true,
    url: "https://www.750g.com/boeuf-bourguignon-au-cookeo-r205045.htm", source: "750g", rating: "5/5, 63 avis",
    serves: 6, tool: "Cookeo, 15 min", note: "Sans les champignons de la recette d'origine",
    ing: [["Collier de bœuf", 1000, "g", "boucher"], ["Vin rouge de Bourgogne", 50, "cl", "epicerie"], ["Lardons", 125, "g", "frais"],
      ["Oignons grelots", 8, "pc", "legumes"], ["Carottes", 3, "pc", "legumes"], ["Persil", 1, "bouquet", "legumes"],
      P("Bouquet garni"), P("Fond brun de veau"), P("Fécule de maïs"), P("Huile de tournesol")],
    side: [["Pâtes", 400, "g", "epicerie"]],
  },
  {
    id: "blanquette", name: "Blanquette de veau, riz", emoji: "🍲", love: 1, tags: [], box: true,
    url: "https://www.750g.com/blanquette-de-veau-au-cookeo-r208813.htm", source: "750g", rating: "5/5, 70 avis",
    serves: 4, tool: "Cookeo, 20 min", note: "Sans les champignons de la recette d'origine",
    ing: [["Veau pour blanquette", 800, "g", "boucher"], ["Carottes", 3, "pc", "legumes"], ["Oignons", 1, "pc", "legumes"],
      ["Crème fraîche", 4, "cl", "cremerie"], ["Œufs", 1, "pc", "cremerie"], ["Citron", 1, "pc", "legumes"], ["Persil", 1, "bouquet", "legumes"],
      P("Bouquet garni"), P("Bouillon de légumes"), P("Beurre"), P("Farine")],
    side: [["Riz", 300, "g", "epicerie"]],
  },
  {
    id: "blanquette-poulet", name: "Blanquette de poulet, riz", emoji: "🍗", love: 1, tags: [], box: true,
    url: "https://www.750g.com/blanquette-de-poulet-au-cookeo-r208845.htm", source: "750g", rating: "4,6/5, 26 avis",
    serves: 4, tool: "Cookeo, 20 min",
    ing: [["Filets de poulet", 800, "g", "boucher"], ["Carottes", 3, "pc", "legumes"], ["Oignons", 1, "pc", "legumes"],
      ["Crème fraîche", 4, "cl", "cremerie"], ["Œufs", 1, "pc", "cremerie"], ["Citron", 1, "pc", "legumes"], ["Persil", 1, "bouquet", "legumes"],
      P("Bouquet garni"), P("Bouillon de légumes"), P("Beurre"), P("Farine")],
    side: [["Riz", 300, "g", "epicerie"]],
  },
  {
    id: "filet-mignon", name: "Filet mignon à la moutarde, pommes de terre", emoji: "🐖", love: 1, tags: [], box: true,
    url: "https://www.750g.com/filet-mignon-au-cookeo-r208864.htm", source: "750g", rating: "5/5, 38 avis",
    serves: 4, tool: "Cookeo, 10 min",
    ing: [["Filets mignons de porc", 800, "g", "boucher"], ["Échalotes", 4, "pc", "legumes"], ["Tomates", 2, "pc", "legumes"],
      ["Crème fraîche", 20, "cl", "cremerie"], P("Moutarde"), P("Bouquet garni"), P("Bouillon de légumes"), P("Farine"), P("Beurre")],
    side: [["Pommes de terre", 1000, "g", "legumes"], ["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  // Autres plats mijotés au Cookeo de la famille
  {
    id: "porc-caramel", name: "Porc au caramel, riz", emoji: "🍖", love: 2, tags: [], box: true,
    tool: "Cookeo, 15 min",
    ing: [["Échine de porc", 800, "g", "boucher"], ["Oignons", 2, "pc", "legumes"], ["Carottes", 4, "pc", "legumes"],
      ["Riz", 300, "g", "epicerie"], P("Sucre"), P("Sauce soja"), P("Ail")],
  },
  {
    id: "petit-sale", name: "Petit salé aux lentilles", emoji: "🥘", love: 1, tags: ["legumineuses"], box: true,
    tool: "Cookeo, 10 min",
    ing: [["Petit salé", 800, "g", "boucher"], ["Lentilles vertes", 400, "g", "epicerie"], ["Carottes", 4, "pc", "legumes"],
      ["Oignons", 1, "pc", "legumes"], P("Bouquet garni")],
  },
  {
    id: "basquaise", name: "Poulet basquaise sans poivron, riz", emoji: "🍅", love: 1, tags: [], box: true,
    tool: "Cookeo, 15 min",
    ing: [["Hauts de cuisse de poulet", 1000, "g", "boucher"], ["Tomates concassées", 2, "boîte", "epicerie"],
      ["Courgettes", 2, "pc", "legumes"], ["Oignons", 2, "pc", "legumes"], ["Riz", 300, "g", "epicerie"]],
  },
  // ---------- Recettes Thermomix (Cookidoo) ----------
  // Quantités de la recette d'origine (voir « serves ») ; l'app les ramène à un dîner de 4.
  // Ces plats sont proposés en priorité dans le menu.
  {
    id: "brandade", name: "Brandade de morue", emoji: "🐟", love: 1, tags: ["poisson", "poissonnier"], box: true,
    tmx: "r59035", serves: 4, tool: "Thermomix + four, 25 min",
    kid: "Olivia n'aime pas la purée : cabillaud et pommes de terre en morceaux pour elle",
    note: "Morue à dessaler 24 h avant",
    ing: [["Morue salée", 600, "g", "poissonnier"], ["Pommes de terre", 500, "g", "legumes"], ["Persil plat", 1, "bouquet", "legumes"],
      P("Ail"), P("Lait"), P("Huile d'olive"), P("Poivre")],
    side: [["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "chili", name: "Chili con carne, riz", emoji: "🌶️", love: 1, tags: ["legumineuses", "viandeRouge"], box: true,
    tmx: "r433835", serves: 4, tool: "Thermomix, 25 min",
    note: "Piment et cumin à doser doucement pour les enfants",
    ing: [["Bœuf haché", 500, "g", "boucher"], ["Oignons", 1, "pc", "legumes"], ["Poivron rouge", 1, "pc", "legumes"],
      ["Tomates", 150, "g", "legumes"], ["Tomates pelées", 1, "boîte", "epicerie"], ["Haricots rouges", 1, "boîte", "epicerie"],
      P("Ail"), P("Huile d'olive"), P("Cumin"), P("Cannelle"), P("Quatre-épices"), P("Origan"), P("Piment en poudre")],
    side: [["Riz", 300, "g", "epicerie"]],
  },
  {
    id: "couscous", name: "Couscous d'agneau", emoji: "🍲", love: 1, tags: ["legumineuses"], box: true,
    tmx: "r910825", serves: 8, tool: "Thermomix, 20 min",
    kid: "Olivia n'aime pas la semoule : riz ou petites pâtes pour elle",
    ing: [["Agneau (épaule)", 580, "g", "boucher"], ["Tomates", 580, "g", "legumes"], ["Oignons", 1, "pc", "legumes"],
      ["Carottes", 180, "g", "legumes"], ["Courgettes", 180, "g", "legumes"], ["Navets", 180, "g", "legumes"],
      ["Potiron", 180, "g", "legumes"], ["Semoule moyenne", 470, "g", "epicerie"], ["Pois chiches en conserve", 290, "g", "epicerie"],
      ["Coriandre", 1, "bouquet", "legumes"], P("Safran"), P("Ras el-hanout"), P("Gingembre en poudre"), P("Huile d'olive"), P("Beurre")],
    side: [["Riz", 100, "g", "epicerie"]],
  },
  {
    id: "porc-caramel-tmx", name: "Échine au caramel, riz parfumé", emoji: "🍖", love: 2, tags: [], box: true, defaultOff: true,
    tmx: "r308569", serves: 4, tool: "Thermomix, 20 min",
    kid: "Pistaches concassées servies à part pour Olivia",
    note: "Plat mijoté : le menu propose la version Cookeo",
    ing: [["Échine de porc désossée", 600, "g", "boucher"], ["Riz", 200, "g", "epicerie"], ["Pistaches non salées", 60, "g", "epicerie"],
      ["Gingembre frais", 1, "pc", "legumes"], ["Persil plat", 1, "bouquet", "legumes"],
      P("Sucre"), P("Sauce soja"), P("Cardamome"), P("Quatre-épices"), P("Bouillon de volaille"), P("Huile d'olive")],
    side: [["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "parmentier-canard", name: "Effiloché de canard en parmentier", emoji: "🦆", love: 1, tags: [], box: true,
    tmx: "r59199", serves: 4, tool: "Thermomix + four, 10 min",
    kid: "Olivia n'aime pas la purée : canard effiloché et pommes de terre en morceaux pour elle",
    ing: [["Cuisses de canard confites", 4, "pc", "epicerie"], ["Pommes de terre", 400, "g", "legumes"], ["Céleri-rave", 300, "g", "legumes"],
      ["Échalotes", 3, "pc", "legumes"], ["Oignons", 1, "pc", "legumes"], ["Lait demi-écrémé", 30, "cl", "cremerie"],
      ["Coriandre", 1, "bouquet", "legumes"], P("Ail"), P("Pain rassis"), P("Huile d'olive")],
  },
  {
    id: "feuillete-saumon", name: "Feuilleté tressé au saumon et poireau", emoji: "🥐", love: 1,
    tags: ["poisson", "poissonnier", "fromage"], box: true,
    tmx: "r395999", serves: 6, tool: "Thermomix + four, 10 min", note: "Pâte feuilletée maison ou du commerce",
    ing: [["Pavés de saumon", 2, "pc", "poissonnier"], ["Poireaux", 2, "pc", "legumes"], ["Pâte feuilletée", 1, "pc", "frais"],
      ["Crème fraîche", 7, "cl", "cremerie"], ["Gruyère râpé", 30, "g", "cremerie"], ["Œufs", 1, "pc", "cremerie"], P("Huile d'olive")],
  },
  {
    id: "gaufre-quiche", name: "Gaufres quiche lardons-gruyère", emoji: "🧇", love: 1, tags: ["fromage"], box: true,
    tmx: "r343083", serves: 8, tool: "Thermomix + gaufrier, 5 min",
    ing: [["Gruyère râpé", 140, "g", "cremerie"], ["Lardons", 125, "g", "frais"], ["Œufs", 2, "pc", "cremerie"],
      ["Lait", 30, "cl", "cremerie"], ["Crème fraîche", 8, "cl", "cremerie"], P("Farine")],
    side: [["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "petit-sale-tmx", name: "Petit salé aux lentilles", emoji: "🥘", love: 1, tags: ["legumineuses"], box: true, defaultOff: true,
    tmx: "r57859", serves: 4, tool: "Thermomix, 5 min",
    note: "Plat mijoté : le menu propose la version Cookeo",
    ing: [["Petit salé", 400, "g", "boucher"], ["Saucisse de Morteau", 1, "pc", "boucher"], ["Lentilles vertes", 250, "g", "epicerie"],
      ["Carottes", 120, "g", "legumes"], ["Oignons", 1, "pc", "legumes"],
      P("Ail"), P("Clou de girofle"), P("Thym, romarin, laurier"), P("Moutarde")],
  },
  {
    id: "basquaise-tmx", name: "Poulet basquaise, riz", emoji: "🍅", love: 1, tags: [], box: true, defaultOff: true,
    tmx: "r431355", serves: 4, tool: "Thermomix, 10 min",
    note: "Plat mijoté : le menu propose la version Cookeo",
    ing: [["Pilons de poulet", 600, "g", "boucher"], ["Oignons", 2, "pc", "legumes"], ["Poivron vert", 1, "pc", "legumes"],
      ["Poivron rouge", 1, "pc", "legumes"], ["Tomates", 250, "g", "legumes"], ["Vin blanc sec", 20, "cl", "epicerie"],
      P("Ail"), P("Huile d'olive"), P("Thym, laurier")],
    side: [["Riz", 300, "g", "epicerie"]],
  },
  {
    id: "risotto-poulet", name: "Risotto de poulet aux champignons", emoji: "🍚", love: 1, tags: ["fromage"], box: true,
    tmx: "r106056", serves: 4, tool: "Thermomix, 10 min",
    note: "Contient des champignons, que Safia n'aime pas : à remplacer avec « Modifier »",
    ing: [["Filet de poulet", 300, "g", "boucher"], ["Riz à risotto", 300, "g", "epicerie"], ["Champignons de Paris", 400, "g", "legumes"],
      ["Échalotes", 2, "pc", "legumes"], ["Parmesan", 30, "g", "cremerie"], ["Crème liquide", 5, "cl", "cremerie"],
      ["Vin blanc sec", 10, "cl", "epicerie"], P("Bouillon de légumes"), P("Beurre"), P("Huile d'olive")],
  },
  {
    id: "roule-pdt", name: "Roulé de pomme de terre au fromage", emoji: "🥓", love: 1, tags: ["fromage"], box: true,
    tmx: "r154330", serves: 6, tool: "Thermomix + four, 10 min",
    kid: "Beaufort au lait cru : bien cuit ici, ou de l'emmental pour Olivia",
    ing: [["Pommes de terre", 550, "g", "legumes"], ["Beaufort", 300, "g", "cremerie"], ["Emmental", 100, "g", "cremerie"],
      ["Bacon", 12, "tranches", "frais"], ["Œufs", 2, "pc", "cremerie"], ["Oignons", 1, "pc", "legumes"]],
    side: [["Haricots verts surgelés", 600, "g", "surgeles"]],
  },
  {
    id: "soupe-oignon", name: "Soupe à l'oignon gratinée", emoji: "🧅", love: 1, tags: ["fromage"], box: true,
    tmx: "r54175", serves: 6, tool: "Thermomix + four, 20 min", note: "Se transporte en thermos",
    ing: [["Oignons", 500, "g", "legumes"], ["Gruyère râpé", 80, "g", "cremerie"], ["Baguette", 1, "pc", "boulangerie"],
      P("Bouillon de volaille"), P("Farine"), P("Beurre"), P("Huile d'olive")],
  },
  {
    id: "soupe-courgette", name: "Velouté de courgette", emoji: "🥣", love: 1, tags: ["vege", "fromage"], box: true,
    tmx: "r54155", serves: 4, tool: "Thermomix, 10 min", note: "Se transporte en thermos",
    ing: [["Courgettes", 700, "g", "legumes"], ["Oignons", 1, "pc", "legumes"], ["Fromage à tartiner (Vache qui rit)", 50, "g", "cremerie"],
      P("Bouillon de légumes"), P("Beurre")],
    side: [["Baguette", 1, "pc", "boulangerie"], ["Emmental râpé", 100, "g", "cremerie"]],
  },
  {
    id: "oeuf-poche", name: "Œufs pochés sauce poulette", emoji: "🍳", love: 1, tags: ["fromage"], box: false,
    tmx: "r765503", serves: 4, tool: "Thermomix, 10 min",
    note: "Pas d'œuf coulant pour les enfants : pocher jusqu'à ce que le jaune soit pris. Contient des champignons (Safia)",
    ing: [["Œufs", 4, "pc", "cremerie"], ["Poitrine fumée", 100, "g", "frais"], ["Champignons de Paris", 150, "g", "legumes"],
      ["Échalotes", 1, "pc", "legumes"], ["Crème fraîche", 5, "cl", "cremerie"], P("Bouillon de volaille"), P("Beurre"), P("Farine")],
    side: [["Pommes de terre", 800, "g", "legumes"]],
  },
  {
    id: "taboule", name: "Taboulé", emoji: "🥗", love: 1, tags: ["vege", "legumineuses"], box: true, defaultOff: true,
    tmx: "r245354", serves: 8, tool: "Thermomix, 15 min",
    note: "Pas proposé par défaut : Raphaël n'aime pas le taboulé et Safia évite le cru",
    ing: [["Semoule moyenne", 300, "g", "epicerie"], ["Tomates", 500, "g", "legumes"], ["Concombre", 1, "pc", "legumes"],
      ["Poivron", 1, "pc", "legumes"], ["Oignon doux", 1, "pc", "legumes"], ["Citrons", 2, "pc", "legumes"], ["Persil", 1, "bouquet", "legumes"],
      ["Pois chiches en conserve", 100, "g", "epicerie"], P("Raisins secs"), P("Huile d'olive")],
  },
  {
    id: "gaspacho", name: "Gaspacho tomate-pastèque", emoji: "🍉", love: 1, tags: ["vege"], box: true, defaultOff: true,
    tmx: "r421062", serves: 6, tool: "Thermomix, 10 min",
    note: "Plat d'été servi cru et froid : pas proposé par défaut (Safia évite le cru)",
    ing: [["Tomates", 500, "g", "legumes"], ["Pastèque", 350, "g", "legumes"], ["Concombre", 1, "pc", "legumes"],
      ["Basilic", 1, "bouquet", "legumes"], ["Pain complet", 50, "g", "boulangerie"], P("Vinaigre balsamique"), P("Huile d'olive")],
  },

  // Accompagnements, bases et desserts Thermomix : pas proposés dans le menu, on les ajoute à la semaine
  // depuis l'onglet Recettes. Les quantités sont pour la recette entière.
  {
    id: "puree", name: "Purée de pommes de terre", emoji: "🥔", kind: "accompagnement", love: 1, tags: ["vege"], box: true,
    tmx: "r54132", serves: 4, tool: "Thermomix, 10 min",
    ing: [["Pommes de terre farineuses", 1000, "g", "legumes"], ["Lait", 35, "cl", "cremerie"], P("Beurre")],
  },
  {
    id: "riz-legumes", name: "Riz express aux légumes", emoji: "🍚", kind: "accompagnement", love: 1, tags: ["vege"], box: true,
    tmx: "r212897", serves: 6, tool: "Thermomix, 10 min",
    ing: [["Riz basmati", 250, "g", "epicerie"], ["Carottes", 100, "g", "legumes"], ["Courgettes", 200, "g", "legumes"],
      P("Beurre demi-sel"), P("Huile d'olive")],
  },
  {
    id: "pates-fraiches", name: "Pâtes fraîches", emoji: "🍝", kind: "accompagnement", love: 1, tags: ["vege"], box: true,
    tmx: "r54105", serves: 4, tool: "Thermomix, 40 min",
    ing: [["Farine", 200, "g", "epicerie"], ["Œufs", 2, "pc", "cremerie"], P("Huile d'olive")],
  },
  {
    id: "bechamel", name: "Sauce béchamel express", emoji: "🥛", kind: "base", love: 1, tags: ["vege"], box: false,
    tmx: "r54157", serves: 4, tool: "Thermomix, 10 min",
    ing: [["Lait", 50, "cl", "cremerie"], P("Beurre"), P("Farine")],
  },
  {
    id: "pate-cake-sale", name: "Pâte à cake salé", emoji: "🍞", kind: "base", love: 1, tags: [], box: true,
    tmx: "r347029", serves: 8, tool: "Thermomix + four, 15 min", note: "Ajoutez la garniture (jambon, fromage, olives…) avec « Modifier »",
    ing: [["Farine", 250, "g", "epicerie"], ["Œufs", 4, "pc", "cremerie"], ["Lait", 20, "cl", "cremerie"], ["Beurre demi-sel", 75, "g", "cremerie"],
      ["Huile de tournesol", 75, "g", "epicerie"], P("Levure chimique")],
  },
  {
    id: "pate-brisee-sucree", name: "Pâte brisée sucrée", emoji: "🥧", kind: "base", love: 1, tags: [], box: false,
    tmx: "r54184", serves: 18, tool: "Thermomix, 20 min",
    ing: [["Farine", 370, "g", "epicerie"], ["Beurre doux", 200, "g", "cremerie"], ["Sucre en poudre", 100, "g", "epicerie"],
      ["Œufs", 1, "pc", "cremerie"], P("Sucre vanillé")],
  },
  {
    id: "cake-pommes", name: "Cake aux pommes", emoji: "🍎", kind: "dessert", love: 1, tags: [], box: true,
    tmx: "r245407", serves: 8, tool: "Thermomix + four, 10 min",
    ing: [["Pommes", 3, "pc", "legumes"], ["Citron non traité", 1, "pc", "legumes"], ["Sucre en poudre", 225, "g", "epicerie"],
      ["Farine", 140, "g", "epicerie"], ["Œufs", 3, "pc", "cremerie"], ["Crème fraîche épaisse", 8, "cl", "cremerie"],
      ["Beurre", 50, "g", "cremerie"], P("Levure chimique"), P("Calvados")],
  },
  {
    id: "cookies", name: "Cookies aux pépites de chocolat", emoji: "🍪", kind: "dessert", love: 1, tags: [], box: true,
    tmx: "r800845", serves: 12, tool: "Thermomix + four, 10 min",
    ing: [["Farine", 250, "g", "epicerie"], ["Beurre", 125, "g", "cremerie"], ["Sucre muscovado", 130, "g", "epicerie"],
      ["Œufs", 1, "pc", "cremerie"], ["Pépites de chocolat noir", 100, "g", "epicerie"], ["Chocolat noir", 50, "g", "epicerie"],
      P("Levure chimique"), P("Extrait de vanille"), P("Fleur de sel")],
  },
  {
    id: "fondant-framboise", name: "Fondant au chocolat et framboises", emoji: "🍫", kind: "dessert", love: 1, tags: [], box: true,
    tmx: "r69487", serves: 10, tool: "Thermomix + four, 5 min",
    ing: [["Chocolat noir 50 %", 200, "g", "epicerie"], ["Beurre", 180, "g", "cremerie"], ["Sucre en poudre", 180, "g", "epicerie"],
      ["Farine", 50, "g", "epicerie"], ["Œufs", 3, "pc", "cremerie"], ["Framboises", 150, "g", "legumes"]],
  },
  {
    id: "quatre-quarts", name: "Quatre-quarts", emoji: "🍰", kind: "dessert", love: 1, tags: [], box: true,
    tmx: "r119512", serves: 10, tool: "Thermomix + four, 5 min",
    ing: [["Beurre doux", 180, "g", "cremerie"], ["Œufs", 3, "pc", "cremerie"], ["Sucre en poudre", 180, "g", "epicerie"],
      ["Farine", 180, "g", "epicerie"], P("Levure chimique"), P("Rhum")],
  },
  {
    id: "crepes", name: "Pâte à crêpes", emoji: "🥞", kind: "dessert", love: 1, tags: [], box: false,
    tmx: "r54103", serves: 10, tool: "Thermomix, 10 min",
    ing: [["Lait", 60, "cl", "cremerie"], ["Farine", 250, "g", "epicerie"], ["Œufs", 4, "pc", "cremerie"], ["Beurre", 50, "g", "cremerie"]],
  },
  {
    id: "gaufres", name: "Pâte à gaufres", emoji: "🧇", kind: "dessert", love: 1, tags: [], box: false,
    tmx: "r56387", serves: 6, tool: "Thermomix + gaufrier, 5 min",
    ing: [["Farine", 250, "g", "epicerie"], ["Lait entier", 36, "cl", "cremerie"], ["Œufs", 2, "pc", "cremerie"], ["Beurre", 40, "g", "cremerie"],
      ["Sucre en poudre", 30, "g", "epicerie"], P("Levure chimique"), P("Sucre glace")],
  },
];
