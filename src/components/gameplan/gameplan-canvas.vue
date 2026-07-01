<template>
  <div
    class="gameplan-canvas-wrap"
    @dragover.prevent
    @drop="onDrop"
  >
    <v-stage
      ref="stage"
      :config="stageConfig"
      @mousedown="onStageMouseDown"
      @mousemove="onStageMouseMove"
      @mouseup="onStageMouseUp"
      @wheel="onWheel"
    >
      <v-layer ref="edgeLayer">
        <!-- Committed edges -->
        <template v-for="edge in edges">
          <v-arrow
            :key="'edge-' + edge.id"
            :config="edgeArrowConfig(edge)"
            @click="selectEdge(edge)"
          />
          <!-- Pill label -->
          <v-group
            v-if="edge.label"
            :key="'edge-lbl-' + edge.id"
            :config="edgeLabelGroupConfig(edge)"
            @click="selectEdge(edge)"
          >
            <v-rect :config="edgeLabelRectConfig(edge)" />
            <v-text :config="edgeLabelTextConfig(edge)" />
          </v-group>
        </template>
        <!-- In-progress edge line while connecting -->
        <v-line v-if="connectingLine" :config="connectingLine" />
      </v-layer>

      <v-layer ref="nodeLayer">
        <template v-for="node in nodes">
          <!-- ── Comment card ── -->
          <v-group
            v-if="node.type === 'comment'"
            :key="'comment-' + node.id"
            :config="nodeGroupConfig(node)"
            @dragend="onNodeDragEnd($event, node)"
            @click="onNodeClick(node)"
            @dblclick="startEditComment(node)"
            @mouseenter="onNodeMouseEnter(node)"
            @mouseleave="onNodeMouseLeave(node)"
          >
            <v-rect :config="commentRectConfig(node)" />
            <v-text :config="commentTextConfig(node)" />
            <template v-if="hoveredNodeId === node.id && mode === 'select'">
              <v-group :config="deleteButtonGroupConfig(node)" @click="deleteNode(node)">
                <v-circle :config="deleteCircleConfig()" />
                <v-text :config="deleteIconConfig()" />
              </v-group>
              <v-circle :config="colorButtonConfig(node)" @click="openNodeColorPicker($event, node)" />
            </template>
            <v-rect v-if="connectingFrom === node.id" :config="connectingRingConfig(node)" />
            <v-circle
              v-if="hoveredNodeId === node.id && mode === 'connect' && !connectingFrom"
              :config="connectHandleConfig(node)"
            />
          </v-group>

          <!-- ── Input icon ── -->
          <v-group
            v-else-if="node.type === 'input'"
            :key="'input-' + node.id"
            :config="nodeGroupConfig(node)"
            @dragend="onNodeDragEnd($event, node)"
            @click="onNodeClick(node)"
            @mouseenter="onNodeMouseEnter(node)"
            @mouseleave="onNodeMouseLeave(node)"
          >
            <v-rect :config="inputRectConfig(node)" />
            <v-image v-if="nodeImages[node.id]" :key="'input-img-' + node.id + '-' + (nodeMediaKeys[node.id] || 0)" :config="inputImageConfig(node)" />
            <v-text v-else :config="inputTextConfig(node)" />
            <template v-if="hoveredNodeId === node.id && mode === 'select'">
              <v-group :config="deleteButtonGroupConfig(node)" @click="deleteNode(node)">
                <v-circle :config="deleteCircleConfig()" />
                <v-text :config="deleteIconConfig()" />
              </v-group>
              <v-circle :config="colorButtonConfig(node)" @click="openNodeColorPicker($event, node)" />
            </template>
            <v-rect v-if="connectingFrom === node.id" :config="connectingRingConfig(node)" />
            <v-circle
              v-if="hoveredNodeId === node.id && mode === 'connect' && !connectingFrom"
              :config="connectHandleConfig(node)"
            />
          </v-group>

          <!-- ── Move card ── -->
          <v-group
            v-else
            :key="'move-' + node.id"
            :config="nodeGroupConfig(node)"
            @dragend="onNodeDragEnd($event, node)"
            @click="onNodeClick(node)"
            @mouseenter="onNodeMouseEnter(node)"
            @mouseleave="onNodeMouseLeave(node)"
          >
            <v-rect :config="nodeRectConfig(node)" />
            <v-image v-if="nodeImages[node.id]" :key="'move-img-' + node.id + '-' + (nodeMediaKeys[node.id] || 0)" :config="nodeImageConfig(node)" />
            <v-rect v-else :config="nodePlaceholderRectConfig(node)" />
            <v-text :config="nodeLabelConfig(node)" />
            <template v-if="hoveredNodeId === node.id && mode === 'select'">
              <v-group :config="deleteButtonGroupConfig(node)" @click="deleteNode(node)">
                <v-circle :config="deleteCircleConfig()" />
                <v-text :config="deleteIconConfig()" />
              </v-group>
              <v-circle :config="colorButtonConfig(node)" @click="openNodeColorPicker($event, node)" />
            </template>
            <v-rect v-if="connectingFrom === node.id" :config="connectingRingConfig(node)" />
            <v-circle
              v-if="hoveredNodeId === node.id && mode === 'connect' && !connectingFrom"
              :config="connectHandleConfig(node)"
            />
          </v-group>
        </template>
      </v-layer>
    </v-stage>

    <!-- Floating color palette (for nodes) -->
    <div
      v-if="colorPicker.visible"
      ref="colorPalette"
      class="color-palette"
      :style="colorPickerStyle"
      @mousedown.stop
    >
      <button
        v-for="c in colorPresets"
        :key="c"
        class="color-swatch"
        :style="{ background: c, outline: colorPicker.current === c ? '2px solid #fff' : 'none' }"
        @click="applyColor(c)"
      />
      <label class="color-custom" title="Custom color">
        <i class="fas fa-eye-dropper"></i>
        <input
          ref="customColorInput"
          type="color"
          :value="colorPicker.current || '#ffffff'"
          style="width:0;height:0;opacity:0;position:absolute;"
          @input="applyColor($event.target.value)"
        />
      </label>
    </div>
    <!-- Comment node inline editor -->
    <div
      v-if="editingComment"
      class="comment-editor"
      :style="commentEditorStyle"
    >
      <textarea
        ref="commentTextarea"
        v-model="editingComment.text"
        class="comment-textarea"
        :style="{ width: COMMENT_W + 'px', height: COMMENT_H + 'px' }"
        @blur="finishEditComment"
        @keyup.escape="finishEditComment"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import VueKonva from 'vue-konva';
