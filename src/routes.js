
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
import HowItWorks from './views/how-it-works.vue';
import UseCases from './views/use-cases.vue';
import Landing from './views/landing.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            title: 'Fighters Edge — Find any matchup, instantly',
            metaTags: [
                {
                    name: 'Fighters-Edge',
                    content: 'Fighters-edge.com is the search engine for fighting game footage. Find any matchup, any player, any tournament — free, forever.'
                }
            ]
        }
    },
    { path: '/home-classic', name: 'HomeClassic', component: Home },
    { path: '/landing', name: 'Landing', component: Landing },
    {
        path: '/collections',
        name: 'Collections',
        component: Collections,
        meta: {
            title: 'My Collections | Fighters Edge',
            description: 'Your saved match and combo collections. Organize footage by matchup, character, or any concept you\'re studying.',
        },
    },
    {
        path: '/combos',
        name: 'Combos',
        component: Combos,
        meta: {
            title: 'Combo Clips | Fighters Edge',
            description: 'Watch and study combo footage for every character across Street Fighter 6, Tekken 8, 2XKO, GGST, and more.',
        },
    },
    { path: '/combo/:id', name: 'Combo', component: Combo },
    { path: '/combos/game/:gameId', name: 'Game Combos', component: Combos },
    { path: '/combos/character/:characterId', name: 'Character Combos', component: Combos },
    {
        path: '/combo-generator',
        name: 'Combo Generator',
        component: ComboGenerator,
        meta: {
            title: 'Combo Generator | Fighters Edge',
            description: 'Generate and explore combo routes for your character. Find optimal damage and corner carry combos.',
        },
    },
    { path: '/combo-generator/character/:characterId', name: 'Character Combo Generator', component: ComboGenerator },
    {
        path: '/matches',
        name: 'Matches',
        component: Matches,
        meta: {
            title: 'Match Footage | Fighters Edge',
            description: 'Browse thousands of indexed pro and tournament matches across Street Fighter 6, Tekken 8, 2XKO, GGST, and more.',
        },
    },
    { path: '/matches/game/:gameId', name: 'Game Matches', component: Matches },
    { path: '/matches/character/:characterId', name: 'Character Matches', component: Matches },
    { path: '/match/:id', name: 'Match', component: Match },
    { path: '/tournament-match/:id', name: 'TournamentMatch', component: TournamentMatch },
    { path: '/tournament-matches-import', name: 'TournamentMatchesImport', component: TournamentMatchesImport },
    { path: '/create-tournament', name: 'CreateTournament', component: CreateTournament },
    {
        path: '/games',
        name: 'Games',
        component: Games,
        meta: {
            title: 'Games | Fighters Edge',
            description: 'Every major fighting game with indexed matches, characters, combos, and tournament data.',
        },
    },
    { path: '/game/:id', name: 'Game', component: Game },
    { path: '/home', name: 'HomeLegacy', component: Home },
    {
        path: '/montages/',
        name: 'Montages',
        component: Montages,
        meta: {
            title: 'Montages | Fighters Edge',
            description: 'Watch the best FGC montages and highlight reels from top players.',
        },
    },
    { path: '/matchups/:id/:id2', name: 'MatchUp', component: MatchUps },
    { path: '/mu/:slug1/:slug2', name: 'Slug MatchUp', component: MatchUps },
    {
        path: '/players/',
        name: 'Players',
        component: Player,
        meta: {
            title: 'Players | Fighters Edge',
            description: 'Browse pro and tournament players tracked on Fighters Edge. Follow players to get notified when new sets drop.',
        },
    },
    { path: '/player/:id', name: 'Player', component: Player },
    { path: '/p/:slug', name: 'PlayerSlug', component: Player },
    { path: '/character/:id', name: 'Character', component: Character },
    { path: '/c/:slug', name: 'CharacterSlug', component: Character },
    { path: '/character/:id/combos', name: 'Character Combo', component: Character },
    { path: '/collection/:id', name: 'Collection', component: Collection },
    { path: '/channel-scrapper', name: 'ChannelScrapper', component: ChannelScrapper },
    {
        path: '/favorite-matches',
        name: 'Favorites Matches',
        component: FavoriteMatches,
        meta: {
            title: 'Favorite Matches | Fighters Edge',
            description: 'Your saved favorite matches, all in one place.',
        },
    },
    {
        path: '/favorite-combos',
        name: 'Favorites Combos',
        component: FavoriteCombos,
        meta: {
            title: 'Favorite Combos | Fighters Edge',
            description: 'Your saved favorite combo clips, all in one place.',
        },
    },
    { path: '/test', name: 'test', component: Test },
    { path: '/explore', name: 'explore', component: Home },
    {
        path: '/favorites',
        name: 'favorites',
        component: Favorites,
        meta: {
            title: 'Favorites | Fighters Edge',
            description: 'Your saved matches and combos.',
        },
    },
    {
        path: '/notes',
        name: 'notes',
        component: Note,
        meta: {
            title: 'Notes | Fighters Edge',
            description: 'Your match study notes and annotations.',
        },
    },
    { path: '/youtube-generator', name: 'Youtube Generator', component: YoutubeGenerator },
    { path: '/tournament-bulk', name: 'Tournament Bulk', component: Tournament },
    { path: '/player-list', name: 'PlayerList', component: PlayerList },
    { path: '/merge-players', name: 'MergePlayers', component: PlayerMerge },
    { path: '/link-user-to-player', name: 'LinkUserToPlayer', component: LinkUserToPlayer },
    { path: '/device-auth', name: 'DeviceAuth', component: DeviceAuth },
    { path: '/match/:id/review', name: 'MatchReview', component: MatchReview },
    { path: '/tournament/:id', name: 'Tournament', component: Tournament },
    { path: '/admin/video-approval', name: 'AdminVideoApproval', component: AdminVideoApproval },
    { path: '/admin/player-link-requests', name: 'AdminPlayerLinkApproval', component: AdminPlayerLinkApproval },
    {
        path: '/tier-list-maker',
        name: 'TierListMaker',
        component: TierListMaker,
        meta: {
            title: 'Tier List Maker | Fighters Edge',
            description: 'Build and share tier lists for any fighting game. Drag and drop characters into tiers.',
        },
    },
    {
        path: '/tier-lists',
        name: 'TierListGallery',
        component: TierListGallery,
        meta: {
            title: 'Tier Lists | Fighters Edge',
            description: 'Community-built tier lists for every major fighting game. See how the FGC ranks every character.',
        },
    },
    { path: '/tier-lists/:id', name: 'TierListDetails', component: TierListDetails },
    {
        path: '/how-it-works',
        name: 'HowItWorks',
        component: HowItWorks,
        meta: {
            title: 'How It Works | Fighters Edge',
            description: 'Learn how Fighters Edge helps you find match footage, study matchups, scout opponents, and level up your game.',
        },
    },
    {
        path: '/use-cases',
        name: 'UseCases',
        component: UseCases,
        meta: {
            title: 'Use Cases | Fighters Edge',
            description: 'See how players, coaches, and content creators use Fighters Edge for tournament prep, matchup study, and content sourcing.',
        },
    },
    // Catch-all — must be last. Renders the landing page for any unmatched path.
    { path: '*', name: 'NotFound', component: Landing },
]

export default routes;