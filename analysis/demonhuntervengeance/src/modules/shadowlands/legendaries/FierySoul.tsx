import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
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
  totalCooldownReduction = 0;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(DH_LEGENDARIES.FIERY_SOUL);
    if (!this.active) {
      return;
    }

    this.addEventListener(EventType.ConsumeSoulFragments, this.onSoulFragmentsConsumed);
  }

  onSoulFragmentsConsumed(event: ConsumeSoulFragmentsEvent) {
    if (event.spellId !== DH_SPELLS.SOUL_CLEAVE.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(DH_SPELLS.FIERY_BRAND.id)) {
      this.totalCooldownReduction += this.spellUsable.reduceCooldown(
        DH_SPELLS.FIERY_BRAND.id,
        event.numberofSoulFragmentsConsumed * COOLDOWN_REDUCTION,
      );
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={DH_LEGENDARIES.FIERY_SOUL.id}>
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
