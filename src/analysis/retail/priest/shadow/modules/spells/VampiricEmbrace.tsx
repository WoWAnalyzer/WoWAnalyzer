import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AbilityTracker from '../core/AbilityTracker';

// Example log: /report/TzhG7rkfJAWP8MQp/32-Mythic+G'huun+-+Wipe+11+(8:21)/16-Constiince/changelog
class VampiricEmbrace extends Analyzer {
  static dependencies = {
    abilityTracker: DamageTracker,
  };
  protected abilityTracker!: AbilityTracker;

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.VAMPIRIC_EMBRACE.id).casts;
  }

  get healingDone() {
    return this.abilityTracker.getAbility(SPELLS.VAMPIRIC_EMBRACE_HEAL.id).healingEffective;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        tooltip={`${formatNumber(this.healingDone)} healing done in ${this.casts || 0} cast(s).`}
      >
        <BoringSpellValueText spellId={SPELLS.VAMPIRIC_EMBRACE.id}>
          <>
            <ItemHealingDone amount={this.healingDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VampiricEmbrace;
