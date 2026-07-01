<template>
  <div class="input-icon-palette">
    <div class="palette-section">
      <div class="section-label">Movement</div>
      <div class="arrow-grid">
        <button
          v-for="btn in arrowButtons"
          :key="btn.notation"
          class="icon-btn"
          draggable="true"
          :title="btn.notation === '5' ? 'Neutral' : `Direction ${btn.notation}`"
          @dragstart="onDragStart($event, btn.notation)"
          @click="onClick(btn.notation)"
        >
          <img v-if="getIcon(btn.notation)" :src="getIcon(btn.notation)" :alt="btn.notation" />
          <span v-else class="neutral-dot">•</span>
        </button>
      </div>
    </div>

    <div class="palette-section">
      <div class="section-label">Motions</div>
      <div class="motion-grid">
        <button
          v-for="btn in motionButtons"
          :key="btn.notation"
          class="icon-btn motion-btn"
          draggable="true"
          :title="btn.label"
          @dragstart="onDragStart($event, btn.notation)"
          @click="onClick(btn.notation)"
        >
          <img v-if="getIcon(btn.notation)" :src="getIcon(btn.notation)" :alt="btn.label" />
          <span v-else class="motion-fallback">{{ btn.label }}</span>
        </button>
      </div>
    </div>

    <div class="palette-section">
      <div class="section-label">Buttons</div>
      <div class="attack-grid">
        <button
          v-for="btn in attackButtons"
          :key="btn.key"
          class="icon-btn attack-btn"
          draggable="true"
          :title="btn.notation"
          @dragstart="onDragStart($event, btn.notation)"
          @click="onClick(btn.notation)"
        >
          <img v-if="getIcon(btn.notation)" :src="getIcon(btn.notation)" :alt="btn.notation" />
          <span v-else>{{ btn.notation }}</span>
        </button>
      </div>
    </div>

    <div class="palette-section">
      <div class="section-label">Other</div>
      <button
        class="link-btn"
        draggable="true"
        title="Link separator"
        @dragstart="onDragStart($event, '>')"
        @click="onClick('>')"
      >
        <i class="fas fa-arrow-right"></i> Link
      </button>
    </div>

    <p class="palette-hint">Drag icons onto the canvas, or click to drop in the center.</p>
  </div>
</template>

<script>
import {
  ARROW_BUTTONS,
  MOTION_BUTTONS,
  getAttackButtons,
  getInputIcon,
} from '@/utils/input-icon-maps';

export default {
  name: 'InputIconPalette',
  props: {
    gameAbbreviation: { type: String, default: 'sf6' },
  },
  computed: {
    arrowButtons() {
      return ARROW_BUTTONS;
    },
    motionButtons() {
      return MOTION_BUTTONS;
    },
    attackButtons() {
      return getAttackButtons(this.gameAbbreviation);
    },
  },
  methods: {
    getIcon(notation) {
      return getInputIcon(notation, this.gameAbbreviation);
    },
    buildPayload(notation) {
      return {
        _paletteType: 'input',
        notation,
        imageUrl: this.getIcon(notation) || '',
        label: notation === '>' ? '→' : notation,
      };
    },
    onDragStart(event, notation) {
      event.dataTransfer.setData('application/json', JSON.stringify(this.buildPayload(notation)));
      event.dataTransfer.effectAllowed = 'copy';
    },
    onClick(notation) {
      this.$emit('add-input', this.buildPayload(notation));
    },
  },
};
</script>

<style scoped>
.input-icon-palette {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.palette-section {
  margin-bottom: 12px;
}

.section-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #666;
  margin-bottom: 6px;
}

.arrow-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.motion-grid,
.attack-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  background: #13131b;
  border: 1px solid #2e2e3a;
  border-radius: 4px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: border-color 0.15s, background 0.15s;
}

.icon-btn:hover {
  border-color: #3eb489;
  background: #1a1a24;
}

.icon-btn:active {
  cursor: grabbing;
}

.icon-btn img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.motion-btn {
  width: 40px;
  height: 32px;
}

.attack-btn {
  width: 34px;
  height: 34px;
}

.neutral-dot {
  color: #888;
  font-size: 18px;
  line-height: 1;
}

.motion-fallback {
  font-size: 8px;
  color: #aaa;
  font-weight: 600;
}

.link-btn {
  width: 100%;
  background: #13131b;
  border: 1px dashed #2e2e3a;
  border-radius: 4px;
  color: #888;
  font-size: 11px;
  padding: 6px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: border-color 0.15s, color 0.15s;
}

.link-btn:hover {
  border-color: #3eb489;
  color: #3eb489;
}

.palette-hint {
  font-size: 10px;
  color: #555;
  text-align: center;
  margin: 8px 0 0;
  line-height: 1.4;
}
</style>
