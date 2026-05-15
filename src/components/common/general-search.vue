<!-- @format -->
<template>
    <div class="general-search" placeholder="Search Category">
        <multiselect
            v-model="searchValue"
            :options="searchValues"
            :close-on-select="true"
            :clear-on-select="true"
            :preserve-search="true"
            placeholder="Search players, games, characters"
            group-label="category"
            group-values="values"
            label="value"
            track-by="value"
            :showNoOptions="false"
            @input="setSearch()"
            @search-change="asyncFind"
        >
        </multiselect>
    </div>
</template>

<script>
import { eventbus } from '@/main';
import GeneralService from '@/services/general-service';
import { gameHrefFromLike, characterPagePath, playerPagePath } from '@/utils/game-character-routes';

export default {
    name: 'TopNav',

    data() {
        return {
            isLoading: true,
            search: null,
            isDropDownOpen: false,
            isRegisterModalOpen: false,
            isLoginModalOpen: false,
            searchValue: null,
            searchValues: [],
            createOptions: [
                {
                    name: 'Video',
                    value: 'video',
                },
                {
                    name: 'Game',
                    value: 'game',
                },
                {
                    name: 'Player',
                    value: 'player',
                },
                {
                    name: 'Creator',
                    value: 'creator',
                },
                {
                    name: 'Character',
                    value: 'character',
                },
                {
                    name: 'Tournament',
                    value: 'tournament',
                },
            ],
        };
    },

    computed: {
        characters: function () {
            return this.searchValues[1].values
                .filter((value) => value.valueType === 'Character')
                .map((character) => {
                    return character.value;
                });
        },
    },

    mounted() {},

    created() {
        eventbus.$on('updateSearch', this.getSearch);
    },

    beforeDestroy() {
        eventbus.$off('updateSearch', this.getSearch);
    },

    methods: {
        async getSearch() {
            const response = await GeneralService.fetchForSearch();
            this.hydrateResults(response);

            this.isLoading = false;
        },

        setSearch() {
            if (!this.searchValue) {
                return;
            }
            var v = this.searchValue;
            var t = v.valueType;
            if (t === 'Game' && v.raw) {
                var gh = gameHrefFromLike({
                    _id: v.id,
                    Abbreviation: v.raw.Abbreviation,
                });
                if (gh) {
                    this.$router.push(gh);
                }
                return;
            }
            if (t === 'Character' && v.raw) {
                var g = v.raw.Game && v.raw.Game[0];
                var gameLike = g && g.Abbreviation ? { Abbreviation: g.Abbreviation } : null;
                var ch = v.raw;
                var path = characterPagePath(gameLike, {
                    id: v.id,
                    slug: ch.Slug,
                    name: ch.Name,
                });
                if (path) {
                    this.$router.push(path);
                }
                return;
            }
            if (t === 'Player') {
                var pPath = playerPagePath({ id: v.id, slug: v.slug });
                this.$router.push(pPath || `/player/${v.id}`);
                return;
            }
            if (t === 'ContentCreator') {
                var ccPath = playerPagePath({ id: v.id, slug: v.slug });
                this.$router.push(ccPath || `/player/${v.id}`);
                return;
            }
            this.$router.push(`/${String(t).toLowerCase()}/${v.id}`);
        },

        openRegisterModal() {
            this.isRegisterModalOpen = true;
            this.closeLoginModal();
        },

        closeRegisterModal() {
            this.isRegisterModalOpen = false;
        },

        openLoginModal() {
            this.isLoginModalOpen = true;
            this.closeRegisterModal();
        },

        closeLoginModal() {
            this.isLoginModalOpen = false;
        },

        async asyncFind(query) {
            this.isLoading = true;
            var queryParameter = {
                searchQuery: [
                    {
                        queryName: 'Value',
                        queryValue: query,
                    },
                ],
            };

            const response = await GeneralService.search(queryParameter);
            if (response.data.searchValues) {
                this.hydrateResults(response);
            }
            this.isLoading = false;
        },

        hydrateResults(response) {
            this.searchValues = [];
            var searchValues = response.data.searchValues.map((value) => {
                var searchValue = {
                    id: value._id,
                    value: '',
                    valueType: '',
                    raw: value,
                };
                if (value.GamesPlayed) {
                    (searchValue.value = value.Name), (searchValue.valueType = 'Player');
                    searchValue.slug = value.Slug || null;
                } else if (value.Game && value.Game.length > 0) {
                    (searchValue.value = `${value.Name} ${
                        value.Game ? `- ${value.Game[0].Abbreviation}` : ''
                    }`),
                        (searchValue.valueType = 'Character');
                } else if (value.YoutubeUrl) {
                    (searchValue.value = value.Name), (searchValue.valueType = 'ContentCreator');
                } else if (value.Title) {
                    (searchValue.value = value.Title), (searchValue.valueType = 'Game');
                } else {
                    (searchValue.value = value.Name), (searchValue.valueType = 'Player');
                    searchValue.slug = value.Slug || null;
                }

                return searchValue;
            });

            this.searchValues = [
                {
                    category: 'Game',
                    values: searchValues.filter((value) => value.valueType === 'Game'),
                },
                {
                    category: 'Character',
                    values: searchValues.filter((value) => value.valueType === 'Character'),
                },
                {
                    category: 'Player',
                    values: searchValues.filter((value) => value.valueType === 'Player'),
                },
                {
                    category: 'Content Creator',
                    values: searchValues.filter((value) => value.valueType === 'ContentCreator'),
                },
            ];
        },
    },
};
</script>

