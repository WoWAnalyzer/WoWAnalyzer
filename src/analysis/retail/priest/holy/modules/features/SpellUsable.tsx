import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbilityEvent, HasRelatedEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options) {
    super(options);
  }

  beginCooldown(cooldownTriggerEvent: AbilityEvent<any>, spellId: number) {
    // Epiphany free Prayer of Mending – do not consume a charge
    if (
      spellId === SPELLS.PRAYER_OF_MENDING_HEAL.id &&
      (HasRelatedEvent(cooldownTriggerEvent, 'EpiphanyPomCast') ||
       this.selectedCombatant.hasBuff(SPELLS.EPIPHANY_BUFF.id, cooldownTriggerEvent.timestamp))
    ) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }

  reduceCooldown(spellId: number, reductionMs: number, timestamp?: number): number {
    return super.reduceCooldown(spellId, reductionMs, timestamp);
  }
}

export default SpellUsable;