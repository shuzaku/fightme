<!-- @format -->
<template>
    <div class="more-info-panel"></div>
</template>

<script>
import CharactersService from '@/services/characters-service';

export default {
    components: {},

    props: {
        account: {
            type: Object,
            default: null,
        },
    },

    computed: {
        routeName: function () {
            return this.$route.name;
        },
    },

    data() {
        return {
            isLoading: false,
            character: {
                id: null,
                name: null,
                imageUrl: null,
            },
        };
    },

    created() {
        this.getData();
    },

    methods: {
        getData() {
            this.isLoading = true;
            switch (this.routeName) {
                case 'Character':
                    this.character.id = this.$route.params.id;
                    this.getCharacter(this.character.id);
            }
            this.isLoading = false;
        },

        async getCharacter(id) {
            const response = await CharactersService.getCharacter({
                id: id,
            });
            this.character.name = response.data.Name;
            this.character.imageUrl = response.data.AvatarUrl;
        },
    },
};
</script>

<style>
.more-info-panel {
    margin-left: 50px;
    padding-top: 50px;
}

.more-info-panel .info-card {
    width: 200px;
    height: 120px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border: 2px solid #4447e2;
    color: #4447e2;
    background: #242832;
}

.more-info-panel .quick-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
}
</style>
