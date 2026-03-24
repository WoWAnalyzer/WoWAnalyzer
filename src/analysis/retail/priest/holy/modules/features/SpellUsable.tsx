import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { AbilityEvent, HasRelatedEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options) {
    super(options);
  }

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  beginCooldown(cooldownTriggerEvent: AbilityEvent<any>, spellId: number) {
    // Epiphany free Prayer of Mending – do not consume a charge
    if (
      spellId === SPELLS.PRAYER_OF_MENDING_CAST.id &&
      (HasRelatedEvent(cooldownTriggerEvent, 'EpiphanyPomCast') ||
        this.selectedCombatant.hasBuff(SPELLS.EPIPHANY_BUFF.id, cooldownTriggerEvent.timestamp))
    ) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;