import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, EventType, FreeCastEvent } from 'parser/core/Events';
import CoreSpellUsable, {
  INVALID_COOLDOWN_CONFIG_LAG_MARGIN,
} from 'parser/shared/modules/SpellUsable';

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
    this._hasCJ = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id);
  }

  beginCooldown(spellId: number, cooldownTriggerEvent: CastEvent | FreeCastEvent) {
    if (cooldownTriggerEvent.type === EventType.FreeCast) {
      // ignore the event
      return;
    }

    const validSpell =
      spellId === SPELLS.AVENGERS_SHIELD.id ||
      (spellId === SPELLS.JUDGMENT_CAST_PROTECTION.id && this._hasCJ);

    if (
      validSpell &&
      !this.isAvailable(spellId) &&
      this.cooldownRemaining(spellId) > INVALID_COOLDOWN_CONFIG_LAG_MARGIN
    ) {
      this.gc.triggerInferredReset(this, cooldownTriggerEvent);
    }

    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
