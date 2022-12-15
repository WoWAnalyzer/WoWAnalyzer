import TALENTS from 'common/TALENTS/warlock';
import { AnyEvent, BeginCastEvent, CastEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { encodeEventSourceString } from 'parser/shared/modules/Enemies';

import { isWildImp } from '../../pets/helpers';

const debug = false;

class PowerSiphonNormalizer extends EventsNormalizer {
  // Power Siphon sacrifices up to 2 Wild Imps to gain Demonic Core stacks from them
  // There's some problems with it I can't seem to solve - according to Warlock Discord, it should pick the imps with the lowest energy
  // But when I get active Wild Imps, order them by energy and if same, by their spawn timestamp (so it should pick the lowest energy or oldest), and sacrifice first 2
  // In lot of cases, I get errors afterwards, that Imps that should be dead, are happily casting things
  // Not sure if it's my fault with tracking their lifespan or Power Siphon Imp picking strategy is different

  // This normalizer looks at Power Siphon casts, and looks for Wild Imp activity AFTER the cast, storing which Wild Imps were active AFTER the cast
  // If I can store the info inside the PS cast (with __modified flag) I should be able to correctly filter Imps that should actually die in the DemoPets.js Analyzer
  normalize(events: AnyEvent[]) {
    if (!this.selectedCombatant.hasTalent(TALENTS.POWER_SIPHON_TALENT.id)) {
      return events;
    }

    let lastPowerSiphonCast:
      | (CastEvent & { __modified?: boolean; activeImpsAfterCast?: string[] })
      | null = null;
    let activeImpsAfterCast: string[] = [];

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      // skip everything till first PS cast
      if (
        !lastPowerSiphonCast &&
        (event.type !== EventType.Cast || event.ability.guid !== TALENTS.POWER_SIPHON_TALENT.id)
      ) {
        continue;
      }
      if (event.type === EventType.Cast && event.ability.guid === TALENTS.POWER_SIPHON_TALENT.id) {
        if (lastPowerSiphonCast) {
          // if it's not first PS cast, add the active imps to previous cast, start counting again
          lastPowerSiphonCast.activeImpsAfterCast = [...activeImpsAfterCast];
          lastPowerSiphonCast.__modified = true;
          activeImpsAfterCast = [];
        }
        lastPowerSiphonCast = event;
      } else {
        // all events after PS cast
        if (
          (event.type === EventType.Cast || event.type === EventType.BeginCast) &&
          this.owner.byPlayerPet(event) &&
          this._isFromWildImp(event)
        ) {
          const sourceString = encodeEventSourceString(event);
          if (sourceString && !activeImpsAfterCast.includes(sourceString)) {
            activeImpsAfterCast.push(sourceString);
          }
        }
      }
    }
    // modify the last PS cast
    if (lastPowerSiphonCast) {
      lastPowerSiphonCast.activeImpsAfterCast = [...activeImpsAfterCast];
      lastPowerSiphonCast.__modified = true;
    }
    debug &&
      console.log(
        'PS casts after normalizing',
        events.filter(
          (event) =>
            event.type === EventType.Cast && event.ability.guid === TALENTS.POWER_SIPHON_TALENT.id,
        ),
      );
    return events;
  }

  _isFromWildImp(event: BeginCastEvent | CastEvent) {
    // if event is not from player pet (is not in this.owner.playerPets), this function shouldn't even get called, but just to be safe
    const info = this.owner.playerPets.find((pet) => pet.id === event.sourceID);
    if (!info) {
      return false;
    }
    return isWildImp(info.guid);
  }
}

export default PowerSiphonNormalizer;
