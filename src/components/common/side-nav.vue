<!-- @format -->
<template>
    <div class="side-nav">
        <div class="logo">
            <h2><span>🥊</span> Fight.Me</h2>
        </div>
        <div class="menu-item">
            <router-link to="/">
                <div class="menu-heading"><font-awesome-icon icon="rss" />Feed</div>
            </router-link>
        </div>
        <div class="menu-item">
            <router-link to="/combos">
                <div class="menu-heading"><font-awesome-icon icon="gamepad" />Combos</div>
            </router-link>
        </div>
        <!-- <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="users" />Players</div>
    </div> -->
        <div class="menu-item">
            <router-link to="/matches">
                <div class="menu-heading"><font-awesome-icon icon="meteor" />Matches</div>
            </router-link>
        </div>
        <!-- <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="network-wired" />Tournaments</div>
    </div>
    <div class="menu-item">
      <div class="menu-heading"><font-awesome-icon icon="video" />Creators</div>
    </div> -->
        <!-- <div class="menu-item">
            <div class="menu-heading" @click="toggleDropDown()">
                <font-awesome-icon icon="plus-circle" />Add
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
</template>

<script>
import { eventbus } from '@/main';

export default {
    name: 'SideNav',
    data() {
        return {
            isDropDownOpen: false,
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
        openCreateWidget(createType) {
            eventbus.$emit('open:videoWidget', {
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
    padding: 80px 30px;
    position: fixed;
    -webkit-box-pack: justify;
    justify-content: space-between;
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
    display: flex;
    align-items: center;
    margin-bottom: 0px;
    color: #3eb489;
    text-transform: uppercase;
    font-size: 20px;
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
    margin-left: 40px;
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
</style>
