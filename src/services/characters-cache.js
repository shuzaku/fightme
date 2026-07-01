import CharactersService from '@/services/characters-service';

const entries = {};

function mapCharacters(raw) {
    return (raw || []).map((character) => ({
        id: character._id || character.id,
        name: character.Name || character.name,
        avatarUrl: character.AvatarUrl || character.avatarUrl,
        imageUrl: character.ImageUrl || character.imageUrl,
        slug: character.Slug || character.slug,
    }));
}

function getEntry(gameId) {
    if (!gameId) {
        return null;
    }
    const key = String(gameId);
    if (!entries[key]) {
        entries[key] = { data: null, promise: null, subscribers: new Set() };
    }
    return entries[key];
}

function notify(entry) {
    entry.subscribers.forEach((fn) => {
        try {
            fn(entry.data);
        } catch (e) {
            /* ignore subscriber errors */
        }
    });
}

export function getCharactersCache(gameId) {
    const entry = getEntry(gameId);
    return entry ? entry.data : null;
}

export function setCharactersCache(gameId, characters) {
    const entry = getEntry(gameId);
    if (!entry) {
        return;
    }
    entry.data = mapCharacters(characters);
    entry.promise = null;
    notify(entry);
}

export function invalidateCharactersCache(gameId) {
    if (gameId) {
        const entry = getEntry(gameId);
        if (entry) {
            entry.data = null;
            entry.promise = null;
        }
        return;
    }
    Object.keys(entries).forEach((key) => {
        entries[key].data = null;
        entries[key].promise = null;
    });
}

export function loadCharacters(gameId, force = false) {
    if (!gameId) {
        return Promise.resolve([]);
    }

    const entry = getEntry(gameId);
    if (force) {
        entry.data = null;
        entry.promise = null;
    }
    if (entry.data) {
        return Promise.resolve(entry.data);
    }
    if (entry.promise) {
        return entry.promise;
    }

    entry.promise = CharactersService.queryCharacters({
        searchQuery: [{ queryName: 'GameId', queryValue: String(gameId) }],
    })
        .then((response) => {
            entry.data = mapCharacters(response.data.characters);
            entry.promise = null;
            notify(entry);
            return entry.data;
        })
        .catch((err) => {
            entry.promise = null;
            throw err;
        });

    return entry.promise;
}

export function subscribeCharactersCache(gameId, fn) {
    const entry = getEntry(gameId);
    if (!entry) {
        return () => {};
    }
    entry.subscribers.add(fn);
    if (entry.data) {
        fn(entry.data);
    }
    return () => entry.subscribers.delete(fn);
}
