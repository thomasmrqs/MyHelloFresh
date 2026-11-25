// Synchronisation du menu et de la liste de courses entre les téléphones de la famille.
//
// Stockage partagé : Firebase Realtime Database (offre gratuite « Spark »), par son API REST :
// pas de bibliothèque à charger, pas de compte dans l'app. Les données d'une famille sont sous
// familles/<code>, où <code> est un code secret de 24 caractères créé par l'app ; les règles de la
// base n'autorisent que les chemins de ce type, et la liste des familles n'est pas lisible.
//
// familles/<code>/menu    { at, by, data }  data = JSON du menu (semaine, plats gardés, dîners, midis…)
// familles/<code>/list    { at, by, data }  data = JSON de la liste de courses, sans les cases cochées
// familles/<code>/checks  { <article>: true }  cases cochées, une par une (deux personnes au magasin)
//
// Le dernier qui modifie gagne, section par section (menu, liste). Sans réseau, l'app continue sur le
// téléphone et envoie ses changements au retour du réseau, sauf si l'autre téléphone a modifié après.
(() => {
  "use strict";

  const LS = {
    get(k, d) { try { const v = localStorage.getItem("menus:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { if (v == null) localStorage.removeItem("menus:" + k); else localStorage.setItem("menus:" + k, JSON.stringify(v)); } catch { /* */ } },
  };
  const DB_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebaseio\.com|firebasedatabase\.app)$/;
  const CODE_RE = /^[A-Za-z0-9]{20,40}$/;
  const cleanDb = (u) => String(u || "").trim().replace(/\/+$/, "");

  let db = cleanDb(LS.get("syncdb", "") || (window.SYNC_CONFIG || {}).databaseURL);
  if (!DB_RE.test(db)) db = "";
  let code = LS.get("famille", null);
  const clientId = LS.get("client", null) || (() => { const c = randomCode(8); LS.set("client", c); return c; })();
  // at : date de la dernière version connue de chaque section ; sent : ce qui a été envoyé ; pending : à envoyer.
  const meta = Object.assign({ menu: { at: 0, sent: "", pending: false }, list: { at: 0, sent: "", pending: false }, checks: {} }, LS.get("syncmeta", {}));
  let es = null, status = "off", remote = {}, hooks = null, retryTimer = null;

  function randomCode(n) {
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return [...a].map((x) => abc[x % abc.length]).join("");
  }
  // Clés Firebase : pas de . $ # [ ] /
  const encKey = (k) => encodeURIComponent(k).replace(/\./g, "%2E").replace(/[$#[\]]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  const decKey = (k) => decodeURIComponent(k);
  const url = (path, c = code) => `${db}/familles/${c}${path}.json`;
  const saveMeta = () => LS.set("syncmeta", meta);

  function setStatus(s) {
    if (s === status) return;
    status = s;
    hooks && hooks.onStatus && hooks.onStatus(s);
  }

  async function req(method, path, body, c) {
    const res = await fetch(url(path, c), { method, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
    if (!res.ok) throw new Error(method + " " + res.status);
    return res.json();
  }

  // ---------- Réception ----------
  function setAt(obj, path, data) {
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return data;
    const root = obj && typeof obj === "object" ? obj : {};
    let o = root;
    for (const p of parts.slice(0, -1)) { if (!o[p] || typeof o[p] !== "object") o[p] = {}; o = o[p]; }
    const last = parts[parts.length - 1];
    if (data === null) delete o[last]; else o[last] = data;
    return root;
  }

  function reconcile() {
    if (!hooks) return;
    let changed = false;
    for (const sec of ["menu", "list"]) {
      const r = remote[sec];
      const m = meta[sec];
      if (!r) { if (m.at || m.pending) push(sec); continue; } // famille vide : on envoie ce qu'on a
      if (r.at === m.at && r.by === clientId) continue; // notre propre envoi
      if (m.pending && m.at > r.at) { push(sec); continue; } // changement fait hors connexion, plus récent
      if (r.at === m.at) continue;
      let data;
      try { data = JSON.parse(r.data); } catch { continue; }
      m.at = r.at; m.pending = false; m.sent = r.data;
      hooks[sec === "menu" ? "applyMenu" : "applyList"](data);
      changed = true;
    }
    const checks = {};
    for (const [k, v] of Object.entries(remote.checks || {})) if (v) checks[decKey(k)] = true;
    for (const [k, v] of Object.entries(meta.checks)) { if (v) checks[k] = true; else delete checks[k]; } // pas encore envoyées
    if (hooks.applyChecks(checks)) changed = true;
    saveMeta();
    if (changed && hooks.onChange) hooks.onChange();
  }

  function connect() {
    disconnect();
    if (!db || !code || !hooks) { setStatus(db ? "off" : "unconfigured"); return; }
    setStatus("connecting");
    remote = {};
    es = new EventSource(url(""));
    es.addEventListener("put", (e) => {
      const { path, data } = JSON.parse(e.data);
      remote = setAt(remote, path, data) || {};
      setStatus("ok");
      reconcile();
      flushChecks();
    });
    es.addEventListener("patch", (e) => {
      const { path, data } = JSON.parse(e.data);
      for (const [k, v] of Object.entries(data || {})) remote = setAt(remote, path + "/" + k, v) || {};
      reconcile();
    });
    es.addEventListener("keep-alive", () => setStatus("ok"));
    es.addEventListener("cancel", () => { setStatus("error"); disconnect(); });
    es.onerror = () => { setStatus(navigator.onLine ? "connecting" : "offline"); };
  }
  function disconnect() {
    if (es) { es.close(); es = null; }
  }

  // ---------- Envoi ----------
  async function push(sec) {
    if (!hooks) return;
    const str = JSON.stringify(sec === "menu" ? hooks.getMenu() : hooks.getList());
    const m = meta[sec];
    if (!m.pending && str === m.sent && m.at) return;
    if (str !== m.sent || !m.at) { m.at = Date.now(); m.sent = str; }
    m.pending = true;
    saveMeta();
    if (!db || !code) return;
    const at = m.at;
    try {
      const body = { at, by: clientId, data: str };
      await req("PUT", "/" + sec, body);
      remote[sec] = body;
      if (m.at === at) m.pending = false;
      if (sec === "list" && str === "null") { await req("PUT", "/checks", null); meta.checks = {}; remote.checks = {}; }
      saveMeta();
    } catch { scheduleRetry(); }
  }

  async function flushChecks() {
    const entries = Object.entries(meta.checks);
    if (!entries.length || !db || !code) return;
    const body = Object.fromEntries(entries.map(([k, v]) => [encKey(k), v ? true : null]));
    try {
      await req("PATCH", "/checks", body);
      for (const [k, v] of entries) if (meta.checks[k] === v) delete meta.checks[k];
      saveMeta();
    } catch { scheduleRetry(); }
  }

  function scheduleRetry() {
    clearTimeout(retryTimer);
    retryTimer = setTimeout(flush, 15000);
  }
  function flush() {
    if (!code) return;
    if (meta.menu.pending) push("menu");
    if (meta.list.pending) push("list");
    flushChecks();
  }

  window.addEventListener("online", () => { if (code) { connect(); flush(); } });
  window.addEventListener("offline", () => { if (code) setStatus("offline"); });
  document.addEventListener("visibilitychange", () => {
    // iOS coupe la connexion quand l'app passe en arrière-plan : on la rouvre au retour.
    if (document.visibilityState === "visible" && code && (!es || es.readyState === 2)) connect();
  });

  window.FamilySync = {
    get status() { return status; },
    get code() { return code; },
    get db() { return db; },
    get configured() { return !!db; },
    validCode: (c) => CODE_RE.test(String(c || "").trim()),
    validDb: (u) => DB_RE.test(cleanDb(u)),
    setDb(u) { const v = cleanDb(u); if (!DB_RE.test(v)) return false; db = v; LS.set("syncdb", v); connect(); return true; },

    init(h) { hooks = h; connect(); },
    // Appelé à chaque enregistrement : n'envoie que ce qui a changé.
    changed() { if (!code) return; push("menu"); push("list"); },
    tick(key, done) { if (!code) return; meta.checks[key] = !!done; saveMeta(); flushChecks(); },

    // Nouvelle famille à partir de ce téléphone : son menu et sa liste sont envoyés.
    async create() {
      const c = randomCode(24);
      const menu = JSON.stringify(hooks.getMenu()), list = JSON.stringify(hooks.getList());
      const at = Date.now();
      const checks = Object.fromEntries(Object.entries(hooks.getChecks()).filter(([, v]) => v).map(([k]) => [encKey(k), true]));
      await req("PUT", "", { menu: { at, by: clientId, data: menu }, list: { at, by: clientId, data: list }, checks }, c);
      code = c; LS.set("famille", c);
      Object.assign(meta, { menu: { at, sent: menu, pending: false }, list: { at, sent: list, pending: false }, checks: {} });
      saveMeta();
      connect();
      return c;
    },
    // Rejoindre une famille : le menu et la liste de ce téléphone sont remplacés par ceux de la famille.
    async join(c, dbUrl) {
      c = String(c || "").trim();
      if (dbUrl && !this.setDb(dbUrl)) throw new Error("db");
      if (!db) throw new Error("db");
      if (!CODE_RE.test(c)) throw new Error("code");
      const data = await req("GET", "", undefined, c);
      if (!data || !data.menu) throw new Error("unknown");
      code = c; LS.set("famille", c);
      Object.assign(meta, { menu: { at: 0, sent: "", pending: false }, list: { at: 0, sent: "", pending: false }, checks: {} });
      saveMeta();
      connect();
    },
    leave() {
      disconnect();
      code = null; LS.set("famille", null);
      Object.assign(meta, { menu: { at: 0, sent: "", pending: false }, list: { at: 0, sent: "", pending: false }, checks: {} });
      saveMeta();
      setStatus("off");
    },
    inviteLink() {
      const host = db.replace(/^https:\/\//, "");
      return `${location.origin}${location.pathname}#famille=${code}@${host}`;
    },
  };
})();
