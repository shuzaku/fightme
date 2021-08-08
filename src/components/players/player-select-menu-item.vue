<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'player-select-menu-item']">
        <div class="menu-item" @click="open">
            Players
            <v-icon>
                mdi-chevron-down
            </v-icon>
        </div>

        <div v-if="isOpen" class="players">
            <v-autocomplete
                v-model="selectedItem"
                :items="players"
                :menu-props="{ closeOnContentClick: true }"
                label="Players"
                item-text="name"
                item-value="id"
                return-object
                outlined
                flat
                small-chips
                dense
                @change="selectPlayers($event)"
            >
            </v-autocomplete>
        </div>
    </div>
</template>

<script>
import PlayersService from '@/services/players-service';

export default {
    name: 'player-select',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            players: [],
            isOpen: false,
            selectedItem: null,
            isLoading: false
        };
    },

    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    mounted() {
        this.getPlayers();
        this.isOpen = this.initialOpen;
    },

    methods: {
        async getPlayers() {
            this.isLoading = true;
            const response = await PlayersService.fetchPlayers();
            this.players = response.data.players.map(player => {
                return {
                    id: player._id,
                    name: player.Name,
                    selected: false
                };
            });
            this.isLoading = false;
        },

        selectPlayers(item) {
            this.players.forEach(player => {
                player.selected = false;
            });

            item.selected = true;

            this.$emit('player-selected', item);
        },

        open() {
            this.isOpen = !this.isOpen;
        }
    }
};
</script>
<style type="text/css">
.player-select-menu-item .logo-img {
    width: 50px;
    height: auto;
    border-radius: 50%;
}

.player-select-menu-item li {
    list-style: none;
    font-weight: 400;
    cursor: pointer;
    padding: 10px 10px;
}

.player-select-menu-item li:hover,
.player-select-menu-item li.selected {
    background: #565656;
}

.player-select-menu-item li:last-child {
    margin-bottom: 0px;
}

.player-select-menu-item .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.player-select-menu-item.opened .mdi-chevron-down {
    transform: rotate(180deg);
    transition: all 0.3s linear;
}

.player-select-menu-item .v-label {
    padding: 0 10px;
}

.player-select-menu-item .v-label--active.v-label {
    background: #404040;
    padding: 3px 10px;
    z-index: 10;
    top: 5px !important;
    left: -5px !important;
}

.player-select-menu-item .v-input__slot {
    padding: 0px !important;
}

.player-select-menu-item .v-input__slot::after,
.player-select-menu-item .v-input__slot::before {
    display: none;
}

.player-select-menu-item .v-menu {
    display: initial;
}

.player-select-menu-item .v-menu__content {
    left: 76px !important;
    max-width: 230px !important;
}

.player-select-menu-item .v-select.v-text-field input {
    border: 0;
}

.player-select-menu-item .v-select__slot .v-select__selections {
    display: flex;
    align-items: flex-start;
}

.player-select-menu-item .v-select__selections {
    padding-top: 20px !important;
}

.player-select-menu-item .v-select__selections input {
    padding-left: 10px !important;
}

.player-select-menu-item .v-select__slot .v-select__slot {
    padding: 15px 0;
}

.player-select-menu-item .v-select__selections input {
    order: 1;
    min-width: 212px !important;
}

.player-select-menu-item .v-select__selections .v-select__selection {
    order: 2;
}

.player-select-menu-item .v-select__slot .v-select__selections .v-chip {
    margin-bottom: 10px;
}
</style>
