import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

const thisPlayer = 1;
const enemy = 2;

export const dps = [
  { type: "cast", sourceid: thisPlayer, targetid: enemy, timestamp: 1000, ability: { guid: SPELLS.TIGER_PALM.id }, classResources: [ { type: RESOURCE_TYPES.ENERGY, amount: 90 } ] },
  { type: "cast", sourceid: thisPlayer, targetid: enemy, timestamp: 5000, ability: { guid: SPELLS.TIGER_PALM.id }, classResources: [ { type: RESOURCE_TYPES.ENERGY, amount: 100 } ] },
  { type: "cast", sourceid: thisPlayer, targetid: enemy, timestamp: 9000, ability: { guid: SPELLS.KEG_SMASH.id }, classResources: [ { type: RESOURCE_TYPES.ENERGY, amount: 100 } ] },
];

export const buffs = [
  { type: "applybuff", sourceid: thisPlayer, targetid: enemy, timestamp: 0, ability: { guid: SPELLS.HEROISM.id } },
  { type: "removebuff", sourceid: thisPlayer, targetid: enemy, timestamp: 1000, ability: { guid: SPELLS.HEROISM.id } },
];

export const EnergyFight = [
  ...dps,
  ...buffs,
].sort((a, b) => a.timestamp - b.timestamp);
