/**
 * Parse bulk tournament match lines:
 *   0:35 SQUISHY FISH vs FRANCIS
 *   00:30:25 Ghirlanda (Kunimitsu) vs. Kirakira (Jun)
 *   29:11 froggymustdie (blanka) v nuckledu (mai)
 *   36:05 - Shinko9 (Eddy) vs Magnalynx21 (Law)
 *   1:10:27 - Salty (Hwoarang) vs Sh4ky (Leo)
 *   20:58 LukesFH (Blitzcrank / Vi) VS Toshi // Haru (Jinx / Thresh)
 *
 * Timestamp is clip start; clip end is the next line's start (last row has no end).
 * Optional " - " may follow the timestamp (YouTube chapter lists).
 * Match separator: " vs ", " vs.", " v ", or " VS " (case insensitive).
 * Tag teams: "//" between players (2XKO), or "/" when not inside ().
 * Characters: inside () separated by "," or "/".
 * Tag teams with 2 players: first character → player 1, remaining → player 2.
 */

const LINE_RE = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*(?:-\s*)?(.+?)\s+v(?:s)?\.?\s+(.+)$/i;
const PLAYER_SIDE_RE = /^(.+?)\s*\(([^)]+)\)\s*$/;
const TAG_TEAM_SPLIT_RE = /\s*\/\/\s*/;

export function normalizeName(name) {
  return (name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** @deprecated use normalizeName */
export function normalizePlayerName(name) {
  return normalizeName(name);
}

function splitOutsideParens(text, delimiter) {
  const parts = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(') {
      depth++;
      current += c;
    } else if (c === ')') {
      depth--;
      current += c;
    } else if (depth === 0 && text.slice(i, i + delimiter.length) === delimiter) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
      i += delimiter.length - 1;
    } else {
      current += c;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

export function parsePlayerSide(side) {
  const trimmed = (side || '').trim();
  const charMatch = trimmed.match(PLAYER_SIDE_RE);
  if (charMatch) {
    return {
      playerName: charMatch[1].trim(),
      characterNames: charMatch[2]
        .split(/[,/]/)
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }
  return { playerName: trimmed, characterNames: [] };
}

/** When a side has two tag partners, split shared character list across them. */
export function distributeTagTeamCharacters(players) {
  if (players.length !== 2) {
    return players;
  }

  const allChars = [];
  players.forEach((p) => {
    allChars.push(...(p.characterNames || []));
  });

  if (allChars.length === 0) {
    return players;
  }

  return [
    { ...players[0], characterNames: [allChars[0]] },
    { ...players[1], characterNames: allChars.slice(1) },
  ];
}

/** One team side — single player or tag partners. */
export function parseTeamSide(side) {
  const trimmed = (side || '').trim();
  if (!trimmed) return [];

  let playerSegments;
  if (TAG_TEAM_SPLIT_RE.test(trimmed)) {
    playerSegments = trimmed.split(TAG_TEAM_SPLIT_RE).map((s) => s.trim()).filter(Boolean);
  } else {
    playerSegments = splitOutsideParens(trimmed, '/');
  }

  const players = playerSegments.map((part) => parsePlayerSide(part)).filter((p) => p.playerName);
  return distributeTagTeamCharacters(players);
}

export function parseBulkMatchLines(text) {
  const lines = (text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed = [];
  const errors = [];

  lines.forEach((line, index) => {
    const m = line.match(LINE_RE);
    if (!m) {
      errors.push(`Line ${index + 1}: could not parse "${line}"`);
      return;
    }
    parsed.push({
      clipStart: m[1].trim(),
      team1Players: parseTeamSide(m[2]),
      team2Players: parseTeamSide(m[3]),
    });
  });

  for (let i = 0; i < parsed.length; i++) {
    parsed[i].clipEnd = i + 1 < parsed.length ? parsed[i + 1].clipStart : '';
  }

  return { matches: parsed, errors };
}

export function findPlayerByName(players, name) {
  const target = normalizeName(name);
  if (!target) return null;
  return (
    players.find((p) => normalizeName(p.playerName || p.Name) === target) || null
  );
}

export function findCharacterByName(characters, name) {
  const target = normalizeName(name);
  if (!target) return null;
  return (
    characters.find((c) => normalizeName(c.name || c.Name) === target) || null
  );
}

export function mapApiCharacters(characters) {
  return (characters || []).map((c) => ({
    id: c._id,
    name: c.Name,
    Name: c.Name,
  }));
}

export function mapApiPlayers(players) {
  return (players || []).map((p) => ({
    id: p._id,
    playerName: p.Name,
    Name: p.Name,
  }));
}

/** Parse clip time (seconds, MM:SS, or HH:MM:SS) to YouTube `t` seconds. */
export function clipTimeToSeconds(time) {
  if (time == null || time === '') return null;
  const str = String(time).trim();
  if (!str) return null;
  if (/^\d+(\.\d+)?$/.test(str)) return Math.floor(Number(str));
  const parts = str.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  }
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  const n = parseInt(parts[0], 10);
  return Number.isNaN(n) ? null : n;
}

export function buildYoutubeWatchUrl(videoId, clipStart) {
  if (!videoId) return null;
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  const seconds = clipTimeToSeconds(clipStart);
  if (seconds == null) return base;
  return `${base}&t=${seconds}`;
}
