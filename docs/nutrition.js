// Équilibre des menus : catégories des plats et règles de la semaine.
//
// Les catégories sont déduites des ingrédients de chaque recette (recipes.js, adaptations comprises),
// pour qu'une recette ajoutée ou changée dans le tableau soit classée toute seule, sans colonne en plus.
// Si un classement est faux, le corriger dans NUTRITION_OVERRIDES ci-dessous.
//
// Catégories :
//   legumes       au moins un vrai légume (oignon, ail et herbes ne comptent pas, la pomme de terre non plus)
//   feculents     pommes de terre, riz, pâtes, semoule, pain, pâte à tarte, légumineuses…
//   poisson       poisson ou fruits de mer
//   viandeRouge   bœuf, agneau, veau
//   viandeBlanche poulet, dinde, canard, porc
//   charcuterie   lardons, jambon, saucisses, bacon…
//   oeufs         des œufs comme ingrédient principal (pas une pâte à gâteau)
//   legumineuses  lentilles, haricots rouges, pois chiches…
//   vege          ni viande ni poisson
//   fromage       fromage ou plat gratiné
(() => {
  "use strict";

  // Corrections à la main : { idRecette: { add: ["legumes"], remove: ["charcuterie"] } }
  window.NUTRITION_OVERRIDES = {
  };

  window.NUTRI_LABELS = {
    legumes: { label: "Légumes", emoji: "🥦" },
    feculents: { label: "Féculents", emoji: "🍚" },
    poisson: { label: "Poisson", emoji: "🐟" },
    viandeRouge: { label: "Viande rouge", emoji: "🥩" },
    viandeBlanche: { label: "Volaille, porc", emoji: "🍗" },
    charcuterie: { label: "Charcuterie", emoji: "🥓" },
    oeufs: { label: "Œufs", emoji: "🥚" },
    legumineuses: { label: "Légumineuses", emoji: "🫘" },
    vege: { label: "Végétarien", emoji: "🌱" },
    fromage: { label: "Fromage", emoji: "🧀" },
  };

  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe");
  const re = (words) => new RegExp("\\b(" + words.join("|") + ")", "i");

  const WORDS = {
    legumes: re(["haricots? verts?", "courgette", "carotte", "navet", "potiron", "butternut", "courge", "celeri", "poireau",
      "poivron", "tomates?$", "tomates? (pelee|cerise|fraiche)", "pulpe de tomate", "petits? pois", "concombre", "epinard",
      "brocoli", "chou", "champignon", "aubergine", "salade", "betterave", "fenouil", "endive", "artichaut", "asperge",
      "legumes", "ratatouille", "mais", "patate douce", "panais", "blette"]),
    feculents: re(["pommes? de terre", "riz", "pates", "coquillettes", "spaghetti", "tagliatelle", "penne", "lasagne",
      "semoule", "boulgour", "quinoa", "pain", "baguette", "pate brisee", "pate feuilletee", "pate a pizza", "frites",
      "ravioles", "gnocchi", "farine", "lentilles", "haricots rouges", "haricots blancs", "pois chiches", "flageolets", "puree"]),
    poisson: re(["poisson", "morue", "saumon", "cabillaud", "colin", "merlu", "thon", "sardine", "maquereau", "truite",
      "lieu", "crevette", "moules", "dorade", "bar\\b", "sole", "lotte", "haddock", "surimi"]),
    viandeRouge: re(["boeuf", "agneau", "veau", "steak", "collier", "bavette", "hache"]),
    viandeBlanche: re(["poulet", "dinde", "canard", "pintade", "pilons", "volaille", "lapin", "porc", "echine", "filets? mignons?"]),
    charcuterie: re(["lardons", "jambon", "saucisse", "bacon", "petit sale", "poitrine", "chorizo", "morteau", "rillettes",
      "salami", "coppa", "lard\\b"]),
    oeufs: re(["oeufs?$"]),
    legumineuses: re(["lentilles", "haricots rouges", "haricots blancs", "pois chiches", "flageolets", "pois casses", "feves"]),
    fromage: re(["fromage", "gruyere", "emmental", "parmesan", "comte", "beaufort", "reblochon", "mont d'or", "cheddar",
      "mozzarella", "chevre", "raclette", "vache qui rit", "feta", "ricotta", "roquefort", "camembert", "brie", "mascarpone"]),
  };
  // Lignes qui ressemblent à un mot-clé mais n'en sont pas.
  const NOT_VEG = re(["coulis de tomate", "concentre de tomate", "oignon", "echalote", "ail\\b", "persil", "coriandre", "basilic", "ciboulette"]);

  // Assaisonnements : ne comptent pour aucune catégorie (« bouillon de volaille » n'est pas de la volaille).
  const IGNORE = re(["bouillon", "fond de", "cube", "sauce", "jus de"]);

  const cache = new WeakMap();

  // Catégories d'une recette : Set de clés de NUTRI_LABELS.
  window.nutriOf = function nutriOf(r) {
    const key = r.ing; // nouvelle liste d'ingrédients (adaptation) = nouveau calcul
    const hit = cache.get(key);
    if (hit && hit.side === r.side && hit.tags === r.tags) return hit.set;
    const lines = [...(r.ing || []), ...(r.side || [])].map((i) => norm(i[0]).trim()).filter((l) => !IGNORE.test(l));
    const set = new Set();
    const any = (k) => lines.some((l) => WORDS[k].test(l));
    if (lines.some((l) => WORDS.legumes.test(l) && !NOT_VEG.test(l))) set.add("legumes");
    for (const k of ["feculents", "poisson", "viandeRouge", "viandeBlanche", "charcuterie", "legumineuses", "fromage"]) if (any(k)) set.add(k);
    // Les œufs comptent comme protéine seulement s'ils ne servent pas de liant (au moins 3).
    if ((r.ing || []).some((i) => WORDS.oeufs.test(norm(i[0]).trim()) && Number(i[1]) >= 3)) set.add("oeufs");
    // Étiquettes du tableau (colonne « Catégories ») : elles priment.
    for (const t of r.tags || []) if (window.NUTRI_LABELS[t]) set.add(t);
    if (!set.has("poisson") && !set.has("viandeRouge") && !set.has("viandeBlanche") && !set.has("charcuterie")) set.add("vege");
    else set.delete("vege");
    const o = window.NUTRITION_OVERRIDES[r.id];
    if (o) { (o.add || []).forEach((k) => set.add(k)); (o.remove || []).forEach((k) => set.delete(k)); }
    cache.set(key, { set, side: r.side, tags: r.tags });
    return set;
  };

  // Règles de la semaine, pour n dîners choisis (3 à 7). min : il en faut au moins autant ; max : pas plus.
  // Repères du PNNS (mangerbouger.fr) : des légumes à chaque repas, du poisson 2 fois par semaine,
  // des légumineuses au moins 2 fois par semaine, moins de viande rouge (500 g / semaine) et de charcuterie.
  window.NUTRI_RULES = [
    { key: "legumes", need: "des légumes", min: (n) => Math.max(1, n - 2), why: "des légumes au moins 5 soirs sur 7" },
    { key: "poisson", need: "du poisson", min: (n) => (n >= 5 ? 2 : 1), why: "du poisson 2 fois par semaine" },
    { key: "legumineuses", need: "des légumineuses", min: () => 1, why: "des légumineuses au moins une fois (les midis en apportent aussi)" },
    { key: "vege", need: "un plat végétarien", min: (n) => (n >= 5 ? 1 : 0), why: "au moins un soir sans viande ni poisson" },
    { key: "viandeRouge", max: () => 2, why: "pas plus de 2 viandes rouges" },
    { key: "charcuterie", max: () => 3, why: "pas plus de 3 plats avec charcuterie" },
  ];

  // Bilan d'une liste de plats (ids) pour n dîners. getRecipe(id) → recette.
  window.nutriBalance = function nutriBalance(ids, n, getRecipe) {
    const cats = ids.map((id) => window.nutriOf(getRecipe(id)));
    return window.NUTRI_RULES.map((rule) => {
      const count = cats.filter((c) => c.has(rule.key)).length;
      const min = rule.min ? rule.min(n) : 0;
      const max = rule.max ? rule.max(n) : Infinity;
      const L = window.NUTRI_LABELS[rule.key];
      return {
        key: rule.key, need: rule.need, label: L.label, emoji: L.emoji, n: count, min, max, why: rule.why,
        missing: Math.max(0, min - count), over: Math.max(0, count - max),
        ok: count >= min && count <= max,
        goal: rule.min ? `au moins ${min}` : `${max} au plus`,
      };
    }).filter((b) => b.min > 0 || b.max < Infinity);
  };
})();
