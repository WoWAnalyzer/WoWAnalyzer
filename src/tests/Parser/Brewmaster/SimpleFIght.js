import SPELLS from 'common/SPELLS';

export const FIGHT_END = 11000;
export const TOTAL_STAGGERED = 231;

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
          module.on_toPlayer_absorbed(event);
        }
      }
      if (event.type === "damage") {
        if (event.targetid === thisPlayer && module.on_toPlayer_damage) {
          module.on_toPlayer_damage(event);
        }
      }
      if (event.type === "cast") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_cast) {
          module.on_byPlayer_cast(event);
        }
      }
      if (event.type === "heal") {
        if (event.targetid === thisPlayer && module.on_toPlayer_heal) {
          module.on_toPlayer_heal(event);
        }
      }
      if (event.type === "applybuff") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_applybuff) {
          module.on_byPlayer_applybuff(event);
        }
      }
      if (event.type === "removebuff") {
        if (event.sourceid === thisPlayer && module.on_byPlayer_removebuff) {
          module.on_byPlayer_removebuff(event);
        }
      }
    }
  });
}

export const events = [
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 400, timestamp: 1, ability: { guid: 1 } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 100, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 200, ability: { guid: SPELLS.IRONSKIN_BREW.id } },
  { type: "applybuff", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 200, ability: { guid: SPELLS.IRONSKIN_BREW_BUFF.id } },
  // This one is spawned by the ISB
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 204, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 400, timestamp: 500, ability: { guid: 1 } },
  { type: "absorbed", sourceid: enemy, targetid: thisPlayer, amount: 300, timestamp: 500, ability: { guid: SPELLS.STAGGER.id }, extraAbility: { guid: 1, type: 1}},
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 1000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 1500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 2000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 2500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 3000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  // The spell doesn't matter it was absorbed by something other than stagger...
  { type: "absorbed", sourceid: enemy, targetid: thisPlayer, amount: 9, timestamp: 3500, ability: { guid: 99999 }, extraAbility: { guid: 1, type: 1}},
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 1, timestamp: 3500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 4000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 4500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 4700, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 5000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 10, timestamp: 5500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  // By fire be... BURNED
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 400, timestamp: 5700, ability: { guid: 4 } },
  { type: "absorbed", sourceid: enemy, targetid: thisPlayer, amount: 299, timestamp: 5700, ability: { guid: SPELLS.STAGGER.id }, extraAbility: { guid: 4, type: 4}},
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 15, timestamp: 6000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 15, timestamp: 6500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  // Without ring this saves 1 tick
  { type: "heal", sourceid: thisPlayer, targetid: thisPlayer, amount: 10, timestamp: 6700, ability: { guid: SPELLS.GIFT_OF_THE_OX_1.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 15, timestamp: 7000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 15, timestamp: 7500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 15, timestamp: 8000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "cast", sourceid: thisPlayer, targetid: thisPlayer, timestamp: 8200, ability: { guid: SPELLS.PURIFYING_BREW.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 13, timestamp: 8500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 13, timestamp: 9000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 13, timestamp: 9500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 13, timestamp: 10000, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
  { type: "damage", sourceid: enemy, targetid: thisPlayer, amount: 13, timestamp: 10500, ability: { guid: SPELLS.STAGGER_TAKEN.id } },
]
