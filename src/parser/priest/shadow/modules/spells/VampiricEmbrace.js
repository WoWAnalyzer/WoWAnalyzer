import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import DamageTracker from 'parser/shared/modules/AbilityTracker';
import { formatNumber } from 'common/format';

class VampiricEmbrace extends Analyzer {
  static dependencies = {
    abilityTracker: DamageTracker,
  };

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.VAMPIRIC_EMBRACE.id).casts;
  }

  get healingDone() {
    return this.abilityTracker.getAbility(SPELLS.VAMPIRIC_EMBRACE_HEAL.id).healingEffective;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(3)}
        icon={<SpellIcon id={SPELLS.VAMPIRIC_EMBRACE.id} />}
        value={<ItemHealingDone amount={this.healingDone} />}
        label="Vampiric Embrace healing"
        tooltip={`${formatNumber(this.healingDone)} healing done in ${this.casts} cast(s).`}
      />
    );
  }
}

export default VampiricEmbrace;
