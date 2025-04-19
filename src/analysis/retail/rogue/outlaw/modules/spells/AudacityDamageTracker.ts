import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { Event, EventType } from 'parser/core/Events';

//--TODO: "minimalActiveTime" should be rogue current gcd, if the value is possible to get from somewhere, instead of a raw number

class AudacityDamageTracker extends FilteredDamageTracker {
  constructor(options: Options) {
    super(options);

    this.subscribeInefficientCast(
      [SPELLS.SINISTER_STRIKE],
      () => `Ambush should be used as your builder when audacity proc is up`,
    );
    this.subscribeInefficientCast(
      [SPELLS.PISTOL_SHOT],
      () => `Ambush should be used as your builder when audacity proc is up`,
    );
  }

  shouldProcessEvent(event: Event<EventType.Event>): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.AUDACITY_TALENT_BUFF.id, null, undefined, 800);
  }
}

export default AudacityDamageTracker;
