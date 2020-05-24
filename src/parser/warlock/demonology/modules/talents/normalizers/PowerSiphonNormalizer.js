import { EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

import SPELLS from 'common/SPELLS';

import { isWildImp } from '../../pets/helpers';

const debug = false;
const CHECKED_EVENT_TYPES = [EventType.BeginCast, EventType.Cast];

class PowerSiphonNormalizer extends EventsNormalizer {
  // Power Siphon sacrifices up to 2 Wild Imps to gain Demonic Core stacks from them
  // There's some problems with it I can't seem to solve - according to Warlock Discord, it should pick the imps with the lowest energy
  // But when I get active Wild Imps, order them by energy and if same, by their spawn timestamp (so it should pick the lowest energy or oldest), and sacrifice first 2
  // In lot of cases, I get errors afterwards, that Imps that should be dead, are happily casting things
  // Not sure if it's my fault with tracking their lifespan or Power Siphon Imp picking strategy is different

  // This normalizer looks at Power Siphon casts, and looks for Wild Imp activity AFTER the cast, storing which Wild Imps were active AFTER the cast
  // If I can store the info inside the PS cast (with __modified flag) I should be able to correctly filter Imps that should actually die in the DemoPets.js Analyzer
  normalize(events) {
    if (!this.selectedCombatant.hasTalent(SPELLS.POWER_SIPHON_TALENT.id)) {
      return events;
    }

    let lastPowerSiphonCast = null;
    let activeImpsAfterCast = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // skip everything till first PS cast
      if (!lastPowerSiphonCast && (!event.ability || event.ability.guid !== SPELLS.POWER_SIPHON_TALENT.id)) {
        continue;
      }
      if (event.ability && event.ability.guid === SPELLS.POWER_SIPHON_TALENT.id) {
        if (lastPowerSiphonCast) {
          // if it's not first PS cast, add the active imps to previous cast, start counting again
          lastPowerSiphonCast.activeImpsAfterCast = [...activeImpsAfterCast];
          lastPowerSiphonCast.__modified = true;
          activeImpsAfterCast = [];
        }
        lastPowerSiphonCast = event;
      } else {
        // all events after PS cast
        if (CHECKED_EVENT_TYPES.includes(event.type) && this.owner.byPlayerPet(event) && this._isFromWildImp(event)) {
          const targetString = encodeTargetString(event.sourceID, event.sourceInstance);
          if (!activeImpsAfterCast.includes(targetString)) {
            activeImpsAfterCast.push(targetString);
          }
        }
      }
    }
    // modify the last PS cast
    lastPowerSiphonCast.activeImpsAfterCast = [...activeImpsAfterCast];
    lastPowerSiphonCast.__modified = true;
    debug && console.log('PS casts after normalizing', events.filter(event => event.type === EventType.Cast && event.ability.guid === SPELLS.POWER_SIPHON_TALENT.id));
    return events;
  }

  _isFromWildImp(event) {
    // if event is not from player pet (is not in this.owner.playerPets), this function shouldn't even get called, but just to be safe
    const info = this.owner.playerPets.find(pet => pet.id === event.sourceID);
    if (!info) {
      return false;
    }
    return isWildImp(info.guid);
  }
}

export default PowerSiphonNormalizer;
