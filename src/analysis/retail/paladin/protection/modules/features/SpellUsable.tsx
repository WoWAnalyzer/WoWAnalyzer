import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, EventType, FreeCastEvent } from 'parser/core/Events';
import CoreSpellUsable, { COOLDOWN_LAG_MARGIN } from 'parser/shared/modules/SpellUsable';
import GrandCrusader from '../core/GrandCrusader';
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

    const validSpell =
      spellId === TALENTS.AVENGERS_SHIELD_TALENT.id ||
      spellId === SPELLS.JUDGMENT_CAST_PROTECTION.id;

    if (
      validSpell &&
      !this.isAvailable(spellId) &&
      this.cooldownRemaining(spellId) > COOLDOWN_LAG_MARGIN
    ) {
      this.gc.triggerInferredReset(this, triggeringEvent);
    }

    super.beginCooldown(triggeringEvent, spellId);
  }
}

export default SpellUsable;
