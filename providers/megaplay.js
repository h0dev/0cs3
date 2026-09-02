/**
 * megaplay - Built from src/megaplay/
 * Generated: 2026-09-02T13:58:11.212Z
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

// src/megaplay/http.js
var BASE = "https://animextv.tech";
var MEGA = "https://megaplay.buzz";
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
    const file = json && json.sources && json.sources.file;
    if (!file)
      throw new Error("getSources returned no sources.file");
    const tracks = Array.isArray(json == null ? void 0 : json.tracks) ? json.tracks.filter((t) => t && t.file) : [];
    return { file, tracks };
  });
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
