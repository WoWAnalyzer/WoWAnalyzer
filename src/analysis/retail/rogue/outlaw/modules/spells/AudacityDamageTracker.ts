import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Event, EventType } from 'parser/core/Events';

//--TODO: "minimalActiveTime" should be rogue current gcd, if the value is possible to get from somewhere, instead of a raw number

class AudacityDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: Event<EventType.Event>): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.AUDACITY.id, null, 0, 800);
  }
}

export default AudacityDamageTracker;
