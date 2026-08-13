/** @format */

// Games whose matches record more than one character per player.
// These ids were previously inlined across the game views; keep them here so
// adding a new team game is a one-line change.
export const TEAM_GAME_IDS = {
    TWO_XKO: '68cba126f261500022897969',
    MARVEL_TOKON: '6a7484b2d28616029b5e4e4a',
};

// Games filtered by picking two characters on the same team (2v2 tag).
const TEAM_PAIRING_GAME_IDS = [TEAM_GAME_IDS.TWO_XKO];

// Games where the FIRST character listed for a player is the point character,
// so replays can be filtered down to "who did they lead with".
const POINT_CHARACTER_GAME_IDS = [TEAM_GAME_IDS.MARVEL_TOKON];

export function isTeamPairingGame(gameId) {
    return TEAM_PAIRING_GAME_IDS.indexOf(String(gameId || '')) !== -1;
}

export function isPointCharacterGame(gameId) {
    return POINT_CHARACTER_GAME_IDS.indexOf(String(gameId || '')) !== -1;
}
