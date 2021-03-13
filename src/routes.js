import NewGame from './components/games/new-game.vue';
import EditGame from './components/games/edit-game.vue';
import NewPlayer from './components/players/new-player.vue';
import EditPlayer from './components/players/edit-player.vue';
import PostVideo from './components/videos/post-video.vue';
import Videos from './components/videos/videos.vue';
import Games from './components/games/games.vue';
import Creators from './components/content-creator/content-creator.vue';

const routes = [
    {path: '/games/new', name: 'NewGame', component: NewGame },
    {path: '/games/:id', name: 'EditGame', component: EditGame},
    {path: '/players/new', name: 'NewPlayer', component: NewPlayer },
    {path: '/players/:id', name: 'EditPlayer', component: EditPlayer},
    {path: '/upload', name: 'Upload', component: PostVideo},
    {path: '/', name: 'Videos', component: Videos},
    {path: '/games', name: 'games', component: Games},
    {path: '/content-creator', name: 'content-creator', component: Creators}
] 

export default routes;   