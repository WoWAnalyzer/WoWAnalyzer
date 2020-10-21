import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import { formatNumber } from 'common/format';

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
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`${formatNumber(this.healingDone)} healing done in ${this.casts || 0} cast(s).`}
      >
        <BoringSpellValueText spell={SPELLS.VAMPIRIC_EMBRACE}>
          <>
            <ItemHealingDone amount={this.healingDone} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VampiricEmbrace;
