import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import SoulFragmentsConsume, {
  SoulFragmentsConsumedEvent,
} from '../../statistics/SoulFragmentsConsume';

const COOLDOWN_REDUCTION = 2000;

/**
 * Fiery Soul
 * Shadowlands legendary that reduces the cooldown of Fiery Brand by 2 seconds for every soul fragment consumed by Soul Cleave.
 */
class FierySoul extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    soulFragmentsConsume: SoulFragmentsConsume,
  };
  protected spellUsable!: SpellUsable;
  protected soulFragmentsConsume!: SoulFragmentsConsume;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FIERY_SOUL.bonusID);
  }

  onLoad() {
    if (!this.active) {
      return;
    }

    this.soulFragmentsConsume.soulFragmentsConsumedHandlers.push(
      this.onSoulFragmentsConsumed.bind(this),
    );
  }

  onSoulFragmentsConsumed(event: SoulFragmentsConsumedEvent) {
    if (event.spellId !== SPELLS.SOUL_CLEAVE.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.FIERY_BRAND.id)) {
      this.spellUsable.reduceCooldown(
        SPELLS.FIERY_BRAND.id,
        event.numberofSoulFragmentsConsumed * COOLDOWN_REDUCTION,
      );
    }
  }
}

export default FierySoul;
