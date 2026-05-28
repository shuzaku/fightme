<!-- @format -->
<template>
    <div class="multistream-view">
        <!-- Top bar -->
        <div class="ms-topbar">
            <div class="ms-title">
                <span class="ms-logo">&#9654;</span>
                Multi-Stream
                <span v-if="streams.length" class="ms-count">{{ streams.length }}</span>
            </div>

            <div class="ms-add-form">
                <input
                    v-model.trim="newChannel"
                    class="ms-input"
                    placeholder="Twitch channel name…"
                    maxlength="50"
                    @keyup.enter="addStream"
                />
                <button class="ms-add-btn" :disabled="!newChannel" @click="addStream">+ Add</button>
            </div>

            <div v-if="streams.length" class="ms-actions">
                <button class="ms-share-btn" @click="copyLink">&#128279; Share</button>
                <button class="ms-clear-btn" @click="clearAll">Clear All</button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="streams.length === 0" class="ms-empty">
            <div class="ms-empty-icon">📺</div>
            <h2>No streams added yet</h2>
            <p>
                Type a Twitch channel name above, or open a link like
                <code>/multistream/capcomfighters/tekken/teamsp00ky</code>
            </p>
            <div class="ms-suggestions">
                <span class="ms-sug-label">Quick start:</span>
                <button
                    v-for="ch in suggestions"
                    :key="ch"
                    class="ms-sug-btn"
                    @click="addSuggestion(ch)"
                >
                    {{ ch }}
                </button>
            </div>
        </div>

        <!-- Stream layout -->
        <div v-else class="ms-layout">
            <!-- Featured stream -->
            <div class="ms-featured-wrapper">
                <div class="ms-featured-label">
                    <span class="ms-live-dot" />
                    <span class="ms-live-text">LIVE</span>
                    <span class="ms-channel-name">{{ streams[featuredIndex] }}</span>
                    <span class="ms-mute-hint">&#128263; Click volume icon to unmute</span>
                </div>
                <div class="ms-featured-player">
                    <!--
                        Muted so it autoplays. Featured player is well above
                        Twitch's 400x300 floor so the size check passes; the
                        50ms delay (featuredReady flag) lets layout settle
                        first so Twitch's "style visibility" check also
                        passes. User clicks the volume icon to unmute.
                    -->
                    <iframe
                        v-if="featuredReady"
                        :key="'feat-' + streams[featuredIndex]"
                        :src="embedUrl(streams[featuredIndex], true)"
                        frameborder="0"
                        allow="autoplay; fullscreen"
                        allowfullscreen
                    />
                    <div v-else class="ms-featured-loading">
                        <span class="ms-tile-loading-dot" />
                    </div>
                </div>
            </div>

            <!-- Non-featured tray -->
            <div v-if="nonFeatured.length" ref="tray" class="ms-tray" :style="trayStyle">
                <div v-for="s in nonFeatured" :key="s.channel" class="ms-tile">
                    <div class="ms-tile-player">
                        <!--
                            Tray iframes mount progressively (see
                            scheduleTrayMounts) so the featured iframe
                            wins Chrome's per-page muted-autoplay budget
                            uncontested, then each tile is added with a
                            small stagger.
                        -->
                        <iframe
                            v-if="mountedSet[s.channel]"
                            :src="embedUrl(s.channel, true)"
                            frameborder="0"
                            scrolling="no"
                            allow="autoplay; fullscreen"
                            allowfullscreen="true"
                            loading="lazy"
                        />
                        <div v-else class="ms-tile-loading">
                            <span class="ms-tile-loading-dot" />
                            <span class="ms-tile-loading-text">{{ s.channel }}</span>
                        </div>
                    </div>
                    <div class="ms-tile-footer">
                        <span class="ms-tile-name">{{ s.channel }}</span>
                        <button
                            class="ms-tile-feature-btn"
                            @click="featuredIndex = s.originalIndex"
                        >
                            Feature
                        </button>
                        <button class="ms-tile-remove" @click="removeStream(s.originalIndex)">
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MultiStream',

    data() {
        return {
            streams: this.parseChannels(),
            featuredIndex: 0,
            newChannel: '',
            suggestions: ['capcomfighters', 'tekken', 'teamsp00ky', 'tenomedia'],
            trayWidth: 0,
            trayHeight: 0,
            // Featured iframe waits one tick after mount so layout settles
            // before Twitch's player runs its "style visibility" autoplay
            // check. Loading the iframe before the page is laid out trips
            // that check and Twitch refuses to autoplay.
            featuredReady: false,
            // Channels currently allowed to mount their iframe. Featured
            // gets to start alone, then tray channels are added one at a
            // time so the featured iframe isn't disrupted by a sudden
            // burst of cross-origin embeds.
            mountedSet: {},
        };
    },

    computed: {
        nonFeatured() {
            return this.streams
                .map((channel, originalIndex) => ({ channel, originalIndex }))
                .filter(({ originalIndex }) => originalIndex !== this.featuredIndex);
        },

        // Find the (cols, rowHeight) that maximises tile size while keeping
        // every tile >= 400x300. Twitch refuses to autoplay any embed smaller
        // than that (per dev.twitch.tv/docs/embed/), so the layout never
        // shrinks below the cutoff — the tray scrolls instead.
        //
        // Returns `fillSpace: true` when the chosen layout fits visibly in
        // the tray. The view then uses `1fr` rows so they expand to fill
        // the entire tray height (no empty space at bottom). When too many
        // streams force scrolling, fixed-pixel rows are used instead.
        optimalLayout() {
            const n = this.nonFeatured.length;
            const FOOTER = 28;
            const GAP = 3;
            const ratio = 16 / 9;
            const MIN_TILE_W = 400; // Twitch autoplay minimum width
            const MIN_PLAYER_H = 300; // Twitch autoplay minimum height
            const MIN_ROW_H = MIN_PLAYER_H + FOOTER;

            if (!n || !this.trayWidth || !this.trayHeight) {
                return {
                    cols: Math.min(n || 1, 4),
                    rowHeight: MIN_ROW_H,
                    fillSpace: false,
                };
            }

            const W = this.trayWidth;
            const H = this.trayHeight;
            const maxCols = Math.max(1, Math.floor((W + GAP) / (MIN_TILE_W + GAP)));

            // Phase 1: prefer a layout where all rows fit visibly AND tiles
            // meet the 400x300 floor. We pick the cols giving largest tiles.
            let best = { cols: 0, tileW: 0, rowH: MIN_ROW_H };
            for (let cols = 1; cols <= Math.min(n, maxCols); cols++) {
                const rows = Math.ceil(n / cols);
                const contentW = W - (cols - 1) * GAP;
                const contentH = H - (rows - 1) * GAP;

                const tileW = contentW / cols;
                const playerH = tileW / ratio;
                const rowH = playerH + FOOTER;

                if (tileW < MIN_TILE_W) continue;
                if (playerH < MIN_PLAYER_H) continue;
                if (rowH * rows > contentH) continue;

                if (tileW > best.tileW) {
                    best = { cols, tileW, rowH };
                }
            }

            if (best.cols > 0) {
                return {
                    cols: best.cols,
                    rowHeight: best.rowH,
                    fillSpace: true,
                };
            }

            // Phase 2: too many streams to fit visibly at minimum size.
            // Lock to MIN_TILE_W with the most cols possible and scroll.
            return {
                cols: Math.min(n, maxCols),
                rowHeight: MIN_ROW_H,
                fillSpace: false,
            };
        },

        trayStyle() {
            const layout = this.optimalLayout;
            const n = this.nonFeatured.length;
            const rows = Math.max(1, Math.ceil(n / layout.cols));
            const style = {
                gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            };
            if (layout.fillSpace) {
                // Stretch all rows equally to fill the tray height.
                style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            } else {
                // Fixed-height rows that overflow into a scrollable tray.
                style.gridAutoRows = `${layout.rowHeight}px`;
            }
            return style;
        },
    },

    watch: {
        streams() {
            this.syncUrl();
            this.scheduleTrayMounts();
            this.$nextTick(this.measureTrayNow);
        },
        featuredIndex() {
            this.scheduleTrayMounts();
            this.$nextTick(this.measureTrayNow);
        },
    },

    created() {
        // Properties starting with `_` aren't proxied by Vue 2's data()
        // reactivity, so initialise non-reactive instance state here
        // instead. (Reading `this._foo` before any `this._foo = …` assign
        // returns undefined when declared via data().)
        this._resizeObserver = null;
        this._measureRaf = null;
        this._measureTimer = null;
        this._trayMountTimers = [];
        this._featuredReadyTimer = null;
    },

    mounted() {
        this.$nextTick(() => {
            this.measureTrayNow();
            if (window.ResizeObserver && this.$refs.tray) {
                this._resizeObserver = new window.ResizeObserver(this.measureTray);
                this._resizeObserver.observe(this.$refs.tray);
            } else {
                window.addEventListener('resize', this.measureTray);
            }
        });
        // Wait for layout to settle (one tick + a small delay) before
        // mounting the featured iframe so Twitch's "style visibility"
        // autoplay check passes on the first attempt.
        this._featuredReadyTimer = setTimeout(() => {
            this.featuredReady = true;
            this.scheduleTrayMounts();
        }, 50);
    },

    beforeDestroy() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this._measureRaf) cancelAnimationFrame(this._measureRaf);
        if (this._measureTimer) clearTimeout(this._measureTimer);
        if (this._featuredReadyTimer) clearTimeout(this._featuredReadyTimer);
        this.clearTrayMountTimers();
        window.removeEventListener('resize', this.measureTray);
    },

    methods: {
        parseChannels() {
            const pathChannels = this.$route.params.channels;
            if (pathChannels) {
                return pathChannels
                    .split('/')
                    .map((c) => c.trim().toLowerCase())
                    .filter(Boolean);
            }
            const queryChannels = this.$route.query.channels;
            if (queryChannels) {
                return String(queryChannels)
                    .split(',')
                    .map((c) => c.trim().toLowerCase())
                    .filter(Boolean);
            }
            return [];
        },

        syncUrl() {
            const newPath = this.streams.length
                ? `/multistream/${this.streams.join('/')}`
                : '/multistream';
            if (this.$route.path !== newPath) {
                this.$router.replace(newPath);
            }
        },

        addStream() {
            const ch = this.newChannel.toLowerCase().replace(/[^a-z0-9_]/g, '');
            if (!ch || this.streams.includes(ch)) {
                this.newChannel = '';
                return;
            }
            this.streams.push(ch);
            this.newChannel = '';
        },

        addSuggestion(ch) {
            if (!this.streams.includes(ch)) this.streams.push(ch);
        },

        removeStream(i) {
            this.streams.splice(i, 1);
            if (this.featuredIndex >= this.streams.length) {
                this.featuredIndex = Math.max(0, this.streams.length - 1);
            }
        },

        clearAll() {
            this.streams = [];
            this.featuredIndex = 0;
        },

        copyLink() {
            const url = `${window.location.origin}/multistream/${this.streams.join('/')}`;
            navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
        },

        // Trailing-edge debounce + RAF: tile sizes only update once the
        // user has finished resizing. This stops Twitch's player from
        // pausing repeatedly during a continuous window-resize drag.
        measureTray() {
            if (this._measureTimer) clearTimeout(this._measureTimer);
            this._measureTimer = setTimeout(() => {
                if (this._measureRaf) cancelAnimationFrame(this._measureRaf);
                this._measureRaf = requestAnimationFrame(this.measureTrayNow);
            }, 200);
        },

        measureTrayNow() {
            if (!this.$refs.tray) {
                this.trayWidth = 0;
                this.trayHeight = 0;
                return;
            }
            this.trayWidth = this.$refs.tray.clientWidth;
            this.trayHeight = this.$refs.tray.clientHeight;
        },

        // Mount tray iframes one-by-one with a delay between each so the
        // featured iframe gets its autoplay grant first and the per-page
        // muted-autoplay budget isn't blown by a single burst of mounts.
        scheduleTrayMounts() {
            this.clearTrayMountTimers();
            // Featured channel mounts immediately (already in template).
            const featuredChannel = this.streams[this.featuredIndex];
            const fresh = { [featuredChannel]: true };
            this.mountedSet = fresh;

            // Wait ~1.5s for the featured iframe to start playing, then
            // mount each tray iframe 250ms apart.
            const FEATURED_HEADSTART = 1500;
            const STAGGER = 250;
            this.nonFeatured.forEach((s, i) => {
                const t = setTimeout(() => {
                    this.$set(this.mountedSet, s.channel, true);
                }, FEATURED_HEADSTART + i * STAGGER);
                this._trayMountTimers.push(t);
            });
        },

        clearTrayMountTimers() {
            if (this._trayMountTimers && this._trayMountTimers.length) {
                this._trayMountTimers.forEach(clearTimeout);
            }
            this._trayMountTimers = [];
        },

        embedUrl(channel, muted = true) {
            // Single parent matching the live hostname — this is the exact
            // pattern multitwitch.tv uses. Sending multiple `parent=` values
            // appears to confuse Twitch's autoplay logic (some embeds load
            // but refuse to autoplay even when muted). Stick to one.
            const parent = window.location.hostname || 'localhost';
            return [
                'https://player.twitch.tv/?',
                `muted=${muted}`,
                `&channel=${encodeURIComponent(channel)}`,
                `&parent=${encodeURIComponent(parent)}`,
                '&autoplay=true',
            ].join('');
        },
    },
};
</script>

