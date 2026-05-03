
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
import TournamentMatch from './views/tournament-match.vue';
import TournamentMatchesImport from './views/tournament-matches-import.vue';
import CreateTournament from './views/create-tournament.vue';
import PlayerList from './views/player-list.vue';
import PlayerMerge from './views/merge-players-view.vue';
import LinkUserToPlayer from './views/link-user-to-player-view.vue';

import DeviceAuth from './views/device-auth.vue';
import MatchReview from './views/match-review.vue';
import AdminVideoApproval from './views/admin-video-approval.vue';
import AdminPlayerLinkApproval from './views/admin-player-link-approval.vue';
import TierListMaker from './views/tier-list-maker.vue';
import TierListGallery from './views/tier-list-gallery.vue';
import TierListDetails from './views/tier-list-details.vue';
import ComboGenerator from './views/combo-generator.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
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
    { path: '/* ', name: 'Home', component: Home },
    { path: '/  200', name: 'Videos', component: Videos },
    { path: '/collections', name: 'Collections', component: Collections },
    { path: '/combos', name: 'Combos', component: Combos },
    { path: '/combo/:id', name: 'Combo', component: Combo },
    { path: '/combos/game/:gameId', name: 'Game Combos', component: Combos },
    { path: '/combos/character/:characterId', name: 'Character Combos', component: Combos },
    { path: '/combo-generator', name: 'Combo Generator', component: ComboGenerator },
    { path: '/combo-generator/character/:characterId', name: 'Character Combo Generator', component: ComboGenerator },
    { path: '/matches', name: 'Matches', component: Matches },
    { path: '/matches/game/:gameId', name: 'Game Matches', component: Matches },
    { path: '/matches/character/:characterId', name: 'Character Matches', component: Matches },
    { path: '/match/:id', name: 'Match', component: Match },
    { path: '/tournament-match/:id', name: 'TournamentMatch', component: TournamentMatch },
    {
        path: '/tournament-matches-import',
        name: 'TournamentMatchesImport',
        component: TournamentMatchesImport,
    },
    { path: '/create-tournament', name: 'CreateTournament', component: CreateTournament },
    { path: '/games', name: 'Games', component: Games },
    { path: '/game/:id', name: 'Game', component: Game },
    { path: '/home', name: 'Home', component: Home },
    { path: '/montages/', name: 'Montages', component: Montages },
    { path: '/matchups/:id/:id2', name: 'MatchUp', component: MatchUps },
    { path: '/mu/:slug1/:slug2', name: 'Slug MatchUp', component: MatchUps },
    { path: '/players/', name: 'Players', component: Player },
    { path: '/player/:id', name: 'Player', component: Player },
    { path: '/p/:slug', name: 'PlayerSlug', component: Player },
    { path: '/character/:id', name: 'Character', component: Character },
    { path: '/c/:slug', name: 'CharacterSlug', component: Character },
    { path: '/character/:id/combos', name: 'Character Combo', component: Character },
    { path: '/collection/:id', name: 'Collection', component: Collection },
    { path: '/channel-scrapper', name: 'ChannelScrapper', component: ChannelScrapper },
    { path: '/favorite-matches', name: 'Favorites Matches', component: FavoriteMatches },
    { path: '/favorite-combos', name: 'Favorites Combos', component: FavoriteCombos },
    { path: '/test', name: 'test', component: Test },
    { path: '/explore', name: 'explore', component: Home },
    { path: '/favorites', name: 'favorites', component: Favorites },
    { path: '/notes', name: 'notes', component: Note },
    { path: '/youtube-generator', name: 'Youtube Generator', component: YoutubeGenerator },
    { path: '/tournament-bulk', name: 'Tournament Bulk', component: Tournament },
    { path: '/player-list', name: 'PlayerList', component: PlayerList },
    { path: '/merge-players', name: 'MergePlayers', component: PlayerMerge },
    { path: '/link-user-to-player', name: 'LinkUserToPlayer', component: LinkUserToPlayer },
    { path: '/device-auth', name: 'DeviceAuth', component: DeviceAuth },
    { path: '/match/:id/review', name: 'MatchReview', component: MatchReview },
    { path: '/tournament/:id', name: 'Tournament', component: Tournament },
    { path: '/admin/video-approval', name: 'AdminVideoApproval', component: AdminVideoApproval },
    {
        path: '/admin/player-link-requests',
        name: 'AdminPlayerLinkApproval',
        component: AdminPlayerLinkApproval,
    },
    { path: '/tier-list-maker', name: 'TierListMaker', component: TierListMaker },
    { path: '/tier-lists', name: 'TierListGallery', component: TierListGallery },
    { path: '/tier-lists/:id', name: 'TierListDetails', component: TierListDetails },
]

export default routes;