/* Menus et courses : app sans serveur. Tout est gardé sur le téléphone (localStorage).
   La liste se partage par un lien qui contient la liste elle-même. */
(() => {
  "use strict";

  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const DAYS_SHORT = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
  const ADULT_LUNCH_DAYS = 5; // lundi → vendredi
  const KID_LUNCH_DAYS = 4; // lundi → jeudi
  // Un dîner « 4 personnes » = 1. Les boîtes du midi : 2 adultes + la petite ≈ 0,85 ; 2 adultes seuls ≈ 0,67.
  const LUNCH_FACTOR_WITH_KID = 0.85;
  const LUNCH_FACTOR_ADULTS = 0.67;
  const FISH_DAYS = [4, 5, 6]; // poissonnier ouvert le vendredi matin
  const RAYON_ORDER = ["boucher", "poissonnier", "legumes", "cremerie", "frais", "boulangerie", "epicerie", "surgeles", "autre", "placard"];

  const RAYONS = window.RAYONS;
  const COOKIDOO = "https://cookidoo.fr/recipes/recipe/fr-FR/";
  const DINNER_SERVINGS = 4;
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Stockage ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("menus:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("menus:" + k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
  };

  // ---------- Dates ----------
  function mondayOf(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (x.getDay() + 6) % 7; // 0 = lundi
    x.setDate(x.getDate() - dow);
    return x;
  }
  function defaultWeek() {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const m = mondayOf(now);
    if (dow >= 2) m.setDate(m.getDate() + 7); // à partir de mercredi on prépare la semaine suivante
    return isoDate(m);
  }
  function isoDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  function parseIso(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
  function weekLabel(iso) {
    return "Semaine du " + parseIso(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  }
  function shiftWeek(iso, n) { const d = parseIso(iso); d.setDate(d.getDate() + 7 * n); return isoDate(d); }

  // ---------- État ----------
  const prefs = Object.assign({ excluded: [], included: [], history: [], target: 7, edits: {} }, store.get("prefs", {}));

  // Recettes « effectives » : celles du fichier, avec les modifications faites sur ce téléphone.
  let RECIPES = [], byId = {};
  function refreshRecipes() {
    RECIPES = window.RECIPES.map((r) => {
      const e = prefs.edits[r.id];
      return e ? { ...r, ing: e.ing, side: e.side, edited: true } : r;
    });
    byId = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
  }
  refreshRecipes();
  const original = Object.fromEntries(window.RECIPES.map((r) => [r.id, r]));
  const isDish = (r) => (r.kind || "plat") === "plat";
  const isOff = (r) => prefs.excluded.includes(r.id) || (!!r.defaultOff && !prefs.included.includes(r.id));
  // Pour la liste de courses : un plat Thermomix est ramené à un dîner de 4 ; le reste se fait en entier.
  const scaleOf = (r) => (r.serves && isDish(r) ? DINNER_SERVINGS / r.serves : 1);

  let S = store.get("state", null) || freshState();
  if (!S.extras) S.extras = [];
  // Nouvelles recettes arrivées depuis la dernière visite : on refait la pile de cartes.
  if (!S.plan && RECIPES.some((r) => isDish(r) && !isOff(r) && !S.deck.includes(r.id) && !S.kept.includes(r.id))) S.deck = buildDeck(S.kept);
  let shared = store.get("shared", null); // liste reçue par lien
  let tab = "menu";
  let coursesView = "mine";
  let lastDecision = null;

  function freshState(week) {
    return { week: week || defaultWeek(), kept: [], deck: buildDeck([]), plan: null, list: null, extras: [] };
  }
  function save() { store.set("state", S); store.set("prefs", prefs); }

  function buildDeck(kept) {
    const recent = new Set(prefs.history.slice(-1).flat());
    return RECIPES
      .filter((r) => isDish(r) && !isOff(r) && !kept.includes(r.id))
      .map((r) => {
        let w = r.love === 2 ? 3 : 1.5;
        if (r.tmx || r.url) w *= 3; // Thermomix, et mijotés Cookeo bien notés sur 750g : en priorité
        if (recent.has(r.id)) w *= 0.25;
        return { id: r.id, k: -Math.log(Math.random()) / w };
      })
      .sort((a, b) => a.k - b.k)
      .map((x) => x.id);
  }

  // Le prochain plat de la pile qui reste compatible avec ce qu'on a déjà gardé.
  function nextCard() {
    const freshFish = S.kept.filter((id) => byId[id].tags.includes("poissonnier")).length;
    const red = S.kept.filter((id) => byId[id].tags.includes("viandeRouge")).length;
    for (const id of S.deck) {
      const r = byId[id];
      if (!r || !isDish(r) || isOff(r)) continue;
      if (r.tags.includes("poissonnier") && freshFish >= FISH_DAYS.length) continue;
      if (r.tags.includes("viandeRouge") && red >= 3) continue;
      return r;
    }
    return null;
  }

  function decide(keep) {
    const r = nextCard();
    if (!r) return;
    S.deck = S.deck.filter((id) => id !== r.id);
    if (keep) S.kept.push(r.id);
    else S.deck.push(r.id); // revient en fin de pile
    lastDecision = { id: r.id, keep };
    if (S.kept.length >= prefs.target) {
      S.plan = buildPlan(S.kept);
      toast("Menu complet ! Vérifiez les jours, puis faites la liste.");
    }
    save();
    render();
  }

  function undo() {
    if (!lastDecision) return;
    const { id, keep } = lastDecision;
    if (keep) S.kept = S.kept.filter((x) => x !== id);
    S.deck = [id, ...S.deck.filter((x) => x !== id)];
    lastDecision = null;
    save();
    render();
  }

  // ---------- Construction du menu ----------
  function buildPlan(ids) {
    const dinners = Array(7).fill(null);
    const place = (id, prefer) => {
      for (const d of prefer) if (!dinners[d]) { dinners[d] = id; return true; }
      return false;
    };
    const fish = ids.filter((id) => byId[id].tags.includes("poissonnier"));
    const noBox = ids.filter((id) => !byId[id].box && !fish.includes(id));
    const rest = ids.filter((id) => !fish.includes(id) && !noBox.includes(id));
    fish.forEach((id) => place(id, FISH_DAYS));
    // Les plats qui ne se transportent pas vont la veille d'un jour sans boîte (vendredi, samedi).
    noBox.forEach((id) => place(id, [5, 4, 6, 3, 2, 1, 0]));
    // Viande du boucher plutôt du mercredi au dimanche ; le reste remplit les trous.
    const butcher = rest.filter((id) => byId[id].ing.some((i) => i[3] === "boucher"));
    const other = rest.filter((id) => !butcher.includes(id));
    butcher.forEach((id) => place(id, [2, 3, 6, 5, 4, 0, 1]));
    other.forEach((id) => place(id, [0, 1, 2, 3, 4, 5, 6]));
    const plan = { dinners, lunches: Array(ADULT_LUNCH_DAYS).fill(null) };
    fillLunches(plan);
    return plan;
  }

  // Midi du jour d = restes du dîner de la veille s'ils se transportent, sinon un plat à préparer.
  function fillLunches(plan) {
    const used = new Set(plan.dinners.filter(Boolean));
    const spare = RECIPES
      .filter((r) => isDish(r) && r.box && !isOff(r) && !r.tags.includes("poissonnier"))
      .sort((a, b) => (b.tmx || b.url ? 2 : 0) + b.love - ((a.tmx || a.url ? 2 : 0) + a.love))
      .map((r) => r.id);
    const pickSpare = () => {
      const id = spare.find((x) => !used.has(x)) || spare[0];
      used.add(id);
      return id;
    };
    for (let d = 0; d < ADULT_LUNCH_DAYS; d++) {
      const cur = plan.lunches[d];
      if (cur && cur.manual) continue;
      if (d === 0) {
        plan.lunches[0] = { id: cur && cur.src === "prep" ? cur.id : pickSpare(), src: "prep" };
        continue;
      }
      const prev = plan.dinners[d - 1];
      if (prev && byId[prev].box) plan.lunches[d] = { id: prev, src: "reste" };
      else plan.lunches[d] = { id: cur && cur.src === "extra" ? cur.id : pickSpare(), src: "extra" };
    }
  }

  function balance(plan) {
    const ids = plan.dinners.filter(Boolean);
    const count = (t) => ids.filter((id) => byId[id].tags.includes(t)).length;
    const leg = count("legumineuses") + plan.lunches.filter((l) => l && l.src !== "reste" && byId[l.id].tags.includes("legumineuses")).length;
    return [
      { label: "Poisson", n: count("poisson"), ok: count("poisson") >= 2, goal: "2 par semaine" },
      { label: "Légumineuses", n: leg, ok: leg >= 2, goal: "2 par semaine" },
      { label: "Végétarien", n: count("vege"), ok: count("vege") >= 1, goal: "au moins 1" },
      { label: "Viande rouge", n: count("viandeRouge"), ok: count("viandeRouge") <= 2, goal: "2 au plus" },
      { label: "Fromage", n: count("fromage"), ok: count("fromage") >= 3, goal: "au moins 3" },
    ];
  }

  // ---------- Liste de courses ----------
  function occurrences(plan) {
    const occ = []; // { id, factor, day }
    plan.dinners.forEach((id, d) => { if (id) occ.push({ id, factor: 1, day: d }); });
    plan.lunches.forEach((l, d) => {
      if (!l) return;
      const f = d < KID_LUNCH_DAYS ? LUNCH_FACTOR_WITH_KID : LUNCH_FACTOR_ADULTS;
      if (l.src === "reste") {
        const o = occ.find((x) => x.day === d - 1 && x.id === l.id);
        if (o) o.factor += f;
      } else {
        occ.push({ id: l.id, factor: f, day: d === 0 ? -1 : d - 1, lunch: true });
      }
    });
    (S.extras || []).forEach((id) => { if (byId[id]) occ.push({ id, factor: 1, day: -2, extra: true }); });
    return occ;
  }

  function roundQty(q, unit) {
    if (unit === "g") return q < 100 ? Math.ceil(q / 10) * 10 : Math.ceil(q / 50) * 50;
    if (unit === "cl") return Math.ceil(q / 5) * 5;
    return Math.ceil(q - 0.05);
  }
  function fmtQty(q, unit) {
    if (!q) return "";
    if (unit === "g" && q >= 1000) return (q / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " kg";
    if (unit === "cl" && q >= 100) return (q / 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " L";
    if (unit === "pc") return String(q);
    let u = unit;
    if (q > 1 && ["boîte", "paquet", "pot", "bouteille", "portion", "bouquet"].includes(unit)) u = unit === "boîte" ? "boîtes" : unit + "s";
    return `${q} ${u}`;
  }
  const dayName = (d) => (d === -1 ? "prépa du dim." : d === -2 ? "extras" : DAYS_SHORT[d]);

  function buildList(plan, previous) {
    const map = new Map();
    for (const o of occurrences(plan)) {
      const r = byId[o.id];
      if (!r) continue;
      const lines = [...r.ing.map((i) => [i, scaleOf(r)]), ...(r.side || []).map((i) => [i, 1])];
      for (const [[name, qty, unit, rayon], scale] of lines) {
        const key = name + "|" + unit;
        const it = map.get(key) || { key, name, unit, rayon, raw: 0, days: new Set() };
        it.raw += (Number(qty) || 0) * o.factor * scale;
        it.days.add(o.day);
        map.set(key, it);
      }
    }
    const prevDone = new Map((previous?.items || []).map((i) => [i.key, i]));
    const items = [...map.values()].map((it) => {
      const qty = it.rayon === "placard" || !it.raw ? 0 : roundQty(it.raw, it.unit);
      const days = [...it.days].sort((a, b) => a - b);
      const old = prevDone.get(it.key);
      return {
        key: it.key, name: it.name, rayon: it.rayon, qty: fmtQty(qty, it.unit),
        when: ["boucher", "poissonnier"].includes(it.rayon) ? "pour " + days.map(dayName).join(", ") : "",
        done: old ? old.done : false,
      };
    });
    const removed = new Set(previous?.removed || []);
    const custom = (previous?.items || []).filter((i) => i.custom);
    return { items: items.filter((i) => !removed.has(i.key)).concat(custom), removed: [...removed] };
  }

  function listAsText(list, menuLines) {
    const lines = [weekLabel(list.week || S.week)];
    for (const r of RAYON_ORDER) {
      const its = list.items.filter((i) => i.rayon === r && !i.done);
      if (!its.length) continue;
      lines.push("", RAYONS[r].label.toUpperCase());
      its.forEach((i) => lines.push("• " + i.name + (i.qty ? " : " + i.qty : "") + (i.when ? " (" + i.when + ")" : "")));
    }
    if (menuLines) lines.push("", "MENU", ...menuLines);
    return lines.join("\n");
  }

  // ---------- Partage par lien ----------
  const b64url = {
    enc(bytes) { let s = ""; bytes.forEach((b) => (s += String.fromCharCode(b))); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); },
    dec(str) { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, (c) => c.charCodeAt(0)); },
  };
  async function encodePayload(obj) {
    const json = new TextEncoder().encode(JSON.stringify(obj));
    if ("CompressionStream" in window) {
      const buf = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
      return "z" + b64url.enc(new Uint8Array(buf));
    }
    return "j" + b64url.enc(json);
  }
  async function decodePayload(str) {
    const bytes = b64url.dec(str.slice(1));
    if (str[0] === "z") {
      const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
      return JSON.parse(new TextDecoder().decode(buf));
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function menuLines(plan) {
    return plan.dinners.map((id, d) => `${DAYS[d]} : ${id ? byId[id].name : "soir libre"}`);
  }

  async function shareLink() {
    if (!S.list) return;
    const payload = {
      v: 1, w: S.week,
      m: menuLines(S.plan),
      i: S.list.items.map((i) => [i.name, i.qty, i.rayon, i.when]),
    };
    const code = await encodePayload(payload);
    const url = location.origin + location.pathname + "#l=" + code;
    const title = "Liste de courses, " + weekLabel(S.week).toLowerCase();
    if (navigator.share) {
      try { await navigator.share({ title, text: title, url }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    await copy(url, "Lien copié : collez-le dans un message.");
  }

  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); }
    catch { prompt("Copiez ce texte :", text); }
  }

  async function readHash() {
    const m = location.hash.match(/^#l=([A-Za-z0-9_-]+)$/);
    if (!m) return;
    try {
      const p = await decodePayload(m[1]);
      const id = m[1].slice(-24);
      if (!shared || shared.id !== id) {
        shared = {
          id, week: p.w, menu: p.m || [],
          items: p.i.map(([name, qty, rayon, when], n) => ({ key: "s" + n, name, qty, rayon: RAYONS[rayon] ? rayon : "autre", when, done: false })),
        };
        store.set("shared", shared);
      }
      tab = "courses";
      coursesView = "shared";
      history.replaceState(null, "", location.pathname);
    } catch {
      toast("Ce lien de liste est abîmé.");
    }
  }

  // ---------- Rendu ----------
  const view = $("#view");
  function setHeader(title, sub) { $("#title").textContent = title; $("#subtitle").textContent = sub || ""; }

  function render() {
    document.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false"));
    if (tab === "menu") renderMenu();
    else if (tab === "courses") renderCourses();
    else renderRecipes();
  }

  function weekNav() {
    return `<div class="week-nav">
      <button class="icon-btn" data-act="week-prev" aria-label="Semaine précédente">‹</button>
      <strong class="grow" style="text-align:center">${esc(weekLabel(S.week))}</strong>
      <button class="icon-btn" data-act="week-next" aria-label="Semaine suivante">›</button>
    </div>`;
  }

  function renderMenu() {
    if (S.plan) return renderPlan();
    setHeader("Composer le menu", "Glissez à droite pour garder, à gauche pour passer.");
    const r = nextCard();
    const bar = Array.from({ length: prefs.target }, (_, i) => `<i class="${i < S.kept.length ? "on" : ""}"></i>`).join("");
    if (!r) {
      view.innerHTML = weekNav() + `<div class="empty"><div class="big">🤷</div><p>Plus de plats à proposer.</p>
        <button class="btn primary" data-act="build-now">Faire le menu avec ${S.kept.length} plats</button></div>`;
      return;
    }
    const under = S.deck.map((id) => byId[id]).find((x) => x && x.id !== r.id);
    view.innerHTML = weekNav() + `
      <div class="row small muted"><span class="grow">${S.kept.length} plat${S.kept.length > 1 ? "s" : ""} sur ${prefs.target} pour les dîners</span></div>
      <div class="progress" aria-hidden="true">${bar}</div>
      ${S.kept.length ? `<div class="chips" style="margin-bottom:12px">${balance({ dinners: S.kept, lunches: [] }).map((b) => `<span class="chip ${b.ok ? "ok" : "warn"}">${b.label} ${b.n}</span>`).join("")}</div>` : ""}
      <div class="deck">
        ${under ? cardHtml(under, "under") : ""}
        ${cardHtml(r, "top")}
      </div>
      <div class="actions">
        <button class="round no" data-act="no" aria-label="Passer, autre chose">✕</button>
        <button class="round undo" data-act="undo" aria-label="Annuler le dernier choix" ${lastDecision ? "" : "disabled"}>↶</button>
        <button class="round yes" data-act="yes" aria-label="Garder ce plat">♥</button>
      </div>
      <p class="hint">Les midis se calent tout seuls sur les restes du dîner de la veille.</p>
      ${S.kept.length ? `<div class="section-title">Déjà gardés</div><div class="chips">${S.kept.map((id) => `<span class="chip">${byId[id].emoji} ${esc(byId[id].name)}</span>`).join("")}</div>` : ""}
      <div class="section-title">Réglage</div>
      <div class="row"><span class="grow">Nombre de dîners à choisir</span>
        <button class="icon-btn" data-act="target-" aria-label="Moins">−</button><strong>${prefs.target}</strong>
        <button class="icon-btn" data-act="target+" aria-label="Plus">+</button></div>`;
    attachSwipe($(".swipe.top"));
  }

  function tagChips(r) {
    const map = { fromage: "🧀 Fromage", poisson: "🐟 Poisson", legumineuses: "🫘 Légumineuses", vege: "🥦 Végétarien", viandeRouge: "🥩 Viande rouge" };
    const chips = r.tags.filter((t) => map[t]).map((t) => `<span class="chip">${map[t]}</span>`);
    if (r.love === 2) chips.unshift(`<span class="chip ok">★ Préféré</span>`);
    if (r.tmx) chips.unshift(`<span class="chip tmx">Thermomix</span>`);
    if (r.url) chips.unshift(`<span class="chip tmx">${esc(r.source || "Web")} ★ ${esc(r.rating || "")}</span>`);
    if (r.edited) chips.push(`<span class="chip warn">✎ Modifiée</span>`);
    if (r.box && isDish(r)) chips.push(`<span class="chip">🥡 Se transporte</span>`);
    return chips.join("");
  }

  function cardHtml(r, cls) {
    return `<article class="swipe ${cls}" data-id="${r.id}">
      <span class="stamp yes">Je garde</span><span class="stamp no">Autre chose</span>
      <div class="emoji" aria-hidden="true">${r.emoji}</div>
      <h2>${esc(r.name)}</h2>
      <div class="meta">${esc(r.tool)}${r.note ? " · " + esc(r.note) : ""}</div>
      <div class="chips">${tagChips(r)}</div>
      ${r.kid ? `<div class="kidnote">👧 ${esc(r.kid)}</div>` : ""}
    </article>`;
  }

  function attachSwipe(card) {
    if (!card) return;
    let x0 = 0, y0 = 0, dx = 0, active = false, horizontal = null;
    const yes = $(".stamp.yes", card), no = $(".stamp.no", card);
    card.addEventListener("pointerdown", (e) => {
      active = true; horizontal = null; x0 = e.clientX; y0 = e.clientY; dx = 0;
      card.setPointerCapture(e.pointerId);
    });
    card.addEventListener("pointermove", (e) => {
      if (!active) return;
      dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal) return;
      card.classList.add("dragging");
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      yes.style.opacity = Math.max(0, Math.min(1, dx / 90));
      no.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    });
    const end = () => {
      if (!active) return;
      active = false;
      card.classList.remove("dragging");
      if (horizontal && Math.abs(dx) > 90) {
        fling(card, dx > 0);
      } else {
        card.style.transform = "";
        yes.style.opacity = no.style.opacity = 0;
      }
    };
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
  }

  function fling(card, keep) {
    if (!card) return decide(keep);
    const w = window.innerWidth;
    card.style.transform = `translateX(${keep ? w : -w}px) rotate(${keep ? 25 : -25}deg)`;
    card.style.opacity = "0";
    setTimeout(() => decide(keep), 180);
  }

  function recipeOptions(selected, { allowEmpty = false, boxOnly = false } = {}) {
    const list = RECIPES.filter((r) => isDish(r) && (!boxOnly || r.box)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return (allowEmpty ? `<option value="">Soir libre / restes</option>` : "") +
      list.map((r) => `<option value="${r.id}" ${r.id === selected ? "selected" : ""}>${esc(r.name)}${r.tmx ? " (Thermomix)" : ""}</option>`).join("");
  }

  function renderPlan() {
    const p = S.plan;
    setHeader("Menu de la semaine", weekLabel(S.week));
    const chips = balance(p).map((b) => `<span class="chip ${b.ok ? "ok" : "warn"}" title="${b.goal}">${b.label} ${b.n}</span>`).join("");
    const days = p.dinners.map((id, d) => {
      const r = id && byId[id];
      const warns = [];
      if (r && r.tags.includes("poissonnier") && !FISH_DAYS.includes(d)) warns.push("Poissonnier ouvert le vendredi matin seulement.");
      if (r && d < 2 && r.ing.some((i) => i[3] === "boucher")) warns.push("Boucher fermé lundi et mardi : viande à acheter le dimanche.");
      const l = d < ADULT_LUNCH_DAYS ? p.lunches[d] : null;
      let lunch = "";
      if (l) {
        const lr = byId[l.id];
        const who = d < KID_LUNCH_DAYS ? "vous deux et la petite" : "vous deux";
        const how = l.src === "reste" ? "restes de la veille" : l.src === "prep" ? "préparé le dimanche" : "à préparer en plus";
        lunch = `<div class="lunch row"><span class="grow">Midi (${who}) : <b>${esc(lr.name)}</b> · ${how}
          ${d < KID_LUNCH_DAYS && lr.kid ? `<br><span style="color:var(--warn)">👧 ${esc(lr.kid)}</span>` : ""}</span>
          <span class="picker icon-btn" aria-label="Changer le midi">✎<select data-act="lunch" data-day="${d}" aria-label="Changer le midi du ${DAYS[d]}">${recipeOptions(l.id, { boxOnly: true })}</select></span></div>`;
      }
      return `<section class="day">
        <div class="row"><h3 class="grow">${DAYS[d]}</h3>
          <div class="tools">
            <button class="icon-btn" data-act="up" data-day="${d}" aria-label="Monter" ${d === 0 ? "disabled" : ""}>↑</button>
            <button class="icon-btn" data-act="down" data-day="${d}" aria-label="Descendre" ${d === 6 ? "disabled" : ""}>↓</button>
            <span class="picker icon-btn" aria-label="Remplacer le dîner">✎<select data-act="dinner" data-day="${d}" aria-label="Remplacer le dîner du ${DAYS[d]}">${recipeOptions(id, { allowEmpty: true })}</select></span>
          </div></div>
        <div class="dish"><span class="em" aria-hidden="true">${r ? r.emoji : "🌙"}</span>
          <div class="grow"><div class="name">${r ? esc(r.name) : "Soir libre ou restes"}</div>
          ${r ? `<div class="small muted">${esc(r.tool)}${r.note ? " · " + esc(r.note) : ""}</div>` : ""}
          ${r && r.kid ? `<div class="small" style="color:var(--warn)">👧 ${esc(r.kid)}</div>` : ""}</div></div>
        ${warns.map((w) => `<div class="warnline">⚠️ ${w}</div>`).join("")}
        ${lunch}
      </section>`;
    }).join("");
    const extras = (S.extras || []).filter((id) => byId[id]);
    const extrasHtml = `<div class="section-title">Goûters, desserts et extras</div>
      ${extras.length ? `<div class="items">${extras.map((id) => `<div class="item"><span style="font-size:22px" aria-hidden="true">${byId[id].emoji}</span>
        <span class="grow">${esc(byId[id].name)}<br><span class="small muted">${esc(byId[id].tool)}</span></span>
        <button class="del" data-act="extra" data-id="${id}" aria-label="Retirer ${esc(byId[id].name)}">✕</button></div>`).join("")}</div>`
        : `<p class="small muted">Ajoutez un gâteau, des crêpes ou une purée depuis l'onglet Recettes : ses ingrédients iront dans la liste de courses.</p>`}`;
    view.innerHTML = `
      <div class="chips" style="margin-bottom:12px">${chips}</div>
      ${days}
      ${extrasHtml}
      <div class="stack" style="margin-top:16px">
        <button class="btn primary block" data-act="make-list">🛒 ${S.list ? "Mettre à jour la liste de courses" : "Faire la liste de courses"}</button>
        <button class="btn ghost block" data-act="reset" id="reset">Recommencer un nouveau menu</button>
      </div>`;
  }

  function renderCourses() {
    const hasMine = !!S.list, hasShared = !!shared;
    if (!hasMine && !hasShared) {
      setHeader("Courses", "");
      view.innerHTML = `<div class="empty"><div class="big">🛒</div>
        <p>Pas encore de liste.<br>Composez le menu, puis touchez « Faire la liste de courses ».</p>
        <button class="btn primary" data-act="go-menu">Composer le menu</button></div>`;
      return;
    }
    if (!hasShared) coursesView = "mine";
    if (!hasMine) coursesView = "shared";
    const mine = coursesView === "mine";
    const list = mine ? S.list : shared;
    const week = mine ? S.week : shared.week;
    const left = list.items.filter((i) => !i.done && i.rayon !== "placard").length;
    setHeader("Courses", `${weekLabel(week)} · ${left} article${left > 1 ? "s" : ""} à prendre`);

    const seg = hasMine && hasShared ? `<div class="seg" role="group">
      <button data-act="view-mine" aria-pressed="${mine}">Ma liste</button>
      <button data-act="view-shared" aria-pressed="${!mine}">Liste reçue</button></div>` : "";

    const share = mine ? `<div class="sharebar">
        <button class="btn primary" data-act="share">📤 Partager la liste</button>
        <button class="btn" data-act="copy-text">Copier en texte</button></div>
        <p class="small muted">Le lien ouvre la liste sur l'autre téléphone. Après une modification, renvoyez un nouveau lien.</p>`
      : `<p class="small muted">Liste reçue par lien. Cochez au fur et à mesure, c'est gardé sur ce téléphone.</p>
        <div class="sharebar"><button class="btn" data-act="copy-text">Copier en texte</button></div>`;

    const recap = !mine && shared.menu?.length ? `<details class="menu-recap"><summary>Voir le menu de la semaine</summary>
      ${shared.menu.map((l) => `<div class="recap-line">${esc(l)}</div>`).join("")}</details>` : "";

    const groups = RAYON_ORDER.map((r) => {
      const its = list.items.filter((i) => i.rayon === r);
      if (!its.length) return "";
      return `<div class="group"><h3>${esc(RAYONS[r].label)} ${RAYONS[r].hint ? `<small>${esc(RAYONS[r].hint)}</small>` : ""}</h3>
        <div class="items">${its.map((i) => `<div class="item ${i.done ? "done" : ""}">
          <input type="checkbox" id="c-${esc(i.key)}" data-act="tick" data-key="${esc(i.key)}" ${i.done ? "checked" : ""}>
          <label for="c-${esc(i.key)}"><span class="n">${esc(i.name)}</span>
            <span class="q">${esc([i.qty, i.when].filter(Boolean).join(" · "))}</span></label>
          ${mine ? `<button class="del" data-act="del" data-key="${esc(i.key)}" aria-label="Retirer ${esc(i.name)}">✕</button>` : ""}
        </div>`).join("")}</div></div>`;
    }).join("");

    view.innerHTML = seg + share + recap + groups + `
      <form class="addbar" data-act="add"><input name="item" placeholder="Ajouter un article (ex. lait, couches…)" autocomplete="off" enterkeyhint="done">
        <button class="btn primary" type="submit">Ajouter</button></form>
      ${list.items.some((i) => i.done) ? `<button class="btn ghost block" data-act="clear-done" style="margin-top:8px">Retirer les articles cochés</button>` : ""}`;
  }

  // ---------- Recettes et modification des recettes ----------
  const FILTERS = [
    ["all", "Tout"], ["tmx", "Thermomix"], ["plat", "Plats"], ["accompagnement", "Accomp."], ["dessert", "Desserts"],
  ];
  const kindLabel = { accompagnement: "Accompagnement", dessert: "Dessert, goûter", base: "Base (pâte, sauce)" };
  let draft = null; // recette en cours de modification : { id, ing, side }
  const openRecipes = new Set();

  function fmtIng([n, q, u]) { return esc(n) + (q ? " · " + esc(fmtQty(Number(q), u)) : ""); }

  function servingsLine(r) {
    if (!r.serves) return isDish(r) ? "Quantités pour un dîner à 4." : "";
    if (isDish(r)) return `Quantités de la recette d'origine (${r.serves} portions). La liste de courses les ramène à un dîner à 4.`;
    return `Quantités pour la recette entière (${r.serves} ${r.kind === "dessert" ? "parts" : "portions"}).`;
  }

  function editorHtml(r) {
    const rayonOpts = (sel) => Object.entries(RAYONS).filter(([k]) => k !== "autre")
      .map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${esc(v.label)}</option>`).join("");
    const rows = (part) => draft[part].map(([n, q, u, ray], i) => `<div class="ed-row" data-part="${part}" data-i="${i}">
        <input class="ed-name" data-f="name" value="${esc(n)}" placeholder="Ingrédient" aria-label="Ingrédient">
        <input class="ed-qty" data-f="qty" value="${q ? esc(String(q).replace(".", ",")) : ""}" inputmode="decimal" placeholder="Qté" aria-label="Quantité">
        <input class="ed-unit" data-f="unit" value="${esc(u)}" list="units" placeholder="unité" aria-label="Unité">
        <select class="ed-rayon" data-f="rayon" aria-label="Rayon">${rayonOpts(ray)}</select>
        <button class="del" data-act="ed-del" data-part="${part}" data-i="${i}" aria-label="Supprimer ${esc(n)}">✕</button>
      </div>`).join("");
    return `<div class="editor">
      <p class="small muted">${r.serves ? `Quantités pour ${r.serves} portions, comme sur la recette d'origine.` : "Quantités pour un dîner à 4."}
        Changez un nom pour remplacer un ingrédient, une quantité, ou supprimez une ligne avec ✕. Une quantité vide = à vérifier au placard.</p>
      ${rows("ing")}
      <button class="btn ghost" data-act="ed-add" data-part="ing">＋ Ajouter un ingrédient</button>
      ${isDish(r) ? `<div class="section-title">Accompagnement (pour 4)</div>${rows("side")}
      <button class="btn ghost" data-act="ed-add" data-part="side">＋ Ajouter un accompagnement</button>` : ""}
      <div class="sharebar" style="margin-top:10px">
        <button class="btn primary" data-act="ed-save">Enregistrer</button>
        <button class="btn" data-act="ed-cancel">Annuler</button>
      </div>
      ${r.edited ? `<button class="btn ghost block" data-act="ed-reset" data-id="${r.id}">Revenir à la recette d'origine</button>` : ""}
      <datalist id="units"><option value="g"><option value="cl"><option value="pc"><option value="boîte"><option value="bouquet"><option value="tranches"><option value="paquet"><option value="pot"></datalist>
    </div>`;
  }

  function recipeBody(r) {
    if (draft && draft.id === r.id) return editorHtml(r);
    const off = isOff(r);
    const inWeek = (S.extras || []).includes(r.id);
    return `<div class="chips">${tagChips(r)}</div>
      ${r.kid ? `<p style="color:var(--warn)">👧 ${esc(r.kid)}</p>` : ""}${r.note ? `<p class="muted">${esc(r.note)}</p>` : ""}
      <ul>${r.ing.map((i) => `<li>${fmtIng(i)}</li>`).join("")}</ul>
      ${r.side && r.side.length ? `<p class="small"><b>Accompagnement</b> (pour 4) : ${r.side.map(fmtIng).join(", ")}</p>` : ""}
      <p class="small muted">${servingsLine(r)}</p>
      ${r.tmx ? `<p class="small"><a href="${COOKIDOO}${r.tmx}" target="_blank" rel="noopener">Ouvrir la recette sur Cookidoo ↗</a></p>` : ""}
      ${r.url ? `<p class="small"><a href="${esc(r.url)}" target="_blank" rel="noopener">Ouvrir la recette sur ${esc(r.source || "le site")} ↗</a></p>` : ""}
      <div class="sharebar">
        <button class="btn" data-act="ed-open" data-id="${r.id}">✎ Modifier</button>
        ${isDish(r)
          ? `<button class="btn" data-act="toggle-ex" data-id="${r.id}">${off ? "Proposer à nouveau" : "Ne plus proposer"}</button>`
          : `<button class="btn ${inWeek ? "" : "primary"}" data-act="extra" data-id="${r.id}">${inWeek ? "Retirer de la semaine" : "Ajouter à la semaine"}</button>`}
      </div>`;
  }

  function editsAsText() {
    const lines = ["Modifications de recettes"];
    for (const id of Object.keys(prefs.edits)) {
      const r = byId[id], o = original[id];
      if (!r || !o) continue;
      lines.push("", r.name.toUpperCase());
      for (const part of ["ing", "side"]) {
        const before = new Map((o[part] || []).map((i) => [i[0], i]));
        const after = new Map((r[part] || []).map((i) => [i[0], i]));
        const label = part === "side" ? " (accompagnement)" : "";
        for (const [n, i] of before) if (!after.has(n)) lines.push(`• Retiré${label} : ${n}`);
        for (const [n, i] of after) {
          const b = before.get(n);
          const q = (x) => (x[1] ? `${String(x[1]).replace(".", ",")} ${x[2]}`.trim() : "au placard");
          if (!b) lines.push(`• Ajouté${label} : ${n}, ${q(i)}`);
          else if (b[1] !== i[1] || b[2] !== i[2] || b[3] !== i[3]) lines.push(`• ${n}${label} : ${q(b)} → ${q(i)}`);
        }
      }
    }
    return lines.join("\n");
  }

  function renderRecipes() {
    const dishes = RECIPES.filter(isDish);
    const nEdits = Object.keys(prefs.edits).length;
    setHeader("Recettes", `${dishes.length} plats dont ${dishes.filter((r) => r.tmx).length} Thermomix · ${dishes.filter(isOff).length} mis de côté`);
    const f = renderRecipes.filter || "all";
    const q = (renderRecipes.q || "").toLowerCase();
    const match = (r) => {
      if (f === "tmx" && !r.tmx) return false;
      if (f === "plat" && !isDish(r)) return false;
      if (f === "accompagnement" && !["accompagnement", "base"].includes(r.kind)) return false;
      if (f === "dessert" && r.kind !== "dessert") return false;
      return !q || r.name.toLowerCase().includes(q) || [...r.ing, ...(r.side || [])].some((i) => i[0].toLowerCase().includes(q));
    };
    // Thermomix d'abord, puis ordre alphabétique.
    const list = RECIPES.filter(match).sort((a, b) => (b.tmx ? 1 : 0) - (a.tmx ? 1 : 0) || a.name.localeCompare(b.name, "fr"));
    view.innerHTML = `<input class="search" type="search" placeholder="Chercher un plat ou un ingrédient" value="${esc(renderRecipes.q || "")}" data-act="search">
      <div class="seg filters" role="group" aria-label="Filtrer">${FILTERS.map(([k, l]) => `<button data-act="filter" data-f="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}</div>
      ${nEdits ? `<div class="notice row"><span class="grow">✎ ${nEdits} recette${nEdits > 1 ? "s" : ""} modifiée${nEdits > 1 ? "s" : ""} sur ce téléphone.</span>
        <button class="btn" data-act="copy-edits">Copier</button></div>` : ""}
      ${list.map((r) => {
        const editing = draft && draft.id === r.id;
        return `<details class="recipe ${isDish(r) && isOff(r) ? "off" : ""} ${editing ? "editing" : ""}" data-id="${r.id}" ${editing || openRecipes.has(r.id) ? "open" : ""}>
          <summary><span style="font-size:26px" aria-hidden="true">${r.emoji}</span>
          <span class="grow"><strong>${esc(r.name)}</strong><br><span class="small muted">${r.kind ? esc(kindLabel[r.kind]) + " · " : ""}${esc(r.tool)}</span></span>
          ${r.edited ? "✎" : ""}${r.love === 2 ? "★" : ""}</summary>
          <div class="body">${recipeBody(r)}</div></details>`;
      }).join("") || `<p class="muted">Aucune recette.</p>`}
      <p class="small muted" style="margin-top:16px">Les modifications restent sur ce téléphone. « Copier » donne le résumé à envoyer à Claude pour les garder dans l'app pour tout le monde.</p>`;
  }

  // Relit les champs de l'éditeur dans le brouillon (avant d'ajouter ou de supprimer une ligne).
  function syncDraft() {
    if (!draft) return;
    document.querySelectorAll(".ed-row").forEach((row) => {
      const line = draft[row.dataset.part][Number(row.dataset.i)];
      if (!line) return;
      const get = (f) => $(`[data-f="${f}"]`, row).value;
      const qty = parseFloat(get("qty").replace(",", "."));
      line[0] = get("name").trim();
      line[1] = Number.isFinite(qty) && qty > 0 ? qty : 0;
      line[2] = get("unit").trim();
      line[3] = get("rayon");
    });
  }

  function saveDraft() {
    syncDraft();
    const clean = (arr) => arr.filter((i) => i[0]).map(([n, q, u, r]) => [n, q, q ? u : "", r]);
    const o = original[draft.id];
    const ing = clean(draft.ing), side = clean(draft.side);
    const same = JSON.stringify(ing) === JSON.stringify(o.ing) && JSON.stringify(side) === JSON.stringify(o.side || []);
    if (same) delete prefs.edits[draft.id];
    else prefs.edits[draft.id] = { ing, side, at: isoDate(new Date()) };
    draft = null;
    afterRecipeChange(same ? "Aucun changement." : "Recette modifiée.");
  }

  function afterRecipeChange(msg) {
    refreshRecipes();
    if (S.plan && S.list) {
      const week = S.list.week;
      S.list = buildList(S.plan, S.list);
      S.list.week = week;
      msg += " Liste de courses mise à jour.";
    }
    toast(msg);
  }

  // ---------- Actions ----------
  function currentList() { return coursesView === "shared" ? shared : S.list; }
  function persistList() { if (coursesView === "shared") store.set("shared", shared); else save(); }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const act = t.dataset.act;
    const d = Number(t.dataset.day);
    switch (act) {
      case "yes": return fling($(".swipe.top"), true);
      case "no": return fling($(".swipe.top"), false);
      case "undo": return undo();
      case "target-": prefs.target = Math.max(3, prefs.target - 1); break;
      case "target+": prefs.target = Math.min(7, prefs.target + 1); break;
      case "week-prev": S.week = shiftWeek(S.week, -1); break;
      case "week-next": S.week = shiftWeek(S.week, 1); break;
      case "build-now": if (S.kept.length) S.plan = buildPlan(S.kept); break;
      case "up": case "down": {
        const o = act === "up" ? d - 1 : d + 1;
        const ds = S.plan.dinners;
        [ds[d], ds[o]] = [ds[o], ds[d]];
        fillLunches(S.plan);
        break;
      }
      case "make-list":
        S.list = buildList(S.plan, S.list);
        S.list.week = S.week;
        coursesView = "mine";
        tab = "courses";
        toast("Liste prête.");
        break;
      case "reset":
        if (!t.dataset.armed) { t.dataset.armed = "1"; t.textContent = "Sûr ? Touchez encore pour effacer le menu"; t.classList.remove("ghost"); return; }
        if (S.plan) prefs.history = [...prefs.history, S.plan.dinners.filter(Boolean)].slice(-4);
        S = freshState(S.plan ? shiftWeek(S.week, 1) : S.week);
        lastDecision = null;
        break;
      case "go-menu": tab = "menu"; break;
      case "view-mine": coursesView = "mine"; break;
      case "view-shared": coursesView = "shared"; break;
      case "share": shareLink(); return;
      case "copy-text": {
        const l = currentList();
        copy(listAsText({ ...l, week: coursesView === "shared" ? shared.week : S.week }), "Liste copiée.");
        return;
      }
      case "del": {
        const l = currentList();
        const key = t.dataset.key;
        const gone = l.items.find((i) => i.key === key);
        if (gone && !gone.custom) l.removed = [...(l.removed || []), key];
        l.items = l.items.filter((i) => i.key !== key);
        persistList();
        break;
      }
      case "clear-done": {
        const l = currentList();
        if (coursesView === "mine") l.removed = [...(l.removed || []), ...l.items.filter((i) => i.done && !i.custom).map((i) => i.key)];
        l.items = l.items.filter((i) => !i.done);
        persistList();
        break;
      }
      case "toggle-ex": {
        const id = t.dataset.id;
        const r = byId[id];
        if (isOff(r)) {
          prefs.excluded = prefs.excluded.filter((x) => x !== id);
          if (r.defaultOff && !prefs.included.includes(id)) prefs.included = [...prefs.included, id];
          if (!S.deck.includes(id) && !S.kept.includes(id)) S.deck.push(id);
        } else {
          prefs.excluded = [...prefs.excluded, id];
          prefs.included = prefs.included.filter((x) => x !== id);
          S.deck = S.deck.filter((x) => x !== id);
        }
        break;
      }
      case "filter": renderRecipes.filter = t.dataset.f; break;
      case "extra": {
        const id = t.dataset.id;
        S.extras = (S.extras || []).includes(id) ? S.extras.filter((x) => x !== id) : [...(S.extras || []), id];
        const added = S.extras.includes(id);
        if (S.plan && S.list) { const w = S.list.week; S.list = buildList(S.plan, S.list); S.list.week = w; }
        toast(added ? `${byId[id].name} : ajouté à la semaine${S.list ? ", liste de courses mise à jour" : ""}.` : "Retiré de la semaine.");
        break;
      }
      case "ed-open": {
        const r = byId[t.dataset.id];
        draft = { id: r.id, ing: r.ing.map((i) => [...i]), side: (r.side || []).map((i) => [...i]) };
        openRecipes.add(r.id);
        break;
      }
      case "ed-add": syncDraft(); draft[t.dataset.part].push(["", 0, "", t.dataset.part === "side" ? "surgeles" : "legumes"]); break;
      case "ed-del": syncDraft(); draft[t.dataset.part].splice(Number(t.dataset.i), 1); break;
      case "ed-cancel": draft = null; break;
      case "ed-save": saveDraft(); break;
      case "ed-reset":
        delete prefs.edits[t.dataset.id];
        draft = null;
        afterRecipeChange("Recette d'origine rétablie.");
        break;
      case "copy-edits": copy(editsAsText(), "Modifications copiées : collez-les dans un message à Claude."); return;
      default: return;
    }
    save();
    render();
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    const act = t.dataset.act;
    if (act === "tick") {
      const l = currentList();
      const it = l.items.find((i) => i.key === t.dataset.key);
      if (it) it.done = t.checked;
      persistList();
      t.closest(".item").classList.toggle("done", t.checked);
      const left = l.items.filter((i) => !i.done && i.rayon !== "placard").length;
      $("#subtitle").textContent = `${weekLabel(coursesView === "shared" ? shared.week : S.week)} · ${left} article${left > 1 ? "s" : ""} à prendre`;
      return;
    }
    const d = Number(t.dataset.day);
    if (act === "dinner") {
      S.plan.dinners[d] = t.value || null;
      fillLunches(S.plan);
    } else if (act === "lunch") {
      S.plan.lunches[d] = { id: t.value, src: t.value === S.plan.dinners[d - 1] ? "reste" : (d === 0 ? "prep" : "extra"), manual: true };
    } else return;
    save();
    render();
  });

  document.addEventListener("submit", (e) => {
    if (e.target.dataset.act !== "add") return;
    e.preventDefault();
    const v = e.target.item.value.trim();
    if (!v) return;
    const l = currentList();
    l.items.push({ key: "+" + Date.now(), name: v, qty: "", rayon: "autre", when: "", done: false, custom: true });
    persistList();
    render();
    $(".addbar input")?.focus();
  });

  document.addEventListener("input", (e) => {
    if (e.target.dataset.act !== "search") return;
    renderRecipes.q = e.target.value;
    const pos = e.target.selectionStart;
    renderRecipes();
    const inp = $(".search");
    inp.focus();
    inp.setSelectionRange(pos, pos);
  });

  document.addEventListener("toggle", (e) => {
    const d = e.target;
    if (!d.matches || !d.matches("details.recipe")) return;
    if (d.open) openRecipes.add(d.dataset.id); else openRecipes.delete(d.dataset.id);
  }, true);

  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => { if (draft) syncDraft(); tab = b.dataset.tab; render(); window.scrollTo(0, 0); }));
  window.addEventListener("hashchange", () => readHash().then(render));

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  if ((!S.plan && S.list) || (shared && !S.list && !S.kept.length)) tab = "courses";
  readHash().then(render);
})();
