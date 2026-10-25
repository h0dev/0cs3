/**
 * mzfi - Built from src/mzfi/
 * Generated: 2026-10-25T05:22:16.588Z
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

// src/mzfi/index.js
var mzfi_exports = {};
__export(mzfi_exports, {
  default: () => mzfi_default,
  getStreams: () => getStreams
});
module.exports = __toCommonJS(mzfi_exports);

// src/mzfi/http.js
var LABEL = "MZFI";
var BROWSER_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36";
var API_BASE = "https://h5-api.aoneroom.com/wefeed-h5api-bff";
var SITE_ORIGIN = "https://mzfi.me";
var PLAY_ORIGIN = "https://mzfi.me";
var MEDIA_REFERER = `${SITE_ORIGIN}/`;
function playPageReferer(detailPath) {
  return `${PLAY_ORIGIN}/spa/videoPlayPage/movies/${detailPath}`;
}
function apiHeaders(referer) {
  return {
    "User-Agent": BROWSER_UA,
    Accept: "application/json",
    Origin: "https://movieboxhd.net",
    Referer: referer || "https://movieboxhd.net/",
    "X-Client-Info": JSON.stringify({ timezone: "Asia/Saigon" }),
    // '0' is what the site's own player sends for a normal session, and it
    // matters: with '1' the API blanks the url of every MP4 the catalogue
    // marks premium (vipLocked:true) even though the DASH ladder stays
    // playable - which silently costs you the 1080p MP4 row.
    "X-Vip-Restrict": "0",
    "X-No-High-Risk-Restrict": "0"
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
    const { method = "GET", headers, body, timeout = 15e3 } = options;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const init = {
      method,
      headers: Object.assign({ "User-Agent": BROWSER_UA }, headers || {})
    };
    if (body != null)
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
      const bag = {};
      const names = ["x-user", "set-cookie", "content-type"];
      for (const name of names) {
        try {
          const value = res.headers && res.headers.get ? res.headers.get(name) : null;
          if (value)
            bag[name] = value;
        } catch (error) {
        }
      }
      return { status: res.status, ok: !!res.ok, text, json, headers: bag };
    });
    try {
      const result = yield withTimeout(run(), timeout, null);
      if (!result && controller)
        controller.abort();
      return result || { status: 0, ok: false, text: "", json: null, headers: {}, error: "timeout" };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        text: "",
        json: null,
        headers: {},
        error: String(error && error.message || error)
      };
    }
  });
}
var guestToken = null;
var guestTokenAt = 0;
var TOKEN_TTL_MS = 6 * 60 * 60 * 1e3;
function tokenFromResponse(res) {
  if (!res)
    return null;
  const raw = res.headers && res.headers["x-user"];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token)
        return String(parsed.token);
    } catch (error) {
    }
  }
  const cookie = res.headers && res.headers["set-cookie"];
  if (cookie) {
    const match = /(?:^|[;,\s])token=([^;,\s]+)/.exec(cookie);
    if (match && match[1])
      return match[1];
  }
  const merged = res.headers && res.headers["x-mb-token"];
  if (merged)
    return String(merged).replace(/^"|"$/g, "");
  return null;
}
function getGuestToken(force = false) {
  return __async(this, null, function* () {
    if (!force && guestToken && Date.now() - guestTokenAt < TOKEN_TTL_MS)
      return guestToken;
    const res = yield request(`${API_BASE}/country-code`, {
      headers: apiHeaders(),
      timeout: 12e3
    });
    const token = tokenFromResponse(res);
    if (token) {
      guestToken = token;
      guestTokenAt = Date.now();
    }
    return guestToken;
  });
}
function parseImdbId(raw) {
  const s = String(raw == null ? "" : raw).trim();
  const prefixed = /^(?:imdb):(tt\d+)$/i.exec(s);
  if (prefixed)
    return prefixed[1].toLowerCase();
  return /^tt\d{5,}$/i.test(s) ? s.toLowerCase() : null;
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
function parseSiteRef(raw) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s || /^\d+$/.test(s))
    return null;
  const url = /\/movies\/([A-Za-z0-9_-]+)(?:\?[^#]*\bid=(\d+))?/.exec(s);
  if (url) {
    const slug = url[1];
    const tail = /-([A-Za-z0-9]{11})$/.exec(slug);
    return { detailPath: slug, subjectId: url[2] || null, shareId: tail ? tail[1] : null };
  }
  const detail = /\/moviedetail\/([A-Za-z0-9_-]+)/.exec(s);
  if (detail) {
    const id = /[?&]id=(\d+)/.exec(s);
    return { detailPath: detail[1], subjectId: id ? id[1] : null, shareId: null };
  }
  const pipe = /^([A-Za-z0-9_-]{6,})\s*[|:]\s*(\d{10,})$/.exec(s);
  if (pipe)
    return { detailPath: pipe[1], subjectId: pipe[2], shareId: null };
  if (/^[A-Za-z0-9_-]{6,}$/.test(s) && /-/.test(s)) {
    const tail = /-([A-Za-z0-9]{11})$/.exec(s);
    return { detailPath: s, subjectId: null, shareId: tail ? tail[1] : null };
  }
  return null;
}
function imdbToTmdb(imdbId, mediaType) {
  return __async(this, null, function* () {
    const imdb = parseImdbId(imdbId);
    if (!imdb)
      return null;
    const type = String(mediaType || "").toLowerCase() === "movie" ? "movie" : "tv";
    const kind = type === "movie" ? "movie" : "series";
    const cinemeta = yield request(`https://v3-cinemeta.strem.io/meta/${kind}/${imdb}.json`, { timeout: 12e3 });
    const meta = cinemeta && cinemeta.json && cinemeta.json.meta;
    if (meta && meta.moviedb_id) {
      console.log(`[${LABEL}] ${imdb} -> tmdb ${meta.moviedb_id} (cinemeta: ${meta.name || "?"})`);
      return String(meta.moviedb_id);
    }
    const found = yield request(
      `${TMDB_BASE}/find/${imdb}?external_source=imdb_id&api_key=${TMDB_KEY}`,
      { timeout: 12e3 }
    );
    const json = found && found.json;
    const bucket = json ? type === "movie" ? json.movie_results : json.tv_results : null;
    if (bucket && bucket.length && bucket[0].id) {
      console.log(`[${LABEL}] ${imdb} -> tmdb ${bucket[0].id} (tmdb find)`);
      return String(bucket[0].id);
    }
    console.log(`[${LABEL}] ${imdb} not mapped to a TMDB id`);
    return null;
  });
}
var TMDB_KEY = "3d421899d5ce93db8ad4ae4591ccc130";
var TMDB_BASE = "https://api.themoviedb.org/3";
function tmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const type = String(mediaType || "").toLowerCase() === "movie" ? "movie" : "tv";
    const res = yield request(`${TMDB_BASE}/${type}/${encodeURIComponent(tmdbId)}?api_key=${TMDB_KEY}&language=en-US`, {
      timeout: 12e3
    });
    const json = res && res.json;
    if (!json)
      return null;
    const title = type === "movie" ? json.title : json.name;
    const original = type === "movie" ? json.original_title : json.original_name;
    const date = type === "movie" ? json.release_date : json.first_air_date;
    const year = date ? parseInt(String(date).slice(0, 4), 10) || 0 : 0;
    if (!title && !original)
      return null;
    return { title: title || original, originalTitle: original || title, year, type };
  });
}
function heightFromResolutions(value) {
  let best = 0;
  for (const token of String(value || "").split(",")) {
    const n = parseInt(token.trim(), 10);
    if (n > best && n <= 4320)
      best = n;
  }
  if (best)
    return best;
  return 0;
}
function qualityLabel(height) {
  if (!height)
    return "Auto";
  if (height >= 2e3)
    return "4K";
  return `${height}p`;
}
function normaliseTitle(value) {
  return String(value || "").toLowerCase().replace(/\([^)]*\)/g, " ").replace(/\bs\d{1,2}(\s*[-–]\s*s?\d{1,2})?\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}

// src/mzfi/api.js
var SUBJECT_TYPE = { movie: 1, tv: 2 };
function searchSubjects(keyword, token, page = 1, perPage = 20) {
  return __async(this, null, function* () {
    const body = JSON.stringify({ keyword, page, perPage });
    const res = yield request(`${API_BASE}/subject/search`, {
      method: "POST",
      headers: Object.assign(apiHeaders(), {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      }),
      body,
      timeout: 15e3
    });
    if (res && res.json && res.json.code === 0) {
      const items = res.json.data && res.json.data.items || [];
      return items;
    }
    const message = res && res.json ? res.json.message : res && res.error;
    return { error: message || `HTTP ${res && res.status}`, auth: /invalid token/i.test(String(message)) };
  });
}
function search(rawKeyword, token) {
  return __async(this, null, function* () {
    const keyword = String(rawKeyword || "").trim();
    if (!keyword)
      return [];
    let current = token || (yield getGuestToken());
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!current)
        return [];
      const result = yield searchSubjects(keyword, current, 1, 20);
      if (Array.isArray(result)) {
        return result.map((item) => ({
          subjectId: String(item.subjectId || ""),
          subjectType: Number(item.subjectType) || 0,
          title: String(item.title || ""),
          year: item.releaseDate ? parseInt(String(item.releaseDate).slice(0, 4), 10) || 0 : 0,
          detailPath: String(item.detailPath || ""),
          rating: item.imdbRatingValue || ""
        }));
      }
      if (!result || !result.auth) {
        console.log(`[${LABEL}] search "${keyword}" failed: ${result && result.error}`);
        return [];
      }
      console.log(`[${LABEL}] search token rejected, refreshing`);
      current = yield getGuestToken(true);
    }
    return [];
  });
}
function fetchDetail(detailPath) {
  return __async(this, null, function* () {
    const res = yield request(
      `${API_BASE}/detail?detailPath=${encodeURIComponent(detailPath)}`,
      { headers: apiHeaders(), timeout: 15e3 }
    );
    const json = res && res.json;
    if (!json || json.code !== 0 || !json.data)
      return null;
    return json.data;
  });
}
function seasonsOf(detail) {
  const seasons = detail && detail.resource && detail.resource.seasons || [];
  const out = [];
  for (const season of seasons) {
    const se = Number(season.se) || 0;
    const maxEp = Number(season.maxEp) || 0;
    if (se > 0 && maxEp > 0)
      out.push({ se, maxEp });
  }
  out.sort((a, b) => a.se - b.se);
  return out;
}
function fetchPlay(args) {
  return __async(this, null, function* () {
    const { subjectId, detailPath, season, episode, type } = args;
    const params = [
      `subjectId=${encodeURIComponent(subjectId)}`,
      `detailPath=${encodeURIComponent(detailPath)}`,
      "streamSignType=1",
      `supportCodecs%5Bhevc%5D=1`,
      `supportCodecs%5Bh264%5D=1`
    ];
    if (type !== "movie") {
      params.splice(1, 0, `se=${Number(season) || 1}`, `ep=${Number(episode) || 1}`);
    }
    const url = `${API_BASE}/subject/play?${params.join("&")}`;
    const referer = playPageReferer(detailPath);
    const started = Date.now();
    const res = yield request(url, {
      headers: Object.assign(apiHeaders(referer), { Referer: referer, Origin: "https://mzfi.me" }),
      timeout: 2e4
    });
    const json = res && res.json;
    const data = json && json.data || null;
    if (!data) {
      console.log(`[${LABEL}] play failed (HTTP ${res && res.status}${res && res.error ? `, ${res.error}` : ""})`);
      return null;
    }
    const streams = (data.streams || []).length + (data.dash || []).length + (data.hls || []).length;
    console.log(
      `[${LABEL}] play ${detailPath} ${type === "movie" ? "" : `S${season}E${episode} `}-> ${streams} source(s) in ${Date.now() - started}ms` + (data.hasResource === false ? " (hasResource:false)" : "")
    );
    return data;
  });
}
function mediaHeaders(signHeaderKey, signCookie) {
  const headers = {
    "User-Agent": apiHeaders()["User-Agent"],
    Referer: MEDIA_REFERER
  };
  if (signHeaderKey && signCookie)
    headers[signHeaderKey] = signCookie;
  return headers;
}
function toCandidate(row, kind, playData) {
  if (!row || typeof row.url !== "string" || !row.url)
    return null;
  const height = heightFromResolutions(row.resolutions);
  const headers = mediaHeaders(row.signHeaderKey, row.signCookie);
  return {
    format: String(row.format || kind).toUpperCase(),
    kind,
    sourceId: String(row.id || ""),
    url: row.url,
    height,
    codec: String(row.codecName || "").toLowerCase(),
    size: Number(row.size) || 0,
    duration: Number(row.duration) || 0,
    headers,
    vipLocked: !!row.vipLocked,
    // DASH/HLS need the token on every segment, so they rank below a plain
    // MP4 file: one header-carrying request instead of hundreds.
    premium: kind === "dash" ? 1 : 0,
    playData
  };
}
function readPlay(playData) {
  if (!playData)
    return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const order = [
    ["mp4", playData.streams],
    ["hls", playData.hls],
    ["dash", playData.dash]
  ];
  for (const [kind, list] of order) {
    for (const row of Array.isArray(list) ? list : []) {
      const candidate = toCandidate(row, kind, playData);
      if (!candidate)
        continue;
      if (seen.has(candidate.url))
        continue;
      seen.add(candidate.url);
      out.push(candidate);
    }
  }
  return out;
}
var LANGUAGE_NAMES = {
  en: "English",
  vi: "Vietnamese",
  zh: "Chinese",
  "zh-cn": "Chinese (Simplified)",
  "zh-tw": "Chinese (Traditional)",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  id: "Indonesian",
  th: "Thai",
  ja: "Japanese",
  ko: "Korean",
  tr: "Turkish",
  it: "Italian",
  pl: "Polish",
  ms: "Malay",
  fil: "Filipino"
};
function languageLabel(code, fallback) {
  const raw = String(code || "").toLowerCase();
  if (!raw)
    return fallback || "";
  return LANGUAGE_NAMES[raw] || fallback || raw;
}
function fetchCaptions(format, sourceId, subjectId, detailPath) {
  return __async(this, null, function* () {
    if (!sourceId)
      return [];
    const url = `${API_BASE}/subject/caption?format=${encodeURIComponent(format)}&id=${encodeURIComponent(sourceId)}&subjectId=${encodeURIComponent(subjectId)}&detailPath=${encodeURIComponent(detailPath)}`;
    const res = yield withTimeout(
      request(url, {
        headers: Object.assign(apiHeaders(playPageReferer(detailPath)), { Referer: playPageReferer(detailPath) }),
        timeout: 12e3
      }),
      13e3,
      null
    );
    const captions = res && res.json && res.json.data && res.json.data.captions || [];
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const caption of captions) {
      if (!caption || !caption.url || seen.has(caption.url))
        continue;
      seen.add(caption.url);
      out.push({
        url: caption.url,
        language: String(caption.lan || "und").toLowerCase(),
        label: languageLabel(caption.lan, caption.lanName),
        format: /\.vtt(\?|$)/i.test(caption.url) ? "vtt" : "srt"
      });
    }
    return out;
  });
}
function tokens(value) {
  return normaliseTitle(value).split(" ").filter(Boolean);
}
function scoreCandidate(item, wanted) {
  const wantedTitle = normaliseTitle(wanted.title);
  const wantedOriginal = normaliseTitle(wanted.originalTitle || wanted.title);
  const have = normaliseTitle(item.title);
  if (!have)
    return -1e3;
  let score = 0;
  if (have === wantedTitle || have === wantedOriginal)
    score += 100;
  else {
    const haveTokens = new Set(tokens(item.title));
    const wantedTokens = new Set(tokens(wantedTitle).concat(tokens(wantedOriginal)));
    let hit = 0;
    for (const token of wantedTokens)
      if (haveTokens.has(token))
        hit += 1;
    score += hit / Math.max(1, wantedTokens.size) * 60;
    if (have.startsWith(wantedTitle) || wantedTitle.startsWith(have))
      score += 10;
    if (wantedTitle.includes(have) && have.length > 6)
      score += 6;
  }
  if (wanted.type === "movie" && item.subjectType === SUBJECT_TYPE.movie)
    score += 25;
  if (wanted.type === "tv" && item.subjectType === SUBJECT_TYPE.tv)
    score += 25;
  if (wanted.type === "movie" && item.subjectType === SUBJECT_TYPE.tv)
    score -= 30;
  if (wanted.type === "tv" && item.subjectType === SUBJECT_TYPE.movie)
    score -= 30;
  if (wanted.year && item.year) {
    const delta = Math.abs(wanted.year - item.year);
    if (delta === 0)
      score += 30;
    else if (delta <= 1)
      score += 12;
    else if (delta <= 3)
      score -= 10;
    else
      score -= Math.min(60, delta * 3);
  }
  if (item.rating)
    score += Math.min(4, Number(item.rating) || 0);
  return score;
}
function pickBest(items, wanted) {
  if (!items || !items.length)
    return null;
  let best = null;
  for (const item of items) {
    const score = scoreCandidate(item, wanted);
    if (!best || score > best.score)
      best = Object.assign({ score }, item);
  }
  if (!best || best.score < 45) {
    if (best) {
      console.log(
        `[${LABEL}] no confident match for "${wanted.title}" (best "${best.title}" ${best.year} = ${best.score.toFixed(1)})`
      );
    }
    return null;
  }
  console.log(
    `[${LABEL}] matched "${best.title}" (${best.year}) subject=${best.subjectId} path=${best.detailPath} score=${best.score.toFixed(1)}`
  );
  return best;
}

// src/mzfi/index.js
var CACHE_TTL_MS = 8 * 60 * 1e3;
var EMPTY_TTL_MS = 90 * 1e3;
var CACHE_MAX = 48;
var MAX_ROWS = 14;
var cache = /* @__PURE__ */ new Map();
var tmdbCache = /* @__PURE__ */ new Map();
var TMDB_TTL_MS = 6 * 60 * 60 * 1e3;
function tmdbInfo2(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const key = `${mediaType}:${tmdbId}`;
    const hit = tmdbCache.get(key);
    if (hit && Date.now() - hit.ts < TMDB_TTL_MS)
      return hit.value;
    const value = yield tmdbInfo(tmdbId, mediaType);
    if (value)
      tmdbCache.set(key, { ts: Date.now(), value });
    return value;
  });
}
var searchCache = /* @__PURE__ */ new Map();
var SEARCH_TTL_MS = 10 * 60 * 1e3;
function searchCached(keyword) {
  return __async(this, null, function* () {
    const hit = searchCache.get(keyword);
    if (hit && Date.now() - hit.ts < SEARCH_TTL_MS)
      return hit.value;
    const value = yield search(keyword);
    if (value && value.length)
      searchCache.set(keyword, { ts: Date.now(), value });
    if (searchCache.size > 64) {
      const oldest = searchCache.keys().next();
      if (!oldest.done)
        searchCache.delete(oldest.value);
    }
    return value;
  });
}
var detailCache = /* @__PURE__ */ new Map();
var DETAIL_TTL_MS = 15 * 60 * 1e3;
function cachedDetail(detailPath) {
  return __async(this, null, function* () {
    const hit = detailCache.get(detailPath);
    if (hit && Date.now() - hit.ts < DETAIL_TTL_MS)
      return hit.value;
    const value = yield fetchDetail(detailPath);
    if (value)
      detailCache.set(detailPath, { ts: Date.now(), value });
    if (detailCache.size > 24) {
      const oldest = detailCache.keys().next();
      if (!oldest.done)
        detailCache.delete(oldest.value);
    }
    return value;
  });
}
function cacheKey(type, id, season, episode) {
  return type === "show" ? `show:${id}:${season}:${episode}` : `movie:${id}`;
}
function labelFor(candidate) {
  const quality = qualityLabel(candidate.height);
  const codec = candidate.codec === "hevc" ? "HEVC" : candidate.codec === "h264" ? "H.264" : "";
  return [candidate.format, quality, codec].filter(Boolean).join(" ");
}
function resolveTarget(id, mediaType) {
  return __async(this, null, function* () {
    const pasted = parseSiteRef(id);
    if (pasted) {
      console.log(`[${LABEL}] direct target ${pasted.detailPath}`);
      return {
        detailPath: pasted.detailPath,
        subjectId: pasted.subjectId,
        type: "movie",
        matchedTitle: "",
        // A pasted path carries no type; detail() below tells us.
        inferred: true
      };
    }
    const type = String(mediaType || "tv").toLowerCase() === "movie" ? "movie" : "tv";
    let tmdbId = parseTmdbId(id);
    if (!tmdbId) {
      const imdb = parseImdbId(id);
      if (!imdb) {
        console.warn(`[${LABEL}] unsupported id "${id}" (needs a TMDB id, an IMDb id or a pasted mzfi URL)`);
        return null;
      }
      tmdbId = yield imdbToTmdb(imdb, type);
      if (!tmdbId) {
        console.warn(`[${LABEL}] ${imdb} could not be mapped to TMDB`);
        return null;
      }
    }
    const info = yield tmdbInfo2(tmdbId, type);
    if (!info) {
      console.warn(`[${LABEL}] tmdb ${tmdbId} not resolved`);
      return null;
    }
    const keywords = [info.title];
    if (info.originalTitle && info.originalTitle !== info.title)
      keywords.push(info.originalTitle);
    for (const keyword of keywords) {
      const items = yield searchCached(keyword);
      const best = pickBest(items, info);
      if (best && best.detailPath) {
        return {
          detailPath: best.detailPath,
          subjectId: best.subjectId || null,
          type,
          matchedTitle: best.title,
          inferred: false
        };
      }
    }
    console.log(`[${LABEL}] not in catalogue: "${info.title}" (${info.year})`);
    return null;
  });
}
function resolveEpisode(seasons, season, episode) {
  if (!seasons.length)
    return null;
  const wanted = Number(season) || 1;
  let target = seasons.find((item) => item.se === wanted);
  if (!target) {
    target = seasons.slice().sort((a, b) => Math.abs(a.se - wanted) - Math.abs(b.se - wanted))[0];
    if (target)
      console.log(`[${LABEL}] season ${wanted} absent, using S${target.se}`);
  }
  if (!target)
    return null;
  const wantedEp = Number(episode) || 1;
  if (wantedEp > target.maxEp) {
    console.log(`[${LABEL}] episode ${wantedEp} > S${target.se} maxEp ${target.maxEp}, clamping`);
  }
  return { se: target.se, ep: Math.min(wantedEp, target.maxEp) };
}
var SUBTITLE_ORDER = ["vi", "en", "zh", "zh-cn", "zh-tw"];
function subtitleRank(sub) {
  const index = SUBTITLE_ORDER.indexOf(String(sub.language || "").toLowerCase());
  return index === -1 ? SUBTITLE_ORDER.length : index;
}
function attachSubtitles(rows, subtitles) {
  if (!subtitles || !subtitles.length)
    return;
  const ordered = subtitles.slice().sort((a, b) => subtitleRank(a) - subtitleRank(b)).slice(0, 10);
  for (const row of rows) {
    row.subtitles = ordered.map((sub) => ({
      url: sub.url,
      language: sub.language,
      label: sub.label
    }));
  }
}
function buildStreams(target, mediaType, season, episode) {
  return __async(this, null, function* () {
    const type = target.type;
    const detail = yield cachedDetail(target.detailPath);
    if (!detail) {
      console.log(`[${LABEL}] detail failed for ${target.detailPath}`);
      return [];
    }
    const subjectId = target.subjectId || detail.subject && detail.subject.subjectId;
    if (!subjectId) {
      console.log(`[${LABEL}] no subjectId for ${target.detailPath}`);
      return [];
    }
    const seasons = seasonsOf(detail);
    let se = null;
    let ep = null;
    if (seasons.length) {
      const picked = resolveEpisode(seasons, season, episode);
      if (picked) {
        se = picked.se;
        ep = picked.ep;
      }
    }
    const playData = yield fetchPlay({
      subjectId,
      detailPath: target.detailPath,
      season: se,
      episode: ep,
      type: seasons.length ? "show" : "movie"
    });
    if (!playData)
      return [];
    const candidates = readPlay(playData);
    if (!candidates.length) {
      console.log(
        `[${LABEL}] no playable source (hasResource=${playData.hasResource}, vipLocked=${playData.vipLocked}, limited=${playData.limited})`
      );
      return [];
    }
    let subtitles = [];
    for (const candidate of candidates) {
      if (subtitles.length)
        break;
      if (!candidate.sourceId)
        continue;
      try {
        subtitles = yield fetchCaptions(candidate.format, candidate.sourceId, subjectId, target.detailPath);
      } catch (error) {
        console.log(`[${LABEL}] captions failed: ${error && error.message || error}`);
      }
      if (subtitles.length) {
        console.log(`[${LABEL}] ${subtitles.length} subtitle track(s)`);
      }
    }
    const ordered = candidates.slice().sort((a, b) => b.height - a.height || a.premium - b.premium || (a.format === "MP4" ? -1 : 0));
    const rows = [];
    const seenHeights = /* @__PURE__ */ new Map();
    for (const candidate of ordered) {
      const key = `${candidate.format}|${candidate.height}`;
      if (seenHeights.has(key))
        continue;
      seenHeights.set(key, candidate);
      const detailBits = labelFor(candidate);
      rows.push({
        name: `${LABEL} \xB7 ${detailBits}`,
        title: detailBits + (candidate.size ? ` \xB7 ${(candidate.size / 1e9).toFixed(2)} GB` : ""),
        quality: qualityLabel(candidate.height),
        url: candidate.url,
        type: candidate.format === "MP4" ? "mp4" : candidate.format === "DASH" ? "dash" : "hls",
        headers: Object.assign({}, candidate.headers),
        subtitles: []
      });
      if (rows.length >= MAX_ROWS)
        break;
    }
    attachSubtitles(rows, subtitles);
    console.log(`[${LABEL}] emitting ${rows.length} row(s) for ${target.detailPath}`);
    return rows;
  });
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
      const cached = yield hit.value;
      return cached;
    }
    if (hit)
      cache.delete(key);
    const value = (() => __async(this, null, function* () {
      try {
        const target = yield resolveTarget(tmdbId, mediaType);
        if (!target)
          return [];
        return yield buildStreams(target, mediaType, s, e);
      } catch (error) {
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
    const streams = yield value;
    if (cache.get(key) === entry) {
      if (!streams || !streams.length)
        entry.ttl = EMPTY_TTL_MS;
    }
    console.log(`[${LABEL}] done in ${Date.now() - started}ms`);
    return streams;
  });
}
var mzfi_default = { getStreams };
