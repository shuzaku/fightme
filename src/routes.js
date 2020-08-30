import HelloWorld from './components/HelloWorld.vue';
import Games from './components/Games/Games.vue';
import NewGame from './components/Games/NewGame.vue';
import EditGame from './components/Games/EditGame.vue';
import Players from './components/Players/Players.vue';
import NewPlayer from './components/Players/NewPlayer.vue';
import EditPlayer from './components/Players/EditPlayer.vue';
import PostVideo from './components/Videos/PostVideo.vue';
import Videos from './components/Videos/Videos.vue';


const routes = [
    {path: '/', name: 'Hello', component: HelloWorld },
    {path: '/games/', name: 'Games', component: Games },
    {path: '/games/new', name: 'NewGame', component: NewGame },
    {path: '/games/:id', name: 'EditGame', component: EditGame},
    {path: '/players/', name: 'Players', component: Players },
    {path: '/players/new', name: 'NewPlayer', component: NewPlayer },
    {path: '/players/:id', name: 'EditPlayer', component: EditPlayer},
    {path: '/upload', name: 'Upload', component: PostVideo},
    {path: '/videos', name: 'Videos', component: Videos}
] 

export default routes;   