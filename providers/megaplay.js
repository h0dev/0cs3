/**
 * megaplay - Built from src/megaplay/
 * Generated: 2026-10-20T11:52:26.470Z
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

// src/megaplay/aescbc.js
function base64UrlToBytes(str) {
  let s = String(str || "").replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  const pad = s.length % 4;
  if (pad)
    s += "====".slice(pad);
  if (typeof atob === "function") {
    const bin = atob(s);
    const out2 = new Array(bin.length);
    for (let i = 0; i < bin.length; i++)
      out2[i] = bin.charCodeAt(i);
    return out2;
  }
  const TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const out = [];
  let buf = 0;
  let bits = 0;
  for (let i = 0; i < s.length; i++) {
    const v = TABLE.indexOf(s[i]);
    if (v < 0)
      continue;
    buf = buf << 6 | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push(buf >> bits & 255);
    }
  }
  return out;
}
function utf8BytesToText(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i++];
    if (b < 128) {
      out += String.fromCharCode(b);
    } else if (b >= 192 && b < 224) {
      out += String.fromCharCode((b & 31) << 6 | bytes[i++] & 63);
    } else if (b >= 224 && b < 240) {
      out += String.fromCharCode(
        (b & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63
      );
    } else if (b >= 240) {
      let cp = (b & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
      cp -= 65536;
      out += String.fromCharCode(55296 + (cp >> 10), 56320 + (cp & 1023));
    }
  }
  return out;
}
function pkcs7Unpad(bytes) {
  if (!bytes.length)
    return bytes;
  const n = bytes[bytes.length - 1];
  if (n < 1 || n > 16 || n > bytes.length)
    return bytes;
  for (let i = bytes.length - n; i < bytes.length; i++) {
    if (bytes[i] !== n)
      return bytes;
  }
  return bytes.slice(0, bytes.length - n);
}
var SBOX = [
  99,
  124,
  119,
  123,
  242,
  107,
  111,
  197,
  48,
  1,
  103,
  43,
  254,
  215,
  171,
  118,
  202,
  130,
  201,
  125,
  250,
  89,
  71,
  240,
  173,
  212,
  162,
  175,
  156,
  164,
  114,
  192,
  183,
  253,
  147,
  38,
  54,
  63,
  247,
  204,
  52,
  165,
  229,
  241,
  113,
  216,
  49,
  21,
  4,
  199,
  35,
  195,
  24,
  150,
  5,
  154,
  7,
  18,
  128,
  226,
  235,
  39,
  178,
  117,
  9,
  131,
  44,
  26,
  27,
  110,
  90,
  160,
  82,
  59,
  214,
  179,
  41,
  227,
  47,
  132,
  83,
  209,
  0,
  237,
  32,
  252,
  177,
  91,
  106,
  203,
  190,
  57,
  74,
  76,
  88,
  207,
  208,
  239,
  170,
  251,
  67,
  77,
  51,
  133,
  69,
  249,
  2,
  127,
  80,
  60,
  159,
  168,
  81,
  163,
  64,
  143,
  146,
  157,
  56,
  245,
  188,
  182,
  218,
  33,
  16,
  255,
  243,
  210,
  205,
  12,
  19,
  236,
  95,
  151,
  68,
  23,
  196,
  167,
  126,
  61,
  100,
  93,
  25,
  115,
  96,
  129,
  79,
  220,
  34,
  42,
  144,
  136,
  70,
  238,
  184,
  20,
  222,
  94,
  11,
  219,
  224,
  50,
  58,
  10,
  73,
  6,
  36,
  92,
  194,
  211,
  172,
  98,
  145,
  149,
  228,
  121,
  231,
  200,
  55,
  109,
  141,
  213,
  78,
  169,
  108,
  86,
  244,
  234,
  101,
  122,
  174,
  8,
  186,
  120,
  37,
  46,
  28,
  166,
  180,
  198,
  232,
  221,
  116,
  31,
  75,
  189,
  139,
  138,
  112,
  62,
  181,
  102,
  72,
  3,
  246,
  14,
  97,
  53,
  87,
  185,
  134,
  193,
  29,
  158,
  225,
  248,
  152,
  17,
  105,
  217,
  142,
  148,
  155,
  30,
  135,
  233,
  206,
  85,
  40,
  223,
  140,
  161,
  137,
  13,
  191,
  230,
  66,
  104,
  65,
  153,
  45,
  15,
  176,
  84,
  187,
  22
];
var INV_SBOX = (() => {
  const t = new Array(256);
  for (let i = 0; i < 256; i++)
    t[SBOX[i]] = i;
  return t;
})();
var RCON = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
function keyExpansion256(key) {
  const w = new Array(60);
  for (let i = 0; i < 8; i++) {
    w[i] = (key[i * 4] << 24 | key[i * 4 + 1] << 16 | key[i * 4 + 2] << 8 | key[i * 4 + 3]) >>> 0;
  }
  for (let i = 8; i < 60; i++) {
    let t = w[i - 1];
    if (i % 8 === 0) {
      t = (t << 8 | t >>> 24) >>> 0;
      t = (SBOX[t >>> 24 & 255] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255]) >>> 0;
      t = (t ^ RCON[(i / 8 | 0) - 1] << 24) >>> 0;
    } else if (i % 8 === 4) {
      t = (SBOX[t >>> 24 & 255] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255]) >>> 0;
    }
    w[i] = (w[i - 8] ^ t) >>> 0;
  }
  return w;
}
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1)
      p ^= a;
    const hi = a & 128;
    a = a << 1 & 255;
    if (hi)
      a ^= 27;
    b >>= 1;
  }
  return p & 255;
}
function addRoundKey(s, w, round) {
  for (let c = 0; c < 4; c++) {
    const word = w[round * 4 + c];
    s[c * 4] ^= word >>> 24 & 255;
    s[c * 4 + 1] ^= word >>> 16 & 255;
    s[c * 4 + 2] ^= word >>> 8 & 255;
    s[c * 4 + 3] ^= word & 255;
  }
}
function invSubBytes(s) {
  for (let i = 0; i < 16; i++)
    s[i] = INV_SBOX[s[i]];
}
function invShiftRows(s) {
  let t = s[13];
  s[13] = s[9];
  s[9] = s[5];
  s[5] = s[1];
  s[1] = t;
  t = s[2];
  s[2] = s[10];
  s[10] = t;
  t = s[6];
  s[6] = s[14];
  s[14] = t;
  t = s[3];
  s[3] = s[7];
  s[7] = s[11];
  s[11] = s[15];
  s[15] = t;
}
function invMixColumns(s) {
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
    s[i] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
    s[i + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
    s[i + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
    s[i + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
  }
}
function decryptBlock(w, block) {
  const s = block.slice(0, 16);
  addRoundKey(s, w, 14);
  for (let round = 13; round >= 1; round--) {
    invShiftRows(s);
    invSubBytes(s);
    addRoundKey(s, w, round);
    invMixColumns(s);
  }
  invShiftRows(s);
  invSubBytes(s);
  addRoundKey(s, w, 0);
  return s;
}
function aes256CbcDecryptJs(keyBytes, ivBytes, dataBytes) {
  const w = keyExpansion256(keyBytes);
  const out = [];
  let prev = ivBytes.slice(0, 16);
  for (let off = 0; off + 16 <= dataBytes.length; off += 16) {
    const block = dataBytes.slice(off, off + 16);
    const plain = decryptBlock(w, block);
    for (let i = 0; i < 16; i++)
      out.push(plain[i] ^ prev[i]);
    prev = block;
  }
  return pkcs7Unpad(out);
}
var _nodeCrypto;
function nodeCrypto() {
  if (_nodeCrypto === void 0) {
    try {
      _nodeCrypto = require("crypto");
    } catch (e) {
      _nodeCrypto = null;
    }
  }
  return _nodeCrypto;
}
function hasSubtle() {
  return typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle && typeof globalThis.crypto.subtle.importKey === "function";
}
function decryptCbcText(enc, keyText, ivText) {
  return __async(this, null, function* () {
    const data = base64UrlToBytes(enc);
    const key = padKey(keyText, 32);
    const iv = padKey(ivText, 16);
    const nc = nodeCrypto();
    if (nc) {
      const d = nc.createDecipheriv("aes-256-cbc", Buffer.from(key), Buffer.from(iv));
      return Buffer.concat([d.update(Buffer.from(data)), d.final()]).toString("utf8");
    }
    if (hasSubtle()) {
      try {
        const k = yield globalThis.crypto.subtle.importKey(
          "raw",
          new Uint8Array(key),
          { name: "AES-CBC" },
          false,
          ["decrypt"]
        );
        const buf = yield globalThis.crypto.subtle.decrypt(
          { name: "AES-CBC", iv: new Uint8Array(iv) },
          k,
          new Uint8Array(data)
        );
        return utf8BytesToText(Array.from(new Uint8Array(buf)));
      } catch (e) {
      }
    }
    return utf8BytesToText(aes256CbcDecryptJs(key, iv, data));
  });
}
function padKey(text, len) {
  const src = String(text || "");
  const out = new Array(len).fill(0);
  for (let i = 0; i < len && i < src.length; i++)
    out[i] = src.charCodeAt(i) & 255;
  return out;
}

// src/megaplay/http.js
var BASE = "https://animextv.tech";
var MEGA = "https://megaplay.buzz";
var ENC_KEY = "i?LMTAx0Q6,:}50U";
var ENC_IV = "W0;27ToaUpl_P%'c";
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
var PLAYBACK_HEADERS = {
  "User-Agent": BROWSER_UA,
  Referer: MEGA + "/",
  Origin: MEGA
};
var SITE_HDR = { "User-Agent": BROWSER_UA };
function siteHeaders(extra) {
  return __spreadValues(__spreadProps(__spreadValues({}, SITE_HDR), { Referer: BASE + "/" }), extra || {});
}
function get(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = yield fetch(url, { method: "GET", headers });
        if (!res.ok)
          throw new Error(`HTTP ${res.status} for ${url}`);
        return res.text();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error(`GET failed ${url}`);
  });
}
function getJson(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    return JSON.parse(yield get(url, headers));
  });
}
var DATA_ID_RE = /data-id="?(\d+)"?/;
function fetchFileId(prefix, id, episode, audio) {
  return __async(this, null, function* () {
    const embedUrl = `${MEGA}/stream/${prefix}/${id}/${episode}/${audio}`;
    const html = yield get(embedUrl, siteHeaders());
    const m = DATA_ID_RE.exec(html || "");
    return m && m[1] ? m[1] : null;
  });
}
function getSourcesData(dataId) {
  return __async(this, null, function* () {
    const url = `${MEGA}/stream/getSources?id=${encodeURIComponent(dataId)}`;
    const headers = {
      "User-Agent": BROWSER_UA,
      Referer: MEGA + "/stream/anime",
      Origin: MEGA,
      "X-Requested-With": "XMLHttpRequest"
    };
    const json = yield getJson(url, headers);
    const tracks = Array.isArray(json && json.tracks) ? json.tracks.filter((t) => t && t.file) : [];
    let file = pickFile(json);
    if (!file && json && json.enc) {
      let inner = null;
      let lastErr = null;
      for (let attempt = 0; attempt < 2 && !inner; attempt++) {
        const candidates = yield encKeyCandidates(attempt > 0);
        for (const keys of candidates) {
          try {
            const text = yield decryptCbcText(json.enc, keys.key, keys.iv);
            inner = JSON.parse(text);
            break;
          } catch (e) {
            lastErr = e;
          }
        }
      }
      if (!inner) {
        throw new Error(`getSources enc undecryptable: ${lastErr && lastErr.message}`);
      }
      file = pickFile(inner);
      if (!file && inner && Array.isArray(inner.sources)) {
        const first = inner.sources.find((s) => s && (s.file || s.url));
        if (first)
          file = first.file || first.url;
      }
    }
    if (!file)
      throw new Error("getSources returned no playable file (no sources.file / enc)");
    return { file, tracks };
  });
}
var _liveKeys = null;
function encKeyCandidates(force) {
  return __async(this, null, function* () {
    if (!_liveKeys || force)
      _liveKeys = yield readLiveKeys();
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const k of [_liveKeys, { key: ENC_KEY, iv: ENC_IV }]) {
      if (!k || !k.key || !k.iv)
        continue;
      const id = `${k.key}\0${k.iv}`;
      if (seen.has(id))
        continue;
      seen.add(id);
      out.push(k);
    }
    return out;
  });
}
function readLiveKeys() {
  return __async(this, null, function* () {
    try {
      const js = yield get(`${MEGA}/lib/app.main.js`, {
        "User-Agent": BROWSER_UA,
        Referer: MEGA + "/"
      });
      const km = /DOMAINS_ENC_KEY\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(js || "");
      const im = /DOMAINS_ENC_IV\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(js || "");
      const key = km && (km[1] || km[2]);
      const iv = im && (im[1] || im[2]);
      if (key && iv)
        return { key, iv };
    } catch (e) {
    }
    return null;
  });
}
function pickFile(obj) {
  if (!obj || typeof obj !== "object")
    return null;
  if (typeof obj.file === "string" && obj.file)
    return obj.file;
  if (typeof obj.url === "string" && obj.url)
    return obj.url;
  if (obj.sources) {
    if (typeof obj.sources === "string")
      return obj.sources;
    if (typeof obj.sources.file === "string" && obj.sources.file)
      return obj.sources.file;
    if (Array.isArray(obj.sources)) {
      const first = obj.sources.find((s) => s && (s.file || s.url));
      if (first)
        return first.file || first.url;
    }
  }
  return null;
}
var MAPPING_RE = /"externalSite"\s*:\s*"anilist\/anime"[\s\S]*?"externalId"\s*:\s*"(\d+)"/;
function kitsuToAnilist(kitsuId) {
  return __async(this, null, function* () {
    const url = `https://kitsu.app/api/edge/anime/${encodeURIComponent(kitsuId)}/mappings`;
    const res = yield fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/vnd.api+json"
      }
    });
    if (!res.ok)
      return null;
    const text = yield res.text();
    const fast = MAPPING_RE.exec(text);
    if (fast && fast[1])
      return fast[1];
    try {
      const json = JSON.parse(text);
      for (const item of (json == null ? void 0 : json.data) || []) {
        const a = (item == null ? void 0 : item.attributes) || {};
        if (a.externalSite === "anilist/anime" && a.externalId) {
          return String(a.externalId);
        }
      }
    } catch (e) {
    }
    return null;
  });
}
function malFromImdb(imdbId, season, episode) {
  return __async(this, null, function* () {
    const url = `https://id-mapping-api-malid.hf.space/api/resolve?id=${encodeURIComponent(imdbId)}&s=${Number(season) || 1}&e=${Number(episode) || 1}`;
    const res = yield fetch(url, { method: "GET", headers: { "User-Agent": BROWSER_UA } });
    if (!res.ok)
      return null;
    let json;
    try {
      json = JSON.parse(yield res.text());
    } catch (e) {
      return null;
    }
    if (!json || json.error || !json.mal_id)
      return null;
    return {
      malId: String(json.mal_id),
      malEpisode: Number(json.mal_episode) || Number(episode) || 1
    };
  });
}

// src/megaplay/extractor.js
function classifyRawId(raw) {
  const s = String(raw != null ? raw : "").trim();
  if (!s)
    return null;
  if (/^tt\d+$/i.test(s))
    return { kind: "imdb", number: s.replace(/^tt/i, "") };
  const m = /^([a-zA-Z]+):(\d+)(?::\d+)?$/.exec(s);
  if (m) {
    return {
      kind: String(m[1]).toLowerCase(),
      number: m[2],
      hasPrefix: true
    };
  }
  if (/^\d+$/.test(s))
    return { kind: "bare", number: s };
  return { kind: "unknown", number: s };
}
function resolveToTargets(parsed, mediaType, season, episode) {
  return __async(this, null, function* () {
    if (!parsed)
      return [];
    const isMovie = mediaType === "movie";
    const ep = isMovie ? 1 : Number(episode || season || 1) || 1;
    const targets = [];
    if (parsed.kind === "imdb") {
      const tt = "tt" + parsed.number;
      const ok = yield malFromImdb(tt, isMovie ? 1 : season || 1, ep);
      if (ok) {
        targets.push({ prefix: "mal", id: ok.malId, episode: ok.malEpisode });
        targets.push({ prefix: "ani", id: ok.malId, episode: ok.malEpisode });
      }
      return targets;
    }
    const kind = parsed.kind;
    if (kind === "mal" || kind === "myanimelist") {
      return [
        { prefix: "mal", id: parsed.number, episode: ep },
        { prefix: "ani", id: parsed.number, episode: ep }
      ];
    }
    if (kind === "ani" || kind === "anime" || kind === "anilist") {
      return [
        { prefix: "ani", id: parsed.number, episode: ep },
        { prefix: "mal", id: parsed.number, episode: ep }
      ];
    }
    if (kind === "kitsu") {
      const aniId = yield kitsuToAnilist(parsed.number);
      if (aniId) {
        return [
          { prefix: "ani", id: aniId, episode: ep },
          { prefix: "mal", id: aniId, episode: ep }
        ];
      }
      return [];
    }
    return [
      { prefix: "mal", id: parsed.number, episode: ep },
      { prefix: "ani", id: parsed.number, episode: ep }
    ];
  });
}
function toSubtitle(track) {
  const lang = track && track.label || "Undetermined";
  return {
    url: track.file,
    language: lang,
    name: track.label || null,
    headers: __spreadValues({}, PLAYBACK_HEADERS)
  };
}
function masterFor(target, audio, logRaw) {
  return __async(this, null, function* () {
    const { prefix, id, episode } = target;
    const where = `${prefix}/${id}`;
    let fileId = null;
    try {
      fileId = yield fetchFileId(prefix, id, episode, audio);
    } catch (e) {
      console.warn(`[MegaPlay] ${where} ep${episode} ${audio} fetch fail: ${e.message}`);
    }
    if (!fileId) {
      console.log(`[MegaPlay] ${where} ep${episode} ${audio}: no file id (${logRaw})`);
      return null;
    }
    try {
      const { file, tracks } = yield getSourcesData(fileId);
      console.log(`[MegaPlay] ${where} ep${episode} ${audio}: file ${fileId} -> ${file.slice(0, 70)} (${tracks.length} subs)`);
      return { url: file, subtitles: tracks.map(toSubtitle) };
    } catch (e) {
      console.warn(`[MegaPlay] getSources(${fileId}) failed: ${e.message}`);
      return null;
    }
  });
}
function extractStreams(meta) {
  return __async(this, null, function* () {
    const { targets, label, raw } = meta;
    if (!targets || targets.length === 0)
      return [];
    const streams = [];
    const usedEp = targets[0].episode;
    for (const audio of ["sub", "dub"]) {
      let resolved = null;
      for (const target of targets) {
        resolved = yield masterFor(target, audio, raw);
        if (resolved)
          break;
      }
      if (!resolved)
        continue;
      const track = audio === "dub" ? "DUB" : "SUB";
      streams.push({
        name: label,
        title: `MegaPlay (${track}) ep.${usedEp}`,
        quality: "auto",
        url: resolved.url,
        headers: __spreadValues({}, PLAYBACK_HEADERS),
        subtitles: resolved.subtitles
      });
    }
    return streams;
  });
}

// src/megaplay/index.js
var LABEL = "MegaPlay";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(
      `[MegaPlay] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(mediaType)} season=${season} episode=${episode}`
    );
    const parsed = classifyRawId(tmdbId);
    if (!parsed || parsed.kind === "unknown") {
      console.warn(`[MegaPlay] unsupported id "${tmdbId}"`);
      return [];
    }
    try {
      const targets = yield resolveToTargets(
        parsed,
        (mediaType || "tv").toLowerCase(),
        season,
        episode
      );
      if (!targets || targets.length === 0) {
        console.log(`[MegaPlay] no resolvable target for "${tmdbId}"`);
        return [];
      }
      const streams = yield extractStreams({ targets, label: LABEL, raw: String(tmdbId) });
      console.log(
        `[MegaPlay] resolved ${streams.length} stream(s) for ${JSON.stringify(tmdbId)}`
      );
      return streams;
    } catch (error) {
      console.error(`[MegaPlay] Error: ${error.message}`, error && error.stack ? error.stack : "");
      return [];
    }
  });
}
module.exports = { getStreams };
