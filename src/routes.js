
import Videos from './views/videos.vue';
import Player from './views/player.vue';
import Character from './views/character.vue';
import Combos from './views/combos.vue';
import Combo from './views/combo.vue';
import Match from './views/match.vue';
import Matches from './views/matches.vue';
import Games from './views/games.vue';
import Game from './views/game.vue';
import Home from './views/home.vue';

import ChannelScrapper from './views/channel-scrapper.vue';
import FavoriteMatches from './views/favorites.vue';
import FavoriteCombos from './views/favorite-combos.vue';
import Montages from './views/montages.vue';
import MatchUps from './views/matchups.vue';
import Test from './views/test.vue';
import Explore from './views/explore.vue';
import Favorites from './views/favorites.vue';
import Collections from './views/collections.vue';
import Collection from './views/collection.vue';
import Note from './views/notes.vue';
import YoutubeGenerator from './views/youtube-generator.vue';
import Tournament from './views/tournament.vue';
import PlayerList from './views/player-list.vue';
import PlayerMerge from './views/merge-players-view.vue'

import MatchReview from './views/match-review.vue'

const routes = [
    {
    path: '/', 
    name: 'Videos', 
    component: Videos,    
        meta: {
        title: 'Fighters Edge',
            metaTags: [
                {
                name: 'Fighters-Edge',
                content: 'Fighters-edge.com is a tool to query through all your favorite players, games, characters, matchups, etc, check it out today!'
                }
            ]
        }
    },
    {path: '/* ', name: 'Videos', component: Videos},
    {path: '/  200', name: 'Videos', component: Videos},
    {path: '/collections', name: 'Collections', component: Collections},
    {path: '/combos', name: 'Combos', component: Combos},
    {path: '/combo/:id', name: 'Combo', component: Combo},
    {path: '/combos/game/:gameId', name: 'Game Combos', component: Combos},
    {path: '/matches', name: 'Matches', component: Matches},
    {path: '/matches/game/:gameId', name: 'Game Matches', component: Matches},
    {path: '/matches/character/:characterId', name: 'Character Matches', component: Matches},
    {path: '/match/:id', name: 'Match', component: Match},
    {path: '/games', name: 'Games', component: Games},
    {path: '/game/:id', name: 'Game', component: Game},
    {path: '/home', name: 'Home', component: Home},
    {path: '/montages/', name: 'Montages', component: Montages},
    {path: '/matchups/:id/:id2', name: 'MatchUp', component: MatchUps},
    {path: '/mu/:slug1/:slug2', name: 'Slug MatchUp', component: MatchUps},
    {path: '/players/', name: 'Players', component: Player},
    {path: '/player/:id', name: 'Player', component: Player},
    {path: '/p/:slug', name: 'PlayerSlug', component: Player},
    {path: '/character/:id', name: 'Character', component: Character},
    {path: '/c/:slug', name: 'CharacterSlug', component: Character},
    {path: '/character/:id/combos', name: 'Character Combo', component: Character},
    {path: '/collection/:id', name: 'Collection', component: Collection},
    {path: '/channel-scrapper', name: 'ChannelScrapper', component: ChannelScrapper},
    {path: '/favorite-matches', name: 'Favorites Matches', component: FavoriteMatches},
    {path: '/favorite-combos', name: 'Favorites Combos', component: FavoriteCombos},
    {path: '/test', name: 'test', component: Test},
    {path: '/explore', name: 'explore', component: Explore},
    {path: '/favorites', name: 'favorites', component: Favorites},
    {path: '/notes', name: 'notes', component: Note},
    {path: '/youtube-generator', name: 'Youtube Generator', component: YoutubeGenerator},
    {path: '/tournament-bulk', name: 'Tournament Bulk', component: Tournament},
    {path: '/player-list', name: 'PlayerList', component: PlayerList},
    {path: '/merge-players', name: 'MergePlayers', component: PlayerMerge},
    {path: '/match/:id/review', name: 'MatchReview', component: MatchReview},
] 

export default routes;   