/**
 * framextv - Built from src/framextv/
 * Generated: 2026-10-25T05:10:30.671Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/framextv/index.js
var framextv_exports = {};
__export(framextv_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(framextv_exports);

// src/framextv/http.js
var LABEL = "FrameXTV";
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36";
var API_BASES = [
  "https://api.framextv.xyz",
  "https://api.framextv.cc",
  "https://api.framextv.tech",
  "https://api.framextv.pro"
];
var SITE_ORIGIN = "https://framextv.cc";
var activeBase = API_BASES[1];
function apiBase() {
  return activeBase;
}
function rotateBase() {
  const index = API_BASES.indexOf(activeBase);
  activeBase = API_BASES[(index + 1) % API_BASES.length];
  return activeBase;
}
function apiHeaders(referer) {
  return {
    "User-Agent": BROWSER_UA,
    Origin: SITE_ORIGIN,
    Referer: referer || `${SITE_ORIGIN}/`,
    Accept: "application/json, text/plain, */*"
  };
}
function withTimeout(promise, ms, fallback) {
  if (typeof setTimeout !== "function")
    return promise;
  let timer;
  const guard = new Promise((resolve) => {
    timer = setTimeout(() => {
      try {
        resolve(fallback);
      } catch (error) {
      }
    }, ms);
  });
  return Promise.race([promise, guard]).finally(() => {
    if (timer)
      clearTimeout(timer);
  });
}
function request(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const { method = "GET", headers, timeout = 15e3, redirect = "follow" } = options;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const init = {
      method,
      redirect,
      headers: Object.assign({ "User-Agent": BROWSER_UA }, headers || {})
    };
    if (controller)
      init.signal = controller.signal;
    const run = () => __async(this, null, function* () {
      const res = yield fetch(url, init);
      let text = "";
      try {
        text = yield res.text();
      } catch (error) {
        text = "";
      }
      let json = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch (error) {
          json = null;
        }
      }
      return { status: res.status, ok: res.ok, headers: res.headers, text, json };
    });
    try {
      const result = yield withTimeout(run(), timeout, null);
      if (!result && controller)
        controller.abort();
      return result || { status: 0, ok: false, text: "", json: null, error: "timeout" };
    } catch (error) {
      return { status: 0, ok: false, text: "", json: null, error: String(error && error.message || error) };
    }
  });
}
function getJSON(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const res = yield request(url, options);
    return res && res.json ? res.json : null;
  });
}
function apiGet(_0) {
  return __async(this, arguments, function* (path, options = {}) {
    const attempts = API_BASES.length;
    let last = null;
    for (let i = 0; i < attempts; i++) {
      const url = `${apiBase()}${path}`;
      const res = yield request(url, options);
      last = res;
      if (res && res.json)
        return { json: res.json, res, base: apiBase() };
      if (res && res.status >= 400 && res.status < 500)
        return { json: null, res, base: apiBase() };
      rotateBase();
    }
    return { json: null, res: last, base: apiBase() };
  });
}
function parseTmdbId(raw) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s)
    return null;
  const prefixed = /^(?:tmdb|themoviedb):(\d+)$/i.exec(s);
  if (prefixed)
    return prefixed[1];
  if (/^\d+$/.test(s))
    return s;
  return null;
}
var TMDB_KEY = "3d421899d5ce93db8ad4ae4591ccc130";
var TMDB_BASE = "https://api.themoviedb.org/3";
function imdbToTmdb(imdbId, mediaType) {
  return __async(this, null, function* () {
    const imdb = String(imdbId || "").trim().toLowerCase();
    if (!/^tt\d+$/.test(imdb))
      return null;
    const type = String(mediaType || "").toLowerCase() === "movie" ? "movie" : "tv";
    const found = yield getJSON(
      `${TMDB_BASE}/find/${imdb}?external_source=imdb_id&api_key=${TMDB_KEY}`,
      { timeout: 12e3 }
    );
    if (found) {
      const bucket = type === "movie" ? found.movie_results : found.tv_results;
      if (bucket && bucket.length && bucket[0].id)
        return String(bucket[0].id);
    }
    const kind = type === "movie" ? "movie" : "series";
    const cinemeta = yield getJSON(`https://v3-cinemeta.strem.io/meta/${kind}/${imdb}.json`, {
      timeout: 12e3
    });
    const id = cinemeta && cinemeta.meta && cinemeta.meta.moviedb_id;
    return id ? String(id) : null;
  });
}
function qualityHeight(quality) {
  const raw = String(quality || "");
  const matches = raw.match(/(\d{3,4})\s*p/gi);
  if (matches && matches.length) {
    const values = matches.map((m) => parseInt(m, 10)).filter((n) => n >= 144 && n <= 2160);
    if (values.length)
      return Math.max.apply(null, values);
  }
  if (/\b(4k|uhd)\b/i.test(raw))
    return 2160;
  return 0;
}
function qualifier(quality) {
  const raw = String(quality || "").trim();
  if (!raw)
    return "";
  const rest = raw.split("/").map((part) => part.trim()).filter((part) => part && !/^auto$/i.test(part) && !/^\d{3,4}p$/i.test(part) && !/^(4k|uhd)$/i.test(part));
  return rest.join(" ");
}
function isGenericQuality(value) {
  const raw = String(value || "").trim();
  if (!raw)
    return true;
  return /^(auto|hd|sd|hq|multi-quality|multi quality|unknown|default)$/i.test(raw) || /^auto\b/i.test(raw);
}
function languageLabel(code) {
  const raw = String(code || "").trim();
  if (!raw)
    return "";
  const lower = raw.toLowerCase();
  const table = {
    eng: "English",
    en: "English",
    spa: "Spanish",
    es: "Spanish",
    fre: "French",
    fra: "French",
    fr: "French",
    ger: "German",
    deu: "German",
    de: "German",
    ita: "Italian",
    it: "Italian",
    por: "Portuguese",
    pt: "Portuguese",
    rus: "Russian",
    ru: "Russian",
    hin: "Hindi",
    hi: "Hindi",
    jpn: "Japanese",
    ja: "Japanese",
    kor: "Korean",
    ko: "Korean",
    chi: "Chinese",
    zho: "Chinese",
    zh: "Chinese",
    vie: "Vietnamese",
    vi: "Vietnamese"
  };
  return table[lower] || raw;
}