<style>
/* ── Shell ────────────────────────────────────────────────────────────────── */
.multistream-view {
    height: 100vh;
    background: #0f1117;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding-top: 80px;
    box-sizing: border-box;
    overflow: hidden;
}

/* ── Top bar ──────────────────────────────────────────────────────────────── */
.ms-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    background: #13151f;
    border-bottom: 1px solid #ffffff15;
    flex-wrap: wrap;
    position: sticky;
    top: 60px;
    z-index: 10;
}

.ms-title {
    font-size: 17px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    flex-shrink: 0;
}

.ms-logo {
    color: #9147ff;
    font-size: 13px;
}

.ms-count {
    background: #9147ff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    padding: 1px 7px;
    line-height: 18px;
}

.ms-add-form {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 200px;
    max-width: 380px;
}

.ms-input {
    flex: 1;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #ffffff20;
    background: #1e2130;
    color: #fff;
    padding: 0 12px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
}
.ms-input::placeholder {
    color: #ffffff45;
}
.ms-input:focus {
    border-color: #9147ff;
}

.ms-add-btn {
    height: 36px;
    padding: 0 14px;
    background: #9147ff;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s;
}
.ms-add-btn:hover:not(:disabled) {
    background: #772ce8;
}
.ms-add-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.ms-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.ms-share-btn,
.ms-clear-btn {
    height: 34px;
    padding: 0 12px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    background: transparent;
    border: 1px solid #ffffff20;
    transition: color 0.15s, border-color 0.15s;
}
.ms-share-btn {
    color: #ffffffaa;
}
.ms-share-btn:hover {
    color: #fff;
    border-color: #ffffff50;
}
.ms-clear-btn {
    color: #ffffff60;
}
.ms-clear-btn:hover {
    color: #ff5c5c;
    border-color: #ff5c5c50;
}

