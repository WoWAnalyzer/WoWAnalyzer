import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands } from 'common/format';

/**
 * Example Report: https://www.warcraftlogs.com/reports/AZMDnzrG48KJLgP6/#fight=1&source=1
 */

class FelMastery extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEL_MASTERY_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_RUSH_DAMAGE), this.felRushExtraDamage);
  }

  //Since fel mastery doubles the damage of fel rush, halfing the damage to get the talent damage part.
  felRushExtraDamage(event) {
    this.damage += event.amount / 2;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.FEL_MASTERY_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={this.owner.formatItemDamageDone(this.damage)}
        tooltip={(
          <>
            {formatThousands(this.damage)} Total damage <br /> <br />
            This shows the extra damage done by Fel Rush due to the Fel Mastery talent.
          </>
        )}

      />
    );
  }
}

export default FelMastery;
