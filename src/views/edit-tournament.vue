<!-- @format -->
<template>
    <div class="edit-tournament">
        <loading v-if="pageLoading" />

        <template v-else>
            <div class="page-header">
                <h1>Edit tournament</h1>
                <p>Update event details for <strong>{{ form.Name || 'this tournament' }}</strong>.</p>
            </div>

            <v-card class="form-card" dark outlined>
                <v-card-text>
                    <v-text-field
                        v-model="form.Name"
                        label="Name *"
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-3"
                    />

                    <div class="field-label">Series (optional)</div>
                    <multiselect
                        v-model="selectedSeries"
                        :options="seriesOptions"
                        :multiple="false"
                        :close-on-select="true"
                        :clear-on-select="false"
                        :preserve-search="true"
                        placeholder="Link to a series / parent event"
                        label="name"
                        track-by="id"
                        class="mb-4 multiselect-dark"
                    />

                    <v-text-field
                        v-model="form.Location"
                        label="Location"
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-3"
                    />

                    <v-text-field
                        v-model="form.EventDate"
                        label="Event date *"
                        type="date"
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-3"
                    />

                    <div class="field-label">Games *</div>
                    <multiselect
                        v-model="selectedGames"
                        :options="gameOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :preserve-search="true"
                        placeholder="Select one or more games"
                        label="title"
                        track-by="id"
                        class="mb-4 multiselect-dark"
                    >
                        <template slot="option" slot-scope="props">
                            <div class="game-opt">
                                <img v-if="props.option.logoUrl" :src="props.option.logoUrl" alt="" />
                                <span>{{ props.option.title }}</span>
                            </div>
                        </template>
                    </multiselect>

                    <v-text-field
                        v-model="form.Image"
                        label="Image URL"
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-3"
                        placeholder="Cloudinary or external image URL"
                    />

                    <v-text-field
                        v-model="form.BracketUrl"
                        label="Bracket URL"
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-3"
                    />

                    <v-text-field
                        v-model.number="form.Tier"
                        label="Tier"
                        type="number"
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-3"
                        placeholder="e.g. 1"
                    />

                    <v-switch v-model="form.IsFinished" label="Event finished" class="mt-0 mb-4" />

                    <div class="field-label">Bracket filters</div>
                    <v-combobox
                        v-model="form.BracketFilters"
                        :items="bracketPresets"
                        label="Pools, phases, etc."
                        multiple
                        chips
                        small-chips
                        outlined
                        dense
                        hide-details="auto"
                        class="mb-4"
                    />

                    <div class="form-actions">
                        <v-btn text @click="goBack">Cancel</v-btn>
                        <v-btn
                            color="primary"
                            large
                            :loading="loading"
                            :disabled="!isValid"
                            @click="submit"
                        >
                            Save changes
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>

            <v-alert v-if="error" type="error" outlined class="mt-4">{{ error }}</v-alert>
            <v-alert v-if="success" type="success" outlined class="mt-4">{{ success }}</v-alert>
        </template>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import TournamentsService from '@/services/tournaments-service';
import Loading from '@/components/common/loading';

