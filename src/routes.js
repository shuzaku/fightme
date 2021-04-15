
import Videos from './views/videos.vue';
import Players from './views/players.vue';
import Characters from './views/characters.vue';
import Combos from './views/combos.vue';
import Matches from './views/matches.vue';
import Games from './views/games.vue';

const routes = [
    {path: '/players/:id', name: 'Players', component: Players},
    {path: '/characters/:id', name: 'Characters', component: Characters},
    {path: '/', name: 'Videos', component: Videos},
    {path: '/combos', name: 'Combos', component: Combos},
    {path: '/matches', name: 'Matches', component: Matches},
    {path: '/games', name: 'Games', component: Games},
] 

export default routes;   