import Konva from 'konva';
import { getInputIcon } from '@/utils/input-icon-maps';
import {
  loadMoveMedia, playVideo, pauseVideo, disposeVideoElement, mediaDimensions,
} from '@/utils/move-media';

Vue.use(VueKonva);

const NODE_W = 160;
const NODE_H = 150;
const IMG_H = 128;
const LABEL_H = 20;
const INPUT_W = 64;
const INPUT_H = 64;
const COMMENT_W = 180;
const COMMENT_H = 100;
const COMMENT_BG = '#2d2a1e';
const COMMENT_BORDER = '#a08c40';
const COMMENT_TEXT = '#e8d88a';
const ACCENT = '#3eb489';
const ARROW_COLOR = '#e8a84a';
const ARROW_COLOR_SEL = '#f0c060';

const COLOR_PRESETS = [
  '#e8a84a', '#3eb489', '#4a90e8', '#e85a4a',
  '#a84ae8', '#e8e8e8', '#4ae8e8', '#e84a90',
  '#e8e84a', '#888888',
];

// Universal game-state arrow types grouped by category
const ARROW_TYPES = [
  // Situation / Context
  { label: 'Round Start', abbr: 'Round Start', color: '#4a90e8', group: 'situation' },
  { label: 'Wake Up',     abbr: 'Wake Up',     color: '#4a90e8', group: 'situation' },
  { label: 'Knockdown',   abbr: 'KD',          color: '#4a90e8', group: 'situation' },
  { label: 'Okizeme',     abbr: 'Oki',         color: '#4a90e8', group: 'situation' },
  // Offense
  { label: 'Meaty',       abbr: 'Meaty',       color: '#e8a84a', group: 'offense' },
  { label: 'Reversal',    abbr: 'Reversal',    color: '#e85a4a', group: 'offense' },
  // Hit states
  { label: 'Counter Hit', abbr: 'CH',          color: '#e84a90', group: 'hit' },
  { label: 'Trade',       abbr: 'Trade',       color: '#e84a90', group: 'hit' },
  // Punish
  { label: 'Punish',      abbr: 'Punish',      color: '#a84ae8', group: 'punish' },
  { label: 'Counter',     abbr: 'Counter',     color: '#a84ae8', group: 'punish' },
  { label: 'Whiff Punish',abbr: 'WP',          color: '#a84ae8', group: 'punish' },
  { label: 'Whiff',       abbr: 'Whiff',       color: '#888888', group: 'punish' },
  // Frame
  { label: '+Frames',     abbr: '+Frames',     color: '#3eb489', group: 'frames' },
  { label: '-Frames',     abbr: '-Frames',     color: '#e85a4a', group: 'frames' },
  // Cancel
  { label: 'Jump Cancel', abbr: 'JC',          color: '#4ae8e8', group: 'cancel' },
  { label: 'Dash Cancel', abbr: 'DC',          color: '#4ae8e8', group: 'cancel' },
];
const CARD_BG = '#1c1c24';

