<template>
  <div class="gameplan-maker-view">
    <!-- Top toolbar -->
    <div class="gp-toolbar">
      <div class="gp-toolbar-left">
        <span class="gp-brand">
          <i class="fas fa-project-diagram"></i> Gameplan Maker
        </span>
        <select v-model="selectedGameId" class="gp-select" @change="onGameChange">
          <option value="" disabled>Select Game</option>
          <option v-for="g in games" :key="g.id" :value="g.id">{{ g.title }}</option>
        </select>
        <div class="gp-char-search-wrap">
          <character-search
            v-if="selectedGameId"
            :game-id="selectedGameId"
            place-holder="Pick character…"
            @update:character="onCharacterSelect"
          />
        </div>
        <span v-if="selectedCharacterId" class="gp-char-vs">VS</span>
        <div v-if="selectedCharacterId" class="gp-char-search-wrap gp-char2-wrap">
          <character-search
            :game-id="selectedGameId"
            place-holder="Add opponent…"
            @update:character="onCharacter2Select"
          />
        </div>
      </div>

      <div class="gp-toolbar-center">
        <input
          v-model="planName"
          class="gp-name-input"
          placeholder="Untitled gameplan"
          maxlength="80"
        />
      </div>

      <div class="gp-toolbar-right">
        <!-- Mode toggle -->
        <div class="gp-mode-group">
          <button
            class="gp-mode-btn"
            :class="{ active: canvasMode === 'select' }"
            @click="canvasMode = 'select'"
          >
            <i class="fas fa-mouse-pointer"></i> Select
          </button>
          <button
            class="gp-mode-btn"
            :class="{ active: canvasMode === 'connect' }"
            @click="canvasMode = 'connect'"
          >
            <i class="fas fa-arrow-right"></i> Draw Arrow
          </button>
        </div>
        <button class="gp-tool-btn" title="Reset zoom" @click="resetViewport">
          <i class="fas fa-compress-arrows-alt"></i>
        </button>
        <button class="gp-tool-btn gp-note-btn" title="Add a comment card to the canvas" @click="addComment">
          <i class="fas fa-sticky-note"></i> Note
        </button>
        <button class="gp-tool-btn" title="Clear canvas" @click="clearCanvas">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button
          v-if="account"
          class="gp-save-btn"
          :class="{ saving }"
          :disabled="saving"
          @click="saveGameplan"
        >
          <i class="fas fa-save"></i>
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
        <span v-else class="gp-login-hint">Log in to save</span>
        <router-link v-if="account" to="/gameplans" class="gp-tool-btn gp-gallery-link" title="My gameplans">
          <i class="fas fa-list"></i>
        </router-link>
      </div>
    </div>

    <!-- Connect-mode instruction banner -->
    <transition name="banner-fade">
      <div v-if="canvasMode === 'connect'" class="gp-connect-banner">
        <i class="fas fa-arrow-right"></i>
        <strong>Draw Arrow mode</strong> — click a move node to start an arrow, then click another node to connect them.
        <button class="gp-banner-dismiss" @click="canvasMode = 'select'">
          <i class="fas fa-times"></i> Done
        </button>
      </div>
    </transition>

    <!-- Main workspace -->
    <div class="gp-workspace">
      <!-- Left sidebar — move palette OR arrow properties -->
      <div class="gp-sidebar">

        <!-- ── Arrow properties panel ─────────────────────── -->
        <template v-if="activeEdge">
          <div class="gp-sidebar-header gp-arrow-header">
            <i class="fas fa-arrow-right" style="color:#e8a84a"></i>
            <span>Arrow Properties</span>
            <button class="gp-arrow-close" title="Deselect" @click="onEdgeSelect(null)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="gp-arrow-panel">
            <!-- Action type -->
            <div class="gp-panel-section-label">Action Type</div>
            <div class="gp-type-grid">
              <button
                v-for="t in arrowTypeList"
                :key="t.label"
                class="gp-type-btn"
                :class="{ active: activeEdge.arrowType === t.label }"
                :style="{ '--tc': t.color }"
                :title="t.label"
                @click="applyEdgeType(t)"
              >{{ t.abbr }}</button>
            </div>

            <!-- Style -->
            <div class="gp-panel-section-label" style="margin-top:10px">Line Style</div>
            <div class="gp-style-row">
              <button
                v-for="s in arrowStyleList"
                :key="s.id"
                class="gp-style-btn"
                :class="{ active: (activeEdge.style || 'solid') === s.id }"
                :title="s.label"
                @click="applyEdgeStyle(s.id)"
              >{{ s.icon }}</button>
            </div>

            <!-- Color -->
            <div class="gp-panel-section-label" style="margin-top:10px">Color</div>
            <div class="gp-color-swatches">
              <button
                v-for="c in colorPresetList"
                :key="c"
                class="gp-color-swatch"
                :style="{ background: c, outline: activeEdge.color === c ? '2px solid #fff' : 'none' }"
                @click="applyEdgeColor(c)"
              />
            </div>

            <!-- Custom label -->
            <div class="gp-panel-section-label" style="margin-top:10px">Label</div>
            <input
              v-model="activeEdge.label"
              class="gp-label-input"
              placeholder="Custom label…"
              @input="onEdgeFieldChange"
            />

            <!-- Delete -->
            <button class="gp-arrow-delete" @click="deleteActiveEdge">
              <i class="fas fa-trash"></i> Delete Arrow
            </button>
          </div>
        </template>

        <!-- ── Character palette (default) ────────────────── -->
        <template v-else>
          <!-- Character tabs -->
          <div class="gp-palette-tabs">
            <button
              class="gp-palette-tab"
              :class="{ active: activePaletteTab === 1 }"
              :style="activePaletteTab === 1 ? { borderBottomColor: CHAR1_COLOR, color: CHAR1_COLOR } : {}"
              @click="activePaletteTab = 1"
            >
              <span class="gp-tab-dot" :style="{ background: CHAR1_COLOR }" />
              {{ selectedCharacterName || 'Character 1' }}
            </button>
            <button
              class="gp-palette-tab"
              :class="{ active: activePaletteTab === 2 }"
              :style="activePaletteTab === 2 ? { borderBottomColor: CHAR2_COLOR, color: CHAR2_COLOR } : {}"
              @click="activePaletteTab = 2"
            >
              <span class="gp-tab-dot" :style="{ background: selectedCharacter2Id ? CHAR2_COLOR : '#444' }" />
              {{ selectedCharacter2Name || 'Character 2' }}
            </button>
            <button
              class="gp-palette-tab"
              :class="{ active: activePaletteTab === 3 }"
              @click="activePaletteTab = 3"
            >
              <i class="fas fa-gamepad"></i> Inputs
            </button>
          </div>

          <!-- Tab 1: Character 1 -->
          <template v-if="activePaletteTab === 1">
            <div class="gp-sidebar-header">
              <input v-model="paletteSearch" class="gp-search" placeholder="Filter moves…" />
            </div>
            <move-palette
              :character-id="selectedCharacterId"
              :search="paletteSearch"
              :accent-color="CHAR1_COLOR"
              :player="1"
            />
          </template>

          <!-- Tab 2: Character 2 -->
          <template v-else-if="activePaletteTab === 2">
            <div class="gp-sidebar-header">
              <input v-model="paletteSearch2" class="gp-search" placeholder="Filter moves…" />
            </div>
            <move-palette
              :character-id="selectedCharacter2Id"
              :search="paletteSearch2"
              :accent-color="CHAR2_COLOR"
              :player="2"
            />
          </template>

          <!-- Tab 3: Input icons -->
          <template v-else>
            <input-icon-palette
              :game-abbreviation="selectedGameAbbreviation"
              @add-input="onAddInput"
            />
          </template>
        </template>

      </div>

      <!-- Canvas -->
      <div class="gp-canvas-container">
        <div v-if="!selectedCharacterId" class="gp-canvas-placeholder">
          <i class="fas fa-chess-knight"></i>
          <p>Select a character to start building your gameplan</p>
        </div>
        <gameplan-canvas
          v-else
          ref="canvas"
          v-model="canvasData"
          :mode="canvasMode"
          :game-abbreviation="selectedGameAbbreviation"
          @edge-select="onEdgeSelect"
        />
      </div>
    </div>

    <!-- Save success toast -->
    <transition name="toast-fade">
      <div v-if="toastMessage" class="gp-toast">
        <i class="fas fa-check-circle"></i> {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import CharacterSearch from '@/components/character/character-search.vue';
import MovePalette from '@/components/gameplan/move-palette.vue';
import InputIconPalette from '@/components/gameplan/input-icon-palette.vue';
import GameplanCanvas from '@/components/gameplan/gameplan-canvas.vue';
import GamesService from '@/services/games-service';
import GameplansService from '@/services/gameplans-service';

export default {
  name: 'GameplanMaker',
  components: { CharacterSearch, MovePalette, InputIconPalette, GameplanCanvas },
  props: {
    account: { type: Object, default: null },
  },
  data() {
    return {
      games: [],
      selectedGameId: this.$route.query.gameId ? String(this.$route.query.gameId) : '',
      selectedCharacterId: this.$route.query.characterId || '',
      selectedCharacterName: '',
      selectedCharacter2Id: '',
      selectedCharacter2Name: '',
      planName: 'Untitled gameplan',
      canvasMode: 'select',
      canvasData: { nodes: [], edges: [], viewport: { scale: 1, offsetX: 0, offsetY: 0 } },
      paletteSearch: '',
      paletteSearch2: '',
      activePaletteTab: 1,
      activeEdge: null,
      saving: false,
      editingId: this.$route.query.id || null,
      toastMessage: '',
    };
  },
  computed: {
    selectedGameAbbreviation() {
      const game = this.games.find((g) => g.id === this.selectedGameId);
      return (game && game.abbreviation) ? game.abbreviation.toLowerCase() : 'sf6';
    },
  },
  created() {
    this.CHAR1_COLOR = '#3eb489';
    this.CHAR2_COLOR = '#4a90e8';
    this.arrowTypeList = [
      { label: 'Round Start', abbr: 'Round Start', color: '#4a90e8' },
      { label: 'Wake Up',     abbr: 'Wake Up',     color: '#4a90e8' },
      { label: 'Knockdown',   abbr: 'KD',          color: '#4a90e8' },
      { label: 'Okizeme',     abbr: 'Oki',         color: '#4a90e8' },
      { label: 'Meaty',       abbr: 'Meaty',       color: '#e8a84a' },
      { label: 'Reversal',    abbr: 'Reversal',    color: '#e85a4a' },
      { label: 'Counter Hit', abbr: 'CH',          color: '#e84a90' },
      { label: 'Trade',       abbr: 'Trade',       color: '#e84a90' },
      { label: 'Punish',      abbr: 'Punish',      color: '#a84ae8' },
      { label: 'Counter',     abbr: 'Counter',     color: '#a84ae8' },
      { label: 'Whiff Punish',abbr: 'WP',          color: '#a84ae8' },
      { label: 'Whiff',       abbr: 'Whiff',       color: '#888888' },
      { label: '+Frames',     abbr: '+Frames',     color: '#3eb489' },
      { label: '-Frames',     abbr: '-Frames',     color: '#e85a4a' },
      { label: 'Jump Cancel', abbr: 'JC',          color: '#4ae8e8' },
      { label: 'Dash Cancel', abbr: 'DC',          color: '#4ae8e8' },
    ];
    this.arrowStyleList = [
      { id: 'solid',  label: 'Solid',  icon: '——→' },
      { id: 'dashed', label: 'Dashed', icon: '╌╌→' },
      { id: 'dotted', label: 'Dotted', icon: '···→' },
      { id: 'double', label: 'Double', icon: '←——→' },
      { id: 'thick',  label: 'Thick',  icon: '━━━→' },
    ];
    this.colorPresetList = [
      '#e8a84a', '#3eb489', '#4a90e8', '#e85a4a',
      '#a84ae8', '#e8e8e8', '#4ae8e8', '#e84a90',
      '#e8e84a', '#888888',
    ];
  },
  async mounted() {
    try {
      const gamesResp = await GamesService.fetchGames();
      this.games = (gamesResp.data.games || gamesResp.data || []).map((g) => ({
        id: String(g._id),
        title: g.Title || g.title || g.Name || '',
        abbreviation: g.Abbreviation || g.abbreviation || '',
      }));
    } catch (e) {
      console.error('[GameplanMaker] loadGames', e);
    }

    if (this.editingId) {
      this.loadExisting(this.editingId);
    }
  },  methods: {
    onEdgeSelect(edge) {
      this.activeEdge = edge;
    },
    applyEdgeType(type) {
      if (!this.activeEdge) return;
      this.$set(this.activeEdge, 'label', type.abbr);
      this.$set(this.activeEdge, 'color', type.color);
      this.$set(this.activeEdge, 'arrowType', type.label);
      if (this.$refs.canvas) this.$refs.canvas.emitChange();
    },
    applyEdgeStyle(styleId) {
      if (!this.activeEdge) return;
      this.$set(this.activeEdge, 'style', styleId);
      if (this.$refs.canvas) this.$refs.canvas.emitChange();
    },
    applyEdgeColor(color) {
      if (!this.activeEdge) return;
      this.$set(this.activeEdge, 'color', color);
      if (this.$refs.canvas) this.$refs.canvas.emitChange();
    },
    onEdgeFieldChange() {
      if (this.$refs.canvas) this.$refs.canvas.emitChange();
    },
    deleteActiveEdge() {
      if (!this.activeEdge || !this.$refs.canvas) return;
      this.$refs.canvas.deleteEdge(this.activeEdge);
      this.activeEdge = null;
    },
    onGameChange() {
      this.selectedCharacterId = '';
      this.selectedCharacter2Id = '';
      this.selectedCharacter2Name = '';
    },
    onCharacterSelect(char) {
      if (!char) return;
      this.selectedCharacterId = char.id || char._id || '';
      this.selectedCharacterName = char.name || char.Name || '';
      if (!this.planName || this.planName === 'Untitled gameplan') {
        this.planName = `${this.selectedCharacterName} Gameplan`;
      }
    },
    onCharacter2Select(char) {
      if (!char) return;
      this.selectedCharacter2Id = char.id || char._id || '';
      this.selectedCharacter2Name = char.name || char.Name || '';
      this.activePaletteTab = 2;
    },
    resetViewport() {
      if (this.$refs.canvas) this.$refs.canvas.resetViewport();
    },
    addComment() {
      if (!this.$refs.canvas) return;
      // Drop the note in the visible center of the canvas
      const el = this.$refs.canvas.$el;
      const cx = (el.clientWidth / 2 - this.$refs.canvas.viewport.offsetX) / this.$refs.canvas.viewport.scale;
      const cy = (el.clientHeight / 2 - this.$refs.canvas.viewport.offsetY) / this.$refs.canvas.viewport.scale;
      this.$refs.canvas.addCommentNode(cx - 90, cy - 50);
    },
    onAddInput(input) {
      if (!this.$refs.canvas) return;
      this.$refs.canvas.addInputNodeAtCenter(input);
    },
    clearCanvas() {
      if (confirm('Clear all nodes and edges?')) {
        if (this.$refs.canvas) this.$refs.canvas.clearCanvas();
        this.canvasData = { nodes: [], edges: [], viewport: { scale: 1, offsetX: 0, offsetY: 0 } };
      }
    },
    async saveGameplan() {
      if (!this.account) return;
      if (!this.selectedCharacterId) {
        alert('Please select a character first.');
        return;
      }
      this.saving = true;
      try {
        const payload = {
          Name: this.planName || 'Untitled gameplan',
          CharacterId: this.selectedCharacterId,
          Character2Id: this.selectedCharacter2Id || undefined,
          GameId: this.selectedGameId || undefined,
          OwnerId: this.account.id,
          Nodes: this.canvasData.nodes,
          Edges: this.canvasData.edges,
          Viewport: this.canvasData.viewport,
          IsPublic: false,
        };

        if (this.editingId) {
          await GameplansService.update(this.editingId, { ...payload, OwnerId: this.account.id });
        } else {
          const resp = await GameplansService.create(payload);
          this.editingId = resp.data._id;
          this.$router.replace({ query: { ...this.$route.query, id: this.editingId } });
        }
        this.showToast('Gameplan saved!');
      } catch (e) {
        console.error('[GameplanMaker] save', e);
        alert('Error saving gameplan: ' + ((e.response && e.response.data && e.response.data.error) || e.message));
      } finally {
        this.saving = false;
      }
    },
    async loadExisting(id) {
      try {
        const resp = await GameplansService.get(id);
        const gp = resp.data;
        this.planName = gp.Name;
        this.selectedGameId = gp.GameId ? String(gp.GameId) : '';
        this.selectedCharacterId = String(gp.CharacterId);
        this.selectedCharacter2Id = gp.Character2Id ? String(gp.Character2Id) : '';
        this.canvasData = {
          nodes: gp.Nodes || [],
          edges: gp.Edges || [],
          viewport: gp.Viewport || { scale: 1, offsetX: 0, offsetY: 0 },
        };
      } catch (e) {
        console.error('[GameplanMaker] loadExisting', e);
      }
    },
    showToast(msg) {
      this.toastMessage = msg;
      setTimeout(() => { this.toastMessage = ''; }, 2500);
    },
  },
};
</script>

<style scoped>
.gameplan-maker-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #13131b;
  color: #fff;
  overflow: hidden;
  padding-top: 140px;
}

