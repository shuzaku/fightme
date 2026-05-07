/**
 * analytics-service.ts
 *
 * Central wrapper for all GA4 custom event tracking.
 * Uses the global gtag() function loaded by vue-gtag.
 * All events appear in GA4 under Events → [event_name].
 */

declare function gtag(...args: any[]): void;

function track(eventName: string, params: Record<string, any> = {}) {
    if (typeof gtag === 'undefined') return;
    gtag('event', eventName, params);
}

// ─── Engagement events ────────────────────────────────────────────────────────

/** Fired when a user saves/favorites a match or combo clip. */
export function trackMatchSaved(params: {
    content_type: 'Match' | 'Combo';
    video_id: string;
}) {
    track('match_saved', params);
}

/** Fired when a user creates a new collection. */
export function trackCollectionCreated(params: {
    collection_id: string;
}) {
    track('collection_created', params);
}

/** Fired when a user adds a video to an existing collection. */
export function trackAddedToCollection(params: {
    video_id: string;
    collection_id: string;
}) {
    track('added_to_collection', params);
}

/** Fired when a user follows a player. */
export function trackPlayerFollowed(params: {
    player_id: string;
}) {
    track('player_followed', params);
}

/** Fired when a user follows a game. */
export function trackGameFollowed(params: {
    game_id: string;
}) {
    track('game_followed', params);
}

/** Fired when a match video starts playing. */
export function trackMatchWatched(params: {
    video_id: string;
    game_id?: string;
}) {
    track('match_watched', params);
}

/** Fired when a user performs a search (general search bar). */
export function trackSearch(params: {
    search_term: string;
    result_type?: string;
}) {
    track('search', { search_term: params.search_term, result_type: params.result_type });
}