// src/framextv/api.js
var PROVIDERS = [
  { id: "royal_champion", label: "Royal Champion I", hint: "4-Server Direct HLS" },
  { id: "bowler", label: "Bowler XVIII", hint: "Multi-Language" },
  { id: "titan", label: "Titan VII", hint: "Films365 Direct MP4" },
  { id: "giant", label: "Giant XI", hint: "Multi-Audio Direct Stream" },
  { id: "super_barbarian", label: "Super Barbarian XVI", hint: "Direct Auto HLS" },
  { id: "minion_prince", label: "Minion Prince I", hint: "4K Direct HLS" },
  { id: "root_rider", label: "Root Rider I", hint: "Multi-Server Worker HLS" },
  { id: "battle_copter", label: "Battle Copter I", hint: "Fast Lookup VPS HLS" },
  // Flaps between "down" and "available" on their own status board; when it
  // answers it is the only server carrying the title (verified live: 2 edges,
  // direct MPEG-TS, no proxy). Costs one timeout when it is really down.
  { id: "super_dragon", label: "Super Dragon XIII", hint: "Delta Multi-Audio Direct HLS" }
];
var KNOWN = {};
for (const provider of PROVIDERS)
  KNOWN[provider.id] = provider;
var PROXY_HOSTS = [
  "frappe.hybrows.workers.dev",
  "crap.hybrows.workers.dev",
  "api.framextv.cc",
  "api.framextv.xyz",
  "api.framextv.tech",
  "api.framextv.pro"
];
function isProxyUrl(url) {
  const raw = String(url || "").toLowerCase();
  if (!raw)
    return false;
  for (const host of PROXY_HOSTS)
    if (raw.includes(host))
      return true;
  return /\/api\/proxy\?/.test(raw);
}
function proxyReferer(url) {
  const raw = String(url || "");
  const origin = /[?&]origin=([^&]+)/.exec(raw);
  if (origin) {
    try {
      return decodeURIComponent(origin[1]);
    } catch (error) {
    }
  }
  const ref = /[?&]ref(?:erer)?=([^&]+)/.exec(raw);
  if (ref) {
    try {
      return decodeURIComponent(ref[1]);
    } catch (error) {
    }
  }
  return "";
}
function normaliseSubtitle(sub, index) {
  if (!sub || typeof sub.url !== "string" || !sub.url)
    return null;
  const label = String(sub.label || "").replace(/^Subtitles\s*•\s*/i, "").trim();
  const language = String(sub.language || sub.lang || sub.code || "").toLowerCase();
  return {
    url: sub.url,
    language: language || "und",
    label: label || sub.label || language || `Track ${index + 1}`,
    format: String(sub.format || "vtt").toLowerCase(),
    isDefault: Boolean(sub.isDefault)
  };
}
function normaliseSource(source, payload, providerId) {
  if (!source || typeof source.url !== "string" || !source.url)
    return null;
  const answered = String(payload.provider || providerId || "");
  const known = KNOWN[answered];
  const providerLabel = known ? known.label : answered || "FrameXTV";
  const server = String(source.server || providerLabel).trim();
  const qualityRaw = String(source.quality || "");
  const height = qualityHeight(qualityRaw);
  const proxy = isProxyUrl(source.url);
  const audio = Array.isArray(source.audioTracks) ? source.audioTracks : [];
  const languages = [];
  for (const track of audio) {
    const label = languageLabel(track && (track.language || track.id || track.label));
    if (label && languages.indexOf(label) === -1)
      languages.push(label);
  }
  const headers = { "User-Agent": apiHeaders()["User-Agent"] };
  if (proxy) {
    const referer = proxyReferer(source.url);
    if (referer)
      headers.Referer = referer;
  }
  if (source.headers && typeof source.headers === "object") {
    for (const key of Object.keys(source.headers)) {
      if (source.headers[key])
        headers[key] = source.headers[key];
    }
  }
  return {
    providerId: answered || providerId,
    providerLabel,
    hint: known ? known.hint : "",
    server,
    // The backend rewrites the server name for some servers: Titan answers
    // "Titan VII - S01E01 Direct MP4" for an episode and "Titan VII -
    // Direct MP4" for a film. Drop that decoration - it is noise in a
    // stream picker and it changes from title to title.
    cleanServer: server.replace(/\s+-?\s*S\d{1,2}\s*E\d{1,3}\s+/, " ").replace(/\s{2,}/g, " ").trim() || server,
    quality: qualityRaw,
    qualifier: qualifier(qualityRaw),
    height,
    type: String(source.type || "hls").toLowerCase(),
    url: source.url,
    headers,
    proxied: proxy,
    languages,
    subtitles: [],
    rank: PROVIDERS.findIndex((provider) => provider.id === (answered || providerId))
  };
}
function readPayload(payload, providerId) {
  if (!payload || typeof payload !== "object")
    return { sources: [], subtitles: [] };
  const direct = Array.isArray(payload.sources) ? payload.sources : [];
  const nested = [];
  if (Array.isArray(payload.alternates)) {
    for (const alternate of payload.alternates) {
      if (alternate && Array.isArray(alternate.sources)) {
        for (const source of alternate.sources) {
          if (source && !source.server)
            source.server = alternate.provider;
          nested.push(source);
        }
      }
    }
  }
  const sources = [];
  for (const source of direct.concat(nested)) {
    const row = normaliseSource(source, payload, providerId);
    if (row)
      sources.push(row);
  }
  const subtitles = [];
  const seen = /* @__PURE__ */ new Set();
  for (const sub of Array.isArray(payload.subtitles) ? payload.subtitles : []) {
    const row = normaliseSubtitle(sub, subtitles.length);
    if (!row || seen.has(row.url))
      continue;
    seen.add(row.url);
    subtitles.push(row);
  }
  return { sources, subtitles };
}
function fetchProvider(args, providerId, timeout) {
  return __async(this, null, function* () {
    const { tmdbId, type, season, episode } = args;
    let path = `/api/stream?type=${encodeURIComponent(type === "movie" ? "movie" : "tv")}&id=${encodeURIComponent(tmdbId)}`;
    if (type !== "movie") {
      path += `&season=${Number(season) || 1}&episode=${Number(episode) || 1}`;
    }
    if (providerId)
      path += `&provider=${encodeURIComponent(providerId)}`;
    const started = Date.now();
    const { json } = yield apiGet(path, {
      headers: apiHeaders(),
      timeout: timeout || 12e3
    });
    const ms = Date.now() - started;
    const parsed = readPayload(json, providerId);
    const answered = json && typeof json.provider === "string" ? json.provider : providerId;
    console.log(
      `[${LABEL}] ${providerId || "auto"} -> ${parsed.sources.length} source(s), ${parsed.subtitles.length} subtitle(s) in ${ms}ms` + (answered && answered !== providerId ? ` (answered: ${answered})` : "")
    );
    return Object.assign({ providerId, answered, ms }, parsed);
  });
}
function fetchProviderStates(args) {
  return __async(this, null, function* () {
    const { tmdbId, type, season, episode } = args;
    let path = `/api/stream/status?type=${encodeURIComponent(type === "movie" ? "movie" : "tv")}&id=${encodeURIComponent(tmdbId)}&season=${Number(season) || 1}&episode=${Number(episode) || 1}`;
    const { json } = yield apiGet(path, { headers: apiHeaders(), timeout: 6e3 });
    const states = {};
    if (json && Array.isArray(json.providers)) {
      for (const item of json.providers) {
        if (item && item.id)
          states[item.id] = String(item.state || "");
      }
    }
    return states;
  });
}