/* ── Toolbar ──────────────────────────────────────────────────────────────── */
.gp-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 48px;
  min-height: 48px;
  background: #1c1c24;
  border-bottom: 1px solid #2e2e3a;
  flex-shrink: 0;
  z-index: 10;
}

.gp-toolbar-left,
.gp-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gp-toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.gp-brand {
  font-size: 13px;
  font-weight: 600;
  color: #3eb489;
  white-space: nowrap;
}

.gp-select {
  background: #13131b;
  color: #ccc;
  border: 1px solid #2e2e3a;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  height: 30px;
}

.gp-char-search-wrap {
  width: 180px;
}

.gp-char-search-wrap :deep(.character-search) {
  margin: 0;
}

.gp-name-input {
  background: transparent;
  border: 1px solid transparent;
  border-bottom-color: #2e2e3a;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 300px;
  padding: 2px 8px;
  outline: none;
  transition: border-color 0.15s;
}

.gp-name-input:focus {
  border-color: #3eb489;
}

.gp-mode-group {
  display: flex;
  border: 1px solid #2e2e3a;
  border-radius: 6px;
  overflow: hidden;
}

.gp-mode-group .gp-mode-btn {
  border: none;
  border-radius: 0;
  padding: 0 14px;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  height: 30px;
  white-space: nowrap;
}

