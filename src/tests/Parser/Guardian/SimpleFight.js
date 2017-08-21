import SPELLS from 'common/SPELLS';

export const FIGHT_END = 15000;

const thisPlayer = 1;
const enemy = 2;

export function processEvents(events, module, fightEndTime) {
  if (!fightEndTime) {
    fightEndTime = FIGHT_END;
  }
  events.forEach(event => {
    if (event.timestamp <= fightEndTime) {
      if (event.type === "absorbed") {
        if (event.targetid === thisPlayer && module.on_toPlayer_absorbed) {
          module.triggerEvent('toPlayer_absorbed', event);
        }
      }
      if (event.type === "damage") {
        if (event.targetid === thisPlayer && module.on_toPlayer_damage) {
          module.triggerEvent('toPlayer_damage', event);
        }
      }
      if (event.type === "cast") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_cast) {
          module.triggerEvent('byPlayer_cast', event);
        }
      }
      if (event.type === "heal") {
        if (event.targetid === thisPlayer && module.on_toPlayer_heal) {
          module.triggerEvent('toPlayer_heal', event);
        }
      }
      if (event.type === "applybuff") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_applybuff) {
          module.triggerEvent('byPlayer_applybuff', event);
        }
      }
      if (event.type === "refreshbuff") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_refreshbuff) {
          module.triggerEvent('byPlayer_refreshbuff', event);
        }
      }
      if (event.type === "removebuff") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_removebuff) {
          module.triggerEvent('byPlayer_removebuff', event);
        }
      }
    }
  });
}

export const events = [
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 1000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 2000, ability: { guid: 1, type: 1 } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 2500, ability: { guid: SPELLS.MANGLE_BEAR.id, type: 1 } },
  { type: "applybuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 2500, ability: { guid: SPELLS.GUARDIAN_OF_ELUNE.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 3000, ability: { guid: 1, type: 1 } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: "applybuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: "removebuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 3500, ability: { guid: SPELLS.GUARDIAN_OF_ELUNE.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 4000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 5000, ability: { guid: 1, type: 1 } },
  { type: "applybuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 5500, ability: { guid: SPELLS.GORE_BEAR.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 6000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 7000, ability: { guid: 1, type: 1 } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 7500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: "applybuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 7500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 8000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 9000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 10000, ability: { guid: 1, type: 1 } },
  { type: "refreshbuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 10500, ability: { guid: SPELLS.GORE_BEAR.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 4000, timestamp: 11000, ability: { guid: 1, type: 1 } },
  // First ironfur stack at 11500 drops (excluding artifact), doesn't show in the logs...
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 11500, ability: { guid: SPELLS.MANGLE_BEAR.id, type: 1 } },
  { type: "applybuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 11500, ability: { guid: SPELLS.GUARDIAN_OF_ELUNE.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 12000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 6000, timestamp: 13000, ability: { guid: 1, type: 1 } },
  { type: "removebuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 13500, ability: { guid: SPELLS.IRONFUR.id, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 14000, ability: { guid: 1, type: 1 } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10000, timestamp: 15000, ability: { guid: 1, type: 1 } },
]
