
import Videos from './views/videos.vue';
import Player from './views/player.vue';
import Character from './views/character.vue';
import Combos from './views/combos.vue';
import Combo from './views/combo.vue';
import Match from './views/match.vue';
import Matches from './views/matches.vue';
import Games from './views/games.vue';
import Game from './views/game.vue';
import WorkSpace from './views/workspace.vue';
import FavoriteMatches from './views/favorite-matches.vue';
import FavoriteCombos from './views/favorite-combos.vue';

const routes = [
    {path: '/', name: 'Videos', component: Videos},
    {path: '/* ', name: 'Videos', component: Videos},
    {path: '/  200', name: 'Videos', component: Videos},
    {path: '/combos', name: 'Combos', component: Combos},
    {path: '/combo/:id', name: 'Combo', component: Combo},
    {path: '/matches', name: 'Matches', component: Matches},
    {path: '/match/:id', name: 'Match', component: Match},
    {path: '/games', name: 'Games', component: Games},
    {path: '/game/:id', name: 'Game', component: Game},
    {path: '/player/:id', name: 'Player', component: Player},
    {path: '/character/:id', name: 'Character', component: Character},
    {path: '/workspace', name: 'WorkSpace', component: WorkSpace},
    {path: '/favorite-matches', name: 'Favorites Matches', component: FavoriteMatches},
    {path: '/favorite-combos', name: 'Favorites Combos', component: FavoriteCombos},
] 

export default routes;   