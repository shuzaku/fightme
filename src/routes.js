import NewGame from './components/Games/NewGame.vue';
import EditGame from './components/Games/EditGame.vue';
import NewPlayer from './components/Players/NewPlayer.vue';
import EditPlayer from './components/Players/EditPlayer.vue';
import PostVideo from './components/Videos/PostVideo.vue';
import Videos from './components/Videos/Videos.vue';


const routes = [
    {path: '/games/new', name: 'NewGame', component: NewGame },
    {path: '/games/:id', name: 'EditGame', component: EditGame},
    {path: '/players/new', name: 'NewPlayer', component: NewPlayer },
    {path: '/players/:id', name: 'EditPlayer', component: EditPlayer},
    {path: '/upload', name: 'Upload', component: PostVideo},
    {path: '/', name: 'Videos', component: Videos}
] 

export default routes;   