import SPELLS from 'common/SPELLS/index';
import { EventType } from 'parser/core/Events';

export const FIGHT_END = 15000;

const thisPlayer = 1;
const enemy = 2;

export const damageTaken = [
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 1000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 2000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 3000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 4000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 5000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 6000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 7000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 8000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 9000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 10000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 11000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 12000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 13000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 14000, ability: { guid: 1, type: 1 } },
  { type: EventType.Damage, sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 15000, ability: { guid: 1, type: 1 } },
];

export const buffsApplied = [
  { type: EventType.ApplyBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 2500, ability: { guid: SPELLS.GUARDIAN_OF_ELUNE.id, type: 1 } },
  { type: EventType.ApplyBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: EventType.ApplyBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 5500, ability: { guid: SPELLS.GORE_BEAR.id, type: 1 } },
  { type: EventType.ApplyBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 7500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: EventType.ApplyBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 11500, ability: { guid: SPELLS.GUARDIAN_OF_ELUNE.id, type: 1 } },

];

export const buffsRefreshed = [
  { type: EventType.RefreshBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 10500, ability: { guid: SPELLS.GORE_BEAR.id, type: 1 } },

];

export const buffsRemoved = [
  { type: EventType.RemoveBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.GUARDIAN_OF_ELUNE.id, type: 1 } },
  { type: EventType.RemoveBuff, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 13500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
];

export const casts = [
  { type: EventType.Cast, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 2500, ability: { guid: SPELLS.MANGLE_BEAR.id, type: 1 } },
  { type: EventType.Cast, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: EventType.Cast, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 7500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: EventType.Cast, sourceid: thisPlayer, targetid: thisPlayer, timestamp: 11500, ability: { guid: SPELLS.MANGLE_BEAR.id, type: 1 } },
];

export const SimpleFight = [
  ...damageTaken,
  ...buffsApplied,
  ...buffsRefreshed,
  ...buffsRemoved,
  ...casts,
].sort((a, b) => a.timestamp - b.timestamp);
