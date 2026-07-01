<!-- @format -->
<template>
    <div class="gtf">
        <div class="gtf-label">Filter by team pairing</div>
        <p class="gtf-hint">
            Pick two characters on the same team to narrow match results below.
        </p>

        <!-- Selected team slots -->
        <div class="gtf-slots">
            <div
                class="gtf-slot"
                :class="{ filled: char1, empty: !char1 }"
                @click="char1 && clearChar(1)"
            >
                <template v-if="char1">
                    <img :src="char1.imageUrl" class="gtf-slot-img" />
                    <span class="gtf-slot-name">{{ char1.name }}</span>
                    <span class="gtf-slot-remove">×</span>
                </template>
                <template v-else>
                    <span class="gtf-slot-placeholder">Pick char 1</span>
                </template>
            </div>

            <span class="gtf-plus">+</span>

            <div
                class="gtf-slot"
                :class="{ filled: char2, empty: !char2, disabled: !char1 }"
                @click="char2 && clearChar(2)"
            >
                <template v-if="char2">
                    <img :src="char2.imageUrl" class="gtf-slot-img" />
                    <span class="gtf-slot-name">{{ char2.name }}</span>
                    <span class="gtf-slot-remove">×</span>
                </template>
                <template v-else>
                    <span class="gtf-slot-placeholder">{{ char1 ? 'Pick char 2' : '—' }}</span>
                </template>
            </div>

            <button v-if="char1 || char2" class="gtf-clear-btn" @click="clearAll">
                Clear
            </button>
        </div>

        <!-- Character chip grid -->
        <div v-if="characters.length" class="gtf-chars">
            <button
                v-for="c in characters"
                :key="c.id"
                class="gtf-char-chip"
                :class="{
                    'gtf-char-chip--selected': isSelected(c.id),
                    'gtf-char-chip--disabled': char2 && !isSelected(c.id),
                }"
                :title="c.name"
                @click="selectChar(c)"
            >
                <img :src="c.imageUrl" class="gtf-char-img" />
                <span class="gtf-char-name">{{ c.name }}</span>
            </button>
        </div>
        <div v-else-if="loading" class="gtf-loading">Loading characters…</div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'GameTeamFilter',

    props: {
        gameId: { type: String, required: true },
    },

    data() {
        return {
            characters: [],
            loading: false,
            char1: null,
            char2: null,
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
                console.error('GameTeamFilter: failed to load characters', e);
            }
            this.loading = false;
        },

        isSelected(id) {
            return (this.char1 && this.char1.id === id) || (this.char2 && this.char2.id === id);
        },

        selectChar(c) {
            if (this.char1 && this.char1.id === c.id) return this.clearChar(1);
            if (this.char2 && this.char2.id === c.id) return this.clearChar(2);
            if (this.char2) return;
            if (!this.char1) {
                this.char1 = c;
            } else {
                this.char2 = c;
            }
            this.emitChange();
        },

        clearChar(slot) {
            if (slot === 1) {
                this.char1 = this.char2 || null;
                this.char2 = null;
            } else {
                this.char2 = null;
            }
            this.emitChange();
        },

        clearAll() {
            this.char1 = null;
            this.char2 = null;
            this.emitChange();
        },

        emitChange() {
            this.$emit('change', {
                char1: this.char1 ? this.char1.id : null,
                char2: this.char2 ? this.char2.id : null,
            });
        },
    },
};
</script>

<style>
.gtf {
    width: 100%;
    max-width: 1100px;
    margin-bottom: 20px;
    padding: 16px;
    background: #1a1d2e;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.gtf-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 8px;
}

.gtf-hint {
    margin: 0 0 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.4;
}

/* ── Slots ─────────────────────────────── */
.gtf-slots {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.gtf-slot {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px 6px 8px;
    border-radius: 8px;
    border: 1.5px dashed rgba(255, 255, 255, 0.2);
    min-width: 130px;
    cursor: default;
    transition: border-color 0.15s;
}

.gtf-slot.filled {
    border-style: solid;
    border-color: #4447e2;
    background: rgba(68, 71, 226, 0.12);
    cursor: pointer;
}

.gtf-slot.filled:hover {
    border-color: #e24444;
    background: rgba(226, 68, 68, 0.1);
}

.gtf-slot.disabled {
    opacity: 0.4;
}

.gtf-slot-img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.gtf-slot-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.gtf-slot-remove {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1;
}

.gtf-slot-placeholder {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
}

.gtf-plus {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 300;
}

.gtf-clear-btn {
    margin-left: auto;
    padding: 5px 14px;
    border-radius: 20px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}

.gtf-clear-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}

/* ── Character chip grid ─────────────── */
.gtf-chars {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.gtf-char-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.15s;
    width: 70px;
}

.gtf-char-chip:hover:not(.gtf-char-chip--disabled) {
    border-color: #4447e2;
    background: rgba(68, 71, 226, 0.15);
}

.gtf-char-chip--selected {
    border-color: #4447e2 !important;
    background: rgba(68, 71, 226, 0.25) !important;
}

.gtf-char-chip--disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.gtf-char-img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
}

.gtf-char-name {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.75);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 62px;
}

.gtf-loading {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
}
</style>
