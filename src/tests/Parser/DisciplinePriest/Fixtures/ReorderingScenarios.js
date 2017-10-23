import SPELLS from 'common/SPELLS';

const thisPlayer = 1;
const otherPlayer1 = 2;
const otherPlayer2 = 3;

const amount = 1000;

const enemy = 99;

const timestamp = 1000;

export const DamagingEvent1 = { type: 'damage', sourceID: thisPlayer, sourceIsFriendly: true, targetID: enemy, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.PURGE_THE_WICKED_BUFF.id } };
export const DamagingEvent2 = { type: 'damage', sourceID: thisPlayer, sourceIsFriendly: true, targetID: enemy, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.SHADOWBIND_TRAIT.id } };

export const AtonementOnSelf1 =   { type: 'heal',   sourceID: thisPlayer, targetID: thisPlayer,   amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };
export const AtonementOnSelf2 =   { type: 'heal',   sourceID: thisPlayer, targetID: thisPlayer,   amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };

export const AtonementOnPlayer1 = { type: 'heal', sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };
export const AtonementOnPlayer2 = { type: 'heal', sourceID: thisPlayer, targetID: otherPlayer2, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } };
