import SPELLS from 'common/SPELLS';

const thisPlayer = 1;
const otherPlayer1 = 2;
const otherPlayer2 = 3;

const amount = 1000;

const enemy = 99;

const timestamp = 1000;

export const TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween = [
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'damage', sourceID: thisPlayer, targetID: enemy,        amount: amount, timestamp: timestamp, ability: { guid: SPELLS.PURGE_THE_WICKED_BUFF.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: thisPlayer,   amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'damage', sourceID: thisPlayer, targetID: enemy,        amount: amount, timestamp: timestamp, ability: { guid: SPELLS.SHADOWBIND_TRAIT.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer2, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
];

export const TwoSuccesiveDamagingEvents = [
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'damage', sourceID: thisPlayer, targetID: enemy,        amount: amount, timestamp: timestamp, ability: { guid: SPELLS.PURGE_THE_WICKED_BUFF.id } },
  { type: 'damage', sourceID: thisPlayer, targetID: enemy,        amount: amount, timestamp: timestamp, ability: { guid: SPELLS.SHADOWBIND_TRAIT.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer2, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer1, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'heal',   sourceID: thisPlayer, targetID: otherPlayer2, amount: amount, timestamp: timestamp, ability: { guid: SPELLS.ATONEMENT_HEAL_NON_CRIT.id } },
  { type: 'damage', sourceID: thisPlayer, targetID: enemy,        amount: amount, timestamp: timestamp, ability: { guid: SPELLS.SHADOWBIND_TRAIT.id } },
];
