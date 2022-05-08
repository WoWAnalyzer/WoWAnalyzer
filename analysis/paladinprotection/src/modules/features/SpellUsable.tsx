import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  CastEvent,
  GlobalCooldownEvent,
  AnyEvent,
  EventType,
  FreeCastEvent,
} from 'parser/core/Events';
import CoreSpellUsable, {
  INVALID_COOLDOWN_CONFIG_LAG_MARGIN,
} from 'parser/shared/modules/SpellUsable';

import GrandCrusader from '../core/GrandCrusader';
import SepulcherTierSet from '../shadowlands/SepulcherTierSet';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    gc: GrandCrusader,
    sepulcher4pc: SepulcherTierSet,
  };
  private _hasCJ: boolean = false;
  gc!: GrandCrusader;
  sepulcher4pc!: SepulcherTierSet;

  constructor(options: Options) {
    super(options);
    this._hasCJ = this.selectedCombatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT.id);
  }

  beginCooldown(spellId: number, event: CastEvent | FreeCastEvent) {
    if (event.type === EventType.FreeCast) {
      // ignore the event
      console.log('ignoring freecast event', event);
      return;
    }

    if (
      this.isAvailable(spellId) ||
      this.cooldownRemaining(spellId) <= INVALID_COOLDOWN_CONFIG_LAG_MARGIN
    ) {
      super.beginCooldown(spellId, event);
      return;
    }

    if (
      spellId === SPELLS.AVENGERS_SHIELD.id ||
      (this._hasCJ && spellId === SPELLS.JUDGMENT_CAST_PROTECTION.id)
    ) {
      this.gc.triggerInferredReset(this, event as CastEvent);
      super.beginCooldown(spellId, event);
    }
  }
}

export default SpellUsable;
