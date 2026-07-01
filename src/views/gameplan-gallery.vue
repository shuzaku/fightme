<template>
  <div class="gameplan-gallery-view">
    <div class="gallery-header">
      <h1><i class="fas fa-project-diagram"></i> My Gameplans</h1>
      <router-link to="/gameplan-maker" class="new-btn">
        <i class="fas fa-plus"></i> New Gameplan
      </router-link>
    </div>

    <div v-if="!account" class="gallery-empty">
      <p>Log in to save and manage gameplans.</p>
    </div>
    <div v-else-if="loading" class="gallery-loading">
      <i class="fas fa-spinner fa-spin"></i> Loading…
    </div>
    <div v-else-if="!gameplans.length" class="gallery-empty">
      <i class="fas fa-chess-knight gallery-empty-icon"></i>
      <p>No gameplans yet.</p>
      <router-link to="/gameplan-maker" class="new-btn-big">Create your first gameplan</router-link>
    </div>

    <div v-else class="gallery-grid">
      <div
        v-for="gp in gameplans"
        :key="gp._id"
        class="gallery-card"
        @click="openGameplan(gp)"
      >
        <div class="gallery-card-title">{{ gp.Name || 'Untitled' }}</div>
        <div class="gallery-card-meta">
          <span v-if="gp.CharacterId" class="meta-badge">
            <i class="fas fa-user"></i> {{ characterName(gp.CharacterId) }}
          </span>
          <span class="meta-badge">
            <i class="fas fa-calendar-alt"></i> {{ formatDate(gp.updatedAt) }}
          </span>
        </div>
        <div class="gallery-card-actions">
          <button class="card-btn edit-btn" @click.stop="openGameplan(gp)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="card-btn delete-btn" @click.stop="deleteGameplan(gp)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GameplansService from '@/services/gameplans-service';

export default {
  name: 'GameplanGallery',
  props: {
    account: { type: Object, default: null },
  },
  data() {
    return {
      gameplans: [],
      loading: false,
    };
  },
  watch: {
    account(val) {
      if (val) this.loadGameplans();
    },
  },
  created() {
    if (this.account) this.loadGameplans();
  },
  methods: {
    async loadGameplans() {
      this.loading = true;
      try {
        const resp = await GameplansService.list({ ownerId: this.account.id });
        this.gameplans = resp.data || [];
      } catch (e) {
        console.error('[GameplanGallery] load', e);
      } finally {
        this.loading = false;
      }
    },
    openGameplan(gp) {
      this.$router.push({ path: '/gameplan-maker', query: { id: gp._id } });
    },
    async deleteGameplan(gp) {
      if (!confirm(`Delete "${gp.Name}"?`)) return;
      try {
        await GameplansService.delete(gp._id, this.account.id);
        this.gameplans = this.gameplans.filter((g) => g._id !== gp._id);
      } catch (e) {
        console.error('[GameplanGallery] delete', e);
        alert('Error deleting gameplan.');
      }
    },
    characterName(id) {
      return String(id).slice(-6);
    },
    formatDate(ts) {
      if (!ts) return '';
      return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    },
  },
};
</script>

<style scoped>
.gameplan-gallery-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 140px 20px;
  color: #fff;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.gallery-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #3eb489;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3eb489;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}

.new-btn:hover { background: #35a07a; }

.gallery-loading,
.gallery-empty {
  text-align: center;
  padding: 60px 0;
  color: #666;
  font-size: 14px;
}

.gallery-empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  color: #333;
}

.new-btn-big {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  background: #3eb489;
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.gallery-card {
  background: #1c1c24;
  border: 1px solid #2e2e3a;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
}

.gallery-card:hover {
  border-color: #3eb489;
  transform: translateY(-2px);
}

.gallery-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #888;
  background: #13131b;
  padding: 2px 7px;
  border-radius: 3px;
}

.gallery-card-actions {
  display: flex;
  gap: 8px;
}

.card-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #2e2e3a;
  font-size: 11px;
  cursor: pointer;
  background: transparent;
  transition: border-color 0.15s, color 0.15s;
}

.edit-btn { color: #3eb489; }
.edit-btn:hover { border-color: #3eb489; }

.delete-btn { color: #e55; }
.delete-btn:hover { border-color: #e55; }
</style>