// src/framextv/variants.js
function resolveVariant(url, headers, timeoutMs) {
  return __async(this, null, function* () {
    if (!/\.m3u8|playlist|master|\/pl\//i.test(String(url)) && !/m3u8/i.test(String(url))) {
      return "";
    }
    const text = yield readText(url, headers, timeoutMs || 4e3);
    if (!text || !text.trimStart().startsWith("#EXTM3U"))
      return "";
    if (!/#EXT-X-STREAM-INF/i.test(text))
      return "";
    const variants = [];
    const lines = text.replace(/\r/g, "").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith("#EXT-X-STREAM-INF"))
        continue;
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j].trim();
        if (!line || line.startsWith("#"))
          continue;
        variants.push(line);
        break;
      }
    }
    if (variants.length !== 1)
      return "";
    try {
      return new URL(variants[0], url).toString();
    } catch (error) {
      return variants[0];
    }
  });
}
function readText(url, headers, timeoutMs) {
  return __async(this, null, function* () {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const init = { headers: Object.assign({}, headers || {}) };
    if (controller)
      init.signal = controller.signal;
    const timer = setTimeout(() => {
      if (controller) {
        try {
          controller.abort();
        } catch (error) {
        }
      }
    }, timeoutMs);
    try {
      const res = yield fetch(url, init);
      if (!res.ok)
        return "";
      return yield res.text();
    } catch (error) {
      return "";
    } finally {
      clearTimeout(timer);
    }
  });
}

