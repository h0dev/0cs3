/**
 * vicdn - Built from src/vicdn/
 * Generated: 2026-09-04T13:12:20.425Z
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

// src/vicdn/http.js
var BASE = "https://vicdn.cc/";
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function siteHeaders(ref) {
  return {
    "User-Agent": BROWSER_UA,
    Origin: BASE.replace(/\/$/, ""),
    Referer: ref || BASE
  };
}
function fetchText(url, headers) {
  return __async(this, null, function* () {
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = yield fetch(url, { method: "GET", headers: headers || {} });
        if (!res.ok)
          throw new Error(`HTTP ${res.status} ${url}`);
        return yield res.text();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error(`GET failed ${url}`);
  });
}
function resolveIdToSlug(raw, isMovie, season) {
  if (!raw)
    return null;
  const s = String(raw).trim();
  if (!s)
    return null;
  let num = null;
  if (/^\d+$/.test(s)) {
    num = s;
  } else {
    const m = /^(?:tmdb|movie|series|tv|show):(\d+)/i.exec(s);
    if (m)
      num = m[1];
  }
  if (num == null) {
    console.log(`[ViCDN] unsupported content id "${raw}" (TMDB numeric expected)`);
    return null;
  }
  return isMovie ? `mv-${num}-1` : `tv-${num}-${season || 1}`;
}
function imdbToTmdb(tt, mediaType) {
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
        console.log(`[ViCDN][debug] imdb->tmdb ${clean} cinemeta HTTP ${res.status}`);
        return null;
      }
      const json = JSON.parse(yield res.text());
      const mid = json && json.meta ? json.meta.moviedb_id : null;
      console.log(
        `[ViCDN][debug] imdb->tmdb ${clean} via cinemeta -> ${mid != null ? `moviedb_id=${mid}` : "absent"}`
      );
      return mid != null ? String(mid) : null;
    } catch (e) {
      console.warn(`[ViCDN][debug] imdb->tmdb ${clean} cinemeta error: ${e.message}`);
      return null;
    }
  });
}
function infoSlug(slug) {
  return __async(this, null, function* () {
    const url = `${BASE}api/info/${encodeURIComponent(slug)}`;
    let txt = null;
    let httpStatus = null;
    try {
      const headers = siteHeaders(BASE);
      const res = yield fetch(url, { method: "GET", headers });
      httpStatus = res.status;
      txt = yield res.text();
    } catch (e) {
      console.warn(`[ViCDN][debug] /api/info request error for ${slug}: ${e.message}`);
      return { found: false, reason: `network_error: ${e.message}` };
    }
    if (txt == null || !txt.length) {
      console.warn(`[ViCDN][debug] /api/info ${slug} -> HTTP ${httpStatus} empty body`);
      return { found: false, reason: `http_${httpStatus}_empty` };
    }
    let parsed = null;
    try {
      parsed = JSON.parse(txt);
    } catch (e) {
    }
    if (!parsed || parsed.status === "error" || !parsed.data || !parsed.data.type) {
      const msg = parsed && parsed.message ? parsed.message : "no-data";
      console.log(`[ViCDN][debug] /api/info ${slug} -> HTTP ${httpStatus} found=false (${msg})`);
      return { found: false, reason: msg };
    }
    const d = parsed.data;
    const list = Array.isArray(d.list_episodes) ? d.list_episodes : [];
    const episodes = list.map((line) => {
      if (typeof line !== "string")
        return null;
      const i = line.indexOf("|");
      if (i < 0)
        return null;
      return {
        n: line.slice(0, i).trim(),
        url: line.slice(i + 1).trim()
      };
    }).filter(Boolean);
    console.log(
      `[ViCDN][debug] /api/info ${slug} -> found=true type=${String(d.type).toLowerCase()} name=${JSON.stringify(d.vname || d.ename || "")} episodes=${episodes.length}`
    );
    return {
      found: true,
      reason: "ok",
      type: String(d.type).toLowerCase(),
      name: d.vname || d.ename || "",
      episodes
    };
  });
}

// src/vicdn/extractor.js
var AUDIO_LABELS = {
  original: "Audio G\u1ED1c",
  female: "Thuy\u1EBFt minh N\u1EEF",
  male: "Thuy\u1EBFt minh Nam"
};
function readJsStr(s, pos) {
  if (pos >= s.length)
    return null;
  const q = s[pos];
  if (q !== "'" && q !== '"')
    return null;
  let idx = pos + 1;
  const out = [];
  while (idx < s.length) {
    const c = s[idx];
    if (c === "\\" && idx + 1 < s.length) {
      out.push(s[idx + 1]);
      idx += 2;
    } else if (c === q) {
      return { text: out.join(""), end: idx + 1 };
    } else {
      out.push(c);
      idx += 1;
    }
  }
  return null;
}
function skipToNextStrArg(s, pos) {
  let i = pos;
  while (i < s.length && s[i] !== "'" && s[i] !== '"')
    i++;
  return i;
}
function unpack(payload, dict) {
  let out = payload;
  for (let c = dict.length - 1; c >= 0; c--) {
    const w = dict[c];
    if (!w)
      continue;
    const token = c === 0 ? "0" : base62FromAlpha(c);
    const re = new RegExp("(?<![A-Za-z0-9_])" + escapeRe(token) + "(?![A-Za-z0-9_])", "g");
    out = out.replace(re, w);
  }
  return out;
}
function base62FromAlpha(n) {
  if (n === 0)
    return "0";
  const alpha = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let x = n;
  let s = "";
  while (x > 0) {
    s = alpha[x % 62] + s;
    x = Math.floor(x / 62);
  }
  return s;
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function decodePackerBlocks(html) {
  const chunks = [];
  const marker = "eval(function(p,a,c,k,e,d){";
  let i = 0;
  while (true) {
    const start = html.indexOf(marker, i);
    if (start < 0)
      break;
    const callOpen = html.indexOf("return p}(", start);
    if (callOpen >= 0) {
      const payloadRes = readJsStr(html, callOpen + "return p}(".length);
      if (payloadRes) {
        let cursor = skipToNextStrArg(html, payloadRes.end);
        const dictRes = readJsStr(html, cursor);
        if (dictRes) {
          const k = dictRes.text.split("|");
          chunks.push(unpack(payloadRes.text, k));
        }
      }
    }
    i = start + marker.length;
  }
  return chunks.join("\n");
}
function extractAudioSources(decoded) {
  const map = {};
  for (const key of ["original", "female", "male"]) {
    const regex = new RegExp(
      "(?:AUDIO_SOURCES|a)\\." + key + `\\s*=\\s*['"]([^'"]+)`
    );
    const m = regex.exec(decoded);
    if (m && m[1] && m[1].indexOf("/hls/") >= 0)
      map[key] = m[1];
  }
  if (Object.keys(map).length === 0) {
    const rawRe = /[A-Z_]*AUDIO_SOURCES\.(original|female|male)\s*=\s*['"]([^'"]+)/g;
    let mm;
    while ((mm = rawRe.exec(decoded)) !== null) {
      if (mm[2] && mm[2].indexOf("/hls/") >= 0)
        map[mm[1]] = mm[2];
    }
  }
  return map;
}
var SLUG_FROM_URL = /([^\/]+)\/?$/;
var SUB_NAMES = { vi: "Ti\u1EBFng Vi\u1EC7t", en: "English" };
function subtitleFor(epSlug, lang) {
  return {
    url: `${BASE}vtt/${epSlug}-${lang}.vtt`,
    language: lang,
    name: SUB_NAMES[lang] || lang,
    headers: {}
  };
}
function unpackAudioStreams(playUrl) {
  return __async(this, null, function* () {
    if (!playUrl)
      return null;
    let html;
    try {
      html = yield fetchText(playUrl, siteHeaders(playUrl));
    } catch (e) {
      console.warn(`[ViCDN] play page fetch failed ${playUrl}: ${e.message}`);
      return null;
    }
    console.log(`[ViCDN][debug] play page ${playUrl} -> ${html.length} bytes`);
    const packed = decodePackerBlocks(html);
    const hasPacker = html.indexOf("eval(function(p,a,c,k,e,d){") >= 0;
    console.log(
      `[ViCDN][debug] packer-blocks present=${hasPacker} decodedChars=${packed ? packed.length : 0}`
    );
    const sources = extractAudioSources(packed || "");
    if (Object.keys(sources).length === 0) {
      console.warn(
        `[ViCDN] no AUDIO_SOURCES resolvable on play page ${playUrl} (packer${hasPacker ? "" : " NOT"} found). Could be shell page instead of real episode page, geo/captcha, or layout change.`
      );
      return null;
    }
    console.log(`[ViCDN][debug] AUDIO_SOURCES resolved: ${Object.keys(sources).join(", ")}`);
    const epSlug = (SLUG_FROM_URL.exec(playUrl.replace(/\/+$/, "")) || [])[1] || "";
    const viSub = subtitleFor(epSlug, "vi");
    const enSub = subtitleFor(epSlug, "en");
    const subs = [viSub, enSub];
    const out = [];
    for (const [key, htmlSrc] of Object.entries(sources)) {
      if (!/\.html$/i.test(htmlSrc))
        continue;
      const master = htmlSrc.slice(0, -5) + ".m3u8";
      out.push({
        name: AUDIO_LABELS[key] || key,
        url: master,
        headers: siteHeaders(playUrl),
        subtitles: subs
      });
    }
    return out;
  });
}

// src/vicdn/index.js
function toEpisodes(info) {
  if (!info || !Array.isArray(info.episodes))
    return [];
  return info.episodes;
}
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(
      `[ViCDN] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(mediaType)} season=${season} episode=${episode}`
    );
    const mt = (mediaType || "tv").toLowerCase();
    const isMovie = mt === "movie";
    const wantedSeason = isMovie ? 1 : Number(season || episode) || 1;
    const inId = String(tmdbId == null ? "" : tmdbId).trim();
    let slug = resolveIdToSlug(inId, isMovie, wantedSeason);
    let slugOrigin = "tmdb-id";
    if (!slug && /^tt/i.test(inId)) {
      const tmdbNo = yield imdbToTmdb(inId, mt);
      if (tmdbNo) {
        const sub = resolveIdToSlug(tmdbNo, isMovie, wantedSeason);
        if (sub) {
          slug = sub;
          slugOrigin = `imdb[${inId}]->cinemeta->tmdb[${tmdbNo}]`;
        }
      } else {
        console.log(
          `[ViCDN] imdb ${inId} has no moviedb_id in cinemeta meta; vicdn cannot build a slug. Returning no streams.`
        );
        return [];
      }
    }
    console.log(`[ViCDN] slug: ${slug || "(none)"} (movie=${isMovie}, via=${slugOrigin})`);
    if (!slug) {
      if (!/^tt/i.test(inId)) {
        console.warn("[ViCDN] unsupported content id, no TMDB slug can be built.");
      }
      return [];
    }
    const infoRes = yield infoSlug(slug);
    if (!infoRes.found) {
      const tag = slugOrigin.startsWith("imdb") ? `mapped ${slugOrigin}; ` : "";
      console.log(
        `[ViCDN] vicdn has no entry under ${slug} (${tag}reason=${infoRes.reason}). Title is probably NOT in vicdn's VN-sub/bilingual catalogue (Western titles are sparse; mostly CN/Asian). Returning no streams so other sources stay available.`
      );
      return [];
    }
    const info = infoRes;
    const eps = toEpisodes(info);
    let playUrl = null;
    if (eps.length) {
      playUrl = isMovie ? eps[0].url || null : (() => {
        const want = Number(episode) || Number(eps[0].n) || 1;
        return (eps.find((e) => Number(e.n) === want) || eps[want - 1] || eps[0]).url || null;
      })();
    } else {
      playUrl = `${slug}-1`;
    }
    console.log(`[ViCDN] resolved play page for wanted episode: ${playUrl || "(none)"}`);
    let streams = [];
    if (playUrl) {
      try {
        streams = (yield unpackAudioStreams(playUrl)) || [];
      } catch (e) {
        console.warn(`[ViCDN] unpack fail ${playUrl}: ${e.message}`);
        streams = [];
      }
    }
    if (streams.length === 0) {
      console.log(`[ViCDN] play ${playUrl || slug} returned no HLS`);
      return [];
    }
    const episodeTag = isMovie ? "" : pickEpisodeTag(playUrl);
    const out = streams.map((s) => __spreadValues(__spreadProps(__spreadValues({
      name: s.name
    }, episodeTag ? { title: `${s.name}${episodeTag}` } : {}), {
      url: s.url,
      headers: s.headers
    }), s.subtitles && s.subtitles.length ? { subtitles: s.subtitles } : {}));
    console.log(`[ViCDN] resolved ${out.length} stream(s) for ${playUrl}`);
    return out;
  });
}
function pickEpisodeTag(playUrl) {
  const m = /-(\d+)\/?$/.exec(playUrl || "");
  return m ? ` ep.${m[1]}` : "";
}
module.exports = { getStreams };
