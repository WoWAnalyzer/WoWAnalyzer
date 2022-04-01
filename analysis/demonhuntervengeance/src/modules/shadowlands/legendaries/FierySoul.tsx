import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

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

  totalCooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.FIERY_SOUL);
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
      this.totalCooldownReduction += this.spellUsable.reduceCooldown(
        SPELLS.FIERY_BRAND.id,
        event.numberofSoulFragmentsConsumed * COOLDOWN_REDUCTION,
      );
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={SPELLS.FIERY_SOUL.id}>
          <>
            {Math.floor(this.totalCooldownReduction / 1000)}s{' '}
            <small>of Fiery Brand cooldown reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FierySoul;
