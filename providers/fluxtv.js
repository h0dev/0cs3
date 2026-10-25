/**
 * fluxtv - Built from src/fluxtv/
 * Generated: 2026-10-25T05:22:16.560Z
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

// src/fluxtv/index.js
var fluxtv_exports = {};
__export(fluxtv_exports, {
  buildStreams: () => buildStreams,
  getStreams: () => getStreams
});
module.exports = __toCommonJS(fluxtv_exports);

// src/fluxtv/http.js
var LABEL = "FluxTV";
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36";
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
    const { method = "GET", headers, body, timeout = 15e3, redirect = "follow" } = options;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const init = {
      method,
      redirect,
      headers: Object.assign({ "User-Agent": BROWSER_UA }, headers || {})
    };
    if (body !== void 0)
      init.body = body;
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
    const guarded = withTimeout(run(), timeout, null);
    const result = yield guarded;
    if (controller) {
      if (!result)
        controller.abort();
    }
    return result;
  });
}
function getJSON(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const res = yield request(url, options);
    return res ? res.json : null;
  });
}
function postJSON(url, payload, options = {}) {
  return request(
    url,
    Object.assign({}, options, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, options.headers || {}),
      body: typeof payload === "string" ? payload : JSON.stringify(payload)
    })
  );
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
var metaCache = /* @__PURE__ */ new Map();
function imdbToTmdb(imdbId, mediaType) {
  return __async(this, null, function* () {
    const imdb = String(imdbId || "").trim();
    if (!/^tt\d+$/i.test(imdb))
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
function tmdbMeta(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = String(mediaType || "").toLowerCase() === "movie" ? "movie" : "tv";
    const key = `${type}:${tmdbId}`;
    if (metaCache.has(key))
      return metaCache.get(key);
    const promise = (() => __async(this, null, function* () {
      const data = yield getJSON(`${TMDB_BASE}/${type}/${tmdbId}?api_key=${TMDB_KEY}`, {
        timeout: 12e3
      });
      if (!data || data.success === false)
        return null;
      const title = type === "movie" ? data.title || data.original_title : data.name || data.original_name;
      if (!title)
        return null;
      const date = type === "movie" ? data.release_date : data.first_air_date;
      return {
        title: String(title),
        originalTitle: String(
          (type === "movie" ? data.original_title : data.original_name) || title
        ),
        year: date ? String(date).slice(0, 4) : "",
        language: String(data.original_language || "")
      };
    }))();
    metaCache.set(key, promise);
    const value = yield promise;
    if (!value)
      metaCache.delete(key);
    return value;
  });
}
function qualityHeight(quality) {
  const raw = String(quality || "");
  if (/^\s*(4k|uhd)\b/i.test(raw))
    return 2160;
  const m = /(\d{3,4})\s*p/i.exec(raw);
  if (m)
    return parseInt(m[1], 10);
  return 0;
}
function cleanLanguage(value) {
  const raw = String(value == null ? "" : value).trim();
  if (!raw)
    return "";
  if (/^(\d{3,4}p|4k|uhd|hdr|hls|dash|hd|sd|sdr|dolby( vision)?)$/i.test(raw))
    return "";
  const cleaned = raw.replace(/\b\d{3,4}p\b/gi, "").replace(/\b(4k|uhd|hdr|hls|dash)\b/gi, "").replace(/\s*[|·—-]\s*$/g, "").replace(/\s{2,}/g, " ").trim();
  return cleaned;
}

// src/fluxtv/bingr.js
var API = "https://api.bingr.one/api/stream";
var ORIGIN = "https://bingr.one";
var HEADERS = {
  "Content-Type": "application/json",
  Origin: ORIGIN,
  Referer: `${ORIGIN}/`,
  "User-Agent": BROWSER_UA
};
var BINGR_DEADLINE_MS = 2e3;
var SERVERS = [
  { id: "s70", name: "Polaris", rank: 5 },
  { id: "s62", name: "Bastion", rank: 4 },
  { id: "s61", name: "Corvus", rank: 3 },
  { id: "s6", name: "Nebula", rank: 3 }
  // s12/s13/s16 (Quasar/Ariane/Cruzeiro) are the hakunaymatata triple: they
  // answer in ~2 s on a desktop but every request from a phone times out, and
  // their edges were dead in every probe. They only ate the deadline, so they
  // are out until that CDN gets healthy again.
];
function queryFor(meta, type, season, episode) {
  const query = {};
  if (meta && meta.title)
    query.title = meta.title;
  if (meta && meta.year)
    query.year = meta.year;
  if (type === "tv") {
    query.season = Number(season) || 1;
    query.episode = Number(episode) || 1;
  }
  return query;
}
function normalizeSource(source, server, scraperName) {
  if (!source || typeof source.url !== "string" || !source.url)
    return null;
  const quality = String(source.quality || source.label || "");
  const language = cleanLanguage(source.language);
  return {
    source: "Bingr",
    sourceRank: server.rank,
    server: scraperName || server.name,
    description: "",
    quality,
    height: qualityHeight(quality),
    url: source.url,
    headers: Object.assign({ "User-Agent": BROWSER_UA }, source.headers || {}),
    isMp4: Boolean(source.isMP4),
    language,
    subtitles: [],
    extra: language
  };
}
function askServer(server, tmdbId, type, season, episode, meta) {
  return __async(this, null, function* () {
    const payload = {
      srv: server.id,
      t: type,
      id: String(tmdbId),
      query: queryFor(meta, type, season, episode)
    };
    const res = yield postJSON(API, payload, { headers: HEADERS, timeout: 9e3 });
    if (!res || !res.ok || !res.json) {
      throw new Error(`HTTP ${res ? res.status : "n/a"}`);
    }
    const data = res.json;
    const sources = (data.sources || []).map((s) => normalizeSource(s, server, data.scraperName)).filter(Boolean);
    return {
      name: data.scraperName || server.name,
      sources,
      subtitles: Array.isArray(data.subtitles) ? data.subtitles : []
    };
  });
}
function settleWithin(tasks, deadlineMs) {
  return __async(this, null, function* () {
    const deadline2 = new Promise((resolve) => setTimeout(resolve, deadlineMs));
    yield Promise.race([Promise.all(tasks), deadline2]);
  });
}
function resolveStreams(_0) {
  return __async(this, arguments, function* ({ tmdbId, type, season, episode, meta: metaInput, sink }) {
    const started = Date.now();
    const metaStarted = Date.now();
    const meta = metaInput && typeof metaInput.then === "function" ? yield withTimeout(metaInput, 2500, null) : metaInput;
    const metaMs = Date.now() - metaStarted;
    const results = new Array(SERVERS.length).fill(null);
    const tasks = SERVERS.map(
      (server, index) => withTimeout(askServer(server, tmdbId, type, season, episode, meta), 6e3, null).then((value) => {
        results[index] = value;
      }).catch((error) => {
        console.log(`[FluxTV] bingr ${server.id}: ${error.message}`);
      })
    );
    yield settleWithin(tasks, BINGR_DEADLINE_MS);
    const streams = [];
    const subtitleMap = /* @__PURE__ */ new Map();
    let answered = 0;
    for (const result of results) {
      if (!result)
        continue;
      answered++;
      streams.push(...result.sources);
      for (const sub of result.subtitles) {
        if (!sub || !sub.url || subtitleMap.has(sub.url))
          continue;
        subtitleMap.set(sub.url, sub);
      }
    }
    const subtitles = [...subtitleMap.values()].map((sub) => ({
      url: sub.url,
      language: String(sub.lang || sub.label || ""),
      label: String(sub.label || sub.lang || ""),
      headers: { "User-Agent": BROWSER_UA }
    }));
    console.log(
      `[FluxTV] bingr: ${streams.length} source(s) from ${answered}/${SERVERS.length} scraper(s), ${subtitles.length} subtitle(s) in ${Date.now() - started}ms (meta ${metaMs}ms)`
    );
    for (const stream of streams)
      stream.subtitles = subtitles;
    return streams;
  });
}

// src/fluxtv/cinesrc.js
var SITE = "https://cinesrc.st";
var ENCDEC = "https://enc-dec.app/api";
var buildTag = "20261014-a";
var STREAM_HEADERS = {
  Referer: `${SITE}/`,
  Origin: SITE,
  "User-Agent": BROWSER_UA
};
var SHA_K = [
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
];
var SHA_H0 = [
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
];
function shaRotr(x, n) {
  return x >>> n | x << 32 - n;
}
var shaW = new Int32Array(64);
var shaH = new Int32Array(8);
function sha256(input) {
  const bytes = typeof input === "string" ? asciiBytes(input) : input;
  const len = bytes.length;
  const total = 64 * Math.ceil((len + 9) / 64);
  const padded = new Uint8Array(total);
  padded.set(bytes);
  padded[len] = 128;
  const bitLenHi = Math.floor(len / 536870912);
  const bitLenLo = len * 8 >>> 0;
  padded[total - 8] = bitLenHi >>> 24 & 255;
  padded[total - 7] = bitLenHi >>> 16 & 255;
  padded[total - 6] = bitLenHi >>> 8 & 255;
  padded[total - 5] = bitLenHi & 255;
  padded[total - 4] = bitLenLo >>> 24 & 255;
  padded[total - 3] = bitLenLo >>> 16 & 255;
  padded[total - 2] = bitLenLo >>> 8 & 255;
  padded[total - 1] = bitLenLo & 255;
  for (let i = 0; i < 8; i++)
    shaH[i] = SHA_H0[i] | 0;
  for (let block = 0; block < total; block += 64) {
    for (let t = 0; t < 16; t++) {
      const o = block + t * 4;
      shaW[t] = padded[o] << 24 | padded[o + 1] << 16 | padded[o + 2] << 8 | padded[o + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = shaRotr(shaW[t - 15], 7) ^ shaRotr(shaW[t - 15], 18) ^ shaW[t - 15] >>> 3;
      const s1 = shaRotr(shaW[t - 2], 17) ^ shaRotr(shaW[t - 2], 19) ^ shaW[t - 2] >>> 10;
      shaW[t] = shaW[t - 16] + s0 + shaW[t - 7] + s1 | 0;
    }
    let a = shaH[0], b = shaH[1], c = shaH[2], d = shaH[3];
    let e = shaH[4], f = shaH[5], g = shaH[6], h = shaH[7];
    for (let t = 0; t < 64; t++) {
      const S1 = shaRotr(e, 6) ^ shaRotr(e, 11) ^ shaRotr(e, 25);
      const ch = e & f ^ ~e & g;
      const t1 = h + S1 + ch + SHA_K[t] + shaW[t] | 0;
      const S0 = shaRotr(a, 2) ^ shaRotr(a, 13) ^ shaRotr(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj | 0;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    shaH[0] = shaH[0] + a | 0;
    shaH[1] = shaH[1] + b | 0;
    shaH[2] = shaH[2] + c | 0;
    shaH[3] = shaH[3] + d | 0;
    shaH[4] = shaH[4] + e | 0;
    shaH[5] = shaH[5] + f | 0;
    shaH[6] = shaH[6] + g | 0;
    shaH[7] = shaH[7] + h | 0;
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = shaH[i] >>> 24 & 255;
    out[i * 4 + 1] = shaH[i] >>> 16 & 255;
    out[i * 4 + 2] = shaH[i] >>> 8 & 255;
    out[i * 4 + 3] = shaH[i] & 255;
  }
  return out;
}
function asciiBytes(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++)
    out[i] = text.charCodeAt(i) & 255;
  return out;
}
function hexOf(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] >>> 4).toString(16) + (bytes[i] & 15).toString(16);
  }
  return out;
}
var CK = [
  1187432225,
  1110491921,
  404896285,
  1446550439,
  3567808771,
  130784815,
  1929928605,
  3526978079,
  598629085,
  1179042959,
  256772355,
  2156879665,
  2503822855,
  2116259839,
  1665504735,
  3411952385
];
var PERMUTATIONS = [
  [3, 5, 1, 0, 2, 4],
  [2, 0, 4, 5, 3, 1],
  [1, 4, 5, 3, 0, 2],
  [2, 0, 1, 5, 4, 3],
  [4, 2, 1, 0, 3, 5],
  [5, 0, 2, 1, 3, 4],
  [4, 5, 1, 0, 3, 2],
  [4, 0, 3, 5, 1, 2]
];
var SCHEDULES = [
  [0, 7, 6, 3, 2, 1, 5, 4, 0, 2, 4, 6, 5, 1, 7, 3],
  [5, 2, 1, 3, 0, 4, 6, 7, 4, 1, 0, 7, 3, 6, 5, 2],
  [4, 0, 2, 1, 5, 7, 6, 3, 2, 6, 0, 7, 4, 3, 5, 1],
  [5, 4, 7, 0, 2, 3, 1, 6, 5, 1, 4, 0, 7, 2, 3, 6],
  [4, 7, 0, 2, 1, 6, 5, 3, 6, 1, 3, 2, 0, 7, 4, 5],
  [0, 7, 2, 6, 3, 4, 5, 1, 6, 5, 0, 2, 7, 1, 4, 3],
  [0, 4, 5, 3, 1, 7, 2, 6, 3, 7, 5, 6, 1, 0, 2, 4],
  [7, 6, 0, 4, 2, 5, 1, 3, 7, 5, 3, 4, 2, 6, 0, 1]
];
var PROFILES = [[12, 15], [16, 17]];
function u32(x) {
  return x >>> 0;
}
function rotl(x, n) {
  const shift = n & 31;
  x = x >>> 0;
  return shift === 0 ? x : (x << shift | x >>> 32 - shift) >>> 0;
}
function imul(a, b) {
  return Math.imul(a, b) >>> 0;
}
function b64urlDecode(text) {
  const normalised = String(text).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised + "=".repeat((4 - normalised.length % 4) % 4);
  const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const out = [];
  let bits = 0;
  let value = 0;
  for (let i = 0; i < padded.length; i++) {
    const ch = padded[i];
    if (ch === "=")
      break;
    const index = table.indexOf(ch);
    if (index < 0)
      continue;
    value = value << 6 | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push(value >>> bits & 255);
    }
  }
  return new Uint8Array(out);
}
function parseChallenge(blob) {
  const c = b64urlDecode(blob);
  if (c.length !== 32)
    throw new Error("invalid CSP4 challenge length");
  if (c[16] !== 125 || c[17] !== 189 || c[18] !== 210 || c[19] !== 67 || c[20] !== 4) {
    throw new Error("invalid CSP4 challenge header");
  }
  if (c[28] !== 67 || c[29] !== 83 || c[30] !== 80 || c[31] !== 52) {
    throw new Error("invalid CSP4 marker");
  }
  const mode = c[21];
  const difficulty = c[22];
  const variant = c[23];
  const rounds = c[24];
  const maskBits = c[25];
  const saltIndex = c[26];
  const permIndex = c[27];
  if (difficulty < 1 || difficulty > 30)
    throw new Error("invalid CSP4 difficulty");
  if (variant > 7 || saltIndex > 7 || permIndex > 7)
    throw new Error("invalid CSP4 selector");
  const profile = PROFILES[mode];
  if (!profile || profile[0] !== rounds || profile[1] !== maskBits) {
    throw new Error("invalid CSP4 profile");
  }
  const w = new Uint32Array(4);
  for (let i = 0; i < 4; i++) {
    w[i] = (c[i * 4] | c[i * 4 + 1] << 8 | c[i * 4 + 2] << 16 | c[i * 4 + 3] << 24) >>> 0;
  }
  return { c, w, mode, difficulty, variant, rounds, maskBits, saltIndex, permIndex };
}
function buildTable(w, variant, saltIndex, maskBits) {
  const size = 1 << maskBits;
  const s = new Uint32Array(size);
  let x = u32(w[variant & 3] ^ CK[saltIndex] ^ imul(CK[8 + saltIndex], variant + 1));
  let y = u32(w[variant + 1 & 3] ^ CK[15 - saltIndex]);
  for (let i = 0; i < size; i++) {
    x = u32(w[i + saltIndex & 3] + x + imul(CK[i + variant & 15], i + 1));
    x = u32(x ^ x << 13);
    x = u32(x ^ x >>> 17);
    x = u32(x ^ x << 5);
    y = rotl(u32(imul(CK[i + 9 & 15], i + 3) ^ y ^ x), i + variant + saltIndex);
    s[i] = u32(imul(CK[i + 5 & 15], i ^ variant) ^ rotl(w[i + variant & 3], i + saltIndex) ^ x ^ y);
  }
  return s;
}
function mixStage(w, s, ch, n) {
  const { variant, rounds, maskBits, saltIndex, permIndex } = ch;
  const mask = (1 << maskBits) - 1;
  const lo = n >>> 0;
  const hi = Math.floor(n / 4294967296) >>> 0;
  let a = u32(w[0] ^ CK[variant] ^ lo);
  let b = u32(rotl(lo, variant + 7) ^ w[2]);
  let c = u32(w[1] ^ CK[8 + saltIndex] ^ hi);
  let d = u32(rotl(lo ^ hi, saltIndex + 11) ^ w[3]);
  let e = u32(CK[saltIndex + variant] ^ lo ^ hi);
  let f = u32(CK[15 - variant] ^ w[saltIndex & 3]);
  const sch = SCHEDULES[saltIndex];
  for (let r = 0; r < rounds; r++) {
    const i1 = u32(rotl(b, r + 1) ^ imul(CK[r & 15], f) ^ e ^ a) & mask;
    const v1 = s[i1];
    const i2 = u32(rotl(e, variant + r + 3) ^ imul(CK[r + 7 & 15], d) ^ c ^ v1) & mask;
    const op = sch[r];
    if (op === 0) {
      a = rotl(u32(a + d + v1), 5);
      c = u32(imul(c ^ f ^ a, 1187432225) + b);
    } else if (op === 1) {
      b = rotl(c ^ e ^ b ^ v1, 11);
      d = u32(imul(b ^ a, 1110491921) + d);
    } else if (op === 2) {
      c = rotl(u32(c + b + v1), 17);
      a = u32(imul(d ^ f ^ c, 404896285) ^ a);
    } else if (op === 3) {
      d = rotl(a ^ d ^ v1, 23);
      b = u32(imul(c ^ e ^ d, 1446550439) + b);
    } else if (op === 4) {
      a = u32(imul(a ^ e ^ v1, -727158525) + rotl(b, 7));
      d = u32(rotl(u32(c + f + a), 13) ^ d);
    } else if (op === 5) {
      c = u32(imul(u32(c + f + v1), 130784815) ^ rotl(d, 9));
      b = u32(rotl(a ^ e ^ c, 19) + b);
    } else if (op === 6) {
      b = u32(imul(b ^ f ^ v1, 1929928605) + rotl(a, 3));
      c = u32(rotl(u32(d + e + b), 15) ^ c);
    } else {
      d = u32(imul(u32(d + e + v1), -767989217) ^ rotl(c, 21));
      a = u32(rotl(b ^ f ^ d, 27) + a);
    }
    const v2 = s[i2];
    if (((f ^ r ^ v1) & 1) === 0) {
      f = rotl(u32(v2 + f + a), r + 5);
      e = u32(imul(CK[8 + op], v2 ^ e ^ f) + d);
    } else {
      e = rotl(v2 ^ e ^ b, r + 9);
      f = u32(imul(CK[op + 11 & 15], u32(v2 + f + e)) ^ c);
    }
  }
  const v = [a, c, b, d, f, e];
  const perm = PERMUTATIONS[permIndex];
  return [v[perm[0]], v[perm[1]], v[perm[2]], v[perm[3]], v[perm[4]], v[perm[5]]];
}
function leadingZeroOk(digest, bits) {
  const wholeBytes = Math.floor(bits / 8);
  const rest = bits % 8;
  for (let i = 0; i < wholeBytes; i++) {
    if (digest[i] !== 0)
      return false;
  }
  if (rest === 0)
    return true;
  return digest[wholeBytes] >> 8 - rest === 0;
}
function solveStage1(challenge, seedHex, budgetMs = 25e3) {
  const ch = parseChallenge(challenge.w);
  const s = buildTable(ch.w, ch.variant, ch.saltIndex, ch.maskBits);
  const seed = hexToBytes(seedHex);
  const msg = new Uint8Array(88);
  msg.set(ch.c.subarray(0, 16), 24);
  const cfg = ch.maskBits ^ 27433;
  msg[48] = 4;
  msg[49] = ch.mode;
  msg[50] = ch.variant;
  msg[51] = ch.saltIndex;
  msg[52] = ch.permIndex;
  msg[53] = ch.rounds;
  msg[54] = cfg & 255;
  msg[55] = cfg >>> 8 & 255;
  msg.set(seed, 56);
  const started = Date.now();
  for (let n = 0; ; n++) {
    const m = mixStage(ch.w, s, ch, n);
    for (let i = 0; i < 6; i++) {
      const word = m[i] >>> 0;
      msg[i * 4] = word & 255;
      msg[i * 4 + 1] = word >>> 8 & 255;
      msg[i * 4 + 2] = word >>> 16 & 255;
      msg[i * 4 + 3] = word >>> 24 & 255;
    }
    const lo = n >>> 0;
    const hi = Math.floor(n / 4294967296);
    msg[40] = lo & 255;
    msg[41] = lo >>> 8 & 255;
    msg[42] = lo >>> 16 & 255;
    msg[43] = lo >>> 24 & 255;
    msg[44] = hi & 255;
    msg[45] = hi >>> 8 & 255;
    msg[46] = hi >>> 16 & 255;
    msg[47] = hi >>> 24 & 255;
    if (leadingZeroOk(sha256(msg), ch.difficulty)) {
      return { solution: `m4.${n.toString(16)}`, attempts: n + 1, ms: Date.now() - started };
    }
    if ((n & 1023) === 1023 && Date.now() - started > budgetMs) {
      throw new Error(`stage1 budget exhausted after ${n + 1} attempts`);
    }
  }
}
function hexToBytes(hex) {
  const clean = String(hex || "");
  const out = new Uint8Array(clean.length >> 1);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}
