/**
 * anistream - Built from src/anistream/
 * Generated: 2026-09-04T12:43:57.445Z
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
var BROWSER_UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
var SITE_REFERER = "https://anistream.one/home";
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
function malFromImdb(imdbId, season, episode) {
  return __async(this, null, function* () {
    const url = `https://id-mapping-api-malid.hf.space/api/resolve?id=${encodeURIComponent("tt" + imdbId)}&s=${Number(season) || 1}&e=${Number(episode) || 1}`;
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
function resolveOpaque(parsed, season, episode) {
  return __async(this, null, function* () {
    if (!parsed || parsed.kind === "unknown")
      return null;
    const num = Number(episode || season || 1) || 1;
    if (parsed.kind === "imdb") {
      try {
        const m = yield malFromImdb(parsed.number, season || 1, num);
        if (m && m.malId) {
          const node = yield fetchAnimeNode({ malId: Number(m.malId) });
          if (node && node.id) {
            return { node, episode: Number(m.malEpisode) || num };
          }
        }
      } catch (e) {
        console.warn(`[anistream] imdb->mal resolve failed: ${e.message}`);
      }
      try {
        const node = yield fetchAnimeNode({ imdbId: "tt" + parsed.number });
        if (node && node.id)
          return { node, episode: num };
      } catch (e) {
      }
      return null;
    }
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
        return { node, episode: num };
      }
      return null;
    }
    const args = argsFor(parsed.kind, parsed.number);
    if (!args)
      return null;
    try {
      const node = yield fetchAnimeNode(args);
      if (node && node.id)
        return { node, episode: num };
      return null;
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
      Referer: SITE_REFERER
    });
  });
}
function tracksToSubtitles(tracks, streamHeaders) {
  if (!Array.isArray(tracks))
    return [];
  return tracks.filter((t) => t && t.url && (t.lang || t.label)).map((t) => ({
    url: t.url,
    language: t.lang || t.label || "Undetermined",
    name: t.label || t.lang || null,
    headers: streamHeaders || void 0
  }));
}
function extractStreams(meta) {
  return __async(this, null, function* () {
    const { node, label, raw, episode } = meta;
    if (!node || !node.id)
      return [];
    const opaque = node.id;
    const streams = [];
    let subProviders = [];
    let dubProviders = [];
    try {
      const serverQ = `${REST}/servers?id=${encodeURIComponent(opaque)}&epNum=${episode}`;
      const servers = yield getJson(serverQ, {
        "User-Agent": BROWSER_UA,
        Referer: SITE_REFERER
      });
      subProviders = Array.isArray(servers && servers.subProviders) ? servers.subProviders : [];
      dubProviders = Array.isArray(servers && servers.dubProviders) ? servers.dubProviders : [];
    } catch (e) {
      console.warn(`[anistream] servers() failed: ${e.message}`);
    }
    const pushAudio = (provList, audio) => __async(this, null, function* () {
      const tag = audio === "dub" ? "DUB" : "SUB";
      for (const prov of provList) {
        if (!prov || !prov.id)
          continue;
        try {
          const src = yield fetchSources(opaque, episode, audio, prov.id);
          const url = src && src.sources && src.sources[0] && src.sources[0].url;
          if (!url)
            continue;
          const headers = Object.assign(
            { "User-Agent": BROWSER_UA },
            src.headers || {}
          );
          const tip = (prov.tip || "").replace(/^Soft sub,?\s*/i, "").trim();
          streams.push({
            name: `${tag} \xB7 ${prov.id}`,
            title: `${tag} \xB7 ${prov.id}${tip ? " \xB7 " + tip : ""}`,
            quality: "auto",
            url,
            headers,
            subtitles: tracksToSubtitles(src.tracks, headers)
          });
          console.log(`[anistream] ${raw} ${audio}(${prov.id}) ep${episode} -> ${url.slice(0, 80)} (${(src.tracks || []).length} subs)`);
        } catch (e) {
          console.warn(`[anistream] ${audio}(${prov.id}) sources failed: ${e.message}`);
        }
      }
    });
    yield pushAudio(subProviders, "sub");
    if (dubProviders.length === 0) {
      console.log(`[anistream] ${raw} ep${episode}: no dub server for this anime/episode`);
    } else {
      yield pushAudio(dubProviders, "dub");
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
      const isMovie = String(mediaType || "tv").toLowerCase() === "movie";
      const seasonNum = isMovie ? 1 : Number(season) || void 0;
      const episodeNum = isMovie ? 1 : Number(episode || season || 1) || 1;
      const res = yield resolveOpaque(parsed, seasonNum, episodeNum);
      if (!res || !res.node || !res.node.id) {
        console.log(`[Anistream] no resolvable anime for "${tmdbId}"`);
        return [];
      }
      const { node, episode: finalEp } = res;
      const streams = yield extractStreams({
        node,
        label: LABEL,
        raw: String(tmdbId),
        episode: finalEp,
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