.gp-mode-group .gp-mode-btn:first-child {
  border-right: 1px solid #2e2e3a;
}

.gp-mode-group .gp-mode-btn.active {
  background: #3eb489;
  color: #fff;
  border-color: #3eb489;
}

.gp-connect-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  background: #1e2a23;
  border-bottom: 1px solid #3eb48950;
  color: #8fd4b0;
  font-size: 13px;
  flex-shrink: 0;
}

.gp-connect-banner strong {
  color: #3eb489;
}

.gp-banner-dismiss {
  margin-left: auto;
  background: none;
  border: 1px solid #3eb48970;
  border-radius: 4px;
  color: #3eb489;
  font-size: 12px;
  padding: 3px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s;
}

.gp-banner-dismiss:hover {
  background: #3eb48920;
}

.banner-fade-enter-active,
.banner-fade-leave-active { transition: opacity 0.2s, max-height 0.2s; max-height: 50px; overflow: hidden; }
.banner-fade-enter,
.banner-fade-leave-to { opacity: 0; max-height: 0; }

.gp-tool-btn {
  width: 30px;
  height: 30px;
  background: #13131b;
  border: 1px solid #2e2e3a;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: color 0.15s, border-color 0.15s;
  text-decoration: none;
}

.gp-tool-btn:hover {
  color: #fff;
  border-color: #3eb489;
}

