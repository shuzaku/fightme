<!-- @format -->
<template>
    <div class="side-nav">
        <div class="top-section">
            <div class="logo">
                <router-link to="/">
                    <img
                        src="https://res.cloudinary.com/shuzchef/image/upload/v1622816435/bb5h6tgdysfys9qi1du5.png"
                        class="logo-img"
                    />
                    <h2>
                        <span class="title"
                            >Fighters<br />
                            Edge</span
                        >
                    </h2>
                </router-link>
            </div>
            <div class="menu-item">
                <router-link to="/">
                    <div class="menu-heading">
                        <font-awesome-icon icon="rss" /><span>Feed</span>
                    </div>
                </router-link>
            </div>
            <div class="menu-item">
                <router-link to="/combos">
                    <div class="menu-heading">
                        <font-awesome-icon icon="hand-rock" /><span>Combos</span>
                    </div>
                </router-link>
            </div>
            <!-- <div class="menu-item">
                <div class="menu-heading"><font-awesome-icon icon="users" /><span>Players</span></div>
            </div> -->
            <div class="menu-item">
                <router-link to="/matches">
                    <div class="menu-heading">
                        <font-awesome-icon icon="meteor" /><span>Matches</span>
                    </div>
                </router-link>
            </div>
            <div class="menu-item">
                <router-link to="/games">
                    <div class="menu-heading">
                        <font-awesome-icon icon="gamepad" /><span>Games</span>
                    </div>
                </router-link>
            </div>
            <div v-if="account" class="menu-item">
                <div class="menu-heading" @click="toggleFavorites()">
                    <font-awesome-icon icon="heart" /><span>Favorites</span>
                </div>
                <div v-if="showFavorites" class="sub-menu">
                    <router-link to="/favorite-matches">
                        <div class="menu-heading">
                            <span>Matches</span>
                        </div>
                    </router-link>
                    <router-link to="/favorite-combos">
                        <div class="menu-heading">
                            <span>Combos</span>
                        </div>
                    </router-link>
                </div>
            </div>
            <!-- <div class="menu-item">
                <div class="menu-heading" @click="toggleDropDown()">
                    <font-awesome-icon icon="plus-circle" /><span>Add</span>
                </div>
            </div> -->
            <div v-if="isDropDownOpen" class="add-content-dropdown">
                <ul>
                    <li
                        v-for="create in createOptions"
                        :key="create.value"
                        @click="openCreateWidget(create.value)"
                    >
                        {{ create.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="bottom-section">
            <div class="menu-item">
                <a class="menu-heading" href="https://discord.gg/n373TGP727" target="_blank">
                    <font-awesome-icon :icon="['fab', 'discord']" /> <span>Discord</span>
                </a>
            </div>
            <user />
        </div>
        <!-- <recommendation /> -->
    </div>
</template>

<script>
import { eventbus } from '@/main';
import user from '@/components/account/user';

// import recommendation from '@/components/common/recommendation';

export default {
    name: 'SideNav',

    components: {
        // recommendation: recommendation
        user: user
    },

    props: {
        characterId: {
            type: String,
            default: null
        },
        playerId: {
            type: String,
            default: null
        },
        gameId: {
            type: String,
            default: null
        },
        value: {
            type: Boolean,
            default: false
        },
        account: {
            type: Object,
            default: null
        }
    },

    data() {
        return {
            isDropDownOpen: false,
            showFavorites: false,
            createOptions: [
                {
                    name: 'Video',
                    value: 'video'
                },
                {
                    name: 'Game',
                    value: 'game'
                },
                {
                    name: 'Player',
                    value: 'player'
                },
                {
                    name: 'Creator',
                    value: 'creator'
                },
                {
                    name: 'Character',
                    value: 'character'
                },
                {
                    name: 'Tournament',
                    value: 'tournament'
                }
            ]
        };
    },

    methods: {
        toggleFavorites() {
            this.showFavorites = !this.showFavorites;
        },
        openCreateWidget(createType) {
            eventbus.$emit('open:widget', {
                name: createType
            });
            this.toggleDropDown();
        },

        toggleDropDown() {
            this.isDropDownOpen = !this.isDropDownOpen;
        }
    }
};
</script>

<style type="text/css">
.side-nav {
    width: 400px;
    padding: 40px 30px;
    position: fixed;
    justify-content: space-between;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.side-nav h2 {
    font-size: 30px;
    color: #3eb489;
    margin-bottom: 20px;
}

.side-nav .menu-item .menu-heading {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3eb489;
    margin-bottom: 20px;
    line-height: 1.2em;
    font-weight: 300;
    text-decoration: none;
    display: flex;
    align-items: center;
}

.side-nav .menu-item .menu-heading:hover {
    color: #fff;
    opacity: 0.7;
    cursor: pointer;
}

.side-nav .sub-menu-item {
    padding-left: 20px;
    margin-top: 20px;
}

.side-nav .menu-heading svg {
    margin-right: 15px;
    width: 25px;
}

.side-nav .logo {
    margin-bottom: 0px;
    color: #3eb489;
    text-transform: uppercase;
    font-size: 20px;
}

.side-nav .logo a {
    text-decoration: none;
}

.side-nav .logo svg {
    font-size: 40px;
    margin-bottom: 50px;
    font-weight: 300;
    margin: 0;
    margin-right: 10px;
}
.side-nav .logo svg path {
    fill: #3eb489;
}

.side-nav .add-content-dropdown li {
    list-style: none;
    margin-bottom: 15px;
    cursor: pointer;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 300;
    margin-left: 40px;
}

.side-nav .add-content-dropdown li:hover {
    opacity: 0.7;
}

.side-nav .menu-item {
    margin-left: 20px;
}

.side-nav .menu-item a {
    text-decoration: none;
}

.side-nav h2 {
    font-weight: 400;
    color: #fff;
    letter-spacing: 3px;
    display: flex;
    align-items: center;
}

.side-nav h2 span {
    position: relative;
    top: -3px;
    margin-right: 5px;
}

.side-nav .logo-img {
    max-width: 120px;
    position: relative;
    left: -40px;
}

.side-nav .sub-menu .menu-heading {
    font-size: 12px;
    margin-left: 40px;
}
</style>
