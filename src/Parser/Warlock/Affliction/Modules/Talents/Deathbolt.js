import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SpellLink from 'common/SpellLink';

class Deathbolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEATHBOLT_TALENT.id);
  }

  subStatistic() {
    const deathbolt = this.abilityTracker.getAbility(SPELLS.DEATHBOLT_TALENT.id);
    const total = deathbolt.damageEffective || 0;
    const avg = total / (deathbolt.casts || 1);
    return (
      <div className="flex">
        <div className="flex-main">
          Average <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} /> damage
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Total Deathbolt damage: ${formatThousands(total)}`}>
            {formatThousands(avg)}
          </dfn>
        </div>
      </div>
    );
  }
}

export default Deathbolt;
