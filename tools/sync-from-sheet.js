#!/usr/bin/env node
/* Recopie le tableau « Base de recettes de la famille » (Claude Sheets) dans l'app.
 *
 * Usage : node tools/sync-from-sheet.js export.json
 *
 * export.json contient les lignes lues dans le tableau (readCells, ligne 1 = en-têtes),
 * onglet par onglet, chacun facultatif : { "recettes": {"1": [...], "2": [...]}, "ingredients": {...} }
 * - réécrit docs/recipes.js (un onglet absent garde son contenu actuel)
 * - compare la colonne « Adaptations » à docs/modifications.js : retire les adaptations effacées
 *   et liste celles que Claude doit traduire en changements.
 * Voir tools/SYNC.md.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "docs");
const exp = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

global.window = {};
require(path.join(DOCS, "recipes.js"));
const RAYONS = window.RAYONS;
const current = window.RECIPES;
const byId = Object.fromEntries(current.map((r) => [r.id, r]));

const KIND = { "Plat": "plat", "Accompagnement": "accompagnement", "Dessert, goûter": "dessert", "Base (pâte, sauce)": "base" };
const TAG = { "Fromage": "fromage", "Poisson": "poisson", "Poisson frais": "poissonnier", "Légumineuses": "legumineuses", "Végétarien": "vege", "Viande rouge": "viandeRouge" };
const rayonKey = (label) => {
  const l = String(label || "").trim().toLowerCase();
  const hit = Object.entries(RAYONS).find(([k, v]) => k === l || v.label.toLowerCase() === l);
  return hit ? hit[0] : null;
};
const cell = (v) => (v && typeof v === "object" ? (v.value ?? v.number ?? v.date ?? null) : v);
const text = (v) => { const c = cell(v); return c == null ? "" : String(c).trim(); };
const num = (v) => { const c = cell(v); const n = typeof c === "number" ? c : parseFloat(String(c ?? "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
const rows = (sheet) => Object.keys(sheet || {}).map(Number).sort((a, b) => a - b).filter((n) => n > 1).map((n) => sheet[n]);

let recipes = current.map((r) => ({ ...r }));
const adaptations = {}; // id → texte de la colonne Adaptations

// Colonnes repérées par leur en-tête, pour que l'ordre des colonnes puisse changer.
function columns(sheet, wanted) {
  const head = (sheet["1"] || []).map((h) => text(h).toLowerCase());
  return Object.fromEntries(Object.entries(wanted).map(([k, label]) => [k, head.findIndex((h) => h.startsWith(label))]));
}

if (exp.recettes) {
  const C = columns(exp.recettes, { id: "id", name: "nom", adapt: "adaptations", kind: "type", tool: "appareil", serves: "portions",
    menu: "proposé", fav: "préféré", box: "se transporte", cats: "catégories", kid: "pour les enfants", note: "astuce", link: "lien" });
  const missing = Object.entries(C).filter(([, i]) => i < 0).map(([k]) => k);
  if (missing.length) throw new Error("Colonnes introuvables dans l'onglet Recettes : " + missing.join(", "));
  const seen = new Set();
  const next = [];
  for (const row of rows(exp.recettes)) {
    const get = (k) => cell(row[C[k]]);
    const [id, name, kind, tool, serves, menu, fav, box, cats, kid, note, link] =
      ["id", "name", "kind", "tool", "serves", "menu", "fav", "box", "cats", "kid", "note", "link"].map(get);
    if (text(id)) adaptations[text(id)] = text(get("adapt"));
    const rid = text(id);
    if (!rid) continue;
    seen.add(rid);
    const old = byId[rid] || { id: rid, emoji: "🍽️", tags: [], ing: [] };
    const r = { ...old, name: text(name) || old.name, tool: text(tool) || old.tool };
    const k = KIND[text(kind)] || "plat";
    if (k === "plat") delete r.kind; else r.kind = k;
    if (num(serves) && (r.serves || num(serves) !== 4)) r.serves = num(serves);
    if (menu === false) r.defaultOff = true; else delete r.defaultOff;
    r.love = fav === true ? 2 : 1;
    r.box = box === true;
    r.tags = text(cats).split(",").map((t) => TAG[t.trim()]).filter(Boolean);
    if (text(kid)) r.kid = text(kid); else delete r.kid;
    if (text(note)) r.note = text(note); else delete r.note;
    const l = text(link);
    const tmx = l.match(/cookidoo\.[a-z]+\/recipes\/recipe\/[a-zA-Z-]+\/(r\d+)/);
    if (tmx) r.tmx = tmx[1];
    else if (l) r.url = l;
    next.push(r);
  }
  recipes = next;
  const gone = current.filter((r) => !seen.has(r.id)).map((r) => r.id);
  if (gone.length) console.log("Recettes retirées du tableau :", gone.join(", "));
}

if (exp.ingredients) {
  const ing = {};
  for (const row of rows(exp.ingredients)) {
    const [id, , part, name, qty, unit, rayon] = row;
    const rid = text(id), n = text(name);
    if (!rid || !n) continue;
    const q = num(qty);
    const ray = rayonKey(text(rayon)) || (q ? "epicerie" : "placard");
    const e = (ing[rid] = ing[rid] || { ing: [], side: [] });
    e[text(part) === "Accompagnement" ? "side" : "ing"].push([n, q, q ? text(unit) : "", ray]);
  }
  for (const r of recipes) {
    if (!ing[r.id]) { console.log("Pas d'ingrédients dans le tableau pour", r.id); continue; }
    r.ing = ing[r.id].ing;
    if (ing[r.id].side.length) r.side = ing[r.id].side; else delete r.side;
  }
}

// ---------- Écriture de recipes.js ----------
const q = (s) => JSON.stringify(s);
const ingLine = ([n, qty, u, ray]) => (!qty && ray === "placard" ? `P(${q(n)})` : `[${q(n)}, ${qty}, ${q(u)}, ${q(ray)}]`);
const list = (arr) => {
  const parts = arr.map(ingLine);
  const lines = [];
  for (let i = 0; i < parts.length; i += 3) lines.push(parts.slice(i, i + 3).join(", "));
  return "[" + lines.join(",\n      ") + "]";
};
const FIELDS = ["kind", "love", "tags", "box", "defaultOff", "tmx", "url", "source", "rating", "serves", "tool", "kid", "note"];
function block(r) {
  const head = [`id: ${q(r.id)}`, `name: ${q(r.name)}`, `emoji: ${q(r.emoji)}`];
  const rest = FIELDS.filter((f) => r[f] !== undefined && r[f] !== "" && !(f === "defaultOff" && !r[f]))
    .map((f) => `${f}: ${f === "tags" ? "[" + r.tags.map(q).join(", ") + "]" : q(r[f])}`);
  let s = `  {\n    ${head.join(", ")},\n    ${rest.join(", ")},\n    ing: ${list(r.ing)},\n`;
  if (r.side && r.side.length) s += `    side: ${list(r.side)},\n`;
  return s + "  },\n";
}
const src = fs.readFileSync(path.join(DOCS, "recipes.js"), "utf8");
const headEnd = src.indexOf("window.RECIPES = [");
const group = (r) => (r.tmx ? 0 : r.url ? 1 : 2);
const titles = [
  "  // ---------- Recettes Thermomix (Cookidoo) : toujours en priorité ----------\n",
  "  // ---------- Plats mijotés au Cookeo (750g.com, 4 étoiles ou plus et plus de 20 avis) ----------\n",
  "  // ---------- Autres plats de la famille ----------\n",
];
let out = src.slice(0, headEnd) + "window.RECIPES = [\n";
for (const g of [0, 1, 2]) {
  const rs = recipes.filter((r) => group(r) === g);
  if (rs.length) out += titles[g] + rs.map(block).join("");
}
out += "];\n";
fs.writeFileSync(path.join(DOCS, "recipes.js"), out);

// ---------- Adaptations : docs/modifications.js ----------
if (exp.recettes) {
  require(path.join(DOCS, "modifications.js"));
  const mods = window.MODIFICATIONS || {};
  const todo = [];
  let removed = 0;
  for (const id of Object.keys(mods)) if (!adaptations[id]) { delete mods[id]; removed++; }
  for (const [id, t] of Object.entries(adaptations)) {
    if (!t) continue;
    if (!mods[id] || mods[id].text !== t) todo.push({ id, text: t, before: mods[id] ? mods[id].text : null });
  }
  if (removed) {
    const msrc = fs.readFileSync(path.join(DOCS, "modifications.js"), "utf8");
    const head = msrc.slice(0, msrc.indexOf("window.MODIFICATIONS = {"));
    const body = Object.entries(mods).map(([id, a]) =>
      `  ${JSON.stringify(id)}: {\n    text: ${JSON.stringify(a.text)},\n    changes: ${JSON.stringify(a.changes)},\n  },\n`).join("");
    fs.writeFileSync(path.join(DOCS, "modifications.js"), head + "window.MODIFICATIONS = {\n" + body + "};\n");
    console.log(removed, "adaptation(s) effacée(s) du tableau, retirée(s) de modifications.js");
  }
  if (todo.length) {
    console.log("\nADAPTATIONS À TRADUIRE dans docs/modifications.js (text + changes) :");
    for (const t of todo) console.log(`- ${t.id} : « ${t.text} »` + (t.before ? ` (avant : « ${t.before} »)` : ""));
  } else console.log("Adaptations : modifications.js est à jour.");
}
console.log(recipes.length, "recettes écrites dans docs/recipes.js");
