
import Videos from './views/videos.vue';
import Player from './views/player.vue';
import Character from './views/character.vue';
import Combos from './views/combos.vue';
import Combo from './views/combo.vue';
import Match from './views/match.vue';
import Matches from './views/matches.vue';
import Games from './views/games.vue';
import Game from './views/game.vue';

import ChannelScrapper from './views/channel-scrapper.vue';
import FavoriteMatches from './views/favorites.vue';
import FavoriteCombos from './views/favorite-combos.vue';
import Montages from './views/montages.vue';
import MatchUps from './views/matchups.vue';
import Test from './views/test.vue';
import Counter from './views/counter.vue';
import Explore from './views/explore.vue';
import Favorites from './views/favorites.vue';
import Collections from './views/collections.vue';
import Collection from './views/collection.vue';

const routes = [
    {path: '/', name: 'Videos', component: Videos},
    {path: '/* ', name: 'Videos', component: Videos},
    {path: '/  200', name: 'Videos', component: Videos},
    {path: '/collections', name: 'Collections', component: Collections},
    {path: '/combos', name: 'Combos', component: Combos},
    {path: '/combo/:id', name: 'Combo', component: Combo},
    {path: '/combos/game/:gameId', name: 'Combos', component: Combos},
    {path: '/combos/character/:characterId', name: 'Combos', component: Combos},
    {path: '/matches', name: 'Matches', component: Matches},
    {path: '/matches/game/:gameId', name: 'Matches', component: Matches},
    {path: '/matches/character/:characterId', name: 'Matches', component: Matches},
    {path: '/match/:id', name: 'Match', component: Match},
    {path: '/games', name: 'Games', component: Games},
    {path: '/game/:id', name: 'Game', component: Game},
    {path: '/montages/', name: 'Montages', component: Montages},
    {path: '/matchups', name: 'MatchUps', component: MatchUps},
    {path: '/matchups/:id/:id2', name: 'MatchUps', component: MatchUps},
    {path: '/players/', name: 'Players', component: Player},
    {path: '/player/:id', name: 'Player', component: Player},
    {path: '/character/:id', name: 'Character', component: Character},
    {path: '/collection/:id', name: 'Collection', component: Collection},
    {path: '/channel-scrapper', name: 'ChannelScrapper', component: ChannelScrapper},
    {path: '/favorite-matches', name: 'Favorites Matches', component: FavoriteMatches},
    {path: '/favorite-combos', name: 'Favorites Combos', component: FavoriteCombos},
    {path: '/test', name: 'test', component: Test},
    {path: '/counter', name: 'counter', component: Counter},
    {path: '/explore', name: 'explore', component: Explore},
    {path: '/favorites', name: 'favorites', component: Favorites}
] 

export default routes;   