<style type="text/css">
.general-search {
    max-width: min(470px, 100%);
    min-width: 0;
    width: 100%;
    color: #fff;
    text-align: center;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    position: relative;
    box-sizing: border-box;
}

.general-search .multiselect {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    margin-bottom: 10px;
}

.general-search .multiselect__tags {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    background: #ffffff10;
    border: #3eb489 1px solid;
    border-radius: 15px;
    padding: 8px 40px 8px 16px;
}

.general-search .multiselect__tags-wrap,
.general-search .multiselect__spinner {
    flex: 0 0 auto;
}

/* When open, the search field should grow; when closed, input is width:0 and absolute */
.general-search .multiselect--active .multiselect__input {
    flex: 1 1 auto;
    min-width: 0;
}

/* Native text field: ellipsis for long query + placeholder (when open) */
.general-search .multiselect__input {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Closed field / selected: flex ellipsis (basis 0 so clipping + … show reliably) */
.general-search .multiselect__placeholder,
.general-search .multiselect__single {
    flex: 1 1 0%;
    min-width: 0;
    max-width: 100%;
    margin-bottom: 0;
    padding-top: 0;
    color: #fff;
    display: block;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    word-break: normal;
    overflow-wrap: normal;
}

.general-search .multiselect__select:before {
    border-color: #3eb489 transparent transparent;
}

#app.mobile.small-mobile .general-search {
    max-width: 100%;
}

.general-search .search-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: #444;
    padding: 10px 10px;
    max-width: 570px;
    border-radius: 15px;
}

.general-search .search-container .multiselect {
    margin: 0 auto;
    width: 100%;
}

.general-search .search-container fieldset,
.general-search .multiselect__input,
.general-search .multiselect__single,
.general-search .multiselect__option {
    background: transparent;
    color: #fff;
}

.general-search .multiselect__option,
.general-search .multiselect__content {
    background: #2b2e36;
}

.general-search .multiselect__option--highlight {
    background: #3eb489;
}

.general-search .search-category,
.general-search .search-input {
    background: #444;
    color: #000;
    padding: 7px;
    border-radius: 8px;
    width: 200px;
    margin: 0 10px;
}

.general-search .multiselect__option {
    color: #fff;
}

.general-search .multiselect__option--disabled {
    background: #3eb489 !important;
    color: #fff !important;
}

.general-search .multiselect__content-wrapper {
    border: none;
}

.general-search .search-btn {
    margin-left: 10px;
}

.general-search .account-btns .v-btn {
    color: #000;
    margin: 0 10px;
    height: 33px;
}

.general-search .account-btns {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.general-search .multiselect__option::after {
    display: none;
}

.general-search .v-navigation-drawer__content {
    overflow: hidden;
}
</style>
