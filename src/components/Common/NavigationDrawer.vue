<template>
      <v-navigation-drawer
        v-model="drawer"
        :color="color"
        :expand-on-hover="expandOnHover"
        :mini-variant="miniVariant"
        :right="right"
        :permanent="permanent"
        absolute
        dark>
        <v-list
          dense
          nav
          class="py-0">
          <v-list-item two-line :class="miniVariant && 'px-0'">
            <v-list-item-avatar>
              <img src="https://randomuser.me/api/portraits/men/81.jpg">
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>Application</v-list-item-title>
              <v-list-item-subtitle>Subtext</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item
            v-for="item in items"
            :key="item.title"
            @click="item.action"
            link>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
</template>

<script>

export default {
  name: 'NavigationDrawer',
  data () {
    return {
        drawer: true,
        items: [
          { title: 'Feed', icon: 'mdi-video-box', action: () => {this.$router.push({ name: 'Videos' })} },
          { title: 'Games', icon: 'mdi-gamepad', action: () => {this.$router.push({ name: 'Games' })} },
          { title: 'Players', icon: 'mdi-account-box', action: () => {this.$router.push({ name: 'Players' })}},
          { title: 'Content Creator', icon: 'mdi-account-box', action: () => {this.$router.push({ name: 'Players' })}},
          { title: 'Tournament', icon: 'mdi-account-box', action: () => {this.$router.push({ name: 'Players' })}},
          { title: 'Region', icon: 'mdi-account-box', action: () => {this.$router.push({ name: 'Players' })}},
        ],
        color: 'primary',
        colors: [
          'primary',
          'blue',
          'success',
          'red',
          'teal',
        ],
        right: false,
        permanent: true,
        miniVariant: false,
        expandOnHover: false,
        background: false,
    }
  },
  methods: {
  }
}
</script>
<style type="text/css">
    #app .v-list-item__icon {
        margin-right: 5px;
    }

    #app .v-avatar {
        margin-right: 5px;
    }

    #app .v-navigation-drawer__content .v-list-item:first-child {
        padding: 0;
    }
</style>
