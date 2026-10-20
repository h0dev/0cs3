/**
 * novahd - Built from src/novahd/
 * Generated: 2026-10-20T11:52:26.475Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

// src/novahd/http.js
var SITE = "https://novahd.cc";
var LABEL = "NovaHD";
var BROWSER_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36";
function uuid4() {
  let out = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += "-";
    } else if (i === 14) {
      out += "4";
    } else if (i === 19) {
      out += (Math.floor(Math.random() * 4) + 8 & 15).toString(16);
    } else {
      out += Math.floor(Math.random() * 16).toString(16);
    }
  }
  return out;
}
var visitor = uuid4();
function resetVisitor() {
  visitor = uuid4();
  return visitor;
}
function withTimeout(promise, ms, fallback) {
  if (typeof setTimeout !== "function")
    return promise;
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done)
        return;
      done = true;
      resolve(fallback);
    }, ms);
    const finish = (value) => {
      if (done)
        return;
      done = true;
      if (typeof clearTimeout === "function")
        clearTimeout(timer);
      resolve(value);
    };
    promise.then(finish, () => finish(fallback));
  });
}
var API_TIMEOUT_MS = 12e3;
function apiGet(path) {
  return __async(this, null, function* () {
    const url = /^https?:/i.test(path) ? path : SITE + path;
    const headers = {
      "User-Agent": BROWSER_UA,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "x-nova-visitor": visitor,
      Origin: SITE,
      Referer: SITE + "/",
      // The resolver returns the decoy stream for a fetch-metadata request it
      // cannot place: `sec-fetch-mode: cors|no-cors` WITHOUT `sec-fetch-site`
      // is treated as a script, and some runtimes add the former by default.
      // Sending the full same-origin XHR set keeps every HTTP stack honest.
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty"
    };
    let res;
    try {
      res = yield withTimeout(fetch(url, { method: "GET", headers }), API_TIMEOUT_MS, null);
    } catch (e) {
      return { ok: false, status: 0, json: null, error: e && e.message ? e.message : String(e) };
    }
    if (!res)
      return { ok: false, status: 0, json: null, error: "timeout" };
    if (!res.ok) {
      const out = { ok: false, status: res.status, json: null };
      if (res.status === 429) {
        out.rateLimited = true;
        try {
          const body = yield res.json();
          out.retryAfterSec = Number(body && body.retryAfterSec) || 60;
        } catch (e) {
          out.retryAfterSec = 60;
        }
      }
      return out;
    }
    let json = null;
    try {
      json = yield res.json();
    } catch (e) {
      return { ok: false, status: res.status, json: null, error: "bad json" };
    }
    return { ok: true, status: res.status, json };
  });
}
function absoluteUrl(url) {
  const s = String(url || "").trim();
  if (!s)
    return "";
  if (/^https?:/i.test(s))
    return s;
  return SITE + (s.charAt(0) === "/" ? s : "/" + s);
}
function imdbToTmdb(imdbId, mediaType) {
  return __async(this, null, function* () {
    const clean = String(imdbId || "").trim();
    if (!/^tt\d+$/i.test(clean))
      return null;
    const kind = String(mediaType || "movie").toLowerCase() === "tv" ? "series" : "movie";
    try {
      const res = yield fetch(`https://v3-cinemeta.strem.io/meta/${kind}/${clean}.json`, {
        method: "GET",
        headers: { "User-Agent": BROWSER_UA, Accept: "application/json" }
      });
      if (!res.ok) {
        console.log(`[${LABEL}] imdb->tmdb ${clean}: cinemeta HTTP ${res.status}`);
        return null;
      }
      const json = yield res.json();
      const tmdb = json && json.meta ? json.meta.moviedb_id : null;
      if (tmdb == null || String(tmdb) === "") {
        console.log(`[${LABEL}] imdb->tmdb ${clean}: no moviedb_id in cinemeta`);
        return null;
      }
      console.log(`[${LABEL}] imdb->tmdb ${clean} -> ${tmdb}`);
      return String(tmdb);
    } catch (e) {
      console.warn(`[${LABEL}] imdb->tmdb ${clean}: ${e && e.message ? e.message : e}`);
      return null;
    }
  });
}

// src/novahd/extractor.js
var PROVIDER_RANK = {
  Titan: 6,
  // direct CDN + multi-audio, HEVC 1080p masters
  Rive: 5,
  Heron: 4,
  Vidzee: 3,
  Vidlove: 2,
  Falcon: 0
  // the decoy provider; never real content
};
var UNKNOWN_HEIGHT = 720;
var CANDIDATES = 4;
var PLAYLIST_BYTES = 16384;
var INSPECT_TIMEOUT_MS = 2500;
var INSPECT_BUDGET_MS = 2600;
var INSPECT_GRACE_MS = 450;
var LANGUAGE_NAMES = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  it: "Italian",
  ru: "Russian",
  ar: "Arabic",
  bn: "Bengali",
  fa: "Persian",
  fil: "Filipino",
  hi: "Hindi",
  id: "Indonesian",
  ko: "Korean",
  ms: "Malay",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  ur: "Urdu",
  vi: "Vietnamese",
  zh: "Chinese"
};
function qualityHeight(quality) {
  const m = /^(\d{3,4})p$/i.exec(String(quality || "").trim());
  return m ? parseInt(m[1], 10) : 0;
}
function languageLabel(entry) {
  const code = String(entry && entry.lang || "").trim();
  const label = String(entry && entry.label || "").trim();
  const byCode = LANGUAGE_NAMES[code.toLowerCase()];
  if (byCode)
    return byCode;
  if (code && !/^[a-z]{2,3}(-[a-z]+)?$/i.test(code))
    return code;
  return label || code || "Undetermined";
}
function isDecoy(sources) {
  if (sources.length !== 1)
    return false;
  const only = sources[0] || {};
  return String(only.provider || "") === "Falcon" || /\/api\/hls\//.test(String(only.url || ""));
}
function cleanLanguage(raw) {
  let value = String(raw || "").trim();
  value = value.replace(
    /^(?:\d{3,4}\s*p|4k|uhd|hdr10?|hd|sd|hls|dash|hevc|avc|h\.?26[45])\b[\s,/·-]*/gi,
    ""
  );
  value = value.replace(/^[\s,/·-]+|[\s,/·-]+$/g, "");
  if (!value)
    return "";
  if (/^(?:hls|dash|hevc|hdr|mp4|ts|aac)$/i.test(value))
    return "";
  return value;
}
function normalizeSources(list) {
  return (Array.isArray(list) ? list : []).filter((s) => s && typeof s.url === "string" && /^https?:\/\//i.test(s.url)).map((s) => ({
    url: s.url,
    provider: String(s.provider || "Nova"),
    quality: String(s.quality || ""),
    language: cleanLanguage(s.language),
    name: String(s.name || ""),
    origAudio: !!s.origAudio,
    headers: s.headers && typeof s.headers === "object" ? s.headers : null
  }));
}
function normalizeSubtitles(list) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const sub of Array.isArray(list) ? list : []) {
    if (!sub || !sub.url)
      continue;
    const url = absoluteUrl(sub.url);
    if (!url || seen.has(url))
      continue;
    seen.add(url);
    const language = languageLabel(sub);
    out.push({
      url,
      language,
      name: String(sub.label || language),
      headers: { "User-Agent": BROWSER_UA }
    });
  }
  return out;
}
function fetchPlaylistHead(_0) {
  return __async(this, arguments, function* (url, bytes = PLAYLIST_BYTES) {
    const headers = { "User-Agent": BROWSER_UA, Accept: "*/*", Range: `bytes=0-${bytes - 1}` };
    let res;
    try {
      res = yield fetch(url, { method: "GET", headers });
    } catch (e) {
      return "";
    }
    if (!res.ok)
      return "";
    let text;
    try {
      text = yield res.text();
    } catch (e) {
      return "";
    }
    if (res.status === 206 || text.length >= bytes) {
      const cut = text.lastIndexOf("\n");
      if (cut > 0)
        text = text.slice(0, cut);
    }
    return text;
  });
}
function maxResolution(text) {
  let best = 0;
  const re = /RESOLUTION=\d+x(\d+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const h = parseInt(m[1], 10);
    if (h > best)
      best = h;
  }
  return best;
}
function resolveUrl(base, rel) {
  if (/^https?:\/\//i.test(rel))
    return rel;
  if (rel.charAt(0) === "/")
    return SITE + rel;
  return base.replace(/[^/]*$/, "") + rel;
}
function playlistUris(text) {
  return text.split("\n").map((l) => l.trim()).filter((l) => l && l.charAt(0) !== "#");
}
function variantUris(text) {
  const lines = text.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf("#EXT-X-STREAM-INF") !== 0)
      continue;
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j].trim();
      if (!l)
        continue;
      if (l.charAt(0) === "#")
        break;
      out.push(l);
      break;
    }
  }
  return out;
}
function segmentMagic(bytes) {
  if (!bytes || bytes.length === 0)
    return "";
  if (bytes[0] === 71)
    return "ts";
  const head = String.fromCharCode.apply(null, Array.prototype.slice.call(bytes, 0, 8));
  if (head.indexOf("ftyp") === 4 || head.indexOf("styp") === 4)
    return "mp4";
  if (head.indexOf("#EXTM3U") === 0)
    return "m3u8";
  if (head.indexOf("WEBVTT") === 0)
    return "vtt";
  return "";
}
function rangeFetch(url, headers, bytes) {
  const h = Object.assign({}, headers, { Range: "bytes=0-" + (bytes - 1) });
  return fetch(url, { method: "GET", headers: h });
}
function inspectSource(url) {
  return __async(this, null, function* () {
    const headers = { "User-Agent": BROWSER_UA, Accept: "*/*" };
    const work = (() => __async(this, null, function* () {
      const master = yield fetchPlaylistHead(url);
      if (master.indexOf("#EXTM3U") !== 0) {
        return { height: 0, ok: false, reason: "master not an m3u8" };
      }
      const height = maxResolution(master);
      const variants = variantUris(master);
      const playlists = variants.length ? variants.slice(0, 2).map((v) => resolveUrl(url, v)) : [null];
      let reason = "no segment";
      for (const playlistUrl of playlists) {
        if (playlistUrl && url.indexOf("?") > -1 && playlistUrl.indexOf("?") === -1) {
          reason = "variant without token";
          continue;
        }
        let base = url;
        let text = master;
        if (playlistUrl) {
          base = playlistUrl;
          text = yield fetchPlaylistHead(playlistUrl);
          if (text.indexOf("#EXTM3U") !== 0) {
            reason = "variant not an m3u8";
            continue;
          }
        }
        const seg = playlistUris(text)[0];
        if (!seg)
          continue;
        const segUrl = resolveUrl(base, seg);
        const res = yield rangeFetch(segUrl, headers, 1024);
        if (!res.ok) {
          reason = `segment http ${res.status}`;
          continue;
        }
        const magic = segmentMagic(new Uint8Array(yield res.arrayBuffer()));
        if (magic === "ts" || magic === "mp4" || magic === "m3u8") {
          return { height, ok: true };
        }
        reason = `segment body ${magic || "unknown"}`;
      }
      return { height, ok: false, reason };
    }))();
    return withTimeout(work, INSPECT_TIMEOUT_MS, {
      height: 0,
      ok: false,
      reason: "timeout"
    });
  });
}
function inspectRanked(urls, budgetMs) {
  return new Promise((resolve) => {
    const results = /* @__PURE__ */ new Map();
    let finished = false;
    let victory = false;
    let pending = urls.length;
    const done = () => {
      if (finished)
        return;
      finished = true;
      resolve(results);
    };
    const settleSoon = () => {
      if (victory)
        return;
      victory = true;
      if (typeof setTimeout === "function")
        setTimeout(done, INSPECT_GRACE_MS);
      else
        done();
    };
    if (urls.length === 0) {
      done();
      return;
    }
    urls.forEach((url) => {
      inspectSource(url).then((report) => {
        results.set(url, report);
        pending--;
        if (report.ok)
          settleSoon();
        if (pending === 0)
          done();
      });
    });
    if (typeof setTimeout === "function")
      setTimeout(done, budgetMs);
  });
}
function fetchSources(_0) {
  return __async(this, arguments, function* ({ type, tmdbId, season, episode }) {
    const base = `/api/sources?type=${encodeURIComponent(type)}&tmdbId=${encodeURIComponent(
      tmdbId
    )}`;
    const path = type === "show" ? `${base}&season=${Number(season) || 1}&episode=${Number(episode) || 1}` : base;
    const apiStarted = Date.now();
    let payload = yield apiGet(path);
    const apiMs = Date.now() - apiStarted;
    if (payload.ok && payload.json && isDecoy(payload.json.sources || [])) {
      console.log("[NovaHD] decoy answer (visitor not accepted) - retrying with a fresh visitor");
      resetVisitor();
      payload = yield apiGet(path);
    }
    if (!payload.ok) {
      if (payload.rateLimited) {
        console.warn(
          `[NovaHD] rate limited (retry in ~${payload.retryAfterSec || 60}s) - no sources this round`
        );
      } else {
        console.warn(`[NovaHD] ${path} failed: status=${payload.status} ${payload.error || ""}`);
      }
      return { sources: [], subtitles: [], failed: true };
    }
    const json = payload.json || {};
    const sources = normalizeSources(json.sources);
    console.log(
      `[NovaHD] /api/sources ${apiMs}ms -> ${sources.length} source(s), ${(json.subtitles || []).length} sub(s)`
    );
    let subtitles = normalizeSubtitles(json.subtitles);
    if (isDecoy(sources)) {
      console.warn("[NovaHD] resolver kept answering with the decoy stream - giving up");
      return { sources: [], subtitles };
    }
    if (sources.length === 0) {
      console.log("[NovaHD] API returned no source for this title/episode");
      return { sources, subtitles };
    }
    if (subtitles.length === 0 && json.subtitlesPending) {
      const statusPath = type === "show" ? `/api/subs-status?type=show&tmdbId=${encodeURIComponent(tmdbId)}&season=${Number(season) || 1}&episode=${Number(episode) || 1}` : `/api/subs-status?type=movie&tmdbId=${encodeURIComponent(tmdbId)}`;
      const extra = yield apiGet(statusPath);
      if (extra.ok && extra.json && Array.isArray(extra.json.subtitles)) {
        subtitles = normalizeSubtitles(extra.json.subtitles);
      }
    }
    return { sources, subtitles };
  });
}
function groupKey(s) {
  return [s.provider, s.quality, s.language, s.origAudio ? "o" : "d"].join("|");
}
function dedupe(sources, perGroup = 2) {
  const counts = /* @__PURE__ */ new Map();
  const out = [];
  for (const s of sources) {
    const key = groupKey(s);
    const n = counts.get(key) || 0;
    if (n >= perGroup)
      continue;
    counts.set(key, n + 1);
    out.push(s);
  }
  return out;
}
function streamTitle(source, height) {
  const label = height >= 360 ? `${height}p` : "auto";
  const lang = source.language || (source.origAudio ? "Original audio" : "Unknown audio");
  return `${label} \xB7 ${lang}`;
}
function streamQuality(source, height) {
  return height >= 360 ? `${height}p` : "auto";
}
function buildStreams(sources, subtitles, max = 12) {
  return __async(this, null, function* () {
    const started = Date.now();
    const unique = dedupe(sources);
    if (unique.length === 0)
      return [];
    const rankOf = (s) => Object.prototype.hasOwnProperty.call(PROVIDER_RANK, s.provider) ? PROVIDER_RANK[s.provider] : 1;
    const nominal = unique.map((s) => ({ source: s, height: qualityHeight(s.quality) })).map((e) => __spreadProps(__spreadValues({}, e), {
      score: (e.source.origAudio ? 1e3 : 0) + (e.height || UNKNOWN_HEIGHT) * 10 + Math.min(rankOf(e.source), 9)
    })).sort((a, b) => b.score - a.score);
    const nominees = nominal.slice(0, CANDIDATES);
    const seen = yield inspectRanked(
      nominees.map((entry) => entry.source.url),
      INSPECT_BUDGET_MS
    );
    const unverified = [];
    const merged = nominal.map((entry) => {
      const report = seen.get(entry.source.url);
      const state = !report ? "unknown" : report.ok ? "live" : "dead";
      if (state === "dead") {
        unverified.push(`${entry.source.provider}/${entry.source.quality} (${report.reason})`);
      }
      return {
        source: entry.source,
        height: report && report.height ? report.height : entry.height,
        state
      };
    });
    const scored = merged.map((e) => __spreadProps(__spreadValues({}, e), {
      score: (e.source.origAudio ? 4e3 : 0) + (e.state === "live" ? 1e3 : e.state === "dead" ? -1e3 : 0) + (e.height || UNKNOWN_HEIGHT) * 10 + Math.min(rankOf(e.source), 9)
    })).sort((a, b) => b.score - a.score);
    if (unverified.length)
      console.log(`[NovaHD] unverified: ${unverified.join(", ")}`);
    const emitted = /* @__PURE__ */ new Set();
    const streams = [];
    for (const entry of scored) {
      if (streams.length >= max)
        break;
      const { source, height } = entry;
      const key = groupKey(source);
      if (emitted.has(key))
        continue;
      emitted.add(key);
      const stream = {
        name: `${LABEL} \xB7 ${source.provider}`,
        title: streamTitle(source, height),
        quality: streamQuality(source, height),
        url: source.url,
        headers: Object.assign({ "User-Agent": BROWSER_UA }, source.headers || {})
      };
      if (subtitles.length)
        stream.subtitles = subtitles;
      streams.push(stream);
    }
    console.log(
      `[NovaHD] ${streams.length} stream(s) from ${sources.length} source(s)` + (subtitles.length ? `, ${subtitles.length} subtitle track(s)` : "") + ` \u2014 ${Date.now() - started}ms`
    );
    for (const st of streams) {
      console.log(`[NovaHD]   ${st.name} | ${st.title} | ${st.url.slice(0, 80)}`);
    }
    return streams;
  });
}

