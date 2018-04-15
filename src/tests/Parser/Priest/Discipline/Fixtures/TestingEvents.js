import SPELLS from 'common/SPELLS';

export const thisPlayer = 1;
const otherPlayer1 = 2;
const otherPlayer2 = 3;
const otherPlayer3 = 4;
const amount = 1000;

const enemy = 99;

const timestamp = 1000;

export const DamagingEvent1 = { title: 'Damaging Event 1', type: 'damage', sourceID: thisPlayer, sourceIsFriendly: true, targetID: enemy, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.PURGE_THE_WICKED_BUFF.id } };
export const DamagingEvent2 = { title: 'Damaging Event 2',  type: 'damage', sourceID: thisPlayer, sourceIsFriendly: true, targetID: enemy, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.MELEE.id } };
export const DamagingEvent3 = { title: 'Damaging Event 3',  type: 'damage', sourceID: thisPlayer, sourceIsFriendly: true, targetID: enemy, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.MELEE.id } };

export const AtonementOnSelf1 =   { title: 'Atonement on self 1',  type: 'heal',   sourceID: thisPlayer, targetID: thisPlayer,   amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };
export const AtonementOnSelf2 =   { title: 'Atonement on self 2', type: 'heal',   sourceID: thisPlayer, targetID: thisPlayer,   amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };

export const AtonementOnPlayer1 = { title: 'Atonement on player 1',type: 'heal', sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };
export const AtonementOnPlayer2 = { title: 'Atonement on player 2',type: 'heal', sourceID: thisPlayer, targetID: otherPlayer2, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };
export const AtonementOnPlayer3 = { title: 'Atonement on player 3',type: 'heal', sourceID: thisPlayer, targetID: otherPlayer3, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };

export const RadianceCast1 = { type: 'cast', sourceid: thisPlayer, targetid: otherPlayer1, timestamp: 0, ability: { guid: SPELLS.POWER_WORD_RADIANCE.id} };
export const RadianceCast2 = { type: 'cast', sourceid: thisPlayer, targetid: otherPlayer1, timestamp: 0, ability: { guid: SPELLS.POWER_WORD_RADIANCE.id} };