// src/framextv/ranking.js
var INSPECT_BYTES = 1024;
var PROBE_CONCURRENCY = 6;
var INSPECT_CANDIDATES = 16;
var MAX_STREAMS = 16;
function rangeGet(url, headers) {
  return fetch(url, {
    headers: Object.assign(
      {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36",
        Accept: "*/*",
        Range: `bytes=0-${INSPECT_BYTES - 1}`
      },
      headers || {}
    )
  });
}
function decode(bytes) {
  if (typeof TextDecoder === "function") {
    try {
      return new TextDecoder("utf-8").decode(bytes);
    } catch (error) {
    }
  }
  let out = "";
  for (let i = 0; i < bytes.length; i++)
    out += String.fromCharCode(bytes[i]);
  return out;
}
function resolutionOf(text) {
  let best = null;
  const re = /RESOLUTION=(\d{2,5})x(\d{2,5})/g;
  let match;
  while (match = re.exec(String(text))) {
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    if (!best || width * height > best.width * best.height)
      best = { width, height };
  }
  return best;
}
function inspect(candidate, budgetMs) {
  return __async(this, null, function* () {
    const started = Date.now();
    const budget = budgetMs || 900;
    for (let attempt = 0; attempt < 2; attempt++) {
      const report = yield inspectOnce(candidate, budget, started);
      if (report.ok || report.reason !== "timeout")
        return report;
      if (Date.now() - started > budget * 2)
        return report;
    }
    return { ok: false, reason: "timeout" };
  });
}
function inspectOnce(candidate, budget, started) {
  return __async(this, null, function* () {
    try {
      const res = yield withTimeout(rangeGet(candidate.url, candidate.headers), budget, null);
      if (!res)
        return { ok: false, reason: "timeout" };
      let buffer = null;
      try {
        buffer = yield withTimeout(res.arrayBuffer(), budget, null);
      } catch (error) {
        buffer = null;
      }
      if (!buffer)
        return { ok: false, reason: `no body (HTTP ${res.status})` };
      const bytes = new Uint8Array(buffer);
      const text = decode(bytes).replace(/^\uFEFF/, "");
      const trimmed = text.trimStart();
      if (trimmed.startsWith("#EXTM3U")) {
        const master = /#EXT-X-STREAM-INF/i.test(trimmed);
        const resolution = master ? resolutionOf(trimmed) : null;
        return {
          ok: true,
          shape: master ? "master" : "media",
          height: resolution ? resolution.height : 0,
          width: resolution ? resolution.width : 0,
          ms: Date.now() - started
        };
      }
      const magic = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (magic === "ftyp" || magic === "styp" || bytes[0] === 71) {
        return { ok: true, shape: "mp4", height: 0, width: 0, ms: Date.now() - started };
      }
      const head = text.slice(0, 60).replace(/\s+/g, " ");
      return { ok: false, reason: `not a playlist (HTTP ${res.status}): ${head}` };
    } catch (error) {
      return { ok: false, reason: String(error && error.message || "fetch failed") };
    }
  });
}
function inspectTop(candidates, budgetMs, concurrency) {
  return __async(this, null, function* () {
    const reports = /* @__PURE__ */ new Map();
    const queue = candidates.slice(0, INSPECT_CANDIDATES);
    if (!queue.length)
      return reports;
    let cursor = 0;
    let live = 0;
    let enough;
    const enoughVerdicts = new Promise((resolve) => {
      enough = resolve;
    });
    const worker = () => __async(this, null, function* () {
      for (; ; ) {
        const index = cursor++;
        if (index >= queue.length)
          return;
        const candidate = queue[index];
        try {
          const report = yield inspect(candidate, Math.max(900, Math.min(3e3, budgetMs)));
          reports.set(candidate.url, report);
          if (report && report.ok)
            live += 1;
        } catch (error) {
        }
      }
    });
    const pool = [];
    const width = Math.max(1, Math.min(concurrency || PROBE_CONCURRENCY, queue.length));
    for (let i = 0; i < width; i++)
      pool.push(worker());
    yield Promise.all(pool).catch(() => null);
    console.log(`[${LABEL}] probed ${reports.size}/${queue.length}: ${live} live`);
    return reports;
  });
}
function score(candidate, report) {
  const state = !report ? "unknown" : report.ok ? "live" : "dead";
  const height = report && report.height || candidate.height || 0;
  const width = report && report.width || 0;
  let value = 0;
  value += Math.min(height, 2160) / 10;
  if (state === "live")
    value += 60;
  else if (state === "unknown")
    value -= 20;
  else
    value -= 5e3;
  const shape = report && report.shape || candidate.shape || "";
  if (shape === "master")
    value += 4;
  if (!candidate.proxied)
    value += 6;
  if (candidate.rank >= 0)
    value += Math.max(0, 3 - candidate.rank / 2);
  if (report && report.ok && report.ms)
    value += Math.max(0, 3 - report.ms / 400);
  return { value, state, height, width, shape };
}
function widthLabel(width, height) {
  if (width >= 3800)
    return "4K";
  if (width >= 1900)
    return "1080p";
  if (width >= 1270)
    return "720p";
  if (width >= 840)
    return "480p";
  if (width >= 620)
    return "360p";
  if (height)
    return height >= 2e3 ? "4K" : `${height}p`;
  return "";
}
function groupMirrors(entries) {
  const groups = [];
  const byKey = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const candidate = entry.candidate;
    const name = String(candidate.cleanServer || candidate.server || "").toLowerCase();
    const base = name.split("\xB7")[0].trim();
    const key = `${candidate.providerId}|${base}`;
    const queue = byKey.get(key) || [];
    const group = queue.find((item) => {
      const other = item.primary.candidate;
      return !other.height || !candidate.height || other.height === candidate.height;
    });
    if (!group) {
      const created = { primary: entry, mirrors: [] };
      queue.push(created);
      byKey.set(key, queue);
      groups.push(created);
      continue;
    }
    const suffix = name.slice(base.length).replace(/^[\s\u00b7]+/, "");
    group.mirrors.push({
      url: candidate.url,
      headers: candidate.headers,
      label: String(suffix || candidate.qualifier || "Mirror").slice(0, 32)
    });
  }
  return groups;
}
function unwrap(url) {
  const raw = String(url || "");
  const marker = /[?&]url=([^&]+)/.exec(raw);
  if (!marker)
    return raw;
  try {
    return decodeURIComponent(marker[1]);
  } catch (error) {
    return raw;
  }
}
function dedupe(candidates) {
  const byEdge = /* @__PURE__ */ new Map();
  for (const candidate of candidates) {
    if (!candidate || !candidate.url)
      continue;
    const raw = String(candidate.url);
    const target = raw.includes("/proxy") || /\/api\/proxy\?/.test(raw) ? unwrap(raw) : raw;
    const key = target.split("#")[0];
    const current = byEdge.get(key);
    if (!current) {
      byEdge.set(key, candidate);
      continue;
    }
    if (current.proxied && !candidate.proxied)
      byEdge.set(key, candidate);
  }
  return [...byEdge.values()];
}
function titleFor(candidate, height, width) {
  const bits = [candidate.cleanServer || candidate.server];
  const measured = widthLabel(width, height);
  const quality = measured || (isGenericQuality(candidate.qualifier) ? "" : candidate.qualifier);
  if (quality)
    bits.push(quality);
  if (candidate.languages && candidate.languages.length)
    bits.push(candidate.languages.join(" / "));
  if (candidate.proxied)
    bits.push("Proxy");
  return bits.join(" \xB7 ");
}
function buildStreams(candidates, subtitles, reports, budgetMs, probed) {
  return __async(this, null, function* () {
    if (!candidates.length)
      return [];
    const unique = dedupe(candidates);
    const ordered = unique.slice().sort((a, b) => b.height - a.height || (a.proxied ? 1 : 0) - (b.proxied ? 1 : 0) || a.rank - b.rank);
    const known = reports || /* @__PURE__ */ new Map();
    if (probed && typeof probed === "object") {
      for (const candidate of ordered) {
        if (known.has(candidate.url))
          continue;
        const report = probed[candidate.providerId];
        if (report)
          known.set(candidate.url, report);
      }
    }
    const missing = ordered.filter((candidate) => !known.has(candidate.url)).slice(0, INSPECT_CANDIDATES);
    if (missing.length) {
      const more = yield inspectTop(missing, budgetMs == null ? 900 : budgetMs).catch(() => /* @__PURE__ */ new Map());
      for (const [url, report] of more)
        known.set(url, report);
    }
    const scored = ordered.map((candidate) => {
      const report = known.get(candidate.url);
      const { value, state, height, width, shape } = score(candidate, report);
      return { candidate, report, state, height, width, shape, value };
    });
    scored.sort((a, b) => b.value - a.value);
    let dead = 0;
    let unknown = 0;
    for (const entry of scored) {
      if (entry.state === "unknown") {
        unknown += 1;
        continue;
      }
      if (entry.state !== "dead")
        continue;
      dead += 1;
      console.log(`[${LABEL}] dead: ${entry.candidate.cleanServer || entry.candidate.server} (${entry.report.reason})`);
    }
    console.log(
      `[${LABEL}] scored ${scored.length}: ${scored.length - dead - unknown} live, ${unknown} unmeasured, ${dead} dead`
    );
    const live = scored.filter((entry) => entry.state !== "dead");
    const pool = live.length ? live : scored;
    const picked = [];
    const used = /* @__PURE__ */ new Set();
    const seenProviders = /* @__PURE__ */ new Set();
    for (const entry of pool) {
      if (seenProviders.has(entry.candidate.providerId))
        continue;
      seenProviders.add(entry.candidate.providerId);
      picked.push(entry);
      used.add(entry.candidate.url);
    }
    for (const entry of pool) {
      if (picked.length >= MAX_STREAMS)
        break;
      if (used.has(entry.candidate.url))
        continue;
      picked.push(entry);
      used.add(entry.candidate.url);
    }
    const tracks = tidySubtitles(subtitles);
    const groups = groupMirrors(picked);
    const out = [];
    for (const group of groups) {
      const entry = group.primary;
      const { candidate, height, width } = entry;
      const quality = widthLabel(width, height) || widthLabel(0, candidate.height) || "Auto";
      const row = {
        name: `${LABEL} \xB7 ${candidate.cleanServer || candidate.server}`,
        title: titleFor(candidate, height, width),
        quality,
        url: candidate.url,
        headers: Object.assign({}, candidate.headers || {})
      };
      if (tracks.length)
        row.subtitles = tracks;
      group.row = row;
      out.push(row);
    }
    yield Promise.all(
      groups.map((group) => __async(this, null, function* () {
        const row = group.row;
        if (group.mirrors.length)
          return;
        try {
          const variant = yield resolveVariant(row.url, row.headers, 3500);
          if (variant)
            row.url = variant;
        } catch (error) {
        }
      }))
    );
    console.log(`[${LABEL}] ${out.length} stream(s) from ${unique.length} candidate(s)`);
    for (const row of out)
      console.log(`[${LABEL}]   ${row.title} | ${row.url.slice(0, 90)}`);
    return out;
  });
}
function tidySubtitles(list) {
  if (!Array.isArray(list) || !list.length)
    return [];
  const priority = (sub) => {
    const language = String(sub.language || "").toLowerCase();
    const label = String(sub.label || "").toLowerCase();
    if (language === "vi" || label.startsWith("viet"))
      return 0;
    if (language === "en" || label.startsWith("english"))
      return 1;
    return 2;
  };
  const seen = /* @__PURE__ */ new Map();
  for (const sub of list) {
    if (!sub || !sub.url)
      continue;
    const key = `${String(sub.language || "").toLowerCase()}|${String(sub.label || "").toLowerCase()}`;
    if (!seen.has(key))
      seen.set(key, sub);
  }
  return [...seen.values()].sort((a, b) => priority(a) - priority(b)).slice(0, 14);
}

