<template>
  <div class="move-palette" :style="{ '--accent-color': accentColor }">
    <div v-if="loading" class="palette-loading">
      <i class="fas fa-spinner fa-spin"></i> Loading moves…
    </div>
    <div v-else-if="!moves.length" class="palette-empty">
      <p>No moves found.</p>
      <p v-if="!characterId" class="palette-hint">Select a character to see their moves.</p>
      <p v-else class="palette-hint">Moves are scraped from the character's wiki page. Run the scraper to populate them.</p>
    </div>
    <div v-else class="palette-grid">
      <div
        v-for="move in filteredMoves"
        :key="move._id"
        class="palette-item"
        draggable="true"
        :title="move.MoveName"
        @dragstart="onDragStart($event, move)"
      >
        <div class="palette-img-wrap">
          <move-media v-if="move.ImageUrl" :src="move.ImageUrl" :alt="move.MoveName" />
          <div v-else class="palette-img-placeholder">
            <i class="fas fa-hand-rock"></i>
          </div>
        </div>
        <span class="palette-name">{{ move.MoveName }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import CharacterMovesService from '@/services/character-moves-service';
import MoveMedia from '@/components/common/move-media.vue';

export default {
  name: 'MovePalette',
  components: { MoveMedia },
  props: {
    characterId: { type: String, default: null },
    search: { type: String, default: '' },
    accentColor: { type: String, default: '#3eb489' },
    player: { type: Number, default: 1 },
  },
  data() {
    return {
      moves: [],
      loading: false,
    };
  },
  computed: {
    filteredMoves() {
      if (!this.search) return this.moves;
      const q = this.search.toLowerCase();
      return this.moves.filter((m) => m.MoveName.toLowerCase().includes(q));
    },
  },
  watch: {
    characterId(val) {
      if (val) this.loadMoves();
      else this.moves = [];
    },
  },
  mounted() {
    if (this.characterId) this.loadMoves();
  },
  methods: {
    async loadMoves() {
      this.loading = true;
      this.moves = [];
      try {
        const resp = await CharacterMovesService.getMovesForCharacter(this.characterId);
        this.moves = resp.data || [];
      } catch (e) {
        console.error('[MovePalette] loadMoves', e);
      } finally {
        this.loading = false;
      }
    },
    onDragStart(event, move) {
      event.dataTransfer.setData('application/json', JSON.stringify({ ...move, _player: this.player }));
      event.dataTransfer.effectAllowed = 'copy';
    },
  },
};
</script>

<style scoped>
.move-palette {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.palette-loading,
.palette-empty {
  color: #aaa;
  font-size: 12px;
  text-align: center;
  padding: 24px 8px;
}

.palette-hint {
  margin-top: 6px;
  color: #666;
  font-size: 11px;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.palette-item {
  background: #1c1c24;
  border: 1px solid #2e2e3a;
  border-radius: 6px;
  padding: 6px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: border-color 0.15s;
  user-select: none;
}

.palette-item:hover {
  border-color: var(--accent-color, #3eb489);
}

.palette-item:active {
  cursor: grabbing;
}

.palette-img-wrap {
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 4px;
  background: #11111a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.palette-img-wrap img,
.palette-img-wrap .move-media {
  width: 100%;
  height: 100%;
}

.palette-img-placeholder {
  color: #444;
  font-size: 20px;
}

.palette-name {
  font-size: 10px;
  color: #ccc;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
}
</style>
