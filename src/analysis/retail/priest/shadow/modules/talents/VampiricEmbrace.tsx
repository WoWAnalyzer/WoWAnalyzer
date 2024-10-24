import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer from 'parser/core/Analyzer';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import AbilityTracker from '../core/AbilityTracker';

class VampiricEmbrace extends Analyzer {
  static dependencies = {
    abilityTracker: DamageTracker,
  };
  protected abilityTracker!: AbilityTracker;

  get casts() {
    return this.abilityTracker.getAbility(TALENTS.VAMPIRIC_EMBRACE_TALENT.id).casts;
  }

  get healingDone() {
    return this.abilityTracker.getAbilityHealing(SPELLS.VAMPIRIC_EMBRACE_HEAL.id);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatNumber(this.healingDone)} healing done in ${this.casts || 0} cast(s).`}
      >
        <BoringSpellValueText spell={TALENTS.VAMPIRIC_EMBRACE_TALENT}>
          <>
            <ItemHealingDone amount={this.healingDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VampiricEmbrace;
