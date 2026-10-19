/**
 * novahd - Built from src/novahd/
 * Generated: 2026-10-19T13:08:11.812Z
 */
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
      res = yield fetch(url, { method: "GET", headers });
    } catch (e) {
      return { ok: false, status: 0, json: null, error: e && e.message ? e.message : String(e) };
    }
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
var MAX_PROBES = 4;
var MAX_VERIFY = 6;
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
function normalizeSources(list) {
  return (Array.isArray(list) ? list : []).filter((s) => s && typeof s.url === "string" && /^https?:\/\//i.test(s.url)).map((s) => ({
    url: s.url,
    provider: String(s.provider || "Nova"),
    quality: String(s.quality || ""),
    language: String(s.language || ""),
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
function fetchPlaylistHead(url, bytes = 65536) {
  return __async(this, null, function* () {
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
function probeHeight(url) {
  return __async(this, null, function* () {
    const text = yield fetchPlaylistHead(url);
    if (!text || text.indexOf("#EXTM3U") < 0)
      return 0;
    let best = 0;
    const re = /RESOLUTION=\d+x(\d+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const h = parseInt(m[1], 10);
      if (h > best)
        best = h;
    }
    return best;
  });
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
function verifySource(url) {
  return __async(this, null, function* () {
    const headers = { "User-Agent": BROWSER_UA, Accept: "*/*" };
    let reason = "unknown";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = yield fetchPlaylistHead(url);
        if (text.indexOf("#EXTM3U") !== 0) {
          reason = "master not an m3u8";
          continue;
        }
        const variants = variantUris(text);
        const playlistUrls = variants.length ? variants.slice(0, 2).map((v) => resolveUrl(url, v)) : [null];
        let passed = false;
        for (const playlistUrl of playlistUrls) {
          let base = url;
          let playlistText = text;
          if (playlistUrl) {
            base = playlistUrl;
            playlistText = yield fetchPlaylistHead(playlistUrl);
            if (playlistText.indexOf("#EXTM3U") !== 0) {
              reason = "variant not an m3u8";
              continue;
            }
          }
          const seg = playlistUris(playlistText)[0];
          if (!seg) {
            reason = "no segment";
            continue;
          }
          const segUrl = resolveUrl(base, seg);
          const sres = yield rangeFetch(segUrl, headers, 1024);
          if (!sres.ok) {
            reason = `segment http ${sres.status}`;
            continue;
          }
          const magic = segmentMagic(new Uint8Array(yield sres.arrayBuffer()));
          if (magic === "ts" || magic === "mp4" || magic === "m3u8") {
            passed = true;
            break;
          }
          reason = `segment body ${magic || "unknown"}`;
        }
        if (passed)
          return "";
      } catch (e) {
        reason = e && e.message ? e.message : "error";
      }
    }
    return reason;
  });
}
function fetchSources(_0) {
  return __async(this, arguments, function* ({ type, tmdbId, season, episode }) {
    const base = `/api/sources?type=${encodeURIComponent(type)}&tmdbId=${encodeURIComponent(
      tmdbId
    )}`;
    const path = type === "show" ? `${base}&season=${Number(season) || 1}&episode=${Number(episode) || 1}` : base;
    let payload = yield apiGet(path);
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
      return null;
    }
    const json = payload.json || {};
    const sources = normalizeSources(json.sources);
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
    const unique = dedupe(sources);
    if (unique.length === 0)
      return [];
    const heights = /* @__PURE__ */ new Map();
    for (const s of unique) {
      heights.set(s.url, qualityHeight(s.quality));
    }
    const unknown = unique.filter((s) => heights.get(s.url) === 0).slice(0, MAX_PROBES);
    if (unknown.length) {
      const probed = yield Promise.all(unknown.map((s) => probeHeight(s.url)));
      unknown.forEach((s, i) => {
        if (probed[i] > 0)
          heights.set(s.url, probed[i]);
      });
      const resolved = unknown.map((s, i) => probed[i] > 0 ? `${s.name}=${probed[i]}p` : null).filter(Boolean);
      if (resolved.length)
        console.log(`[NovaHD] probed auto masters: ${resolved.join(", ")}`);
    }
    const scored = unique.map((s) => {
      const real = heights.get(s.url) || 0;
      const rank = Object.prototype.hasOwnProperty.call(PROVIDER_RANK, s.provider) ? PROVIDER_RANK[s.provider] : 1;
      const score = (s.origAudio ? 1e3 : 0) + (real || UNKNOWN_HEIGHT) * 10 + Math.min(rank, 9);
      return { source: s, height: real, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const checked = scored.slice(0, MAX_VERIFY);
    const reports = yield Promise.all(checked.map((entry) => verifySource(entry.source.url)));
    const alive = [];
    const dead = [];
    checked.forEach((entry, i) => (reports[i] === "" ? alive : dead).push(entry));
    if (dead.length) {
      const detail = dead.map((d, i) => {
        const idx = checked.indexOf(d);
        return `${d.source.provider}/${d.source.quality} (${reports[idx]})`;
      });
      console.log(`[NovaHD] unverified: ${detail.join(", ")}`);
    }
    const ordered = alive.length >= 3 ? alive.concat(scored.slice(MAX_VERIFY)) : alive.concat(dead, scored.slice(MAX_VERIFY));
    const emitted = /* @__PURE__ */ new Set();
    const streams = [];
    for (const entry of ordered) {
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
      `[NovaHD] ${streams.length} stream(s) from ${sources.length} source(s)` + (subtitles.length ? `, ${subtitles.length} subtitle track(s)` : "")
    );
    for (const st of streams) {
      console.log(`[NovaHD]   ${st.name} | ${st.title} | ${st.url.slice(0, 80)}`);
    }
    return streams;
  });
}

// src/novahd/index.js
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
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(
      `[${LABEL}] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(
        mediaType
      )} season=${season} episode=${episode}`
    );
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
    try {
      const payload = yield fetchSources({ type, tmdbId: id, season: s, episode: e });
      if (!payload || payload.sources.length === 0) {
        console.log(`[${LABEL}] nothing playable for ${type} ${id}`);
        return [];
      }
      return yield buildStreams(payload.sources, payload.subtitles);
    } catch (error) {
      console.error(
        `[${LABEL}] error: ${error && error.message ? error.message : error}`,
        error && error.stack ? error.stack : ""
      );
      return [];
    }
  });
}
module.exports = { getStreams };
