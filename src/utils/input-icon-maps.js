import arrow1 from '@/assets/icons/inputs/arrows/1.png';
import arrow2 from '@/assets/icons/inputs/arrows/2.png';
import arrow3 from '@/assets/icons/inputs/arrows/3.png';
import arrow4 from '@/assets/icons/inputs/arrows/4.png';
import arrow6 from '@/assets/icons/inputs/arrows/6.png';
import arrow7 from '@/assets/icons/inputs/arrows/7.png';
import arrow8 from '@/assets/icons/inputs/arrows/8.png';
import arrow9 from '@/assets/icons/inputs/arrows/9.png';

import sf6Lp from '@/assets/icons/inputs/sf6/lp.png';
import sf6Mp from '@/assets/icons/inputs/sf6/mp.png';
import sf6Hp from '@/assets/icons/inputs/sf6/hp.png';
import sf6Lk from '@/assets/icons/inputs/sf6/lk.png';
import sf6Mk from '@/assets/icons/inputs/sf6/mk.png';
import sf6Hk from '@/assets/icons/inputs/sf6/hk.png';

import ggstP from '@/assets/icons/inputs/ggst/P.png';
import ggstK from '@/assets/icons/inputs/ggst/K.png';
import ggstS from '@/assets/icons/inputs/ggst/S.png';
import ggstHS from '@/assets/icons/inputs/ggst/HS.png';
import ggstD from '@/assets/icons/inputs/ggst/D.png';

import xko2H from '@/assets/icons/inputs/2xko/H.png';
import xko2L from '@/assets/icons/inputs/2xko/L.png';
import xko2M from '@/assets/icons/inputs/2xko/M.png';
import xko2S1 from '@/assets/icons/inputs/2xko/S1.png';
import xko2S2 from '@/assets/icons/inputs/2xko/s2.png';
import xko2T from '@/assets/icons/inputs/2xko/T.png';

import cotwA from '@/assets/icons/inputs/cotw/a.png';
import cotwB from '@/assets/icons/inputs/cotw/b.png';
import cotwBr from '@/assets/icons/inputs/cotw/br.png';
import cotwC from '@/assets/icons/inputs/cotw/c.png';
import cotwD from '@/assets/icons/inputs/cotw/d.png';
import cotwFe from '@/assets/icons/inputs/cotw/fe.png';
import cotwRev from '@/assets/icons/inputs/cotw/rev.png';

import gbvsrH from '@/assets/icons/inputs/gbvsr/H.png';
import gbvsrL from '@/assets/icons/inputs/gbvsr/L.png';
import gbvsrM from '@/assets/icons/inputs/gbvsr/M.png';
import gbvsrU from '@/assets/icons/inputs/gbvsr/U.png';

import t8_1 from '@/assets/icons/inputs/t8/1.png';
import t8_2 from '@/assets/icons/inputs/t8/2.png';
import t8_3 from '@/assets/icons/inputs/t8/3.png';
import t8_4 from '@/assets/icons/inputs/t8/4.png';
import t8_12 from '@/assets/icons/inputs/t8/12.png';
import t8_13 from '@/assets/icons/inputs/t8/13.png';
import t8_14 from '@/assets/icons/inputs/t8/14.png';
import t8_23 from '@/assets/icons/inputs/t8/23.png';
import t8_24 from '@/assets/icons/inputs/t8/24.png';
import t8_34 from '@/assets/icons/inputs/t8/34.png';

import qcf from '@/assets/icons/inputs/directional/qcf.png';
import qcb from '@/assets/icons/inputs/directional/qcb.png';
import dp from '@/assets/icons/inputs/directional/dp.png';
import motion421 from '@/assets/icons/inputs/directional/421.png';
import motion360 from '@/assets/icons/inputs/directional/360.png';
import r360 from '@/assets/icons/inputs/directional/r360.png';
import motion180f from '@/assets/icons/inputs/directional/180f.png';
import motion180b from '@/assets/icons/inputs/directional/180b.png';
import holdBack from '@/assets/icons/inputs/directional/hold back.png';
import holdDownIcon from '@/assets/icons/inputs/directional/hold down.png';
import dashIcon from '@/assets/icons/inputs/ggst/dash.png';

export const arrowIcons = {
  1: arrow1, 2: arrow2, 3: arrow3, 4: arrow4, 6: arrow6, 7: arrow7, 8: arrow8, 9: arrow9,
};

export const motionIcons = {
  qcf: qcf, qcb: qcb, dp: dp, 421: motion421, 360: motion360, r360: r360,
  '180f': motion180f, '180b': motion180b, 'hold back': holdBack, 'hold down': holdDownIcon,
};