const ARROW_STYLES = [
  { id: 'solid',  label: 'Solid',   icon: '——→',  dash: null,     strokeMult: 1,   pointerAtBeginning: false },
  { id: 'dashed', label: 'Dashed',  icon: '╌╌→',  dash: [10, 6],  strokeMult: 1,   pointerAtBeginning: false },
  { id: 'dotted', label: 'Dotted',  icon: '···→',  dash: [2, 7],   strokeMult: 1,   pointerAtBeginning: false },
  { id: 'double', label: 'Double',  icon: '←——→', dash: null,     strokeMult: 1,   pointerAtBeginning: true  },
  { id: 'thick',  label: 'Thick',   icon: '━━━→', dash: null,     strokeMult: 2.2, pointerAtBeginning: false },
];
const CARD_BORDER = '#2e2e3a';
const SELECTED_BORDER = ACCENT;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getNodeSize(node) {
  if (node.type === 'comment') return { w: COMMENT_W, h: COMMENT_H };
  if (node.type === 'input') return { w: INPUT_W, h: INPUT_H };
  return { w: NODE_W, h: NODE_H };
}

function midpoint(nodes, edge) {
  const from = nodes.find((n) => n.id === edge.fromNodeId);
  const to = nodes.find((n) => n.id === edge.toNodeId);
  if (!from || !to) return { x: 0, y: 0 };
  const fromSize = getNodeSize(from);
  const toSize = getNodeSize(to);
  return {
    x: (from.x + fromSize.w + to.x) / 2,
    y: (from.y + fromSize.h / 2 + to.y + toSize.h / 2) / 2,
  };
}

