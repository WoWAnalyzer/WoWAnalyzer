import EventsNormalizer from 'parser/core/EventsNormalizer';

const debug = false;

/**
 * The `combatantinfo` event is a event that's fired at the start of the fight. It has a lot of information about the players, including an `auras` prop that's an array with a few of the buffs applied on the pull. Unfortunately this array is incomplete and based on a whitelist.
 *
 * **This normalizer will make sure the `auras` prop is complete.** It looks for events such as `refreshbuff` and `removebuff` to detect if a buff has been active since before the pull, and if so it will add it to the `auras` array.
 *
 * Note: each entry of the `auras` prop has the following format:
 * {
 *   source: (int)sourceId,
 *   ability: (int)spellId,
 *   icon: (string)icon,
 * }
 * This deviates from pretty much any other data structure in every single way. `source` is normally called `sourceID`, and `ability` and `icon` are usually in an object with the spell name, guid and icon.
 */
class CombatantInfoAuras extends EventsNormalizer {
  normalize(events) {
    const combatantInfoEvents = this.owner.combatantInfoEvents;
    const playersById = this.owner.playersById;
    const combatantInfoById = combatantInfoEvents.reduce((obj, combatantinfo) => {
      obj[combatantinfo.sourceID] = combatantinfo;
      return obj;
    }, {});
    // This tracks which buffs are completed already. A buff can only be applied once to someone per target/source/spellid.
    const completeBuffs = {};
    const markComplete = (sourceId, targetId, spellId) => {
      completeBuffs[targetId] = completeBuffs[targetId] || {};
      completeBuffs[targetId][sourceId] = completeBuffs[targetId][sourceId] || [];
      completeBuffs[targetId][sourceId].push(Number(spellId));
      debug && this.log(`Marked ${spellId} on ${targetId} by ${sourceId} as complete`);
    };
    const isComplete = (sourceId, targetId, spellId) => {
      if (!completeBuffs[targetId] || !completeBuffs[targetId][sourceId]) {
        return false;
      }
      return completeBuffs[targetId][sourceId].includes(Number(spellId));
    };

    // Mark everything already in the `auras` prop as complete to avoid doubling them.
    combatantInfoEvents.forEach(combatantinfo => {
      // event.auras can be undefined if combatantinfo for any player in the fight errored
      combatantinfo.auras && combatantinfo.auras.forEach(aura => {
        markComplete(aura.source, combatantinfo.sourceID, aura.ability);
      });
    });

    const length = events.length;
    for (let i = 0; i < length; i += 1) {
      const event = events[i];
      const sourceId = event.sourceID;
      const targetId = event.targetID;
      if (!event.ability) {
        continue;
      }
      const spellId = event.ability.guid;
      if (isComplete(sourceId, targetId, spellId)) {
        continue;
      }

      switch (event.type) {
        case 'applybuff':
          markComplete(sourceId, targetId, spellId);
          break;
        case 'removebuff':
        case 'applybuffstack':
        case 'removebuffstack':
        case 'refreshbuff': {
          const combatant = combatantInfoById[event.targetID];
          if (!combatant) {
            // Probably a pet
            continue;
          }
          if (!combatant.auras) {
            // event.auras can be undefined if combatantinfo for any player in the fight errored
            combatant.auras = [];
          }

          debug && this.log('Found', spellId, event.ability.name, 'on', targetId, ((playersById[targetId] && playersById[targetId].name) || '???'), 'by', sourceId, ((playersById[sourceId] && playersById[sourceId].name) || '???'), 'that was applied before the pull! Fabricating an entry in `auras` of the `combatantinfo` so you don\'t have to do anything special to take this into account.');
          combatant.auras.push({
            source: event.sourceID,
            ability: spellId,
            icon: event.ability.abilityIcon,
            __fabricated: true,
            __extra: {
              ability: event.ability,
              sourceIsFriendly: event.sourceIsFriendly,
              targetIsFriendly: event.targetIsFriendly,
            },
          });
          markComplete(sourceId, targetId, spellId);
          break;
        }
        default: break;
      }
    }

    return events;
  }
}

export default CombatantInfoAuras;