function reverseString(text) {
  return String(text).split("").reverse().join("");
}
function b64urlDecodeText(text) {
  const bytes = b64urlDecode(text);
  let out = "";
  for (let i = 0; i < bytes.length; i++)
    out += String.fromCharCode(bytes[i]);
  return out;
}
function solveStage2(challenge, budgetMs = 25e3) {
  const pack = Array.isArray(challenge.pack) ? challenge.pack : [];
  const target = reverseString(pack[0]);
  const salt = reverseString(pack[3]);
  const token = reverseString(pack[4]);
  const body = b64urlDecodeText(String(token).split(".")[1] || "");
  const payload = b64urlDecodeText(body.split(".")[1] || "");
  let difficulty = 0;
  try {
    difficulty = Number(JSON.parse(payload).d) || 0;
  } catch (error) {
    difficulty = 0;
  }
  if (difficulty <= 0 || difficulty > 24)
    throw new Error("stage2 difficulty out of range");
  const width = Math.ceil(difficulty / 4);
  const started = Date.now();
  const limit = Math.min(1 << difficulty, 16777216);
  for (let counter = 0; counter < limit; counter++) {
    let key = counter.toString(16);
    while (key.length < width)
      key = `0${key}`;
    if (hexOf(sha256(asciiBytes(salt + key))) === target) {
      return { solution: key, attempts: counter + 1, ms: Date.now() - started };
    }
    if ((counter & 8191) === 8191 && Date.now() - started > budgetMs) {
      throw new Error("stage2 budget exhausted");
    }
  }
  throw new Error("stage2 has no solution");
}
function sessionHeaders(query, session) {
  const headers = {
    Origin: SITE,
    Referer: `${SITE}/`,
    "Content-Type": "text/plain;charset=UTF-8",
    "User-Agent": BROWSER_UA,
    "x-cs-b": buildTag,
    "x-cs-q": query
  };
  if (session) {
    headers["x-cs-r"] = session.r;
    headers["x-cs-p"] = session.p;
  }
  return headers;
}
function encodeQuery(type, id, season, episode) {
  const fields = [type, String(id), season ? String(season) : "", episode ? String(episode) : ""];
  let b64 = "";
  const raw = JSON.stringify(fields);
  const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let bits = 0;
  let value = 0;
  for (let i = 0; i < raw.length; i++) {
    value = value << 8 | raw.charCodeAt(i) & 255;
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      b64 += table[value >>> bits & 63];
    }
  }
  if (bits > 0)
    b64 += table[value << 6 - bits & 63];
  return b64;
}
function encCinesrc(payload) {
  return __async(this, null, function* () {
    const res = yield postJSON(`${ENCDEC}/enc-cinesrc`, payload, { timeout: 2e4 });
    if (!res || !res.json || res.json.status !== 200 || !res.json.result) {
      throw new Error(`enc-cinesrc failed (${res ? res.status : "no response"})`);
    }
    return res.json.result;
  });
}
function decCinesrc(text, state) {
  return __async(this, null, function* () {
    const res = yield postJSON(`${ENCDEC}/dec-cinesrc`, { text, state }, { timeout: 25e3 });
    if (!res || !res.json || res.json.status !== 200 || !res.json.result) {
      throw new Error(`dec-cinesrc failed (${res ? res.status : "no response"})`);
    }
    return res.json.result;
  });
}
function absolute(url) {
  const raw = String(url || "");
  if (!raw)
    return "";
  if (/^https?:\/\//i.test(raw))
    return raw;
  return `${SITE}${raw.startsWith("/") ? "" : "/"}${raw}`;
}
function parseProviders(text) {
  const lines = String(text || "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("1:"))
      continue;
    try {
      const parsed = JSON.parse(trimmed.slice(2));
      if (Array.isArray(parsed))
        return parsed;
    } catch (error) {
    }
  }
  for (const line of lines) {
    const idx = line.indexOf("[");
    if (idx < 0)
      continue;
    try {
      const parsed = JSON.parse(line.slice(idx));
      if (Array.isArray(parsed) && parsed.length && parsed[0].id)
        return parsed;
    } catch (error) {
    }
  }
  return [];
}
function subtitleFrom(caption) {
  return {
    url: String(caption.url || ""),
    language: String(caption.language || ""),
    label: String(caption.display || caption.language || ""),
    headers: { "User-Agent": BROWSER_UA }
  };
}
function resolveStreams2(_0) {
  return __async(this, arguments, function* ({ tmdbId, type, season, episode, maxProviders = 3 }) {
    const started = Date.now();
    const isMovie = type === "movie";
    const embed = isMovie ? `${SITE}/embed/movie/${tmdbId}` : `${SITE}/embed/tv/${tmdbId}?s=${Number(season) || 1}&e=${Number(episode) || 1}`;
    const query = encodeQuery(isMovie ? "movie" : "tv", tmdbId, isMovie ? "" : season, isMovie ? "" : episode);
    const bootRes = yield request(`${SITE}/api/c/bootstrap`, {
      method: "POST",
      headers: Object.assign({}, sessionHeaders(query), { "Content-Length": "0" }),
      body: "",
      timeout: 15e3
    });
    if (!bootRes || !bootRes.json || !bootRes.json.r) {
      throw new Error(`bootstrap HTTP ${bootRes ? bootRes.status : "n/a"}`);
    }
    const session = { r: bootRes.json.r, p: bootRes.json.p };
    const headers = sessionHeaders(query, session);
    const issue = yield request(`${SITE}/api/c/issue`, { headers, timeout: 15e3 });
    if (!issue || !issue.json || !issue.json.w) {
      throw new Error(`issue HTTP ${issue ? issue.status : "n/a"}`);
    }
    const challenge1 = issue.json;
    const seedData = yield encCinesrc({
      data: { url: embed, user_agent: BROWSER_UA, challenge_data: challenge1 },
      type: "seed"
    });
    const stage1 = solveStage1(challenge1, seedData.seed);
    const issue2 = yield request(`${SITE}/api/c/stage2/issue`, { headers, timeout: 15e3 });
    if (!issue2 || !issue2.json || !issue2.json.pack) {
      throw new Error(`stage2 issue HTTP ${issue2 ? issue2.status : "n/a"}`);
    }
    const stage2 = solveStage2(issue2.json);
    const tokenData = yield encCinesrc({
      data: {
        url: embed,
        user_agent: BROWSER_UA,
        challenge_data: {
          stage1: { challenge: challenge1, solution: stage1.solution },
          stage2: { challenge: issue2.json, solution: stage2.solution }
        },
        state: seedData.state
      },
      type: "encrypt"
    });
    const token = `${tokenData.token}::c3::${session.r}`;
    const actions = tokenData.headers || {};
    const listRes = yield request(embed, {
      method: "POST",
      headers: Object.assign({}, headers, { "Next-Action": actions.getProviderList }),
      body: "[]",
      timeout: 2e4
    });
    const providers = parseProviders(listRes ? listRes.text : "");
    if (!providers.length)
      throw new Error("cinesrc returned an empty server list");
    const ordered = providers.slice().sort((a, b) => (Number(b.rank) || 0) - (Number(a.rank) || 0)).slice(0, maxProviders);
    const streams = [];
    const subtitles = [];
    for (const provider of ordered) {
      const payload = JSON.stringify([
        String(tmdbId),
        isMovie ? "movie" : "show",
        isMovie ? "$undefined" : String(Number(season) || 1),
        isMovie ? "$undefined" : String(Number(episode) || 1),
        token,
        provider.id
      ]);
      let res = null;
      try {
        res = yield request(embed, {
          method: "POST",
          headers: Object.assign({}, headers, { "Next-Action": actions.getStream }),
          body: payload,
          timeout: 2e4
        });
      } catch (error) {
        continue;
      }
      if (!res || res.status !== 200 || !res.text)
        continue;
      let decoded = null;
      try {
        decoded = yield decCinesrc(res.text, tokenData.state);
      } catch (error) {
        continue;
      }
      const entries = decoded && decoded.url || [];
      for (const entry of entries) {
        const url = absolute(entry.url);
        if (!url)
          continue;
        streams.push({
          source: "CineSrc",
          sourceRank: 7,
          // Provider names carry emoji ("⭐️ Nebula"); keep the word only.
          server: String(provider.name || provider.id || "CineSrc").replace(/[^\w .-]/g, "").replace(/\s+/g, " ").trim(),
          description: "",
          quality: "",
          height: 0,
          url,
          headers: STREAM_HEADERS,
          isMp4: false,
          language: "",
          subtitles: [],
          extra: ""
        });
      }
      for (const caption of decoded && decoded.captions || []) {
        if (!caption || !caption.url)
          continue;
        subtitles.push(subtitleFrom(caption));
      }
      if (streams.length)
        break;
    }
    for (const stream of streams)
      stream.subtitles = subtitles;
    console.log(
      `[FluxTV] cinesrc: ${streams.length} server(s) via ${stage1.attempts}+${stage2.attempts} PoW attempt(s), ${Date.now() - started}ms`
    );
    return streams;
  });
}

// src/fluxtv/vidfast.js
var BASE = "https://vidfast.vc";
var ENCDEC2 = "https://enc-dec.app/api";
var PLAYER_HEADERS = {
  "User-Agent": BROWSER_UA,
  Referer: `${BASE}/`,
  Origin: BASE,
  "X-Requested-With": "XMLHttpRequest"
};
var STREAM_HEADERS2 = {
  Referer: `${BASE}/`,
  Origin: BASE,
  "User-Agent": BROWSER_UA
};
var SERVERS_TTL = 15 * 60 * 1e3;
var STREAM_TTL = 8 * 60 * 1e3;
var serverCache = /* @__PURE__ */ new Map();
var streamCache = /* @__PURE__ */ new Map();
function cacheGet(map, key, ttl) {
  const hit = map.get(key);
  if (!hit)
    return null;
  if (Date.now() - hit.ts > ttl) {
    map.delete(key);
    return null;
  }
  return hit.value;
}
function cacheSet(map, key, value, max = 40) {
  map.set(key, { ts: Date.now(), value });
  if (map.size > max) {
    const oldest = map.keys().next();
    if (!oldest.done)
      map.delete(oldest.value);
  }
}
function pageUrl(tmdbId, type, season, episode) {
  if (type === "movie")
    return `${BASE}/movie/${tmdbId}/`;
  return `${BASE}/tv/${tmdbId}/${season || 1}/${episode || 1}/`;
}
function extractPageToken(html) {
  if (!html)
    return null;
  const patterns = [
    /\\"token\\":\\"(.*?)\\"/,
    /\\"en\\":\\"([^"\\]{16,})\\"/,
    /"token":"([^"]{16,})"/,
    /"en":"([^"]{16,})"/
  ];
  for (const pattern of patterns) {
    const m = pattern.exec(html);
    if (m && m[1])
      return m[1];
  }
  return null;
}
function encStage(stage, text) {
  return __async(this, null, function* () {
    const url = `${ENCDEC2}/enc-vidfast?text=${encodeURIComponent(text)}&stage=${stage}`;
    const res = yield request(url, { timeout: 2e4 });
    const payload = res && res.json;
    if (!payload || payload.status !== 200 || !payload.result) {
      throw new Error(`enc-dec stage ${stage} failed (${res ? res.status : "no response"})`);
    }
    return payload.result;
  });
}
function decVidfast(text) {
  return __async(this, null, function* () {
    const res = yield postJSON(`${ENCDEC2}/dec-vidfast`, { text }, { timeout: 25e3 });
    if (!res || !res.json || res.json.status !== 200) {
      throw new Error(`dec-vidfast failed (${res ? res.status : "no response"})`);
    }
    return res.json.result;
  });
}
function postEncrypted(url, token) {
  return request(url, {
    method: "POST",
    headers: Object.assign({}, PLAYER_HEADERS, { "X-CSRF-Token": token }),
    body: "",
    timeout: 2e4
  });
}
function loadServers(tmdbId, type, season, episode) {
  return __async(this, null, function* () {
    const key = `${type}:${tmdbId}:${type === "movie" ? "" : `${season}:${episode}`}`;
    const cached = cacheGet(serverCache, key, SERVERS_TTL);
    if (cached)
      return cached;
    const page = yield request(pageUrl(tmdbId, type, season, episode), {
      headers: { Accept: "text/html,application/xhtml+xml" },
      timeout: 2e4
    });
    if (!page || !page.ok) {
      throw new Error(`vidfast page HTTP ${page ? page.status : "n/a"}`);
    }
    const token = extractPageToken(page.text);
    if (!token)
      throw new Error("vidfast page carried no token");
    const stage1 = yield encStage(1, token);
    if (!stage1.stage1 || !stage1.token)
      throw new Error("vidfast stage 1 payload unexpected");
    const blob = yield postEncrypted(stage1.stage1, stage1.token);
    if (!blob || !blob.text)
      throw new Error(`vidfast stage 1 POST HTTP ${blob ? blob.status : "n/a"}`);
    const stage2 = yield encStage(2, blob.text);
    if (!stage2.servers || !stage2.stream || !stage2.token) {
      throw new Error("vidfast stage 2 payload unexpected");
    }
    const listBlob = yield postEncrypted(stage2.servers, stage2.token);
    if (!listBlob || !listBlob.text) {
      throw new Error(`vidfast servers POST HTTP ${listBlob ? listBlob.status : "n/a"}`);
    }
    const servers = yield decVidfast(listBlob.text);
    if (!Array.isArray(servers) || servers.length === 0) {
      throw new Error("vidfast returned no servers");
    }
    const value = { servers, streamBase: stage2.stream, token: stage2.token };
    cacheSet(serverCache, key, value);
    return value;
  });
}
function streamForServer(entry, server) {
  return __async(this, null, function* () {
    const cacheKey2 = `${entry.streamBase}|${server.data}`;
    const cached = cacheGet(streamCache, cacheKey2, STREAM_TTL);
    if (cached)
      return cached;
    const res = yield postEncrypted(`${entry.streamBase}/${server.data}`, entry.token);
    if (!res || !res.text)
      throw new Error(`stream POST HTTP ${res ? res.status : "n/a"}`);
    const payload = yield decVidfast(res.text);
    if (!payload || typeof payload.url !== "string" || !payload.url) {
      throw new Error("stream payload carried no url");
    }
    cacheSet(streamCache, cacheKey2, payload, 80);
    return payload;
  });
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var PREFERRED = ["vrapid", "vblaze", "cobra"];
function orderServers(servers) {
  const rank = (server) => {
    const index = PREFERRED.indexOf(String(server.name || "").toLowerCase());
    return index === -1 ? PREFERRED.length : index;
  };
  return servers.slice().sort((a, b) => rank(a) - rank(b));
}
function tryServer(entry, server) {
  return __async(this, null, function* () {
    const payload = yield withTimeout(streamForServer(entry, server), 5e3, null);
    return payload || null;
  });
}
function resolveStreams3(_0) {
  return __async(this, arguments, function* ({ tmdbId, type, season, episode }) {
    const started = Date.now();
    const entry = yield loadServers(tmdbId, type, season, episode);
    const servers = orderServers(entry.servers).slice(0, 2);
    const attempts = yield Promise.all(
      servers.map(
        (server, index) => sleep(index * 200).then(() => tryServer(entry, server)).then((payload) => ({ server, payload })).catch((error) => {
          console.log(`[FluxTV] vidfast ${server.name}: ${error.message}`);
          return null;
        })
      )
    );
    const streams = [];
    for (const attempt of attempts) {
      if (!attempt || !attempt.payload)
        continue;
      const { server, payload } = attempt;
      const description = String(server.description || "").trim();
      streams.push({
        source: "VidFast",
        sourceRank: 6,
        server: server.name,
        description,
        quality: payload["4kAvailable"] ? "4K" : "",
        height: payload["4kAvailable"] ? 2160 : 0,
        url: payload.url,
        headers: STREAM_HEADERS2,
        isMp4: Boolean(payload.mp4),
        subtitles: [],
        extra: description
      });
    }
    console.log(
      `[FluxTV] vidfast: ${streams.length}/${servers.length} server(s) in ${Date.now() - started}ms`
    );
    return streams;
  });
}

// src/fluxtv/vidlove.js
var API2 = "https://api.vidlove.cc";
var REFERER = "https://player.vidlove.cc/";
var VARIANTS = ["vidapi", ""];
var HEADERS2 = {
  Referer: REFERER,
  Origin: "https://player.vidlove.cc",
  Accept: "*/*",
  "User-Agent": BROWSER_UA
};
function urlOf(value) {
  if (typeof value === "string" && /^https?:\/\//i.test(value))
    return value;
  if (value && typeof value === "object") {
    for (const key of ["url", "file", "playlist", "src", "link"]) {
      const candidate = value[key];
      if (typeof candidate === "string" && /^https?:\/\//i.test(candidate))
        return candidate;
    }
  }
  return null;
}
function resolutionOf(attrs) {
  const m = /RESOLUTION=(\d{2,5})x(\d{2,5})/i.exec(String(attrs || ""));
  return m ? { width: parseInt(m[1], 10), height: parseInt(m[2], 10) } : { width: 0, height: 0 };
}
function variantsOf(manifest, label) {
  const out = [];
  const text = String(manifest || "");
  if (!text.includes("#EXTM3U"))
    return out;
  const lines = text.split("\n").map((line) => line.trim());
  let attrs = null;
  for (const line of lines) {
    if (!line)
      continue;
    if (line.startsWith("#EXT-X-STREAM-INF")) {
      attrs = line.slice(line.indexOf(":") + 1);
      continue;
    }
    if (line.startsWith("#"))
      continue;
    if (!/^https?:\/\//i.test(line)) {
      attrs = null;
      continue;
    }
    const resolution = resolutionOf(attrs);
    out.push({ url: line, width: resolution.width, height: resolution.height, label });
    attrs = null;
  }
  return out;
}
function collect(payload, variantId) {
  if (!payload || typeof payload !== "object")
    return [];
  const label = `VidLove${variantId ? ` ${variantId}` : ""}`;
  const out = [];
  const push = (url, width, height, extra, assumeLive) => {
    if (!url)
      return;
    out.push({
      source: "VidLove",
      sourceRank: variantId === "vidapi" ? 6 : 2,
      server: label,
      description: extra || "",
      quality: height ? `${height}p` : "",
      width,
      height,
      assumeLive: Boolean(assumeLive),
      url,
      headers: { Referer: REFERER, Origin: "https://player.vidlove.cc", "User-Agent": BROWSER_UA },
      isMp4: /\.mp4(\?|$)/i.test(url),
      language: "",
      subtitles: [],
      extra: extra || ""
    });
  };
  const sources = [payload.source, payload.sources, payload.streams, payload.data];
  for (const entry of sources) {
    if (!entry)
      continue;
    if (Array.isArray(entry)) {
      for (const item of entry) {
        if (!item)
          continue;
        const variants = variantsOf(item.manifest, label);
        if (variants.length) {
          for (const v of variants)
            push(v.url, v.width, v.height, v.label, true);
          continue;
        }
        push(urlOf(item), 0, 0, item.label || "", false);
      }
      continue;
    }
    if (typeof entry === "object" && typeof entry.manifest === "string") {
      const variants = variantsOf(entry.manifest, label);
      if (variants.length) {
        for (const v of variants)
          push(v.url, v.width, v.height, v.label || "", true);
        continue;
      }
    }
    push(urlOf(entry), 0, 0, entry && entry.label || "", false);
  }
  return out;
}
function resolveStreams4(_0) {
  return __async(this, arguments, function* ({ tmdbId, type, season, episode }) {
    const started = Date.now();
    const path = type === "movie" ? `${API2}/movie?id=${tmdbId}&mode=json` : `${API2}/tv?id=${tmdbId}&season=${Number(season) || 1}&episode=${Number(episode) || 1}&mode=json`;
    const attempts = yield Promise.all(
      VARIANTS.map((variant) => __async(this, null, function* () {
        const url = variant ? `${path}&sources=${variant}` : path;
        try {
          const payload = yield getJSON(url, { headers: HEADERS2, timeout: 12e3 });
          return collect(payload, variant);
        } catch (error) {
          return [];
        }
      }))
    );
    const streams = attempts.flat();
    console.log(
      `[FluxTV] vidlove: ${streams.length} source(s) in ${Date.now() - started}ms` + (streams.length ? "" : " (API answered empty for this region/title)")
    );
    return streams;
  });
}

// src/fluxtv/index.js
var CACHE_TTL_MS = 10 * 60 * 1e3;
var EMPTY_TTL_MS = 90 * 1e3;
var CACHE_MAX = 48;
var cache = /* @__PURE__ */ new Map();
var MAX_STREAMS = 14;
var INSPECT_BUDGET_MS = 900;
var INSPECT_CANDIDATES = 4;
var CINESRC_ENABLED = false;
var PROBE_CONCURRENCY = 4;
var FIRST_WAIT_MS = 3e3;
var FALLBACK_WAIT_MS = 5200;
var PROBE_BUDGET_MS = 900;
var LATE_PROBE_BUDGET_MS = 250;
function debugEnabled() {
  try {
    return typeof process !== "undefined" && process && process.env && process.env.FLUXTV_DEBUG === "1";
  } catch (error) {
    return false;
  }
}
function cacheKey(type, id, season, episode) {
  return type === "show" ? `show:${id}:${season}:${episode}` : `movie:${id}`;
}
var INSPECT_BYTES = 8192;
function rangeGet(url, headers, bytes) {
  return fetch(url, {
    headers: Object.assign(
      {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36",
        Accept: "*/*",
        Range: `bytes=0-${bytes - 1}`
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
function resolutionOf2(text) {
  let best = null;
  const re = /RESOLUTION=(\d{2,5})x(\d{2,5})/g;
  let m;
  while (m = re.exec(String(text))) {
    const width = parseInt(m[1], 10);
    const height = parseInt(m[2], 10);
    if (!best || width * height > best.width * best.height)
      best = { width, height };
  }
  return best;
}
function inspect(stream) {
  return __async(this, null, function* () {
    const started = Date.now();
    const label = `${stream.server || stream.source}/${stream.quality || "?"}`;
    try {
      const res = yield withTimeout(rangeGet(stream.url, stream.headers, INSPECT_BYTES), 900, null);
      if (!res)
        return { ok: false, reason: "timeout" };
      if (!res.ok && res.status !== 206)
        return { ok: false, reason: `HTTP ${res.status}` };
      const buffer = yield withTimeout(res.arrayBuffer(), 900, null);
      if (!buffer)
        return { ok: false, reason: "body timeout" };
      const bytes = new Uint8Array(buffer);
      const text = decode(bytes).replace(/^\uFEFF/, "");
      const trimmed = text.trimStart();
      if (trimmed.startsWith("#EXTM3U")) {
        const resolution = resolutionOf2(trimmed);
        const height = resolution ? resolution.height : 0;
        const width = resolution ? resolution.width : 0;
        const ms = Date.now() - started;
        console.log(`[FluxTV] probe ${label} live${width ? ` ${width}x${height}` : ""} ${ms}ms`);
        return { ok: true, height, width, ms };
      }
      const magic = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (magic === "ftyp" || magic === "styp" || bytes[0] === 71) {
        console.log(`[FluxTV] probe ${label} live (container) ${Date.now() - started}ms`);
        return { ok: true, height: 0, width: 0 };
      }
      return { ok: false, reason: "not a playlist or container" };
    } catch (error) {
      return { ok: false, reason: error && error.message ? error.message : "fetch failed" };
    }
  });
}
function inspectTop(_0) {
  return __async(this, arguments, function* (streams, budgetMs = INSPECT_BUDGET_MS) {
    const reports = /* @__PURE__ */ new Map();
    const nominees = streams.slice(0, INSPECT_CANDIDATES);
    for (const stream of streams) {
      if (stream.assumeLive)
        reports.set(stream.url, { ok: true, height: stream.height || 0 });
    }
    const perGroup = /* @__PURE__ */ new Map();
    const queue = nominees.filter((stream) => {
      if (stream.assumeLive)
        return false;
      const key = `${stream.server}|${stream.quality}`;
      const seen = perGroup.get(key) || 0;
      if (seen >= 2)
        return false;
      perGroup.set(key, seen + 1);
      return true;
    });
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
        const stream = queue[index];
        try {
          const report = yield inspect(stream);
          reports.set(stream.url, report);
          if (report && report.ok && ++live >= 3)
            enough("enough");
        } catch (error) {
        }
      }
    });
    const pool = [];
    for (let i = 0; i < Math.min(PROBE_CONCURRENCY, queue.length); i++)
      pool.push(worker());
    yield Promise.race([Promise.all(pool), deadline(budgetMs, "budget"), enoughVerdicts]);
    console.log(`[FluxTV] inspected ${reports.size}/${nominees.length} candidate(s)`);
    return reports;
  });
}
var ORIGINAL_AUDIO = /^(original( audio)?|orig)$/i;
function isOriginalAudio(stream) {
  const text = `${stream.language || ""} ${stream.description || ""}`.trim();
  if (!text)
    return false;
  if (ORIGINAL_AUDIO.test(text))
    return true;
  return /original audio/i.test(text);
}
function score(stream, report) {
  const state = !report ? "unknown" : report.ok ? "live" : "dead";
  const height = report && report.height || stream.height || 0;
  const width = report && report.width || stream.width || 0;
  let value = 0;
  value += Math.min(height, 2160) * 10;
  if (isOriginalAudio(stream))
    value += 300;
  if (state === "live") {
    value += 150 - Math.min(120, Math.round((report && report.ms || 0) / 20));
  } else if (state === "unknown")
    value -= 200;
  else
    value -= 1e4;
  value += Math.min(stream.sourceRank || 0, 9);
  return { value, state, height, width };
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
    return `${height}p`;
  return "Auto";
}
function titleFor(stream, height, width) {
  const bits = [stream.server || stream.source];
  const quality = widthLabel(width, height || stream.height);
  if (quality && quality !== "Auto")
    bits.push(quality);
  const language = stream.language;
  if (language && !ORIGINAL_AUDIO.test(language))
    bits.push(language);
  if (stream.description && stream.description !== language)
    bits.push(stream.description);
  return bits.join(" \xB7 ");
}
function dedupe(streams) {
  const seen = /* @__PURE__ */ new Map();
  for (const stream of streams) {
    if (!stream || !stream.url)
      continue;
    const key = stream.url.split("#")[0];
    if (!seen.has(key))
      seen.set(key, stream);
  }
  return [...seen.values()];
}
function nominate(streams) {
  return streams.map((stream) => ({ stream, height: qualityHeight(stream.quality) })).sort((a, b) => b.height - a.height || (b.stream.sourceRank || 0) - (a.stream.sourceRank || 0)).map((entry) => entry.stream);
}
function buildStreams(streams, subtitles, known, budgetMs) {
  return __async(this, null, function* () {
    if (!streams.length)
      return [];
    const unique = dedupe(streams);
    const nominal = nominate(unique);
    const reports = known && known.size ? known : /* @__PURE__ */ new Map();
    const missing = nominal.slice(0, INSPECT_CANDIDATES).filter((stream) => !reports.has(stream.url));
    if (missing.length) {
      const more = yield inspectTop(missing, budgetMs == null ? INSPECT_BUDGET_MS : budgetMs);
      for (const [url, report] of more)
        reports.set(url, report);
    }
    const scored = nominal.map((stream) => {
      const report = reports.get(stream.url);
      const { value, state, height, width } = score(stream, report);
      return { stream, report, state, height, width, value };
    }).sort((a, b) => b.value - a.value);
    for (const entry of scored) {
      if (entry.state !== "dead")
        continue;
      console.log(
        `[FluxTV] dead: ${entry.stream.server}/${entry.stream.quality || "?"} (${entry.report.reason})`
      );
    }
    if (debugEnabled()) {
      for (const e of scored) {
        console.log(
          `[FluxTV] score ${e.value} ${e.state} ${e.width}x${e.height} ${e.stream.server}/${e.stream.quality}`
        );
      }
    }
    const usable = scored.filter((entry) => entry.state !== "dead");
    const pool = usable.length >= 3 ? usable : scored.filter((entry) => entry.state === "live" || entry.state === "unknown").concat(scored.filter((entry) => entry.state === "dead"));
    const picked = [];
    const usedUrls = /* @__PURE__ */ new Set();
    const seenSources = /* @__PURE__ */ new Set();
    for (const entry of pool) {
      const source = entry.stream.source;
      if (seenSources.has(source))
        continue;
      seenSources.add(source);
      picked.push(entry);
      usedUrls.add(entry.stream.url);
    }
    for (const entry of pool) {
      if (picked.length >= MAX_STREAMS)
        break;
      if (usedUrls.has(entry.stream.url))
        continue;
      picked.push(entry);
      usedUrls.add(entry.stream.url);
    }
    const tracks = tidySubtitles(subtitles);
    const out = [];
    for (const entry of picked.slice(0, MAX_STREAMS)) {
      const { stream, height, width } = entry;
      const quality = widthLabel(width, height || stream.height);
      const item = {
        name: `${LABEL} \xB7 ${stream.server || stream.source}`,
        title: titleFor(stream, height, width),
        quality,
        url: stream.url,
        headers: Object.assign({}, stream.headers || {})
      };
      const own = tidySubtitles(stream.subtitles);
      const list = own.length ? own : tracks;
      if (list.length)
        item.subtitles = list;
      out.push(item);
    }
    console.log(`[FluxTV] ${out.length} stream(s) from ${unique.length} candidate(s)`);
    for (const item of out) {
      console.log(`[FluxTV]   ${item.name} | ${item.title} | ${item.url.slice(0, 90)}`);
    }
    return out;
  });
}
function tidySubtitles(list) {
  if (!Array.isArray(list) || !list.length)
    return [];
  const priority = (sub) => {
    const code = String(sub.language || "").toLowerCase();
    const label = String(sub.label || "").toLowerCase();
    if (code === "en" || label.startsWith("english"))
      return 0;
    if (code === "vi" || label.startsWith("viet"))
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
  return [...seen.values()].sort((a, b) => priority(a) - priority(b)).slice(0, 12);
}
function safe(name, fn) {
  return __async(this, null, function* () {
    const started = Date.now();
    try {
      const value = yield fn();
      return value || [];
    } catch (error) {
      console.log(
        `[FluxTV] ${name} failed after ${Date.now() - started}ms: ${error && error.message ? error.message : error}`
      );
      return [];
    }
  });
}
function deadline(ms, fallback = "deadline") {
  return new Promise((resolve) => {
    const fire = () => {
      try {
        resolve(fallback);
      } catch (error) {
      }
    };
    setTimeout(fire, ms);
    setTimeout(fire, ms + 700);
  });
}
function sleep2(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        resolve();
      } catch (error) {
      }
    }, ms);
  });
}
function waitForCandidates(settled, partial, until) {
  return __async(this, null, function* () {
    for (; ; ) {
      const all = Object.values(settled).flat().concat(partial || []);
      if (all.length || Date.now() >= until)
        return all;
      yield sleep2(120);
    }
  });
}
function collectSubtitles(lists) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const stream of lists) {
    for (const sub of stream && stream.subtitles || []) {
      if (!sub || !sub.url || seen.has(sub.url))
        continue;
      seen.add(sub.url);
      out.push(sub);
    }
  }
  return out;
}
function resolveStreams5(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    const started = Date.now();
    const type = String(mediaType || "tv").toLowerCase() === "movie" ? "movie" : "show";
    const s = Number(season) || 1;
    const e = Number(episode) || 1;
    let id = parseTmdbId(tmdbId);
    if (!id && /^tt\d+$/i.test(String(tmdbId || "").trim())) {
      id = yield imdbToTmdb(tmdbId, type === "movie" ? "movie" : "tv");
    }
    if (!id) {
      console.warn(`[FluxTV] unsupported id "${tmdbId}" (FluxTV needs a TMDB id)`);
      return [];
    }
    const meta = safe("tmdb meta", () => tmdbMeta(id, type === "movie" ? "movie" : "tv"));
    const args = { tmdbId: id, type: type === "movie" ? "movie" : "tv", season: s, episode: e, meta };
    console.log(`[FluxTV] id ${id} (${args.type}) resolved at +${Date.now() - started}ms`);
    const settled = {};
    const track = (name, budget, run) => withTimeout(safe(name, run), budget, []).then((value) => {
      settled[name] = value || [];
      console.log(
        `[FluxTV] ${name} ready at +${Date.now() - started}ms (${settled[name].length} source(s))`
      );
      return settled[name];
    });
    const partial = [];
    track("bingr", 6e3, () => resolveStreams(Object.assign({}, args, { sink: partial })));
    track("vidfast", 6500, () => resolveStreams3(args));
    track("vidlove", 3e3, () => resolveStreams4(args));
    if (CINESRC_ENABLED)
      track("cinesrc", 9e3, () => resolveStreams2(args));
    let early = yield waitForCandidates(settled, partial, started + FIRST_WAIT_MS);
    if (!early.length) {
      early = yield waitForCandidates(settled, partial, started + FALLBACK_WAIT_MS);
    }
    console.log(
      `[FluxTV] first candidates at +${Date.now() - started}ms (${early.length}), probing`
    );
    const reports = early.length ? yield inspectTop(nominate(early), PROBE_BUDGET_MS).catch(() => /* @__PURE__ */ new Map()) : /* @__PURE__ */ new Map();
    const streams = Object.values(settled).flat().concat(partial);
    console.log(
      `[FluxTV] merging ${streams.length} candidate(s) at +${Date.now() - started}ms, ${reports.size} pre-probed`
    );
    try {
      return yield buildStreams(streams, collectSubtitles(streams), reports, LATE_PROBE_BUDGET_MS);
    } catch (error) {
      console.error(
        `[FluxTV] ranking failed (${error && error.message ? error.message : error}), emitting raw candidates`
      );
      return rawStreams(streams, collectSubtitles(streams));
    }
  });
}
function rawStreams(streams, subtitles) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const stream of nominate(streams)) {
    if (!stream || !stream.url || seen.has(stream.url))
      continue;
    seen.add(stream.url);
    const item = {
      name: `${LABEL} \xB7 ${stream.server || stream.source}`,
      title: titleFor(stream, stream.height || 0, stream.width || 0),
      quality: widthLabel(stream.width || 0, stream.height || 0),
      url: stream.url,
      headers: Object.assign({}, stream.headers || {})
    };
    if (subtitles && subtitles.length)
      item.subtitles = tidySubtitles(subtitles);
    out.push(item);
    if (out.length >= MAX_STREAMS)
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
      `[FluxTV] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(
        mediaType
      )} season=${season} episode=${episode}`
    );
    const hit = cache.get(key);
    if (hit && Date.now() - hit.ts < hit.ttl) {
      console.log(`[FluxTV] cache hit ${key}`);
      return hit.value;
    }
    if (hit)
      cache.delete(key);
    let failed = false;
    const value = (() => __async(this, null, function* () {
      try {
        return yield resolveStreams5(tmdbId, mediaType, season, episode);
      } catch (error) {
        failed = true;
        console.error(
          `[FluxTV] error: ${error && error.message ? error.message : error}`,
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
    console.log(`[FluxTV] ${streams.length} stream(s) in ${Date.now() - started}ms`);
    return streams;
  });
}
module.exports = { getStreams };