.gp-note-btn {
  width: auto;
  padding: 0 10px;
  gap: 5px;
  font-size: 12px;
  color: #a08c40;
  border-color: #a08c4060;
}

.gp-note-btn:hover {
  color: #e8d88a;
  border-color: #a08c40;
}

.gp-save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 30px;
  background: #3eb489;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.gp-save-btn:hover { background: #35a07a; }
.gp-save-btn.saving { background: #2a7a5a; cursor: default; }

.gp-login-hint {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

/* ── Workspace ───────────────────────────────────────────────────────────── */
.gp-workspace {
  display: flex;
  flex: 1;
  min-height: 0;
}

.gp-char-vs {
  font-size: 10px;
  font-weight: 700;
  color: #555;
  letter-spacing: 0.05em;
}

.gp-char2-wrap :deep(.character-search input) {
  border-color: #4a90e860;
}

/* ── Palette tabs ─────────────────────────────────────────────────────────── */
.gp-palette-tabs {
  display: flex;
  border-bottom: 1px solid #2e2e3a;
  flex-shrink: 0;
}

.gp-palette-tab {
  flex: 1;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #666;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 7px 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s, border-color 0.15s;
}

.gp-palette-tab:hover {
  color: #aaa;
}

.gp-palette-tab.active {
  color: #3eb489;
}

.gp-tab-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Arrow properties panel ──────────────────────────────────────────────── */
.gp-arrow-header {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
  color: #e8a84a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gp-arrow-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  transition: color 0.15s;
}
.gp-arrow-close:hover { color: #fff; }

.gp-arrow-panel {
  padding: 10px 8px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gp-panel-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #666;
  margin-bottom: 4px;
}

.gp-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.gp-type-btn {
  background: #13131b;
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 2px solid var(--tc, #888);
  border-radius: 3px;
  color: var(--tc, #aaa);
  font-size: 10px;
  font-weight: 600;
  padding: 3px 7px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s;
  line-height: 1.3;
}
.gp-type-btn:hover { background: rgba(255,255,255,0.06); }
.gp-type-btn.active {
  background: var(--tc, #888);
  color: #111;
}

.gp-style-row {
  display: flex;
  gap: 4px;
}

.gp-style-btn {
  flex: 1;
  background: #13131b;
  border: 1px solid #2e2e3a;
  border-radius: 4px;
  color: #888;
  font-size: 11px;
  padding: 5px 2px;
  cursor: pointer;
  text-align: center;
  transition: background 0.1s, color 0.1s;
  letter-spacing: -0.5px;
}
.gp-style-btn:hover { background: rgba(255,255,255,0.07); color: #ccc; }
.gp-style-btn.active { background: #2e2e3a; color: #fff; border-color: #3eb489; }

.gp-color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.gp-color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.12);
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s;
}
.gp-color-swatch:hover { transform: scale(1.2); border-color: #fff; }

.gp-label-input {
  background: #13131b;
  border: 1px solid #2e2e3a;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  padding: 5px 8px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.gp-label-input:focus { border-color: #3eb489; }

.gp-arrow-delete {
  margin-top: 10px;
  width: 100%;
  background: none;
  border: 1px solid #e5555550;
  border-radius: 4px;
  color: #e55;
  font-size: 11px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s;
}
.gp-arrow-delete:hover { background: #e5555520; }

/* ── Sidebar ─────────────────────────────────────────────────────────────── */.gp-sidebar {
  width: 200px;
  min-width: 200px;
  background: #1c1c24;
  border-right: 1px solid #2e2e3a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gp-sidebar-header {
  padding: 6px 8px;
  border-bottom: 1px solid #2e2e3a;
  flex-shrink: 0;
}

.gp-search {
  background: #13131b;
  border: 1px solid #2e2e3a;
  border-radius: 4px;
  color: #ccc;
  font-size: 11px;
  padding: 3px 8px;
  outline: none;
  width: 100%;
}

/* ── Canvas ──────────────────────────────────────────────────────────────── */
.gp-canvas-container {
  flex: 1;
  min-width: 0;
  position: relative;
}

.gp-canvas-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #444;
  gap: 12px;
}

.gp-canvas-placeholder i {
  font-size: 48px;
}

.gp-canvas-placeholder p {
  font-size: 14px;
  color: #666;
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
.gp-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #3eb489;
  color: #fff;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 13px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.3s; }
.toast-fade-enter,
.toast-fade-leave-to { opacity: 0; }
</style>
