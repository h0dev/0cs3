/**
 * abdx - Built from src/abdx/
 * Generated: 2026-09-05T23:58:16.290Z
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// src/abdx/sha256.js
var require_sha256 = __commonJS({
  "src/abdx/sha256.js"(exports2, module2) {
    var K = [
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
    var H0 = [
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ];
    function rotr(x, n) {
      return x >>> n | x << 32 - n;
    }
    function sha256BytesAscii(ascii) {
      const w = new Array(64);
      const H = H0.slice();
      const bytes = [];
      for (let i = 0; i < ascii.length; i++)
        bytes.push(ascii.charCodeAt(i) & 255);
      const bitLen = bytes.length * 8;
      bytes.push(128);
      while (bytes.length % 64 !== 56)
        bytes.push(0);
      for (let j = 7; j >= 0; j--)
        bytes.push(Math.floor(bitLen / Math.pow(2, 8 * j)) & 255);
      for (let off = 0; off < bytes.length; off += 64) {
        for (let t = 0; t < 16; t++) {
          w[t] = bytes[off + t * 4] << 24 | bytes[off + t * 4 + 1] << 16 | bytes[off + t * 4 + 2] << 8 | bytes[off + t * 4 + 3];
        }
        for (let t = 16; t < 64; t++) {
          const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ w[t - 15] >>> 3;
          const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ w[t - 2] >>> 10;
          w[t] = w[t - 16] + s0 + w[t - 7] + s1 | 0;
        }
        let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
        for (let t = 0; t < 64; t++) {
          const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
          const ch = e & f ^ ~e & g;
          const t1 = h + S1 + ch + K[t] + w[t] | 0;
          const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
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
        H[0] = H[0] + a | 0;
        H[1] = H[1] + b | 0;
        H[2] = H[2] + c | 0;
        H[3] = H[3] + d | 0;
        H[4] = H[4] + e | 0;
        H[5] = H[5] + f | 0;
        H[6] = H[6] + g | 0;
        H[7] = H[7] + h | 0;
      }
      const out = new Uint8Array(32);
      for (let i = 0; i < 8; i++) {
        out[i * 4] = H[i] >>> 24 & 255;
        out[i * 4 + 1] = H[i] >>> 16 & 255;
        out[i * 4 + 2] = H[i] >>> 8 & 255;
        out[i * 4 + 3] = H[i] & 255;
      }
      return out;
    }
    function leadingZeroBits(g) {
      let bits = 0, i = 0;
      while (i < g.length) {
        const b = g[i];
        if (b === 0) {
          bits += 8;
          i++;
          continue;
        }
        let x = b;
        while (x < 128) {
          bits++;
          x <<= 1;
        }
        break;
      }
      return bits;
    }
    function solvePow(challenge, difficulty) {
      const need = difficulty | 0 || 18;
      const cap = 1 << 24;
      let nonce = 0;
      for (; ; ) {
        const g = sha256BytesAscii(challenge + ":" + nonce);
        if (leadingZeroBits(g) >= need)
          return String(nonce);
        nonce++;
        if (nonce > cap)
          throw new Error("abdx pow cap exceeded");
      }
    }
    module2.exports = { sha256BytesAscii, leadingZeroBits, solvePow };
  }
});

// src/abdx/codec.js
var require_codec = __commonJS({
  "src/abdx/codec.js"(exports2, module2) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function utf8Encode(str) {
      const out = [];
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        if (c < 128) {
          out.push(c);
        } else if (c < 2048) {
          out.push(192 | c >> 6, 128 | c & 63);
        } else if (c >= 55296 && c <= 56319 && i + 1 < str.length) {
          const lo = str.charCodeAt(i + 1);
          if (lo >= 56320 && lo <= 57343) {
            const cp = 65536 + (c - 55296 << 10) + (lo - 56320);
            out.push(
              240 | cp >> 18,
              128 | cp >> 12 & 63,
              128 | cp >> 6 & 63,
              128 | cp & 63
            );
            i++;
            continue;
          }
          out.push(239, 191, 189);
        } else if (c < 65536) {
          out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
        } else {
          out.push(
            240 | c >> 18,
            128 | c >> 12 & 63,
            128 | c >> 6 & 63,
            128 | c & 63
          );
        }
      }
      return out;
    }
    function utf8Decode(bytes) {
      let out = "", i = 0;
      const n = bytes.length;
      while (i < n) {
        const b = bytes[i];
        if (b < 128) {
          out += String.fromCharCode(b);
          i++;
        } else if ((b & 224) === 192 && i + 1 < n) {
          out += String.fromCharCode((b & 31) << 6 | bytes[i + 1] & 63);
          i += 2;
        } else if ((b & 240) === 224 && i + 2 < n) {
          out += String.fromCharCode(
            (b & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63
          );
          i += 3;
        } else if ((b & 248) === 240 && i + 3 < n) {
          const cp = (b & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
          if (cp > 65535) {
            const c = cp - 65536;
            out += String.fromCharCode(55296 + (c >> 10), 56320 + (c & 1023));
          } else
            out += String.fromCharCode(cp);
          i += 4;
        } else {
          out += "\uFFFD";
          i++;
        }
      }
      return out;
    }
    function bytesToHex(bytes) {
      let s = "";
      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i] & 255;
        s += (b < 16 ? "0" : "") + b.toString(16);
      }
      return s;
    }
    function hexToBytes(hex) {
      let h = String(hex || "").trim();
      if (h.length % 2)
        h = "0" + h;
      const out = [];
      for (let i = 0; i < h.length; i += 2) {
        out.push(parseInt(h.slice(i, i + 2), 16));
      }
      return out;
    }
    function bytesToBase64(bytes) {
      let out = "";
      for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i] & 255;
        const b1 = i + 1 < bytes.length ? bytes[i + 1] & 255 : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] & 255 : 0;
        const pad = bytes.length - i;
        out += B64[b0 >> 2];
        out += B64[(b0 & 3) << 4 | b1 >> 4];
        out += pad > 1 ? B64[(b1 & 15) << 2 | b2 >> 6] : "=";
        out += pad > 2 ? B64[b2 & 63] : "=";
      }
      return out;
    }
    function base64ToBytes(str) {
      const s = String(str || "").replace(/[-_]/g, (m) => m === "-" ? "+" : "/");
      let clean = "";
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === "=")
          break;
        if (B64.indexOf(c) >= 0)
          clean += c;
      }
      const out = [];
      for (let i = 0; i < clean.length; i += 4) {
        const c0 = B64.indexOf(clean[i]);
        const c1 = i + 1 < clean.length ? B64.indexOf(clean[i + 1]) : 0;
        const c2 = i + 2 < clean.length ? B64.indexOf(clean[i + 2]) : 0;
        const c3 = i + 3 < clean.length ? B64.indexOf(clean[i + 3]) : 0;
        out.push(c0 << 2 | c1 >> 4);
        if (i + 2 < clean.length)
          out.push((c1 & 15) << 4 | c2 >> 2);
        if (i + 3 < clean.length)
          out.push((c2 & 3) << 6 | c3);
      }
      return out;
    }
    function bytesToBase64Url(bytes) {
      return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    function base64UrlToBytes(str) {
      return base64ToBytes(String(str || ""));
    }
    module2.exports = {
      utf8Encode,
      utf8Decode,
      bytesToHex,
      hexToBytes,
      bytesToBase64,
      base64ToBytes,
      bytesToBase64Url,
      base64UrlToBytes
    };
  }
});

// src/abdx/crypto.js
var require_crypto = __commonJS({
  "src/abdx/crypto.js"(exports2, module2) {
    var { utf8Encode, utf8Decode, bytesToHex, hexToBytes, bytesToBase64Url, base64UrlToBytes } = require_codec();
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
    function hasBridge() {
      return typeof globalThis !== "undefined" && typeof globalThis.__crypto_aes_encrypt_hex === "function" && typeof globalThis.__crypto_aes_decrypt_hex === "function";
    }
    function hasSubtle() {
      return typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle && typeof globalThis.crypto.subtle.importKey === "function";
    }
    function randomIv() {
      if (typeof globalThis !== "undefined" && typeof globalThis.__crypto_get_random_values_hex === "function") {
        return hexToBytes(globalThis.__crypto_get_random_values_hex(12));
      }
      const nc = nodeCrypto();
      if (nc)
        return Array.from(nc.randomBytes(12));
      const out = [];
      for (let i = 0; i < 12; i++)
        out.push(Math.floor(Math.random() * 256));
      return out;
    }
    function aesGcmEncryptBytes(keyHex, ivBytes, plainBytes) {
      return __async(this, null, function* () {
        if (hasBridge()) {
          const ctHex = globalThis.__crypto_aes_encrypt_hex("AES-GCM", keyHex, bytesToHex(ivBytes), bytesToHex(plainBytes));
          return hexToBytes(ctHex);
        }
        const nc = nodeCrypto();
        if (nc) {
          const iv = Buffer.from(ivBytes);
          const key = Buffer.from(keyHex, "hex");
          const c = nc.createCipheriv("aes-256-gcm", key, iv);
          const ct = Buffer.concat([c.update(Buffer.from(plainBytes)), c.final()]);
          return Array.from(Buffer.concat([ct, c.getAuthTag()]));
        }
        if (hasSubtle()) {
          const key = yield globalThis.crypto.subtle.importKey(
            "raw",
            hexToBytes(keyHex),
            { name: "AES-GCM" },
            false,
            ["encrypt"]
          );
          const ctBuf = yield globalThis.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBytes), tagLength: 128 },
            key,
            new Uint8Array(plainBytes)
          );
          return Array.from(new Uint8Array(ctBuf));
        }
        throw new Error("abdx: no AES-GCM backend available");
      });
    }
    function aesGcmDecryptBytes(keyHex, ivBytes, dataBytes) {
      return __async(this, null, function* () {
        if (hasBridge()) {
          const ptHex = globalThis.__crypto_aes_decrypt_hex("AES-GCM", keyHex, bytesToHex(ivBytes), bytesToHex(dataBytes));
          return hexToBytes(ptHex);
        }
        const nc = nodeCrypto();
        if (nc) {
          const iv = Buffer.from(ivBytes);
          const key = Buffer.from(keyHex, "hex");
          const data = Buffer.from(dataBytes);
          const d = nc.createDecipheriv("aes-256-gcm", key, iv);
          d.setAuthTag(data.slice(-16));
          return Array.from(Buffer.concat([d.update(data.slice(0, -16)), d.final()]));
        }
        if (hasSubtle()) {
          const key = yield globalThis.crypto.subtle.importKey(
            "raw",
            hexToBytes(keyHex),
            { name: "AES-GCM" },
            false,
            ["decrypt"]
          );
          const ptBuf = yield globalThis.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(ivBytes), tagLength: 128 },
            key,
            new Uint8Array(dataBytes)
          );
          return Array.from(new Uint8Array(ptBuf));
        }
        throw new Error("abdx: no AES-GCM backend available");
      });
    }
    function encryptObjectToE(keyHex, obj) {
      return __async(this, null, function* () {
        const plain = utf8Encode(JSON.stringify(obj));
        const iv = randomIv();
        const ct = yield aesGcmEncryptBytes(keyHex, iv, plain);
        const wire = iv.concat(ct);
        return bytesToBase64Url(wire);
      });
    }
    function decryptEToObject(keyHex, eStr) {
      return __async(this, null, function* () {
        const wire = base64UrlToBytes(eStr);
        const iv = wire.slice(0, 12);
        const data = wire.slice(12);
        const pt = yield aesGcmDecryptBytes(keyHex, iv, data);
        const text = utf8Decode(pt);
        return JSON.parse(text);
      });
    }
    module2.exports = { encryptObjectToE, decryptEToObject, aesGcmEncryptBytes, aesGcmDecryptBytes, randomIv };
  }
});

// src/abdx/api.js
var require_api = __commonJS({
  "src/abdx/api.js"(exports2, module2) {
    var { solvePow } = require_sha256();
    var { encryptObjectToE, decryptEToObject } = require_crypto();
    var { base64UrlToBytes } = require_codec();
    var BASE = "https://abdx.tv/";
    var CHALLENGE_URL = BASE + "pow/challenge";
    var REDEEM_URL = BASE + "pow/redeem";
    var STREAM_URL = BASE + "movies/stream";
    var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var sessionCache = null;
    function getJson(url, headers) {
      return __async(this, null, function* () {
        let lastErr;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const res = yield fetch(url, { method: "GET", headers: headers || {} });
            const txt = yield res.text();
            if (!res.ok)
              throw new Error("HTTP " + res.status + " " + url + " :: " + txt.slice(0, 120));
            return JSON.parse(txt);
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error("GET failed " + url);
      });
    }
    function getSession2() {
      return __async(this, null, function* () {
        const now = Date.now();
        if (sessionCache && sessionCache.expMs - now > 12e4)
          return sessionCache;
        const ch = yield getJson(CHALLENGE_URL, { "User-Agent": BROWSER_UA, Accept: "application/json" });
        if (!ch || !ch.challenge || !ch.difficulty)
          throw new Error("abdx: unexpected /pow/challenge reply");
        const nonce = solvePow(ch.challenge, ch.difficulty);
        console.log(`[ABDX] pow solved nonce=${nonce} difficulty=${ch.difficulty}`);
        let res;
        try {
          res = yield fetch(REDEEM_URL, {
            method: "POST",
            headers: {
              "User-Agent": BROWSER_UA,
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              challenge: ch.challenge,
              difficulty: ch.difficulty,
              ts: ch.ts,
              sig: ch.sig,
              nonce
            })
          });
        } catch (e) {
          throw new Error("abdx redeem network error: " + e.message);
        }
        const txt = yield res.text();
        if (!res.ok)
          throw new Error("abdx redeem HTTP " + res.status + " :: " + txt.slice(0, 150));
        let j;
        try {
          j = JSON.parse(txt);
        } catch (e) {
          throw new Error("abdx redeem bad json: " + txt.slice(0, 150));
        }
        if (!j.token || !j.key)
          throw new Error("abdx redeem missing token/key: " + txt.slice(0, 150));
        sessionCache = {
          token: j.token,
          key: j.key,
          expMs: j.exp ? j.exp * 1e3 : now + 36e5
        };
        console.log(`[ABDX] session token=${j.token.slice(0, 8)}\u2026 key=${j.key.slice(0, 8)}\u2026 ttl=${j.ttl || 3600}s`);
        return sessionCache;
      });
    }
    function fetchStream2(payload) {
      return __async(this, null, function* () {
        const attempt = () => __async(this, null, function* () {
          const sess = yield getSession2();
          const bodyE = yield encryptObjectToE(sess.key, payload);
          const res = yield fetch(STREAM_URL, {
            method: "POST",
            headers: {
              "User-Agent": BROWSER_UA,
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-ABDX-PoW": sess.token
            },
            body: JSON.stringify({ e: bodyE })
          });
          const txt = yield res.text();
          if (res.status === 401) {
            const err = new Error("unauthorized");
            err.status = 401;
            throw err;
          }
          if (!res.ok) {
            const err = new Error("abdx stream HTTP " + res.status + " :: " + txt.slice(0, 150));
            err.status = res.status;
            throw err;
          }
          let j;
          try {
            j = JSON.parse(txt);
          } catch (e) {
            throw new Error("abdx stream bad json: " + txt.slice(0, 150));
          }
          if (!j || typeof j.e !== "string") {
            throw new Error("abdx stream unexpected reply: " + txt.slice(0, 200));
          }
          return decryptEToObject(sess.key, j.e);
        });
        try {
          return yield attempt();
        } catch (e) {
          if (e.status === 401) {
            sessionCache = null;
            return attempt();
          }
          throw e;
        }
      });
    }
    module2.exports = { getSession: getSession2, fetchStream: fetchStream2, STREAM_URL, BROWSER_UA, base64UrlToBytes };
  }
});

// src/abdx/resolve.js
var require_resolve = __commonJS({
  "src/abdx/resolve.js"(exports2, module2) {
    var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    var CDN_REFERER = "https://nextgencloudfabric.com/";
    function siteHeaders2() {
      return {
        Referer: CDN_REFERER,
        "User-Agent": BROWSER_UA
      };
    }
    function resolveNumericId2(raw) {
      if (raw == null)
        return null;
      const s = String(raw).trim();
      if (!s)
        return null;
      if (/^\d+$/.test(s))
        return s;
      const m = /^(?:tmdb|movie|series|tv|show):(\d+)/i.exec(s);
      return m ? m[1] : null;
    }
    function imdbToTmdb2(tt, mediaType) {
      return __async(this, null, function* () {
        const clean = String(tt || "").trim();
        if (!/^tt\d+$/i.test(clean))
          return null;
        const kind = String(mediaType || "movie").toLowerCase() === "tv" ? "series" : "movie";
        const url = `https://v3-cinemeta.strem.io/meta/${kind}/${clean}.json`;
        try {
          const res = yield fetch(url, {
            method: "GET",
            headers: { "User-Agent": BROWSER_UA, Accept: "application/json" }
          });
          if (!res.ok) {
            console.log(`[ABDX][debug] imdb->tmdb ${clean} cinemeta HTTP ${res.status}`);
            return null;
          }
          const json = JSON.parse(yield res.text());
          const mid = json && json.meta ? json.meta.moviedb_id : null;
          console.log(`[ABDX][debug] imdb->tmdb ${clean} -> ${mid != null ? `moviedb_id=${mid}` : "absent"}`);
          return mid != null ? String(mid) : null;
        } catch (e) {
          console.warn(`[ABDX][debug] imdb->tmdb ${clean} error: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { BROWSER_UA, CDN_REFERER, siteHeaders: siteHeaders2, resolveNumericId: resolveNumericId2, imdbToTmdb: imdbToTmdb2 };
  }
});

// src/abdx/index.js
var { getSession, fetchStream } = require_api();
var { imdbToTmdb, resolveNumericId, siteHeaders } = require_resolve();
var LABEL = "ABDX";
var CINEMAOS_WATCH = "https://cinemaos.live/watch";
function watchUrlFor(tmdbId, mediaType, season, episode) {
  const isMovie = String(mediaType || "tv").toLowerCase() === "movie";
  if (isMovie)
    return `${CINEMAOS_WATCH}/${tmdbId}`;
  const s = Number(season) || 1;
  const e = Number(episode) || 1;
  return `${CINEMAOS_WATCH}/${tmdbId}/${s}/${e}`;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(
      `[ABDX] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(mediaType)} season=${season} episode=${episode}`
    );
    const mt = String(mediaType || "tv").toLowerCase();
    const isMovie = mt === "movie";
    const inId = String(tmdbId == null ? "" : tmdbId).trim();
    let num = resolveNumericId(inId);
    let idOrigin = "tmdb-id";
    if (!num && /^tt/i.test(inId)) {
      const mapped = yield imdbToTmdb(inId, mt);
      if (mapped) {
        num = mapped;
        idOrigin = `imdb[${inId}]->cinemeta->tmdb[${mapped}]`;
      } else {
        console.log(`[ABDX] imdb ${inId} unmapped (no moviedb_id in cinemeta). No streams.`);
        return [];
      }
    }
    console.log(`[ABDX] tmdb=${num || "(none)"} movie=${isMovie} (via ${idOrigin})`);
    if (!num)
      return [];
    const seasonNo = isMovie ? null : Number(season) || 1;
    const episodeNo = isMovie ? null : Number(episode) || 1;
    const payload = {
      watch_url: watchUrlFor(num, mt, seasonNo, episodeNo),
      imdb_id: "",
      tmdb_id: String(num),
      media_type: isMovie ? "movie" : "tv",
      season: seasonNo,
      episode: episodeNo,
      title: "",
      year: ""
    };
    let result;
    try {
      result = yield fetchStream(payload);
    } catch (e) {
      console.warn(`[ABDX] stream exchange failed: ${e.message}`);
      return [];
    }
    if (!result || typeof result !== "object") {
      console.log("[ABDX] empty/odd stream reply");
      return [];
    }
    const mirrors = Array.isArray(result.stream_urls) ? result.stream_urls : [];
    const main = result.hls_url || mirrors[0];
    if (!main) {
      console.log(`[ABDX] title not found on abdx (${payload.watch_url}) -> no streams`);
      return [];
    }
    const seen = /* @__PURE__ */ new Set();
    const urls = [];
    if (main) {
      seen.add(main);
      urls.push(main);
    }
    for (const u of mirrors) {
      if (u && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
    const hdrs = result.headers && typeof result.headers === "object" && result.headers.Referer ? result.headers : siteHeaders();
    console.log(`[ABDX] resolved ${urls.length} master(s) for ${payload.watch_url}`);
    const rows = urls.map((u, i) => {
      const base = i === 0 ? LABEL : `${LABEL} \u2022 Server ${i + 1}`;
      return {
        name: isMovie ? base : `${base} \u2022 S${seasonNo}E${episodeNo}`,
        url: u,
        headers: hdrs,
        quality: ""
      };
    });
    console.log(`[ABDX] \u2192 ${rows.length} stream(s)`);
    return rows;
  });
}
module.exports = { getStreams };
