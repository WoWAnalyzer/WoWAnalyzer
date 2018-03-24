import SPELLS from 'common/SPELLS';

const thisPlayer = 1;
const enemy = 2;

// Damage taken: amount: 224, absorbed: 16, overkill: 0
export const staggerTicks = [
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 1000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 1500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 2000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 2500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 3000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 1, absorbed: 9, timestamp: 3500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 4000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 4500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 5000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 10, timestamp: 5500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 8, absorbed: 7, timestamp: 6000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 15, timestamp: 6500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 15, timestamp: 7000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 15, timestamp: 7500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 15, timestamp: 8000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 13, timestamp: 8500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 13, timestamp: 9000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 13, timestamp: 9500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 13, timestamp: 10000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 13, timestamp: 10500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
];

// 599 will be removed by the stagger array below when combined
// Damage taken: amount: 1200, absorbed: 599, overkill: 0
export const incomingDamage = [
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 400, timestamp: 1, ability: { guid: 1 } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 400, absorbed: 300, timestamp: 500, ability: { guid: 1 } },
  { type: 'damage', sourceID: enemy, targetid: thisPlayer, amount: 400, absorbed: 299, timestamp: 5700, ability: { guid: 4 } },
];

// Damage taken: amount: 0, absorbed: 0, overkill: 0
export const casts = [
  { type: 'cast', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 100, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 204, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 4700, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 8200, ability: { guid: SPELLS.PURIFYING_BREW.id } },
];

export const dpsCasts = [
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 3500, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 4500, ability: { guid: SPELLS.KEG_SMASH.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 4700, ability: { guid: SPELLS.KEG_SMASH.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 6500, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 8500, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 9000, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { type: 'cast', sourceID: thisPlayer, targetid: enemy, timestamp: 9700, ability: { guid: SPELLS.BREATH_OF_FIRE.id } },
];

// Damage taken: amount: 0, absorbed: 0, overkill: 0
export const isbCasts = [
  { type: 'cast', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 200, ability: { guid: SPELLS.IRONSKIN_BREW.id } },
];

// Damage taken: amount: 0, absorbed: 0, overkill: 0
export const applybuff = [
  { type: 'applybuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 200, ability: { guid: SPELLS.IRONSKIN_BREW_BUFF.id } },
  { type: 'applybuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
  { type: 'applybuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 6500, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
  { type: 'applybuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 8500, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
];

export const refreshBuff = [
  { type: 'refreshbuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 9000, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
];

export const removebuff = [
  { type: 'removebuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 4500, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
  { type: 'removebuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 8200, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
  { type: 'removebuff', sourceID: thisPlayer, targetid: thisPlayer, timestamp: 9700, ability: { guid: SPELLS.BLACKOUT_COMBO_BUFF.id } },
];

// This absorb is used from the damage line
// Damage taken: amount: 0, absorbed: 0, overkill: 0
export const absorbed = [
  { type: 'absorbed', sourceID: enemy, targetid: thisPlayer, amount: 9, timestamp: 3500, ability: { guid: 99999 }, extraAbility: { guid: 1, type: 1 } },
  { type: 'absorbed', sourceID: enemy, targetid: thisPlayer, amount: 7, timestamp: 6000, ability: { guid: 99999 }, extraAbility: { guid: 1, type: 1 } },
];

// Damage taken: amount: 0, absorbed: 0, overkill: 0
// Stagger damage taken: amount: 0, absorbed: -599, overkill: 0
export const staggerAbsorbed = [
  { type: 'absorbed', sourceID: enemy, targetid: thisPlayer, amount: 300, timestamp: 500, ability: { guid: SPELLS.STAGGER.id }, extraAbility: { guid: 1, type: 1 } },
  { type: 'absorbed', sourceID: enemy, targetid: thisPlayer, amount: 299, timestamp: 5700, ability: { guid: SPELLS.STAGGER.id }, extraAbility: { guid: 4, type: 4 } },
];

// Damage taken: amount: 0, absorbed: 0, overkill: 0
export const heal = [
  { type: 'heal', sourceID: thisPlayer, targetid: thisPlayer, amount: 10, timestamp: 6700, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
];

export const SimpleFight = [
  ...staggerTicks,
  ...incomingDamage,
  ...casts,
  ...applybuff,
  ...absorbed,
  ...staggerAbsorbed,
  ...heal,
  ...isbCasts,
  ...dpsCasts,
  ...refreshBuff,
  ...removebuff,
].sort((a, b) => a.timestamp - b.timestamp);

export const EarlyFinish = [
  ...staggerTicks,
  ...incomingDamage,
  ...casts,
  ...applybuff,
  ...absorbed,
  ...staggerAbsorbed,
  ...heal,
  ...isbCasts,
  ...dpsCasts,
  ...refreshBuff,
  ...removebuff,
].sort((a, b) => a.timestamp - b.timestamp).filter(event => event.timestamp <= 6000);
