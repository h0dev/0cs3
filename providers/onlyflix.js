/**
 * onlyflix - Built from src/onlyflix/
 * Generated: 2026-09-25T12:55:42.329Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
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

// src/onlyflix/http.js
var require_http = __commonJS({
  "src/onlyflix/http.js"(exports2, module2) {
    var SITE = "https://onlyflix.to";
    var VIDAPI = "https://vidapi.xyz";
    var VSCDN = "https://vscdn.xyz";
    var BROWSER_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36";
    var EMBED_HEADERS = {
      "User-Agent": BROWSER_UA,
      Referer: SITE + "/",
      Origin: SITE,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9"
    };
    var VIDAPI_HEADERS = {
      "User-Agent": BROWSER_UA,
      Referer: VIDAPI + "/",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    };
    var VSCDN_HEADERS = {
      "User-Agent": BROWSER_UA,
      Referer: VSCDN + "/",
      Accept: "*/*"
    };
    var PLAYBACK_HEADERS = {
      "User-Agent": BROWSER_UA,
      Referer: VSCDN + "/",
      Origin: VSCDN
    };
    function fetchText(_0) {
      return __async(this, arguments, function* (url, headers = {}, attempts = 3) {
        let lastErr = null;
        for (let i = 0; i < attempts; i++) {
          try {
            const res = yield fetch(url, { method: "GET", headers, redirect: "follow" });
            if (!res.ok)
              throw new Error(`HTTP ${res.status} for ${url}`);
            return yield res.text();
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error(`GET failed ${url}`);
      });
    }
    function decodeEntities(value) {
      if (!value)
        return value;
      return String(value).replace(/&amp;/g, "&").replace(/&#0?38;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
    function normalizeId(raw) {
      const parsed = classifyId2(raw);
      return parsed ? parsed.value : null;
    }
    function classifyId2(raw) {
      const s = String(raw == null ? "" : raw).trim();
      if (!s)
        return null;
      const m = /^([a-z_]+):(tt\d+|\d+)$/i.exec(s);
      if (m) {
        const tag = m[1].toLowerCase();
        const payload = m[2].toLowerCase();
        if (payload.startsWith("tt") || ["imdb", "tt"].includes(tag)) {
          return payload.startsWith("tt") ? { kind: "imdb", value: payload } : { kind: "imdb", value: "tt" + payload };
        }
        if (["tmdb", "movie", "tv", "series", "show", "tmdbid"].includes(tag)) {
          return { kind: "tmdb", value: payload };
        }
        return null;
      }
      if (/^tt\d+$/i.test(s))
        return { kind: "imdb", value: s.toLowerCase() };
      if (/^\d+$/.test(s))
        return { kind: "tmdb", value: s };
      return null;
    }
    module2.exports = {
      SITE,
      VIDAPI,
      VSCDN,
      BROWSER_UA,
      EMBED_HEADERS,
      VIDAPI_HEADERS,
      VSCDN_HEADERS,
      PLAYBACK_HEADERS,
      fetchText,
      decodeEntities,
      normalizeId,
      classifyId: classifyId2
    };
  }
});

// src/onlyflix/ids.js
var require_ids = __commonJS({
  "src/onlyflix/ids.js"(exports2, module2) {
    var { BROWSER_UA } = require_http();
    var WD_ENDPOINT = "https://query.wikidata.org/sparql";
    var WD_UA = `${BROWSER_UA} OnlyFlixNuvio/1.0 (+https://github.com/hung319/nuvix)`;
    var TMDB_PROP = { tv: "P4983", movie: "P4947" };
    function sparql(query) {
      return __async(this, null, function* () {
        const url = `${WD_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;
        const res = yield fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": WD_UA,
            Accept: "application/sparql-results+json"
          }
        });
        if (!res.ok)
          throw new Error(`HTTP ${res.status}`);
        const json = JSON.parse(yield res.text());
        const rows = json && json.results && json.results.bindings || [];
        for (const row of rows) {
          const value = row && row.imdb && row.imdb.value;
          if (value && /^tt\d+$/.test(value))
            return value;
        }
        return null;
      });
    }
    function tmdbToImdb2(tmdbId, isMovie) {
      return __async(this, null, function* () {
        const num = String(tmdbId == null ? "" : tmdbId).trim();
        if (!/^\d+$/.test(num))
          return null;
        const first = isMovie ? TMDB_PROP.movie : TMDB_PROP.tv;
        const second = isMovie ? TMDB_PROP.tv : TMDB_PROP.movie;
        for (const prop of [first, second]) {
          try {
            const imdb = yield sparql(`SELECT ?imdb WHERE { ?x wdt:${prop} "${num}"; wdt:P345 ?imdb }`);
            if (imdb) {
              console.log(`[OnlyFlix] tmdb ${num} -> imdb ${imdb} (wikidata ${prop})`);
              return imdb;
            }
          } catch (e) {
            console.warn(`[OnlyFlix] wikidata ${prop} lookup for ${num} failed: ${e.message}`);
          }
        }
        console.log(`[OnlyFlix] tmdb ${num} has no IMDb cross-reference on Wikidata`);
        return null;
      });
    }
    module2.exports = { tmdbToImdb: tmdbToImdb2 };
  }
});

// src/onlyflix/packer.js
var require_packer = __commonJS({
  "src/onlyflix/packer.js"(exports2, module2) {
    var DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    function toBase(n, base) {
      if (n === 0)
        return "0";
      let out = "";
      let x = Math.abs(Math.trunc(n));
      while (x > 0) {
        out = DIGITS[x % base] + out;
        x = Math.floor(x / base);
      }
      return out;
    }
    function readStringLiteral(text) {
      const src = String(text || "");
      let i = 0;
      while (i < src.length && /\s/.test(src[i]))
        i++;
      const quote = src[i];
      if (quote !== "'" && quote !== '"')
        return null;
      i++;
      let value = "";
      for (; i < src.length; i++) {
        const c = src[i];
        if (c === "\\") {
          const n = src[++i];
          switch (n) {
            case "n":
              value += "\n";
              break;
            case "r":
              value += "\r";
              break;
            case "t":
              value += "	";
              break;
            case "b":
              value += "\b";
              break;
            case "f":
              value += "\f";
              break;
            case "v":
              value += "\v";
              break;
            case "0":
              value += "\0";
              break;
            case "x":
              value += String.fromCharCode(parseInt(src.substr(i + 1, 2), 16) || 0);
              i += 2;
              break;
            case "u":
              value += String.fromCharCode(parseInt(src.substr(i + 1, 4), 16) || 0);
              i += 4;
              break;
            case "\n":
              break;
            case void 0:
              break;
            default:
              value += n;
          }
          continue;
        }
        if (c === quote)
          return { value, rest: src.slice(i + 1) };
        value += c;
      }
      return { value, rest: "" };
    }
    function splitTopLevel(args) {
      const parts = [];
      let depth = 0;
      let quote = null;
      let cur = "";
      const src = String(args || "");
      for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (quote) {
          cur += c;
          if (c === "\\") {
            cur += src[++i] || "";
            continue;
          }
          if (c === quote)
            quote = null;
          continue;
        }
        if (c === "'" || c === '"') {
          quote = c;
          cur += c;
          continue;
        }
        if (c === "(" || c === "[" || c === "{")
          depth++;
        if (c === ")" || c === "]" || c === "}")
          depth--;
        if (c === "," && depth === 0) {
          parts.push(cur);
          cur = "";
          continue;
        }
        cur += c;
      }
      parts.push(cur);
      return parts;
    }
    function unpack(source) {
      const src = String(source || "").trim();
      const m = /eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\(([\s\S]*)\)\)\s*;?\s*$/.exec(src);
      if (!m)
        return null;
      const args = splitTopLevel(m[1]);
      if (args.length < 4)
        return null;
      const packedLit = readStringLiteral(args[0]);
      const wordsLit = readStringLiteral(args[3]);
      const base = parseInt(String(args[1]).trim(), 10);
      const count = parseInt(String(args[2]).trim(), 10);
      if (!packedLit || !wordsLit || !base || !count || base > 62)
        return null;
      const words = wordsLit.value.split("|");
      let out = packedLit.value;
      for (let i = count - 1; i >= 0; i--) {
        const word = words[i];
        if (!word)
          continue;
        const token = toBase(i, base);
        if (!token)
          continue;
        out = out.replace(new RegExp("\\b" + token + "\\b", "g"), () => word);
      }
      return out;
    }
    function extractStreamLinks(pageHtml) {
      const found = { hls2: null, hls3: null, hls4: null, source: "none" };
      const html = String(pageHtml || "");
      const packed = /<script[^>]*>([\s\S]*?eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/.exec(html);
      const js = packed ? unpack(packed[1]) : null;
      if (js) {
        for (const key of ["hls4", "hls3", "hls2"]) {
          const m = new RegExp('"' + key + '"\\s*:\\s*"([^"]+)"').exec(js);
          if (m && m[1])
            found[key] = m[1];
        }
        if (found.hls2 || found.hls3 || found.hls4)
          found.source = "packed";
      }
      if (!found.hls2 && !found.hls3 && !found.hls4) {
        const hay = js || html;
        const urls = (hay.match(/https?:\/\/[^"'\\\s]+?master\.(?:m3u8|txt)[^"'\\\s]*/g) || []).filter((u) => !/jquery|googleapis/i.test(u));
        if (urls[0])
          found.hls2 = urls[0];
        const rel = /"?(?:hls4|file)"?\s*:\s*"(\/stream\/[^"]+\.m3u8[^"]*)"/.exec(hay);
        if (rel)
          found.hls4 = rel[1];
        if (urls[0] || rel)
          found.source = "fallback";
      }
      return found;
    }
    var ISO2 = {
      eng: "en",
      spa: "es",
      por: "pt",
      fra: "fr",
      fre: "fr",
      deu: "de",
      ger: "de",
      ita: "it",
      rus: "ru",
      ara: "ar",
      hin: "hi",
      ben: "bn",
      tam: "ta",
      tel: "te",
      mal: "ml",
      urd: "ur",
      tha: "th",
      vie: "vi",
      ind: "id",
      may: "ms",
      msa: "ms",
      fil: "fil",
      tgl: "tl",
      jpn: "ja",
      kor: "ko",
      zho: "zh",
      chi: "zh",
      pol: "pl",
      tur: "tr",
      nld: "nl",
      dut: "nl",
      swe: "sv",
      nor: "no",
      dan: "da",
      fin: "fi",
      ell: "el",
      gre: "el",
      heb: "he",
      hun: "hu",
      ces: "cs",
      cze: "cs",
      ron: "ro",
      rum: "ro",
      ukr: "uk",
      bul: "bg",
      hrv: "hr",
      srp: "sr",
      slk: "sk",
      slo: "sk",
      slv: "sl",
      lit: "lt",
      lav: "lv",
      est: "et",
      fas: "fa",
      per: "fa",
      khm: "km",
      lao: "lo",
      nep: "ne",
      sin: "si",
      swa: "sw",
      afr: "af",
      isl: "is",
      ice: "is",
      cat: "ca",
      glg: "gl",
      eus: "eu",
      baq: "eu",
      bos: "bs",
      mkd: "mk",
      sqi: "sq",
      alb: "sq",
      hye: "hy",
      arm: "hy",
      kat: "ka",
      geo: "ka",
      aze: "az",
      kaz: "kk",
      uzb: "uz",
      amh: "am",
      yor: "yo",
      zul: "zu",
      hat: "ht",
      mya: "my",
      bur: "my"
    };
    function extractTracks(pageHtml) {
      const html = String(pageHtml || "");
      const packed = /<script[^>]*>([\s\S]*?eval\(function\(p,a,c,k,e,d\)[\s\S]*?)<\/script>/.exec(html);
      const js = packed ? unpack(packed[1]) : null;
      if (!js)
        return [];
      const tracks = [];
      const seen = /* @__PURE__ */ new Set();
      const re = /\{file:"([^"]+\.vtt)"([^}]*)\}/g;
      let m;
      while ((m = re.exec(js)) !== null) {
        const url = m[1];
        if (seen.has(url))
          continue;
        seen.add(url);
        const rest = m[2] || "";
        const label = (/,label:"([^"]*)"/.exec(rest) || [])[1] || null;
        const isDefault = /[,{]"default":\s*(true|!0)/.test(rest);
        const code = (/[_\-]([a-z]{2,3})\.vtt$/i.exec(url) || [])[1] || "";
        const key = code.toLowerCase();
        tracks.push({
          url,
          language: ISO2[key] || key || "und",
          name: label || (key ? key.toUpperCase() : null),
          default: isDefault
        });
      }
      tracks.sort((a, b) => Number(b.default) - Number(a.default));
      return tracks;
    }
    module2.exports = { unpack, extractStreamLinks, extractTracks, readStringLiteral, toBase };
  }
});

// src/onlyflix/extractor.js
var require_extractor = __commonJS({
  "src/onlyflix/extractor.js"(exports2, module2) {
    var {
      VSCDN,
      VIDAPI,
      EMBED_HEADERS,
      VIDAPI_HEADERS,
      VSCDN_HEADERS,
      PLAYBACK_HEADERS,
      fetchText,
      decodeEntities
    } = require_http();
    var { extractStreamLinks, extractTracks } = require_packer();
    var LABEL2 = "OnlyFlix";
    var MAX_STREAMS = 2;
    function embedUrl(id, isMovie, season, episode) {
      return isMovie ? `${VIDAPI}/embed/movie/${encodeURIComponent(id)}` : `${VIDAPI}/embed/tv/${encodeURIComponent(id)}/${season || 1}/${episode || 1}`;
    }
    function absolutize(url) {
      if (!url)
        return null;
      if (url.startsWith("//"))
        return "https:" + url;
      if (url.startsWith("/"))
        return VSCDN + url;
      return url;
    }
    function vscdnPageUrl(swishUrl) {
      return __async(this, null, function* () {
        let fileCode = (/[?&]id=([A-Za-z0-9_-]{4,})/.exec(swishUrl) || [])[1] || null;
        if (!fileCode) {
          try {
            const html = yield fetchText(swishUrl, VIDAPI_HEADERS);
            fileCode = (/<iframe[^>]*\bsrc="([A-Za-z0-9_-]{4,})"/.exec(html) || [])[1] || null;
          } catch (e) {
            console.warn(`[${LABEL2}] swish page failed: ${e.message}`);
          }
        }
        return fileCode ? `${VSCDN}/e/${fileCode}` : null;
      });
    }
    function probeMaster(url) {
      return __async(this, null, function* () {
        try {
          const body = yield fetchText(url, VSCDN_HEADERS, 2);
          if (!body || body.indexOf("#EXTM3U") < 0) {
            return { ok: false, reason: `not-hls(${body ? body.length : 0}b)` };
          }
          let height = 0;
          const re = /RESOLUTION=\d+x(\d+)/g;
          let m;
          while ((m = re.exec(body)) !== null)
            height = Math.max(height, parseInt(m[1], 10) || 0);
          if (!height) {
            const inf = /#EXT-X-STREAM-INF[^\n]*BANDWIDTH=(\d+)/.exec(body);
            if (inf)
              height = 0;
          }
          return { ok: true, quality: height ? `${height}p` : "" };
        } catch (e) {
          return { ok: false, reason: e.message };
        }
      });
    }
    function resolveStreams2(req) {
      return __async(this, null, function* () {
        const { id, isMovie, season, episode } = req;
        const embed = embedUrl(id, isMovie, season, episode);
        let html;
        try {
          html = yield fetchText(embed, EMBED_HEADERS);
        } catch (e) {
          console.warn(`[${LABEL2}] embed ${embed} failed: ${e.message}`);
          return [];
        }
        const swish = decodeEntities((/data-src="(https:\/\/stream\.vidapi\.xyz\/swish\?[^"]+)"/.exec(html) || [])[1] || "");
        if (!swish) {
          console.log(`[${LABEL2}] no swish mirror on ${embed} (title not on vidapi?)`);
          return [];
        }
        const pageUrl = yield vscdnPageUrl(swish);
        if (!pageUrl) {
          console.log(`[${LABEL2}] could not derive vscdn file code from ${swish}`);
          return [];
        }
        let page;
        try {
          page = yield fetchText(pageUrl, VSCDN_HEADERS);
        } catch (e) {
          console.warn(`[${LABEL2}] ${pageUrl} failed: ${e.message}`);
          return [];
        }
        const links = extractStreamLinks(page);
        const candidates = [links.hls4, links.hls3, links.hls2].map(absolutize).filter(Boolean);
        console.log(
          `[${LABEL2}] ${embed} -> file ${pageUrl.split("/").pop()} (links via ${links.source}, ${candidates.length} candidate(s))`
        );
        if (!candidates.length)
          return [];
        const epTag = isMovie ? "" : ` S${season || 1}E${episode || 1}`;
        const subtitles = extractTracks(page).map((t) => ({
          url: t.url,
          language: t.language,
          name: t.name,
          headers: __spreadValues({}, PLAYBACK_HEADERS)
        }));
        if (subtitles.length) {
          console.log(`[${LABEL2}]   ${subtitles.length} subtitle track(s), default=${subtitles[0].language}`);
        }
        const seen = /* @__PURE__ */ new Set();
        const streams = [];
        let mirror = 0;
        for (const url of candidates) {
          if (seen.has(url))
            continue;
          seen.add(url);
          const probe = yield probeMaster(url);
          if (!probe.ok) {
            console.log(`[${LABEL2}]   mirror rejected (${probe.reason}): ${url.slice(0, 90)}`);
            continue;
          }
          mirror++;
          streams.push(__spreadValues({
            name: `${LABEL2} \u2022 VidAPI`,
            title: `${probe.quality ? probe.quality + " \xB7 " : ""}mirror ${mirror}${epTag}`.trim(),
            url,
            headers: __spreadValues({}, PLAYBACK_HEADERS)
          }, subtitles.length ? { subtitles } : {}));
          console.log(`[${LABEL2}]   mirror ${mirror} ok (${probe.quality || "auto"}): ${url.slice(0, 90)}`);
          if (streams.length >= MAX_STREAMS)
            break;
        }
        if (!streams.length)
          console.log(`[${LABEL2}] every candidate master was rejected for ${embed}`);
        return streams;
      });
    }
    module2.exports = { resolveStreams: resolveStreams2, embedUrl };
  }
});

// src/onlyflix/index.js
var { classifyId } = require_http();
var { tmdbToImdb } = require_ids();
var { resolveStreams } = require_extractor();
var LABEL = "OnlyFlix";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(
      `[${LABEL}] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(mediaType)} season=${season} episode=${episode}`
    );
    const parsed = classifyId(tmdbId);
    if (!parsed) {
      console.warn(
        `[${LABEL}] unsupported content id "${tmdbId}" (expected tt\u2026/imdb:tt\u2026 or a numeric TMDB id)`
      );
      return [];
    }
    const mt = String(mediaType || "tv").toLowerCase();
    const isMovie = mt === "movie";
    const s = Number(season) || 1;
    const e = Number(episode) || 1;
    let id = parsed.value;
    if (parsed.kind === "tmdb") {
      const imdb = yield tmdbToImdb(parsed.value, isMovie);
      if (imdb)
        id = imdb;
      else
        console.log(`[${LABEL}] keeping numeric id ${id} (no IMDb mapping found)`);
    }
    try {
      const streams = yield resolveStreams({ id, isMovie, season: s, episode: e });
      console.log(
        `[${LABEL}] resolved ${streams.length} stream(s) for ${id}${isMovie ? "" : ` S${s}E${e}`}`
      );
      return streams;
    } catch (error) {
      console.error(`[${LABEL}] Error: ${error.message}`, error && error.stack ? error.stack : "");
      return [];
    }
  });
}
module.exports = { getStreams };
