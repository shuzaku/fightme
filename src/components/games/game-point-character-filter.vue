<!-- @format -->
<template>
    <div class="gpf">
        <div class="gpf-header">
            <h2>Filter by point character</h2>
            <button v-if="selected" class="gpf-clear-btn" @click="clearSelection">
                <span>Clear</span>
            </button>
        </div>
        <p class="gpf-hint">
            The point character is the first character listed for a player. Pick one to show only
            replays where someone led with them.
        </p>

        <div v-if="characters.length" class="gpf-chars" :class="{ 'gpf-chars--picked': !!selected }">
            <button
                v-for="c in characters"
                :key="c.id"
                class="gpf-char"
                :class="{ 'gpf-char--selected': selected && selected.id === c.id }"
                :title="c.name"
                :aria-pressed="!!(selected && selected.id === c.id)"
                @click="selectChar(c)"
            >
                <img :src="c.imageUrl" :alt="c.name" />
                <span class="gpf-char-sheen"></span>
            </button>
        </div>
        <div v-else-if="loading" class="gpf-loading">Loading characters…</div>

        <div v-if="selected" class="gpf-active">
            <span class="gpf-active-label">Point</span>
            <img v-if="selected.imageUrl" :src="selected.imageUrl" :alt="selected.name" />
            <span class="gpf-active-name">{{ selected.name }}</span>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'GamePointCharacterFilter',

    props: {
        gameId: { type: String, required: true },
    },

    data() {
        return {
            characters: [],
            loading: false,
            selected: null,
        };
    },

    mounted() {
        this.loadCharacters();
    },

    methods: {
        async loadCharacters() {
            this.loading = true;
            try {
                const res = await CharactersService.queryCharacters({
                    searchQuery: [{ queryName: 'GameId', queryValue: this.gameId }],
                });
                const raw = res.data.characters || res.data || [];
                this.characters = raw
                    .map((c) => ({
                        id: c._id,
                        name: c.Name || c.name,
                        imageUrl: c.AvatarUrl || c.imageUrl,
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
            } catch (e) {
                console.error('GamePointCharacterFilter: failed to load characters', e);
            }
            this.loading = false;
        },

        selectChar(c) {
            // Clicking the active character clears the filter.
            if (this.selected && this.selected.id === c.id) {
                this.clearSelection();
                return;
            }
            this.selected = c;
            this.emitChange();
        },

        clearSelection() {
            this.selected = null;
            this.emitChange();
        },

        emitChange() {
            this.$emit('change', { pointChar: this.selected ? this.selected.id : null });
        },
    },
};
</script>

<style>
.gpf {
    width: 100%;
    margin: 0 0 28px;
    padding: 18px 20px 20px;
    background: linear-gradient(180deg, #1b1e2b 0%, #16181f 100%);
    border: 1px solid #ffffff1f;
    border-left: 3px solid #3eb489;
    border-radius: 4px;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
}

.gpf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ffffff14;
}

.gpf-header h2 {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
}

.gpf-clear-btn {
    padding: 5px 14px;
    background: transparent;
    border: 1px solid #ffffff26;
    border-radius: 0;
    color: #ffffff80;
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transform: skewX(-8deg);
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.gpf-clear-btn > span {
    display: inline-block;
    transform: skewX(8deg);
}

.gpf-clear-btn:hover {
    background: #ffffff12;
    border-color: #ffffff40;
    color: #fff;
}

.gpf-hint {
    margin: 0 0 14px;
    font-size: 13px;
    line-height: 1.5;
    color: #ffffff70;
}

/* Angled roster cells, matching the character select grid. */
.gpf-chars {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.gpf-char {
    position: relative;
    width: 68px;
    height: 68px;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    background: #0e1018;
    border: 1px solid #ffffff26;
    border-radius: 0;
    transform: skewX(-8deg);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.gpf-char img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: skewX(8deg) scale(1.22);
    filter: saturate(0.85) brightness(0.86);
    transition: filter 0.15s ease, transform 0.2s ease;
}

.gpf-char-sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, #ffffff00 40%, #ffffff1f 62%, #ffffff00 78%);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
}

.gpf-char:hover {
    border-color: #3eb489;
    box-shadow: 0 0 0 1px #3eb489, 0 8px 20px rgba(0, 0, 0, 0.45);
    transform: skewX(-8deg) translateY(-3px);
}

.gpf-char:hover img {
    filter: saturate(1.05) brightness(1.05);
    transform: skewX(8deg) scale(1.3);
}

.gpf-char:hover .gpf-char-sheen {
    opacity: 1;
}

.gpf-char--selected {
    border-color: #5ae1ae;
    box-shadow: 0 0 0 2px #3eb489, 0 8px 20px rgba(62, 180, 137, 0.35);
}

.gpf-char--selected img {
    filter: saturate(1.1) brightness(1.08);
}

/* Dim the rest of the roster once a point character is locked in. */
.gpf-chars--picked .gpf-char:not(.gpf-char--selected) {
    opacity: 0.45;
}

.gpf-chars--picked .gpf-char:not(.gpf-char--selected):hover {
    opacity: 1;
}

.gpf-active {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    padding: 6px 16px 6px 10px;
    background: #3eb4891f;
    border-left: 3px solid #3eb489;
    transform: skewX(-8deg);
}

.gpf-active > * {
    transform: skewX(8deg);
}

.gpf-active-label {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5ae1ae;
}

.gpf-active img {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border: 1px solid #3eb48980;
}

.gpf-active-name {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fff;
}

.gpf-loading {
    font-size: 13px;
    color: #ffffff66;
    font-style: italic;
}

.mobile .gpf-chars {
    justify-content: center;
    gap: 5px;
}

.mobile .gpf-char {
    width: 58px;
    height: 58px;
}

.mobile .gpf-header h2 {
    font-size: 17px;
}
</style>
