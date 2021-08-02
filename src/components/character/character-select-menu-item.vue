<!-- @format -->
<template>
    <div :class="[{ opened: isOpen }, 'character-select-menu-item']">
        <div class="menu-item" @click="open">
            Characters
            <v-icon>
                mdi-chevron-down
            </v-icon>
        </div>
        <div class="characters">
            <v-autocomplete
                v-model="selectedItem"
                :items="characters"
                :menu-props="{ closeOnClick: true, closeOnContentClick: true }"
                label="Characters"
                item-text="name"
                item-value="id"
                return-object
                outlined
                flat
                small-chips
                dense
                @change="selectCharacter($event)"
            >
            </v-autocomplete>
        </div>
    </div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    name: 'character-select',
    props: {
        initialOpen: {
            type: Boolean,
            default: false
        },
        gameId: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            characters: [],
            isOpen: false,
            selectedItem: null
        };
    },

    computed: {
        componentStyle() {
            return '[{opened: }]';
        }
    },

    watch: {
        gameId() {
            this.getCharacters();
        }
    },

    mounted() {
        this.getCharacters();
        this.isOpen = this.initialOpen;
    },

    methods: {
        async getCharacters() {
            const response = await CharactersService.queryCharacters([
                {
                    queryName: 'GameId',
                    queryValue: this.gameId
                }
            ]);

            this.characters = response.data.characters.map(character => {
                return {
                    id: character._id,
                    name: character.Name,
                    imageUrl: character.ImageUrl
                };
            });
        },

        selectCharacter(character) {
            this.characters.forEach(character => {
                character.selected = false;
            });
            character.selected = true;
            this.$emit('character-selected', character);
        },

        open() {
            this.isOpen = !this.isOpen;
        }
    }
};
</script>
<style type="text/css">
.character-select-menu-item .logo-img {
    width: 50px;
    height: auto;
    border-radius: 50%;
}

.character-select-menu-item li {
    list-style: none;
    font-weight: 400;
    cursor: pointer;
    padding: 10px 10px;
}

.character-select-menu-item li:hover,
.character-select-menu-item li.selected {
    background: #565656;
}

.character-select-menu-item li:last-child {
    margin-bottom: 0px;
}

.character-select-menu-item .players {
    background: #404040;
    padding: 20px 10px 0;
}

.character-select-menu-item .mdi-chevron-down {
    transform: rotate(0deg);
    transition: all 0.3s linear;
}

.character-select-menu-item.opened .mdi-chevron-down {
    transform: rotate(180deg);
    transition: all 0.3s linear;
}

.character-select-menu-item .v-label {
    padding: 0 10px;
}

.character-select-menu-item .v-label--active.v-label {
    background: #404040;
    padding: 3px 10px;
    z-index: 10;
    top: 5px !important;
    left: -5px !important;
}

.character-select-menu-item .v-input__slot {
    padding: 0px !important;
}

.character-select-menu-item .v-input__slot::after,
.character-select-menu-item .v-input__slot::before {
    display: none;
}

.character-select-menu-item .v-menu {
    display: initial;
}

.character-select-menu-item .v-menu__content {
    left: 76px !important;
    max-width: 230px !important;
}

.character-select-menu-item .v-select.v-text-field input {
    border: 0;
}

.character-select-menu-item .v-select__slot .v-select__selections {
    display: flex;
    align-items: flex-start;
}

.character-select-menu-item .v-select__selections {
    padding-top: 20px !important;
}

.character-select-menu-item .v-select__slot .v-select__slot {
    padding: 15px 0;
}

.character-select-menu-item .v-select__selections input {
    order: 1;
    min-width: 212px !important;
}

.character-select-menu-item .v-select__selections .v-select__selection {
    order: 2;
}

.character-select-menu-item .v-select__slot .v-select__selections .v-chip {
    margin-bottom: 10px;
}
</style>