/* ── Empty state ──────────────────────────────────────────────────────────── */
.ms-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 60px 24px;
    text-align: center;
}
.ms-empty-icon {
    font-size: 54px;
    line-height: 1;
}
.ms-empty h2 {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
}
.ms-empty p {
    color: #ffffff60;
    font-size: 14px;
    margin: 0;
    max-width: 500px;
}
.ms-empty code {
    background: #1e2130;
    padding: 2px 6px;
    border-radius: 4px;
    color: #9147ff;
    font-size: 13px;
}
.ms-suggestions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
}
.ms-sug-label {
    color: #ffffff45;
    font-size: 13px;
}
.ms-sug-btn {
    background: #1e2130;
    border: 1px solid #ffffff20;
    color: #ffffffcc;
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}
.ms-sug-btn:hover {
    background: #9147ff25;
    border-color: #9147ff;
    color: #fff;
}

/* ── Stream layout ────────────────────────────────────────────────────────── */
.ms-layout {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #0d0f18;
    gap: 3px;
    padding: 3px;
}

/* ── Featured stream ──────────────────────────────────────────────────────── */
.ms-featured-wrapper {
    flex-shrink: 0;
    background: #000;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.ms-featured-label {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #13151f;
}

.ms-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #f03;
    display: inline-block;
    animation: ms-pulse 1.8s ease-in-out infinite;
}
@keyframes ms-pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.35;
    }
}
.ms-live-text {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #f03;
    text-transform: uppercase;
}
.ms-channel-name {
    font-size: 13px;
    font-weight: 600;
    color: #ffffffcc;
}