// src/framextv/index.js
var CACHE_TTL_MS = 10 * 60 * 1e3;
var EMPTY_TTL_MS = 60 * 1e3;
var CACHE_MAX = 48;
var cache = /* @__PURE__ */ new Map();
var FANOUT_BUDGET_MS = 11e3;
var LATE_PROBE_BUDGET_MS = 400;
function cacheKey(type, id, season, episode) {
  return type === "show" ? `show:${id}:${season}:${episode}` : `movie:${id}`;
}
function safe(name, run) {
  const started = Date.now();
  return Promise.resolve().then(run).then((value) => {
    const rows = value && Array.isArray(value.sources) ? value : { sources: [], subtitles: [] };
    rows.elapsed = Date.now() - started;
    return rows;
  }).catch((error) => {
    console.log(
      `[${LABEL}] ${name} failed after ${Date.now() - started}ms: ${error && error.message || error}`
    );
    return { sources: [], subtitles: [], elapsed: Date.now() - started };
  });
}
function timeoutFor(provider) {
  if (provider === "giant")
    return 9e3;
  if (provider === "bowler" || provider === "root_rider")
    return 7e3;
  return 6e3;
}
function providersToQuery(args) {
  return __async(this, null, function* () {
    const states = yield safe("status", () => fetchProviderStates(args).then((map) => ({ providers: map }))).then(
      (result) => result && result.providers || {}
    );
    const skipped = [];
    const wanted = PROVIDERS.filter((provider) => {
      const state = String(states && states[provider.id] || "");
      if (state === "disabled" || state === "unavailable") {
        skipped.push(`${provider.id}:${state}`);
        return false;
      }
      return true;
    });
    if (skipped.length)
      console.log(`[${LABEL}] skipping ${skipped.join(", ")}`);
    return wanted;
  });
}
function resolveStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const started = Date.now();
    const type = String(mediaType || "tv").toLowerCase() === "movie" ? "movie" : "show";
    const s = Number(season) || 1;
    const e = Number(episode) || 1;
    let id = parseTmdbId(tmdbId);
    if (!id && /^tt\d+$/i.test(String(tmdbId || "").trim())) {
      id = yield imdbToTmdb(tmdbId, type);
    }
    if (!id) {
      console.warn(`[${LABEL}] unsupported id "${tmdbId}" (FrameXTV needs a TMDB id)`);
      return [];
    }
    const args = { tmdbId: id, type, season: s, episode: e };
    console.log(`[${LABEL}] id ${id} (${type}${type === "show" ? ` S${s}E${e}` : ""})`);
    const candidates = [];
    const subtitles = [];
    const reports = /* @__PURE__ */ new Map();
    const probed = {};
    const seen = /* @__PURE__ */ new Set();
    let settled = 0;
    const absorb = (result) => {
      if (!result)
        return;
      const added = [];
      for (const source of result.sources || []) {
        if (seen.has(source.url))
          continue;
        seen.add(source.url);
        candidates.push(source);
        added.push(source);
      }
      for (const sub of result.subtitles || [])
        subtitles.push(sub);
      settled += 1;
      return added;
    };
    const probeBatch = (batch, budget, limit) => __async(this, null, function* () {
      if (!batch || !batch.length)
        return;
      const ordered = dedupe(batch).slice().sort((a, b) => b.height - a.height || (a.proxied ? 1 : 0) - (b.proxied ? 1 : 0) || a.rank - b.rank);
      const perProvider = /* @__PURE__ */ new Map();
      const best = [];
      for (const source of ordered) {
        const count = perProvider.get(source.providerId) || 0;
        if (count >= (limit ? 1 : 2))
          continue;
        perProvider.set(source.providerId, count + 1);
        best.push(source);
      }
      const capped = best.slice(0, limit || best.length);
      const verdicts = yield inspectTop(capped, budget, capped.length).catch(() => /* @__PURE__ */ new Map());
      for (const [url, report] of verdicts) {
        reports.set(url, report);
        const source = capped.find((item) => item.url === url);
        if (!source)
          continue;
        const current = probed[source.providerId];
        if (!current || !current.ok && report.ok)
          probed[source.providerId] = report;
      }
    });
    const firstWave = safe("auto", () => fetchProvider(args, null, 6e3)).then((result) => __async(this, null, function* () {
      const added = absorb(result);
      yield probeBatch(added, 2e3, 3);
      return result;
    }));
    const wanted = yield withTimeout(providersToQuery(args), 2500, PROVIDERS);
    const asked = new Set(wanted.map((provider) => provider.id));
    const pending = wanted.map((provider) => {
      const run = safe(provider.id, () => fetchProvider(args, provider.id, timeoutFor(provider.id))).then(
        (result) => {
          absorb(result);
          return result;
        }
      );
      return withTimeout(run, timeoutFor(provider.id) + 1500, null);
    });
    const byProvider = /* @__PURE__ */ new Map();
    wanted.forEach(
      (provider, index) => pending[index].then((result) => {
        if (result && result.sources && result.sources.length)
          byProvider.set(provider.id, result.sources);
      })
    );
    const remaining = Math.max(600, FANOUT_BUDGET_MS - (Date.now() - started));
    yield withTimeout(Promise.all(pending), remaining, null);
    const unmeasured = [];
    for (const list of byProvider.values()) {
      if (!list || !list.length)
        continue;
      if (probed[list[0].providerId])
        continue;
      unmeasured.push(list[0]);
    }
    if (unmeasured.length) {
      console.log(`[${LABEL}] measuring ${unmeasured.map((item) => item.providerId).join(", ")}`);
      yield probeBatch(unmeasured, 1500);
    }
    console.log(
      `[${LABEL}] ${settled} answer(s), ${candidates.length} candidate(s) at +${Date.now() - started}ms`
    );
    let extra = [];
    if (candidates.length) {
      const discovered = [];
      for (const candidate of candidates) {
        if (!candidate.providerId || asked.has(candidate.providerId))
          continue;
        asked.add(candidate.providerId);
        discovered.push(candidate.providerId);
      }
      if (discovered.length) {
        console.log(`[${LABEL}] auto pointed at ${discovered.join(", ")}, asking`);
        extra = discovered.map(
          (providerId) => withTimeout(
            safe(providerId, () => fetchProvider(args, providerId, 5e3)).then((result) => {
              absorb(result);
              return result;
            }),
            6500,
            null
          )
        );
        yield withTimeout(Promise.all(extra), 7e3, null);
      }
    }
    if (!candidates.length) {
      console.log(`[${LABEL}] no server returned a stream for ${type} ${id}`);
      return [];
    }
    console.log(`[${LABEL}] ranking ${candidates.length} candidate(s) at +${Date.now() - started}ms`);
    try {
      return yield buildStreams(candidates, subtitles, reports, LATE_PROBE_BUDGET_MS, probed);
    } catch (error) {
      console.error(
        `[${LABEL}] ranking failed (${error && error.message || error}), emitting raw candidates`
      );
      return rawStreams(candidates, subtitles);
    }
  });
}
function rawStreams(candidates, subtitles) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const candidate of candidates) {
    if (!candidate || !candidate.url || seen.has(candidate.url))
      continue;
    seen.add(candidate.url);
    const row = {
      name: `${LABEL} \xB7 ${candidate.cleanServer || candidate.server}`,
      title: `${candidate.cleanServer || candidate.server}${candidate.qualifier ? ` \xB7 ${candidate.qualifier}` : ""}`,
      quality: candidate.qualifier || "Auto",
      url: candidate.url,
      headers: Object.assign({}, candidate.headers || {})
    };
    if (subtitles && subtitles.length) {
      row.subtitles = subtitles.slice(0, 8).map((sub) => ({
        url: sub.url,
        language: sub.language,
        label: sub.label
      }));
    }
    out.push(row);
    if (out.length >= 12)
      break;
  }
  return out;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const started = Date.now();
    const type = String(mediaType || "tv").toLowerCase() === "movie" ? "movie" : "show";
    const s = Number(season) || 1;
    const e = Number(episode) || 1;
    const key = cacheKey(type, String(tmdbId), s, e);
    console.log(
      `[${LABEL}] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(mediaType)} season=${season} episode=${episode}`
    );
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < hit.ttl) {
      console.log(`[${LABEL}] cache hit ${key}`);
      return hit.value;
    }
    if (hit)
      cache.delete(key);
    let failed = false;
    const value = (() => __async(this, null, function* () {
      try {
        return yield resolveStreams(tmdbId, mediaType, season, episode);
      } catch (error) {
        failed = true;
        console.error(
          `[${LABEL}] error: ${error && error.message || error}`,
          error && error.stack ? error.stack : ""
        );
        return [];
      }
    }))();
    const entry = { ts: Date.now(), ttl: CACHE_TTL_MS, value };
    cache.set(key, entry);
    if (cache.size > CACHE_MAX) {
      const oldest = cache.keys().next();
      if (!oldest.done)
        cache.delete(oldest.value);
    }
    value.then((streams2) => {
      if (cache.get(key) !== entry)
        return;
      if (failed)
        entry.ttl = 0;
      else if (!streams2 || streams2.length === 0)
        entry.ttl = EMPTY_TTL_MS;
    });
    const streams = yield value;
    console.log(`[${LABEL}] ${streams.length} stream(s) in ${Date.now() - started}ms`);
    return streams;
  });
}
module.exports = { getStreams };
