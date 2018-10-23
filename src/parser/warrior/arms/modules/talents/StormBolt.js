import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Hurls your weapon at an enemy, causing [ 16.38% of Attack Power ] Physical damage and stunning for 4 sec.
 */

class StormBolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id);
  }

  stun = 0;

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.STORM_BOLT_TALENT_DEBUFF.id) return;
    this.stun += 1;
  }

  subStatistic() {
    const stormBolt = this.abilityTracker.getAbility(SPELLS.STORM_BOLT_TALENT.id);
    const total = stormBolt.damageEffective || 0;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.STORM_BOLT_TALENT.id} /> Stun</>}
        value={formatNumber(this.stun)}
        valueTooltip={`Total Storm Bolt damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default StormBolt;