.ms-mute-hint {
    margin-left: auto;
    font-size: 11px;
    color: #ffffff60;
    font-style: italic;
}

/*
 * max-height caps the featured player at 40vh, leaving more vertical space
 * below for the non-featured tray. With aspect-ratio 16:9 the width
 * shrinks proportionally to match.
 */
/*
 * Guaranteed minimum height of 320px keeps the iframe above Twitch's
 * 400×300 autoplay floor on shorter viewports. width:100% × min-height
 * also guarantees the width side of the floor (anything > ~570px wide).
 */
.ms-featured-player {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 40vh;
    min-height: 320px;
    background: #000;
}
.ms-featured-player iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    visibility: visible;
}

.ms-featured-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0c14;
}

/* ── Non-featured tray ────────────────────────────────────────────────────── */
/*
 * Grid columns and row height are computed in JS via :style binding so
 * tiles grow/shrink to fill all available space below the featured stream.
 */
.ms-tray {
    display: grid;
    gap: 3px;
    flex: 1;
    min-height: 0;
    align-content: stretch;
    overflow-y: auto;
}

.ms-tray::-webkit-scrollbar {
    width: 8px;
}
.ms-tray::-webkit-scrollbar-track {
    background: transparent;
}
.ms-tray::-webkit-scrollbar-thumb {
    background: #ffffff20;
    border-radius: 4px;
}
.ms-tray::-webkit-scrollbar-thumb:hover {
    background: #ffffff35;
}