// src/novahd/index.js
var CACHE_TTL_MS = 10 * 60 * 1e3;
var EMPTY_TTL_MS = 60 * 1e3;
var CACHE_MAX = 48;
var cache = /* @__PURE__ */ new Map();
function cacheKey(type, id, season, episode) {
  return type === "show" ? `${type}:${id}:${season}:${episode}` : `${type}:${id}`;
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
function resolveStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const type = String(mediaType || "tv").toLowerCase() === "movie" ? "movie" : "show";
    let id = parseTmdbId(tmdbId);
    if (!id && /^tt\d+$/i.test(String(tmdbId || "").trim())) {
      id = yield imdbToTmdb(tmdbId, mediaType);
    }
    if (!id) {
      console.warn(`[${LABEL}] unsupported id "${tmdbId}" (NOVA needs a TMDB id)`);
      return [];
    }
    const s = Number(season) || 1;
    const e = Number(episode) || 1;
    const key = cacheKey(type, id, s, e);
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
        const payload = yield fetchSources({ type, tmdbId: id, season: s, episode: e });
        if (!payload || payload.failed) {
          failed = true;
          return [];
        }
        if (payload.sources.length === 0) {
          console.log(`[${LABEL}] nothing playable for ${type} ${id}`);
          return [];
        }
        return yield buildStreams(payload.sources, payload.subtitles);
      } catch (error) {
        failed = true;
        console.error(
          `[${LABEL}] error: ${error && error.message ? error.message : error}`,
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
    value.then((streams) => {
      if (cache.get(key) !== entry)
        return;
      if (failed)
        entry.ttl = 0;
      else if (!streams || streams.length === 0)
        entry.ttl = EMPTY_TTL_MS;
    });
    return value;
  });
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const started = Date.now();
    console.log(
      `[${LABEL}] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(
        mediaType
      )} season=${season} episode=${episode}`
    );
    const streams = yield resolveStreams(tmdbId, mediaType, season, episode);
    console.log(
      `[${LABEL}] ${streams.length} stream(s) for ${JSON.stringify(tmdbId)} in ${Date.now() - started}ms`
    );
    return streams;
  });
}
module.exports = { getStreams };
