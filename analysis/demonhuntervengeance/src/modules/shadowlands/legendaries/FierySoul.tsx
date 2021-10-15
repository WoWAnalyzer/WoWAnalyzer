import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { ConsumeSoulFragmentsEvent } from '../../statistics/SoulFragmentsConsume';

const COOLDOWN_REDUCTION = 2000;

/**
 * Fiery Soul
 * Shadowlands legendary that reduces the cooldown of Fiery Brand by 2 seconds for every soul fragment consumed by Soul Cleave.
 */
class FierySoul extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FIERY_SOUL.bonusID);
    if (!this.active) {
      return;
    }

    this.addEventListener(EventType.ConsumeSoulFragments, this.onSoulFragmentsConsumed);
  }

  onSoulFragmentsConsumed(event: ConsumeSoulFragmentsEvent) {
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