export default {
    name: 'EditTournament',

    components: {
        loading: Loading,
    },

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
            pageLoading: true,
            form: {
                Name: '',
                Location: '',
                EventDate: '',
                Image: '',
                BracketUrl: '',
                Tier: null,
                IsFinished: false,
                BracketFilters: [],
            },
            selectedGames: [],
            selectedSeries: null,
            gameOptions: [],
            seriesOptions: [],
            bracketPresets: [
                'Pools',
                'Top 24',
                'Top 8',
                'Winners Semi',
                'Winners Finals',
                'Grand Finals',
            ],
            loading: false,
            error: null,
            success: null,
        };
    },

    computed: {
        tournamentId() {
            return this.$route.params.id;
        },

        isAdmin() {
            return this.account && String(this.account.role || '').toLowerCase() === 'admin';
        },

        isValid() {
            return (
                this.form.Name.trim().length > 0 &&
                this.form.EventDate &&
                this.selectedGames &&
                this.selectedGames.length > 0
            );
        },
    },

    async mounted() {
        if (!this.isAdmin) {
            this.$router.replace({ name: 'Tournament', params: { id: this.tournamentId } });
            return;
        }
        await this.loadGames();
        await Promise.all([this.loadSeries(), this.loadTournament()]);
        this.pageLoading = false;
    },

    methods: {
        formatDateForInput(value) {
            if (!value) return '';
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },

        async loadGames() {
            const res = await GamesService.fetchGames();
            this.gameOptions = res.data.games.map((g) => ({
                id: String(g._id),
                title: g.Title,
                logoUrl: g.LogoUrl,
            }));
            this.gameOptions.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        },

        async loadSeries() {
            const res = await TournamentsService.fetchTournaments();
            this.seriesOptions = res.data.tournaments
                .filter((t) => String(t._id) !== String(this.tournamentId))
                .map((t) => ({
                    id: String(t._id),
                    name: t.Name,
                }));
            this.seriesOptions.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        },

        async loadTournament() {
            const res = await TournamentsService.getTournament({ id: this.tournamentId });
            const t = res.data;

            this.form = {
                Name: t.Name || '',
                Location: t.Location || '',
                EventDate: this.formatDateForInput(t.EventDate),
                Image: t.Image || '',
                BracketUrl: t.BracketUrl || '',
                Tier: t.Tier != null ? t.Tier : null,
                IsFinished: !!t.IsFinished,
                BracketFilters: Array.isArray(t.BracketFilters) ? [...t.BracketFilters] : [],
            };

            const gameIds = (t.Games || []).map((id) => String(id));
            this.selectedGames = this.gameOptions.filter((g) => gameIds.includes(g.id));

            if (t.Series) {
                const seriesId = typeof t.Series === 'object' && t.Series._id ? String(t.Series._id) : String(t.Series);
                this.selectedSeries =
                    this.seriesOptions.find((s) => s.id === seriesId) ||
                    { id: seriesId, name: t.Series.Name || 'Series' };
            }
        },

        goBack() {
            this.$router.push({ name: 'Tournament', params: { id: this.tournamentId } });
        },

        async submit() {
            this.error = null;
            this.success = null;
            if (!this.isValid) return;

            this.loading = true;
            try {
                const payload = {
                    id: this.tournamentId,
                    Name: this.form.Name.trim(),
                    Location: this.form.Location.trim() || undefined,
                    EventDate: this.form.EventDate
                        ? new Date(this.form.EventDate + 'T12:00:00').toISOString()
                        : undefined,
                    Games: this.selectedGames.map((g) => g.id),
                    Image: this.form.Image.trim() || undefined,
                    BracketUrl: this.form.BracketUrl.trim() || undefined,
                    BracketFilters: Array.isArray(this.form.BracketFilters)
                        ? this.form.BracketFilters.map((x) => String(x).trim()).filter(Boolean)
                        : [],
                    IsFinished: this.form.IsFinished,
                    Series: this.selectedSeries && this.selectedSeries.id ? this.selectedSeries.id : null,
                };
                if (
                    this.form.Tier !== null &&
                    this.form.Tier !== '' &&
                    !Number.isNaN(Number(this.form.Tier))
                ) {
                    payload.Tier = Number(this.form.Tier);
                }

                await TournamentsService.updateTournament(payload);
                this.success = 'Tournament updated.';
                setTimeout(() => this.goBack(), 600);
            } catch (e) {
                const msg =
                    (e.response && e.response.data && e.response.data.error) ||
                    (e.response && e.response.data && e.response.data.message) ||
                    e.message ||
                    'Request failed';
                this.error = msg;
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.edit-tournament {
    max-width: 720px;
    margin: 0 auto;
    padding: 200px 24px 48px;
    color: #fff;
}

.page-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
}

.page-header p {
    opacity: 0.85;
    line-height: 1.5;
}

.form-card {
    margin-top: 24px;
    background: rgba(0, 0, 0, 0.35) !important;
}

.field-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.7;
    margin-bottom: 8px;
}

.game-opt {
    display: flex;
    align-items: center;
    gap: 8px;
}

.game-opt img {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 4px;
}

.form-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
}

.multiselect-dark >>> .multiselect__tags {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.25);
}

.multiselect-dark >>> .multiselect__input,
.multiselect-dark >>> .multiselect__single {
    background: transparent;
    color: #fff;
}

.multiselect-dark >>> .multiselect__content-wrapper {
    background: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.15);
}
</style>
