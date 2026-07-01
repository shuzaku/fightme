import PlayersService from '@/services/players-service';

let cache = null;
let loadPromise = null;
const subscribers = new Set();

function mapPlayers(raw) {
    return (raw || []).map((player) => ({
        id: player._id || player.id,
        playerName: player.Name || player.playerName,
        twitter: player.Twitter,
        stream: player.Stream,
        youtube: player.Youtube,
        slug: player.Slug,
        matchupAppearance: player.MatchupAppearance,
    }));
}

function notify() {
    subscribers.forEach((fn) => {
        try {
            fn(cache);
        } catch (e) {
            /* ignore subscriber errors */
        }
    });
}

export function getPlayersCache() {
    return cache;
}

export function setPlayersCache(players) {
    cache = mapPlayers(players);
    loadPromise = null;
    notify();
}

export function invalidatePlayersCache() {
    cache = null;
    loadPromise = null;
}

export function loadPlayers(force = false) {
    if (force) {
        invalidatePlayersCache();
    }
    if (cache) {
        return Promise.resolve(cache);
    }
    if (loadPromise) {
        return loadPromise;
    }

    loadPromise = PlayersService.fetchPlayers()
        .then((response) => {
            cache = mapPlayers(response.data.players);
            loadPromise = null;
            notify();
            return cache;
        })
        .catch((err) => {
            loadPromise = null;
            throw err;
        });

    return loadPromise;
}

export function subscribePlayersCache(fn) {
    subscribers.add(fn);
    if (cache) {
        fn(cache);
    }
    return () => subscribers.delete(fn);
}
