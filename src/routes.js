
import Videos from './views/videos.vue';
import Players from './views/players.vue';
import Characters from './views/characters.vue';
import Combos from './views/combos.vue';
import Combo from './views/combo.vue';
import Match from './views/match.vue';
import Matches from './views/matches.vue';
import Games from './views/games.vue';
import Game from './views/game.vue';
import WorkSpace from './views/workspace.vue';

const routes = [
    {path: '/', name: 'Videos', component: Videos},
    {path: '/* ', name: 'Videos', component: Videos},
    {path: '/  200', name: 'Videos', component: Videos},
    {path: '/combos', name: 'Combos', component: Combos},
    {path: '/matches', name: 'Matches', component: Matches},
    {path: '/games', name: 'Games', component: Games},
    {path: '/players/:id', name: 'Players', component: Players},
    {path: '/characters/:id', name: 'Characters', component: Characters},
    {path: '/combo/:id', name: 'Combo', component: Combo},
    {path: '/match/:id', name: 'Match', component: Match},
    {path: '/workspace', name: 'WorkSpace', component: WorkSpace},
    {path: '/game/:id', name: 'Game', component: Game},
] 

export default routes;   