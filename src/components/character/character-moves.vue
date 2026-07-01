<template>
    <div class="character-moves">
        <loading v-if="isLoading" />

        <template v-else>
            <!-- Image grid palette (new character-moves API) -->
            <div v-if="moves.length" class="moves-grid">
                <div
                    v-for="move in moves"
                    :key="move._id"
                    class="move-card"
                    :title="move.MoveName"
                >
                    <div class="move-card-img-wrap">
                        <move-media v-if="move.ImageUrl" :src="move.ImageUrl" :alt="move.MoveName" />
                        <div v-else class="move-card-img-placeholder">
                            <i class="fas fa-hand-rock"></i>
                        </div>
                    </div>
                    <span class="move-card-name">{{ move.MoveName }}</span>
                </div>
            </div>

            <div v-else class="moves-empty">
                <p>No moves yet.</p>
                <p class="moves-empty-hint">Moves are populated by the wiki scraper.</p>
            </div>

            <!-- Attribution credit -->
            <div v-if="attributionUrl" class="moves-attribution">
                Move images sourced from
                <a :href="attributionUrl" target="_blank" rel="noopener noreferrer">{{ attributionHost }}</a>.
                All rights belong to their respective owners.
            </div>
        </template>
    </div>
</template>

<script>
import CharacterMovesService from '@/services/character-moves-service';
import Loading from '@/components/common/loading';
import MoveMedia from '@/components/common/move-media.vue';

export default {
    name: 'CharacterMoves',
    components: { loading: Loading, MoveMedia },
    props: {
        characterId: { type: String, default: null },
        gameId: { type: String, default: null },
    },
    data() {
        return {
            isLoading: false,
            moves: [],
        };
    },
    computed: {
        // Pick the first WikiSourceUrl that has a value for attribution.
        attributionUrl() {
            const move = this.moves.find((m) => m.WikiSourceUrl);
            return move ? move.WikiSourceUrl : null;
        },
        attributionHost() {
            if (!this.attributionUrl) return null;
            try {
                return new URL(this.attributionUrl).hostname.replace(/^www\./, '');
            } catch {
                return this.attributionUrl;
            }
        },
    },
    created() {
        if (this.characterId) this.getMoves();
    },
    methods: {
        async getMoves() {
            this.isLoading = true;
            try {
                const resp = await CharacterMovesService.getMovesForCharacter(this.characterId);
                this.moves = resp.data || [];
            } catch (e) {
                console.error('[CharacterMoves] getMoves', e);
                this.moves = [];
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style scoped>
.character-moves {
    color: #fff;
    padding: 16px 0;
}

/* ── Grid ───────────────────────────────────────────────────────────────── */
.moves-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
    padding: 0 4px 16px;
}

.move-card {
    background: #1c1c24;
    border: 1px solid #2e2e3a;
    border-radius: 6px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    transition: border-color 0.15s;
}

.move-card:hover {
    border-color: #3eb489;
}

.move-card-img-wrap {
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: 4px;
    background: #11111a;
    display: flex;
    align-items: center;
    justify-content: center;
}

.move-card-img-wrap img,
.move-card-img-wrap .move-media {
    width: 100%;
    height: 100%;
}

.move-card-img-placeholder {
    color: #333;
    font-size: 18px;
}

.move-card-name {
    font-size: 10px;
    color: #aaa;
    text-align: center;
    line-height: 1.2;
    word-break: break-word;
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
.moves-empty {
    text-align: center;
    padding: 32px 0 16px;
    color: #666;
    font-size: 13px;
}

.moves-empty-hint {
    margin-top: 6px;
    font-size: 11px;
    color: #444;
}

/* ── Attribution ─────────────────────────────────────────────────────────── */
.moves-attribution {
    margin-top: 10px;
    font-size: 10px;
    color: #555;
    text-align: center;
}

.moves-attribution a {
    color: #3eb489;
    text-decoration: none;
}

.moves-attribution a:hover {
    text-decoration: underline;
}
</style>
