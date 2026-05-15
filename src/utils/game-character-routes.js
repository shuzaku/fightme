/** @format */

import GamesService from '@/services/games-service';

export const MONGO_OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/**
 * Resolves a game document _id from a route segment: either a 24-char hex id or a game Abbreviation.
 */
export async function resolveGameIdFromRouteParam(key) {
    if (key == null || key === '') {
        return '';
    }
    const s = String(key).trim();
    if (MONGO_OBJECT_ID_RE.test(s)) {
        return s;
    }
    const attempts = [s, s.toUpperCase(), s.toLowerCase()];
    var tried = {};
    for (var i = 0; i < attempts.length; i++) {
        var abbr = attempts[i];
        if (!abbr || tried[abbr]) {
            continue;
        }
        tried[abbr] = true;
        var r = await GamesService.queryGames({
            searchQuery: [{ queryName: 'Abbreviation', queryValue: abbr }],
        });
        var games = r.data && r.data.games;
        if (games && games.length > 0) {
            return games[0]._id;
        }
    }
    return '';
}

export function gamePathFromAbbreviation(abbreviation) {
    if (abbreviation == null || abbreviation === '') {
        return '';
    }
    return String(abbreviation).trim().toLowerCase();
}

export function characterPathSegmentFromApiRow(row) {
    if (!row) {
        return '';
    }
    var slug = row.Slug != null ? row.Slug : row.slug;
    if (slug) {
        return String(slug).trim().toLowerCase();
    }
    var name = row.Name != null ? row.Name : row.name;
    if (name) {
        return String(name)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
    }
    return '';
}

/** For Vue character objects { id, name, slug } from character-search / explore. */
export function characterPathSegment(character) {
    if (!character) {
        return '';
    }
    // Prefer the DB slug when available — it's the canonical identifier
    // (e.g. SF6_ALEX → /character/sf6_alex). The backend resolves by both
    // Slug and Name so name-derived fallbacks also work.
    if (character.slug) {
        return String(character.slug).trim().toLowerCase();
    }
    if (character.Slug) {
        return String(character.Slug).trim().toLowerCase();
    }
    var name = character.name != null ? character.name : character.Name;
    if (name) {
        return String(name)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
    }
    return '';
}

export function normalizeCharacterRouteKey(characterKeyRaw) {
    if (characterKeyRaw == null) {
        return '';
    }
    try {
        return decodeURIComponent(String(characterKeyRaw).trim());
    } catch (e) {
        return String(characterKeyRaw).trim();
    }
}

export function characterApiRowMatchesRouteKey(row, characterKeyRaw) {
    var key = normalizeCharacterRouteKey(characterKeyRaw).toLowerCase();
    if (!key || !row) {
        return false;
    }
    var slug = (row.Slug != null && String(row.Slug)) || '';
    if (slug && slug.toLowerCase() === key) {
        return true;
    }
    var name = (row.Name != null && String(row.Name)) || '';
    if (!name) {
        return false;
    }
    var nameLower = name.toLowerCase();
    var keyHyphen = key.replace(/\s+/g, '-');
    var nameHyphen = nameLower.replace(/\s+/g, '-');
    var keySpaces = key.replace(/-/g, ' ');
    return (
        nameLower === key ||
        nameHyphen === key ||
        nameHyphen === keyHyphen ||
        nameLower === keySpaces
    );
}

/**
 * @param {string} gameAbbreviation - resolved Abbreviation for URL
 * @param {object} character - { slug?, name?, id? }
 */
export function gameCharacterPath(gameAbbreviation, character) {
    var g = gamePathFromAbbreviation(gameAbbreviation);
    var c = characterPathSegment(character);
    if (!g || !c) {
        return '';
    }
    return `/game/${encodeURIComponent(g)}/character/${encodeURIComponent(c)}`;
}

/**
 * Game hub URL: /game/{abbrev-lowercase} when Abbreviation is set, else /game/{mongoId}.
 * @param {object|null} gameLike — { abbreviation?, Abbreviation?, id?, _id? }
 */
export function gameHrefFromLike(gameLike) {
    if (!gameLike) {
        return '';
    }
    var abbr =
        gameLike.abbreviation != null
            ? gameLike.abbreviation
            : gameLike.Abbreviation != null
              ? gameLike.Abbreviation
              : '';
    var seg = gamePathFromAbbreviation(abbr);
    if (!seg) {
        var id = gameLike._id != null ? gameLike._id : gameLike.id;
        if (id != null && id !== '') {
            seg = String(id);
        }
    }
    if (!seg) {
        return '';
    }
    return `/game/${encodeURIComponent(seg)}`;
}

/**
 * Player page: /player/{slug} when slug is available, else /player/{id}.
 * Accepts objects with { slug?, Slug?, name?, Name?, id?, _id? }.
 */
export function playerPathSegment(playerLike) {
    if (!playerLike) { return ''; }
    var slug = playerLike.slug != null ? playerLike.slug : playerLike.Slug;
    if (slug) { return String(slug).trim().toLowerCase(); }
    var name = playerLike.name != null ? playerLike.name : playerLike.Name;
    if (name) {
        return String(name).trim().toLowerCase().replace(/\s+/g, '-');
    }
    return '';
}

export function playerPagePath(playerLike) {
    if (playerLike == null) { return ''; }
    var seg = playerPathSegment(playerLike);
    if (seg) { return `/player/${encodeURIComponent(seg)}`; }
    var pid =
        playerLike._id != null
            ? playerLike._id
            : playerLike.id != null
              ? playerLike.id
              : typeof playerLike === 'string' || typeof playerLike === 'number'
                ? playerLike
                : '';
    if (pid === '' || pid == null) { return ''; }
    return `/player/${encodeURIComponent(String(pid))}`;
}

/**
 * Character page: /character/{slug-or-name} when a path segment can be derived; otherwise /character/:id.
 * The game context is no longer used for the URL shape — the flat /character/{slug} is canonical.
 */
export function characterPagePath(gameLike, characterLike) {
    if (characterLike == null) {
        return '';
    }
    var seg = characterPathSegment(characterLike);
    if (seg) {
        return `/character/${encodeURIComponent(seg)}`;
    }
    var cid =
        characterLike._id != null
            ? characterLike._id
            : characterLike.id != null
              ? characterLike.id
              : typeof characterLike === 'string' || typeof characterLike === 'number'
                ? characterLike
                : '';
    if (cid === '' || cid == null) {
        return '';
    }
    return `/character/${encodeURIComponent(String(cid))}`;
}
