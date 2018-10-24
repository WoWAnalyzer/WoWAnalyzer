import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Strikes all enemies in front of you with a sweeping attack for [ 45% of Attack Power ] Physical damage.
 * Hitting 3 or more targets inflicts Deep Wounds.
 */

class Cleave extends Analyzer {
    static dependencies = {
        abilityTracker: AbilityTracker,
      };
      
    constructor(...args) {
        super(...args);
        this.active = this.selectedCombatant.hasTalent(SPELLS.CLEAVE_TALENT.id);
    }

    subStatistic() {
        const Cleave = this.abilityTracker.getAbility(SPELLS.CLEAVE_TALENT.id);
        const total = Cleave.damageEffective || 0;
        const avg = total / (Cleave.casts || 1);
        return (
          <StatisticListBoxItem
            title={<>Average <SpellLink id={SPELLS.CLEAVE_TALENT.id} /> damage</>}
            value={formatThousands(avg)}
            valueTooltip={`Total Cleave damage: ${formatThousands(total)}`}
          />
        );
      }
}

export default Cleave;