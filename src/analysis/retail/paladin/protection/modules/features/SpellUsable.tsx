import TALENTS from 'common/TALENTS/paladin';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, EventType, FreeCastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import GrandCrusader from '../talents/GrandCrusader';
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    gc: GrandCrusader,
  };
  _hasCJ: boolean = false;
  gc!: GrandCrusader;
  constructor(options: Options) {
    super(options);
    this._hasCJ = this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT);
  }

  beginCooldown(
    triggeringEvent: CastEvent | FreeCastEvent,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    if (triggeringEvent.type === EventType.FreeCast) {
      // ignore the event
      return;
    }
    super.beginCooldown(triggeringEvent, spellId);
  }
}

export default SpellUsable;
