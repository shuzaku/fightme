<!-- @format -->
<template>
    <div class="creators-search">
        <multiselect
            v-model="selectedCreator"
            :options="creators"
            :multiple="false"
            :close-on-select="true"
            :clear-on-select="false"
            :preserve-search="true"
            :taggable="true"
            placeholder="Search or add a Creator"
            label="name"
            @tag="addCreator($event)"
            @input="setCreator()"
        >
            <template slot="selection" slot-scope="{ values, isOpen }">
                <span v-if="values.length &amp;&amp; !isOpen" class="multiselect__single">
                    Select Creator
                </span>
            </template>
        </multiselect>
    </div>
</template>

<script>
import CreatorsService from '@/services/creators-service';

export default {
    name: 'CreatorsSearch',
    props: {
        creator: {
            type: Number,
            default: null
        },
        value: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            creators: [],
            selectedCreator: null
        };
    },

    mounted() {
        this.getCreators();
    },

    methods: {
        async addCreator(newCreator) {
            await CreatorsService.addCreator({
                Name: newCreator,
                Logo: null,
                youtubeChannel: null
            });
            this.getCreators(newCreator);
        },

        async getCreators(newCreator) {
            const response = await CreatorsService.fetchCreators();
            this.creators = response.data.creators.map(creator => {
                return {
                    id: creator._id,
                    name: creator.Name,
                    logo: creator.Logo,
                    youtubeChannel: creator.YoutubeChannel
                };
            });

            if (newCreator) {
                this.selectedCreator = this.creators.filter(
                    creator => creator.name === newCreator.trim()
                )[0];
                this.setCreator();
            }

            if (this.value) {
                this.selectedCreator = this.creators.filter(creator => creator.id === this.value);
            }
        },

        setCreator() {
            this.$emit('update:creator', this.selectedCreator);
        }
    }
};
</script>
