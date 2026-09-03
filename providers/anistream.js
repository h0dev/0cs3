/**
 * anistream - Built from src/anistream/
 * Generated: 2026-09-03T00:11:21.040Z
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

// src/anistream/http.js
var GRAPHQL = "https://graphql.animex.one/graphql";
var REST = "https://api.anistream.one/rest/api";
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function getJson(_0) {
  return __async(this, arguments, function* (url, headers = {}) {
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = yield fetch(url, { method: "GET", headers });
        if (!res.ok)
          throw new Error(`HTTP ${res.status} for ${url}`);
        return res.json();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error(`GET json failed ${url}`);
  });
}
function gql(query, variables) {
  return __async(this, null, function* () {
    const payload = { query };
    if (variables && typeof variables === "object" && Object.keys(variables).length) {
      payload.variables = variables;
    }
    const res = yield fetch(GRAPHQL, {
      method: "POST",
      headers: BROWSER_UA ? { "User-Agent": BROWSER_UA, "Content-Type": "application/json" } : null,
      body: JSON.stringify(payload)
    });
    if (!res.ok)
      throw new Error(`GraphQL HTTP ${res.status}`);
    return res.json();
  });
}
var NODE_FIELDS = `
    id malId anilistId tmdbId imdbId kitsuId thetvdbId anidbId
    titleRomaji titleEnglish format type episodeCount status
    subCount dubCount seasonYear season source
`;
function fetchAnimeNode(args) {
  return __async(this, null, function* () {
    if (!args || Object.keys(args).length === 0)
      return null;
    const argText = Object.keys(args).map((k) => {
      const v = args[k];
      if (v === null || v === void 0 || v === "")
        return "";
      return typeof v === "number" ? `${k}:${v}` : `${k}:"${v}"`;
    }).filter(Boolean).join(",");
    if (!argText)
      return null;
    const query = `query{anime(${argText}){` + NODE_FIELDS + ` seasons{animeId anilistId malId title relationType seasonYear season format} }}`;
    const json = yield gql(query);
    const node = json && json.data && json.data.anime;
    return node || null;
  });
}

// src/anistream/extractor.js
function classifyRawId(raw) {
  const s = String(raw != null ? raw : "").trim();
  if (!s)
    return null;
  if (/^tt\d+$/i.test(s))
    return { kind: "imdb", number: s.replace(/^tt/i, "") };
  const m = /^([a-zA-Z]+):(\d+)(?::\d+)?$/.exec(s);
  if (m)
    return { kind: String(m[1]).toLowerCase(), number: m[2] };
  if (/^\d+$/.test(s))
    return { kind: "bare", number: s };
  return { kind: "unknown", number: s };
}
function argsFor(kind, number) {
  switch (kind) {
    case "imdb":
      return { imdbId: "tt" + number };
    case "myanimelist":
    case "mal":
      return { malId: Number(number) };
    case "ani":
    case "anime":
    case "anilist":
      return { anilistId: Number(number) };
    case "kitsu":
      return { kitsuId: Number(number) };
    case "tmdb":
    case "themoviedb":
      return { tmdbId: String(number).indexOf("tt") !== 0 ? String(number) : number };
    default:
      return null;
  }
}
var BARE_AXES = (num) => [
  { anilistId: num },
  { malId: num },
  { kitsuId: num },
  { tmdbId: String(num) }
];
function resolveOpaque(parsed, mediaType) {
  return __async(this, null, function* () {
    if (!parsed || parsed.kind === "unknown")
      return null;
    if (parsed.kind === "bare") {
      for (const cand of BARE_AXES(Number(parsed.number))) {
        let node = null;
        try {
          node = yield fetchAnimeNode(cand);
        } catch (e) {
          continue;
        }
        if (!node || !node.id)
          continue;
        return node;
      }
      return null;
    }
    const args = argsFor(parsed.kind, parsed.number);
    if (!args)
      return null;
    try {
      return yield fetchAnimeNode(args);
    } catch (e) {
      console.warn(`[anistream] lookup(${parsed.kind}) failed: ${e.message}`);
      return null;
    }
  });
}
function fetchSources(opaqueId, episode, type, providerId) {
  return __async(this, null, function* () {
    const q = `id=${encodeURIComponent(opaqueId)}&epNum=${episode}&type=${type}` + (providerId ? `&providerId=${encodeURIComponent(providerId)}` : "");
    return getJson(`${REST}/sources?${q}`, {
      "User-Agent": BROWSER_UA,
      Referer: "https://anistream.one/" + q
    });
  });
}
function tracksToSubtitles(tracks) {
  if (!Array.isArray(tracks))
    return [];
  return tracks.filter((t) => t && t.url).map((t) => ({
    url: t.url,
    language: t.lang || t.label || "Undetermined",
    name: t.label || t.lang || null,
    default: !!t.default
  }));
}
function extractStreams(meta) {
  return __async(this, null, function* () {
    const { node, label, raw, episode } = meta;
    if (!node || !node.id)
      return [];
    const opaque = node.id;
    const streams = [];
    const serverQ = `${REST}/servers?id=${encodeURIComponent(opaque)}&epNum=${episode}`;
    let subProv = null;
    let dubProv = null;
    try {
      const servers = yield getJson(serverQ, {
        "User-Agent": BROWSER_UA,
        Referer: "https://anistream.one/" + serverQ
      });
      const pick = (list) => {
        if (!Array.isArray(list) || list.length === 0)
          return null;
        const d = list.find((p) => p && p.default);
        return d || list[0];
      };
      subProv = pick(servers && servers.subProviders);
      dubProv = pick(servers && servers.dubProviders);
    } catch (e) {
      console.warn(`[anistream] servers() failed: ${e.message}`);
    }
    if (subProv && subProv.id) {
      try {
        const src = yield fetchSources(opaque, episode, "sub", subProv.id);
        const url = src && src.sources && src.sources[0] && src.sources[0].url;
        if (url) {
          const headers = Object.assign(
            { "User-Agent": BROWSER_UA },
            src.headers || {}
          );
          streams.push({
            name: label,
            title: `Anistream (SUB) ep.${episode}`,
            quality: "auto",
            url,
            headers,
            subtitles: tracksToSubtitles(src.tracks)
          });
          console.log(`[anistream] ${raw} sub(${subProv.id}) ep${episode} -> ${url.slice(0, 80)}`, "subs", tracksToSubtitles(src.tracks).length);
        }
      } catch (e) {
        console.warn(`[anistream] sub sources failed: ${e.message}`);
      }
    } else {
      console.log(`[anistream] ${raw} ep${episode}: no sub provider (maybe not aired)`);
    }
    if (dubProv && dubProv.id) {
      try {
        const src = yield fetchSources(opaque, episode, "dub", dubProv.id);
        const url = src && src.sources && src.sources[0] && src.sources[0].url;
        if (url) {
          streams.push({
            name: label,
            title: `Anistream (DUB) ep.${episode}`,
            quality: "auto",
            url,
            headers: Object.assign(
              { "User-Agent": BROWSER_UA },
              src.headers || {}
            ),
            subtitles: tracksToSubtitles(src.tracks)
          });
          console.log(`[anistream] ${raw} dub(${dubProv.id}) ep${episode} -> ${url.slice(0, 80)}`);
        }
      } catch (e) {
        console.warn(`[anistream] dub sources failed: ${e.message}`);
      }
    }
    return streams;
  });
}

// src/anistream/index.js
var LABEL = "Anistream";
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(
      `[Anistream] getStreams id=${JSON.stringify(tmdbId)} mediaType=${JSON.stringify(mediaType)} season=${season} episode=${episode}`
    );
    const parsed = classifyRawId(tmdbId);
    if (!parsed || parsed.kind === "unknown") {
      console.warn(`[Anistream] unsupported/empty id "${tmdbId}"`);
      return [];
    }
    try {
      const node = yield resolveOpaque(parsed, String(mediaType || "tv").toLowerCase());
      if (!node || !node.id) {
        console.log(`[Anistream] no resolvable anime for "${tmdbId}"`);
        return [];
      }
      const isMovie = String(mediaType || "tv").toLowerCase() === "movie";
      const episodeNum = isMovie ? 1 : Number(episode || season || 1) || 1;
      const streams = yield extractStreams({
        node,
        label: LABEL,
        raw: String(tmdbId),
        episode: episodeNum,
        mediaType: isMovie ? "movie" : (node.format || "tv").toLowerCase()
      });
      console.log(`[Anistream] resolved ${streams.length} stream(s) for "${tmdbId}"`);
      return streams;
    } catch (error) {
      console.error(`[Anistream] Error: ${error.message}`, error && error.stack || "");
      return [];
    }
  });
}
module.exports = { getStreams };