/* ── Tile ─────────────────────────────────────────────────────────────────── */
.ms-tile {
    cursor: default;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid transparent;
    background: #1a1d27;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    transition: border-color 0.15s;
}
.ms-tile:hover {
    border-color: #ffffff25;
}

/* Player fills the tile area minus the footer */
.ms-tile-player {
    position: relative;
    flex: 1;
    min-height: 0;
    background: #000;
    overflow: hidden;
}
.ms-tile-player iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    visibility: visible;
}

/* Brief placeholder shown until trayReady flips true */
.ms-tile-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #0a0c14;
    color: #ffffff60;
    font-size: 12px;
}
.ms-tile-loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9147ff;
    animation: ms-pulse 1.2s ease-in-out infinite;
}
.ms-tile-loading-text {
    font-weight: 600;
    color: #ffffff90;
}

/* Tile footer */
.ms-tile-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    background: #1a1d27;
    flex-shrink: 0;
}
.ms-tile-name {
    font-size: 11px;
    font-weight: 600;
    color: #ffffffcc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}
.ms-tile-feature-btn {
    background: #9147ff;
    border: none;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s;
}
.ms-tile-feature-btn:hover {
    background: #772ce8;
}

.ms-tile-remove {
    background: transparent;
    border: none;
    color: #ffffff35;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;
    transition: color 0.12s;
}
.ms-tile-remove:hover {
    color: #ff5c5c;
}

/* ── Mobile ───────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
    .ms-topbar {
        padding: 8px 12px;
    }
    .ms-add-form {
        min-width: 0;
        width: 100%;
    }
}
</style>