export const specialIcons = { dash: dashIcon, '>': null };

export const allGameIcons = {
  sf6: { lp: sf6Lp, mp: sf6Mp, hp: sf6Hp, lk: sf6Lk, mk: sf6Mk, hk: sf6Hk },
  ggst: { P: ggstP, K: ggstK, S: ggstS, HS: ggstHS, D: ggstD },
  '2xko': { H: xko2H, L: xko2L, M: xko2M, S1: xko2S1, S2: xko2S2, T: xko2T },
  cotw: { a: cotwA, b: cotwB, br: cotwBr, c: cotwC, d: cotwD, fe: cotwFe, rev: cotwRev },
  gbvsr: { H: gbvsrH, L: gbvsrL, M: gbvsrM, U: gbvsrU },
  t8: { 1: t8_1, 2: t8_2, 3: t8_3, 4: t8_4, 12: t8_12, 13: t8_13, 14: t8_14, 23: t8_23, 24: t8_24, 34: t8_34 },
};

const GAME_BUTTON_MAP = {
  sf6: [
    { key: 'lp', notation: 'LP' }, { key: 'mp', notation: 'MP' }, { key: 'hp', notation: 'HP' },
    { key: 'lk', notation: 'LK' }, { key: 'mk', notation: 'MK' }, { key: 'hk', notation: 'HK' },
  ],
  ggst: [
    { key: 'P', notation: 'P' }, { key: 'K', notation: 'K' }, { key: 'S', notation: 'S' },
    { key: 'HS', notation: 'HS' }, { key: 'D', notation: 'D' },
  ],
  '2xko': [
    { key: 'L', notation: 'L' }, { key: 'M', notation: 'M' }, { key: 'H', notation: 'H' },
    { key: 'S1', notation: 'S1' }, { key: 'S2', notation: 'S2' }, { key: 'T', notation: 'T' },
  ],
  cotw: [
    { key: 'a', notation: 'A' }, { key: 'b', notation: 'B' }, { key: 'br', notation: 'BR' },
    { key: 'c', notation: 'C' }, { key: 'd', notation: 'D' }, { key: 'fe', notation: 'FE' },
    { key: 'rev', notation: 'REV' },
  ],
  gbvsr: [
    { key: 'L', notation: 'L' }, { key: 'M', notation: 'M' }, { key: 'H', notation: 'H' },
    { key: 'U', notation: 'U' },
  ],
  t8: [
    { key: '1', notation: '1' }, { key: '2', notation: '2' }, { key: '3', notation: '3' },
    { key: '4', notation: '4' }, { key: '12', notation: '12' }, { key: '13', notation: '13' },
    { key: '14', notation: '14' }, { key: '23', notation: '23' }, { key: '24', notation: '24' },
    { key: '34', notation: '34' },
  ],
};

export const ARROW_BUTTONS = [
  { notation: '7' }, { notation: '8' }, { notation: '9' },
  { notation: '4' }, { notation: '5' }, { notation: '6' },
  { notation: '1' }, { notation: '2' }, { notation: '3' },
];

export const MOTION_BUTTONS = [
  { notation: 'qcf', label: '236' }, { notation: 'qcb', label: '214' }, { notation: 'dp', label: '623' },
  { notation: '421', label: '421' }, { notation: '360', label: '360' }, { notation: '180f', label: '180f' },
  { notation: '180b', label: '180b' }, { notation: 'hold back', label: 'Hold B' },
  { notation: 'hold down', label: 'Hold D' }, { notation: 'dash', label: 'Dash' },
];

export function normalizeAbbrev(abbrev) {
  return (abbrev || 'sf6').toLowerCase();
}

export function getAttackButtons(gameAbbreviation) {
  const abbrev = normalizeAbbrev(gameAbbreviation);
  return GAME_BUTTON_MAP[abbrev] || GAME_BUTTON_MAP.sf6;
}

export function getAttackIcons(gameAbbreviation) {
  const abbrev = normalizeAbbrev(gameAbbreviation);
  return allGameIcons[abbrev] || allGameIcons.sf6;
}

export function getInputIcon(notation, gameAbbreviation) {
  if (/^[1-9]$/.test(notation)) return arrowIcons[notation] || null;
  if (motionIcons[notation]) return motionIcons[notation];
  if (notation === 'dash') return specialIcons.dash;
  const attacks = getAttackIcons(gameAbbreviation);
  if (attacks[notation]) return attacks[notation];
  const lower = notation.toLowerCase();
  if (attacks[lower]) return attacks[lower];
  const upper = notation.toUpperCase();
  if (attacks[upper]) return attacks[upper];
  return null;
}
