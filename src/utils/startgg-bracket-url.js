/**
 * Builds a start.gg bracket URL from a tournament's StartggSlug.
 *
 * Only manually-entered tournaments carry BracketUrl. Auto-ingested ones
 * (MicroServices/tournament-ingestion-service) store a start.gg slug instead,
 * in one of two shapes:
 *   - "tournament/<t>"           — fuzzy match against start.gg's tournament search
 *   - "tournament/<t>/event/<e>" — normalized from a Liquipedia `startgg=` ref
 * Both resolve under start.gg/. A bare slug missing the "tournament/" prefix is
 * tolerated too, since the prefix-omitted form shows up in Liquipedia data.
 *
 * Returns null when there's no usable slug, so callers can fall through to
 * hiding the link.
 */
export function startggBracketUrl(slug) {
    if (!slug) return null;

    const trimmed = String(slug).trim().replace(/^\/+/, '');
    if (!trimmed) return null;

    const path = trimmed.startsWith('tournament/') ? trimmed : `tournament/${trimmed}`;
    return `https://start.gg/${path}`;
}

export default startggBracketUrl;