export default {
  name: 'GameplanCanvas',
  props: {
    value: {
      // { nodes, edges, viewport }
      type: Object,
      default: () => ({ nodes: [], edges: [], viewport: { scale: 1, offsetX: 0, offsetY: 0 } }),
    },
    mode: {
      type: String,
      default: 'select', // 'select' | 'connect'
    },
    gameAbbreviation: {
      type: String,
      default: 'sf6',
    },
  },
  data() {
    const vp = (this.value && this.value.viewport) || {};
    return {
      nodes: (this.value && this.value.nodes) ? [...this.value.nodes] : [],
      edges: (this.value && this.value.edges) ? [...this.value.edges] : [],
      viewport: {
        scale: vp.scale || 1,
        offsetX: vp.offsetX || 0,
        offsetY: vp.offsetY || 0,
      },
      stageSize: { width: 800, height: 600 },
      nodeImages: {}, // nodeId → HTMLImageElement | HTMLVideoElement
      nodeVideoIds: {}, // nodeId → true when media is video
      nodeMediaKeys: {}, // nodeId → version key to force v-image refresh
      videoAnims: {}, // nodeId → Konva.Animation
      hoveredNodeId: null,
      selectedEdge: null,
      editingComment: null, // { node, text } while editing
      // connection in progress
      connectingFrom: null,
      connectingPointer: null,
      // panning
      isPanning: false,
      panStart: null,
      // color picker
      colorPicker: {
        visible: false,
        target: null, // { type: 'node'|'edge', item }
        current: null,
        screenX: 0,
        screenY: 0,
      },
    };
  },
  computed: {
    stageConfig() {
      return {
        width: this.stageSize.width,
        height: this.stageSize.height,
        scaleX: this.viewport.scale,
        scaleY: this.viewport.scale,
        x: this.viewport.offsetX,
        y: this.viewport.offsetY,
        draggable: this.mode === 'select',
      };
    },
    connectingLine() {
      if (!this.connectingFrom || !this.connectingPointer) return null;
      const from = this.nodes.find((n) => n.id === this.connectingFrom);
      if (!from) return null;
      const fromSize = getNodeSize(from);
      return {
        points: [
          from.x + fromSize.w / 2,
          from.y + fromSize.h / 2,
          this.connectingPointer.x,
          this.connectingPointer.y,
        ],
        stroke: ARROW_COLOR,
        strokeWidth: 2,
        dash: [6, 4],
      };
    },
    commentEditorStyle() {
      if (!this.editingComment) return {};
      const node = this.editingComment;
      const stage = this.$refs.stage;
      const stagePos = stage ? stage.getStage().container().getBoundingClientRect() : { left: 0, top: 0 };
      return {
        left: `${node.x * this.viewport.scale + this.viewport.offsetX + stagePos.left}px`,
        top: `${node.y * this.viewport.scale + this.viewport.offsetY + stagePos.top}px`,
        transform: `scale(${this.viewport.scale})`,
        transformOrigin: 'top left',
      };
    },
    colorPickerStyle() {
      if (!this.colorPicker.visible) return {};
      return {
        left: `${this.colorPicker.screenX}px`,
        top: `${this.colorPicker.screenY}px`,
      };
    },
  },
  watch: {
    value(val) {
      if (!val) return;

      const vp = val.viewport || {};
      this.viewport = {
        scale: vp.scale || 1,
        offsetX: vp.offsetX || 0,
        offsetY: vp.offsetY || 0,
      };

      const incomingNodes = val.nodes || [];
      const incomingEdges = val.edges || [];
      const incomingNodeIds = incomingNodes.map((n) => n.id).join('|');
      const currentNodeIds = this.nodes.map((n) => n.id).join('|');

      if (incomingNodeIds !== currentNodeIds) {
        Object.keys(this.videoAnims).forEach((id) => this.stopNodeVideo(id));
        const preservedImages = {};
        const preservedVideoIds = {};
        const preservedMediaKeys = {};
        incomingNodes.forEach((n) => {
          if (this.nodeImages[n.id]) preservedImages[n.id] = this.nodeImages[n.id];
          if (this.nodeVideoIds[n.id]) preservedVideoIds[n.id] = true;
          if (this.nodeMediaKeys[n.id]) preservedMediaKeys[n.id] = this.nodeMediaKeys[n.id];
        });
        this.nodeImages = preservedImages;
        this.nodeVideoIds = preservedVideoIds;
        this.nodeMediaKeys = preservedMediaKeys;
        this.nodes = [...incomingNodes];
        this.edges = [...incomingEdges];
        this.loadImages();
        return;
      }

      this.edges = [...incomingEdges];
      incomingNodes.forEach((incoming) => {
        const local = this.nodes.find((n) => n.id === incoming.id);
        if (local) Object.assign(local, incoming);
      });
    },
    selectedEdge(edge) {
      this.$emit('edge-select', edge || null);
    },
  },
  created() {
    this.COMMENT_W = COMMENT_W;
    this.COMMENT_H = COMMENT_H;
    this.ARROW_COLOR = ARROW_COLOR;
    this.colorPresets = COLOR_PRESETS;
    this.arrowTypes = ARROW_TYPES;
    this.arrowStyles = ARROW_STYLES;
  },
  mounted() {
    this.measureStage();
    window.addEventListener('resize', this.measureStage);
    this.loadImages();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.measureStage);
    Object.values(this.videoAnims).forEach((anim) => anim.stop());
    Object.values(this.nodeImages).forEach((el) => {
      pauseVideo(el);
      disposeVideoElement(el);
    });
  },
  methods: {
    measureStage() {
      const el = this.$el;
      if (el) {
        this.stageSize = { width: el.clientWidth || 800, height: el.clientHeight || 600 };
      }
    },

    // ── Node configs ──────────────────────────────────────────────────────

    nodeGroupConfig(node) {
      return {
        x: node.x,
        y: node.y,
        draggable: this.mode === 'select',
        id: node.id,
      };
    },
    nodeRectConfig(node) {
      const selected = this.selectedEdge &&
        (this.selectedEdge.fromNodeId === node.id || this.selectedEdge.toNodeId === node.id);
      const accent = node.color || null;
      return {
        x: 0, y: 0,
        width: NODE_W,
        height: NODE_H,
        fill: CARD_BG,
        stroke: selected ? SELECTED_BORDER : (accent || CARD_BORDER),
        strokeWidth: selected ? 2 : (accent ? 2 : 1),
        cornerRadius: 6,
        shadowColor: accent || 'black',
        shadowBlur: 4,
        shadowOpacity: accent ? 0.7 : 0.4,
        shadowOffsetY: 2,
      };
    },
    nodeImageConfig(node) {
      const img = this.nodeImages[node.id];
      const boxW = NODE_W - 8;
      const boxH = IMG_H - 4;
      const config = {
        x: 4, y: 4,
        width: boxW,
        height: boxH,
        image: img,
        cornerRadius: 4,
      };
      const dims = mediaDimensions(img);
      if (dims.width && dims.height) {
        const scale = Math.min(boxW / dims.width, boxH / dims.height);
        const drawW = dims.width * scale;
        const drawH = dims.height * scale;
        config.x = 4 + (boxW - drawW) / 2;
        config.y = 4 + (boxH - drawH) / 2;
        config.width = drawW;
        config.height = drawH;
        if (node.player === 2) {
          config.scaleX = -1;
          config.offsetX = drawW;
        }
      }
      return config;
    },
    nodePlaceholderRectConfig() {
      return {
        x: 4, y: 4,
        width: NODE_W - 8,
        height: IMG_H - 4,
        fill: '#11111a',
        cornerRadius: 4,
      };
    },
    nodeLabelConfig(node) {
      return {
        x: 4,
        y: IMG_H,
        width: NODE_W - 8,
        height: LABEL_H,
        text: node.moveName || '',
        fontSize: 10,
        fill: '#ccc',
        align: 'center',
        verticalAlign: 'middle',
        ellipsis: true,
        wrap: 'none',
      };
    },
    inputRectConfig(node) {
      const selected = this.selectedEdge &&
        (this.selectedEdge.fromNodeId === node.id || this.selectedEdge.toNodeId === node.id);
      const accent = node.color || null;
      return {
        x: 0, y: 0,
        width: INPUT_W,
        height: INPUT_H,
        fill: CARD_BG,
        stroke: selected ? SELECTED_BORDER : (accent || CARD_BORDER),
        strokeWidth: selected ? 2 : (accent ? 2 : 1),
        cornerRadius: 6,
        shadowColor: accent || 'black',
        shadowBlur: 3,
        shadowOpacity: accent ? 0.6 : 0.35,
        shadowOffsetY: 1,
      };
    },
    inputImageConfig(node) {
      const img = this.nodeImages[node.id];
      const pad = 8;
      const boxW = INPUT_W - pad * 2;
      const boxH = INPUT_H - pad * 2;
      const config = {
        x: pad, y: pad,
        width: boxW,
        height: boxH,
        image: img,
      };
      const dims = mediaDimensions(img);
      if (dims.width && dims.height) {
        const scale = Math.min(boxW / dims.width, boxH / dims.height);
        const drawW = dims.width * scale;
        const drawH = dims.height * scale;
        config.x = pad + (boxW - drawW) / 2;
        config.y = pad + (boxH - drawH) / 2;
        config.width = drawW;
        config.height = drawH;
      }
      return config;
    },
    inputTextConfig(node) {
      const label = node.label || node.notation || '';
      return {
        x: 0,
        y: 0,
        width: INPUT_W,
        height: INPUT_H,
        text: label === '>' ? '→' : label,
        fontSize: label.length > 3 ? 11 : 16,
        fontStyle: 'bold',
        fill: '#ccc',
        align: 'center',
        verticalAlign: 'middle',
      };
    },
    deleteButtonGroupConfig(node) {
      const size = getNodeSize(node);
      return { x: size.w - 14, y: -6 };
    },
    colorButtonConfig(node) {
      const size = getNodeSize(node);
      return {
        x: 8,
        y: size.h - 10,
        radius: 6,
        fill: node.color || ACCENT,
        stroke: '#fff',
        strokeWidth: 1,
        shadowColor: '#000',
        shadowBlur: 3,
        shadowOpacity: 0.4,
      };
    },
    deleteCircleConfig() {
      return { x: 0, y: 0, radius: 8, fill: '#e55', strokeWidth: 0 };
    },
    deleteIconConfig() {
      return { x: -4, y: -5, text: '×', fontSize: 12, fill: '#fff', fontStyle: 'bold' };
    },
    connectHandleConfig(node) {
      const size = getNodeSize(node);
      return {
        x: size.w / 2, y: size.h / 2,
        radius: Math.min(size.w, size.h) / 2 - 2,
        fill: 'transparent',
        stroke: ARROW_COLOR,
        strokeWidth: 2,
        dash: [6, 4],
        opacity: 0.6,
      };
    },
    connectingRingConfig(node) {
      const size = getNodeSize(node);
      return {
        x: 0, y: 0,
        width: size.w,
        height: size.h,
        fill: 'transparent',
        stroke: ARROW_COLOR,
        strokeWidth: 3,
        cornerRadius: 6,
        shadowColor: ARROW_COLOR,
        shadowBlur: 10,
        shadowOpacity: 0.6,
      };
    },

    // ── Comment node configs ──────────────────────────────────────────────

    commentRectConfig(node) {
      const accent = node.color || null;
      return {
        x: 0, y: 0,
        width: COMMENT_W,
        height: COMMENT_H,
        fill: accent || COMMENT_BG,
        stroke: accent || COMMENT_BORDER,
        strokeWidth: 1.5,
        cornerRadius: 6,
        shadowColor: '#000',
        shadowBlur: 6,
        shadowOpacity: 0.4,
        shadowOffsetY: 2,
        dash: [6, 3],
      };
    },
    commentTextConfig(node) {
      return {
        x: 10, y: 10,
        width: COMMENT_W - 20,
        height: COMMENT_H - 20,
        text: node.text || 'Double-click to edit…',
        fontSize: 12,
        fontStyle: node.text ? 'normal' : 'italic',
        fill: node.text ? COMMENT_TEXT : '#6a5e2a',
        lineHeight: 1.5,
        wrap: 'word',
        ellipsis: true,
      };
    },

    // ── Edge configs ──────────────────────────────────────────────────────

    edgeArrowConfig(edge) {
      const from = this.nodes.find((n) => n.id === edge.fromNodeId);
      const to = this.nodes.find((n) => n.id === edge.toNodeId);
      if (!from || !to) return { points: [] };
      const fromSize = getNodeSize(from);
      const toSize = getNodeSize(to);
      const selected = this.selectedEdge && this.selectedEdge.id === edge.id;
      const base = edge.color || ARROW_COLOR;
      const color = selected ? ARROW_COLOR_SEL : base;
      const x1 = from.x + fromSize.w;
      const y1 = from.y + fromSize.h / 2;
      const x2 = to.x;
      const y2 = to.y + toSize.h / 2;
      const dx = Math.abs(x2 - x1) * 0.5;
      const styleDef = ARROW_STYLES.find((s) => s.id === edge.style) || ARROW_STYLES[0];
      const baseStroke = selected ? 3 : 2.5;
      const cfg = {
        points: [x1, y1, x1 + dx, y1, x2 - dx, y2, x2, y2],
        tension: 0.5,
        pointerLength: 12,
        pointerWidth: 10,
        pointerAtBeginning: styleDef.pointerAtBeginning,
        fill: color,
        stroke: color,
        strokeWidth: baseStroke * styleDef.strokeMult,
        hitStrokeWidth: 20,
        shadowColor: color,
        shadowBlur: selected ? 8 : 4,
        shadowOpacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      };
      if (styleDef.dash) cfg.dash = styleDef.dash;
      return cfg;
    },
    edgeLabelGroupConfig(edge) {
      const mid = midpoint(this.nodes, edge);
      const text = edge.label || '';
      const pad = 10;
      const approxW = Math.max(text.length * 6.5 + pad * 2, 60);
      return {
        x: mid.x - approxW / 2,
        y: mid.y - 11,
      };
    },
    edgeLabelRectConfig(edge) {
      const text = edge.label || '';
      const pad = 10;
      const approxW = Math.max(text.length * 6.5 + pad * 2, 60);
      const selected = this.selectedEdge && this.selectedEdge.id === edge.id;
      const base = edge.color || ARROW_COLOR;
      return {
        x: 0, y: 0,
        width: approxW,
        height: 22,
        fill: selected ? ARROW_COLOR_SEL : base,
        cornerRadius: 11,
        shadowColor: base,
        shadowBlur: 6,
        shadowOpacity: 0.5,
      };
    },
    edgeLabelTextConfig(edge) {
      const text = edge.label || '';
      const pad = 10;
      const approxW = Math.max(text.length * 6.5 + pad * 2, 60);
      return {
        x: 0, y: 4,
        width: approxW,
        text,
        fontSize: 11,
        fontStyle: 'bold',
        fill: '#1c1c24',
        align: 'center',
      };
    },

    // ── Interactions ──────────────────────────────────────────────────────

    onNodeDragEnd(event, node) {
      const pos = event.target.position();
      node.x = pos.x;
      node.y = pos.y;
      this.emitChange();
    },
    onNodeClick(node) {
      if (this.mode === 'connect') {
        if (!this.connectingFrom) {
          // First click — start connection from this node
          this.connectingFrom = node.id;
        } else if (this.connectingFrom !== node.id) {
          // Second click — complete the arrow
          this.finishConnect(node);
        }
      }
    },
    onNodeMouseEnter(node) {
      this.hoveredNodeId = node.id;
      document.body.style.cursor = this.mode === 'connect' ? 'crosshair' : 'pointer';
      if (this.nodeVideoIds[node.id]) this.startNodeVideo(node.id);
    },
    onNodeMouseLeave(node) {
      this.hoveredNodeId = null;
      document.body.style.cursor = 'default';
      if (this.nodeVideoIds[node.id]) this.stopNodeVideo(node.id);
    },
    onStageMouseDown(e) {
      if (this.mode === 'select' && e.target === e.target.getStage()) {
        this.selectedEdge = null;
      }
    },
    onStageMouseMove(e) {
      if (this.connectingFrom) {
        const stage = this.$refs.stage.getStage();
        const pos = stage.getPointerPosition();
        const scale = this.viewport.scale;
        this.connectingPointer = {
          x: (pos.x - this.viewport.offsetX) / scale,
          y: (pos.y - this.viewport.offsetY) / scale,
        };
      }
    },
    onStageMouseUp() {
      if (this.connectingFrom && !this.connectingPointer) {
        this.cancelConnect();
      }
    },
    onWheel(e) {
      e.evt.preventDefault();
      const scaleBy = 1.05;
      const stage = this.$refs.stage.getStage();
      const oldScale = this.viewport.scale;
      const pointer = stage.getPointerPosition();
      const mousePointTo = {
        x: (pointer.x - this.viewport.offsetX) / oldScale,
        y: (pointer.y - this.viewport.offsetY) / oldScale,
      };
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      this.viewport.scale = Math.min(Math.max(newScale, 0.2), 4);
      this.viewport.offsetX = pointer.x - mousePointTo.x * this.viewport.scale;
      this.viewport.offsetY = pointer.y - mousePointTo.y * this.viewport.scale;
      this.emitChange();
    },

    // ── Drop from palette ─────────────────────────────────────────────────

    onDrop(event) {
      event.preventDefault();
      let payload;
      try {
        payload = JSON.parse(event.dataTransfer.getData('application/json'));
      } catch {
        return;
      }
      const rect = this.$el.getBoundingClientRect();
      const x = (event.clientX - rect.left - this.viewport.offsetX) / this.viewport.scale;
      const y = (event.clientY - rect.top - this.viewport.offsetY) / this.viewport.scale;
      if (payload._paletteType === 'input') {
        this.addInputNode({ input: payload, x, y });
      } else {
        this.addNode({ move: payload, x, y });
      }
    },
    addNode({ move, x, y }) {
      const node = {
        id: uid(),
        moveId: move._id,
        moveName: move.MoveName,
        imageUrl: move.ImageUrl || '',
        player: move._player || 1,
        x: Math.round(x),
        y: Math.round(y),
        note: '',
      };
      this.nodes.push(node);
      if (node.imageUrl) this.loadNodeMedia(node);
      this.emitChange();
    },
    addInputNode({ input, x, y }) {
      const node = {
        id: uid(),
        type: 'input',
        notation: input.notation,
        label: input.label || input.notation,
        imageUrl: input.imageUrl || '',
        x: Math.round(x - INPUT_W / 2),
        y: Math.round(y - INPUT_H / 2),
      };
      this.nodes.push(node);
      if (node.imageUrl) this.loadNodeMedia(node);
      this.emitChange();
    },
    addInputNodeAtCenter(input) {
      const el = this.$el;
      const cx = (el.clientWidth / 2 - this.viewport.offsetX) / this.viewport.scale;
      const cy = (el.clientHeight / 2 - this.viewport.offsetY) / this.viewport.scale;
      this.addInputNode({ input, x: cx, y: cy });
    },
    addCommentNode(x, y) {
      const node = {
        id: uid(),
        type: 'comment',
        text: '',
        x: Math.round(x),
        y: Math.round(y),
      };
      this.nodes.push(node);
      this.emitChange();
      this.$nextTick(() => this.startEditComment(node));
    },
    startEditComment(node) {
      this.editingComment = node;
      this.$nextTick(() => {
        if (this.$refs.commentTextarea) {
          this.$refs.commentTextarea.focus();
          this.$refs.commentTextarea.select();
        }
      });
    },
    finishEditComment() {
      if (this.editingComment) {
        this.emitChange();
        this.editingComment = null;
      }
    },

    // ── Connection logic ──────────────────────────────────────────────────

    startConnect(node) {
      this.connectingFrom = node.id;
    },
    finishConnect(targetNode) {
      const exists = this.edges.some(
        (e) => e.fromNodeId === this.connectingFrom && e.toNodeId === targetNode.id,
      );
      if (!exists && this.connectingFrom !== targetNode.id) {
        const newEdge = {
          id: uid(),
          fromNodeId: this.connectingFrom,
          toNodeId: targetNode.id,
          label: '',
          style: 'solid',
        };
        this.edges.push(newEdge);
        this.emitChange();
        this.selectedEdge = newEdge;
      }
      this.cancelConnect();
    },
    cancelConnect() {
      this.connectingFrom = null;
      this.connectingPointer = null;
    },

    // ── Deletion ──────────────────────────────────────────────────────────

    deleteNode(node) {
      this.stopNodeVideo(node.id);
      disposeVideoElement(this.nodeImages[node.id]);
      Vue.delete(this.nodeImages, node.id);
      Vue.delete(this.nodeVideoIds, node.id);
      Vue.delete(this.nodeMediaKeys, node.id);
      this.nodes = this.nodes.filter((n) => n.id !== node.id);
      this.edges = this.edges.filter(
        (e) => e.fromNodeId !== node.id && e.toNodeId !== node.id,
      );
      this.emitChange();
    },
    selectEdge(edge) {
      this.selectedEdge = edge;
    },
    deleteEdge(edge) {
      this.edges = this.edges.filter((e) => e.id !== edge.id);
      this.selectedEdge = null;
      this.emitChange();
    },

    // ── Color picker ─────────────────────────────────────────────────────

    openNodeColorPicker(evt, node) {
      // Get screen coords from the Konva event
      const nativeEvt = evt.evt || evt;
      this.colorPicker = {
        visible: true,
        target: { type: 'node', item: node },
        current: node.color || null,
        screenX: nativeEvt.clientX - 10,
        screenY: nativeEvt.clientY + 14,
      };
      this._bindColorPickerClose();
    },
    openEdgeColorPicker(evt, edge) {
      // kept for potential external use; edge colors are now managed via the sidebar
      this.colorPicker = {
        visible: true,
        target: { type: 'edge', item: edge },
        current: edge.color || null,
        screenX: evt.clientX - 10,
        screenY: evt.clientY + 14,
      };
      this._bindColorPickerClose();
    },
    applyColor(color) {
      if (!this.colorPicker.target) return;
      const { type, item } = this.colorPicker.target;
      this.$set(item, 'color', color);
      this.colorPicker.current = color;
      this.emitChange();
    },
    closeColorPicker() {
      this.colorPicker.visible = false;
      this.colorPicker.target = null;
    },
    _bindColorPickerClose() {
      const close = (e) => {
        if (this.$refs.colorPalette && !this.$refs.colorPalette.contains(e.target)) {
          this.closeColorPicker();
          document.removeEventListener('mousedown', close);
        }
      };
      this.$nextTick(() => document.addEventListener('mousedown', close));
    },
    applyArrowType(type) {
      if (!this.selectedEdge) return;
      this.$set(this.selectedEdge, 'label', type.abbr);
      this.$set(this.selectedEdge, 'color', type.color);
      this.$set(this.selectedEdge, 'arrowType', type.label);
      this.emitChange();
    },
    applyArrowStyle(styleId) {
      if (!this.selectedEdge) return;
      this.$set(this.selectedEdge, 'style', styleId);
      this.emitChange();
    },

    // ── Image loading ─────────────────────────────────────────────────────

    loadImages() {
      this.nodes.forEach((node) => {
        if (node.type === 'input' && !node.imageUrl && node.notation) {
          const url = getInputIcon(node.notation, this.gameAbbreviation);
          if (url) node.imageUrl = url;
        }
        if (node.imageUrl && !this.nodeImages[node.id]) this.loadNodeMedia(node);
      });
    },
    loadNodeMedia(node) {
      loadMoveMedia(node.imageUrl)
        .then(({ element, isVideo }) => {
          Vue.set(this.nodeImages, node.id, element);
          Vue.set(this.nodeMediaKeys, node.id, (this.nodeMediaKeys[node.id] || 0) + 1);
          if (isVideo) Vue.set(this.nodeVideoIds, node.id, true);
          this.$nextTick(() => {
            const layer = this.$refs.nodeLayer && this.$refs.nodeLayer.getNode();
            if (layer) layer.batchDraw();
          });
        })
        .catch((err) => {
          console.warn('[GameplanCanvas] media load failed', node.imageUrl, err);
        });
    },
    startNodeVideo(nodeId) {
      const video = this.nodeImages[nodeId];
      if (!video || this.videoAnims[nodeId]) return;
      playVideo(video);
      const layer = this.$refs.nodeLayer && this.$refs.nodeLayer.getNode();
      if (!layer) return;
      const anim = new Konva.Animation(() => {}, layer);
      anim.start();
      Vue.set(this.videoAnims, nodeId, anim);
    },
    stopNodeVideo(nodeId) {
      const anim = this.videoAnims[nodeId];
      if (anim) {
        anim.stop();
        Vue.delete(this.videoAnims, nodeId);
      }
      pauseVideo(this.nodeImages[nodeId], 0.1);
      const layer = this.$refs.nodeLayer && this.$refs.nodeLayer.getNode();
      if (layer) layer.batchDraw();
    },

    // ── Emit ──────────────────────────────────────────────────────────────

    emitChange() {
      this.$emit('input', {
        nodes: this.nodes,
        edges: this.edges,
        viewport: { ...this.viewport },
      });
    },

    // ── Public API ────────────────────────────────────────────────────────

    clearCanvas() {
      Object.keys(this.videoAnims).forEach((id) => this.stopNodeVideo(id));
      this.nodeImages = {};
      this.nodeVideoIds = {};
      this.nodeMediaKeys = {};
      this.nodes = [];
      this.edges = [];
      this.emitChange();
    },
    resetViewport() {
      this.viewport = { scale: 1, offsetX: 0, offsetY: 0 };
      this.emitChange();
    },
  },
};
</script>

<style scoped>
.gameplan-canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #13131b;
  background-image:
    radial-gradient(circle, #2e2e3a 1px, transparent 1px);
  background-size: 24px 24px;
}

.color-palette {
  position: fixed;
  z-index: 100;
  background: #1c1c28;
  border: 1px solid #3eb489;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 144px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6);
}

.color-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.15);
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s;
}

.color-swatch:hover {
  transform: scale(1.25);
  border-color: #fff;
}

.color-custom {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f);
  border: 1.5px solid rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.1s;
}

.color-custom:hover {
  transform: scale(1.25);
}

.color-custom i {
  font-size: 9px;
  color: #fff;
  pointer-events: none;
}

.comment-editor {
  position: fixed;
  z-index: 50;
}

.comment-textarea {
  background: #2d2a1e;
  border: 1.5px dashed #a08c40;
  border-radius: 6px;
  color: #e8d88a;
  font-size: 12px;
  line-height: 1.5;
  padding: 8px 10px;
  resize: none;
  outline: none;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);
}
</style>
