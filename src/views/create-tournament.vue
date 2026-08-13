<!-- @format -->
<template>
    <div class="create-tournament">
        <div class="page-header">
            <h1>Create tournament</h1>
            <p>
                Add an event to the
                <code>Tournaments</code>
                collection. Games and optional series use the same ids as elsewhere on the site.
            </p>
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

                <div
                    class="finished-toggle mb-4"
                    role="button"
                    tabindex="0"
                    @click="toggleIsFinished"
                    @keydown.enter.prevent="toggleIsFinished"
                    @keydown.space.prevent="toggleIsFinished"
                >
                    <v-switch
                        :input-value="form.IsFinished"
                        label="Event finished"
                        readonly
                        hide-details
                        class="mt-0 pt-0"
                    />
                </div>

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

                <v-btn
                    color="primary"
                    large
                    :loading="loading"
                    :disabled="!isValid"
                    @click="submit"
                >
                    Create tournament
                </v-btn>
            </v-card-text>
        </v-card>

        <v-alert v-if="error" type="error" outlined class="mt-4">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" outlined class="mt-4">{{ success }}</v-alert>
    </div>
</template>

<script>
import GamesService from '@/services/games-service';
import TournamentsService from '@/services/tournaments-service';

export default {
    name: 'CreateTournament',

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    data() {
        return {
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
        await this.loadGames();
        await this.loadSeries();
    },

    methods: {
        async loadGames() {
            const res = await GamesService.fetchGames();
            this.gameOptions = res.data.games.map((g) => ({
                id: g._id,
                title: g.Title,
                logoUrl: g.LogoUrl,
            }));
            this.gameOptions.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        },

        async loadSeries() {
            const res = await TournamentsService.fetchTournaments();
            this.seriesOptions = res.data.tournaments.map((t) => ({
                id: t._id,
                name: t.Name,
            }));
            this.seriesOptions.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        },

        async submit() {
            this.error = null;
            this.success = null;
            if (!this.isValid) return;

            this.loading = true;
            try {
                const payload = {
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
                };
                if (this.selectedSeries && this.selectedSeries.id) {
                    payload.Series = this.selectedSeries.id;
                }
                if (
                    this.form.Tier !== null &&
                    this.form.Tier !== '' &&
                    !Number.isNaN(Number(this.form.Tier))
                ) {
                    payload.Tier = Number(this.form.Tier);
                }

                const res = await TournamentsService.addTournament(payload);
                if (res.data && res.data.success) {
                    const id =
                        res.data.tournamentId || (res.data.tournament && res.data.tournament._id);
                    this.success = id ? 'Tournament created. Id: ' + id : 'Tournament created.';
                    this.resetForm();
                } else {
                    this.error = (res.data && res.data.message) || 'Unexpected response';
                }
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

        toggleIsFinished() {
            this.form.IsFinished = !this.form.IsFinished;
        },

        resetForm() {
            this.form = {
                Name: '',
                Location: '',
                EventDate: '',
                Image: '',
                BracketUrl: '',
                Tier: null,
                IsFinished: false,
                BracketFilters: [],
            };
            this.selectedGames = [];
            this.selectedSeries = null;
        },
    },
};
</script>

<style scoped>
.create-tournament {
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

.page-header code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.1em 0.35em;
    border-radius: 4px;
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

.finished-toggle {
    position: relative;
    z-index: 51;
    cursor: pointer;
}
</style>
