import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';

/**
 * Trailblazer increases your movement speed by 30% whenever you have not
 * attacked for 3 seconds.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/1YZkWvbFGNgTA7L4#fight=3&type=summary&source=97
 */
class Trailblazer extends Analyzer {

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAILBLAZER_TALENT.id);
  }

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TRAILBLAZER_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.TRAILBLAZER_TALENT}>
          <>
            <UptimeIcon /> {formatPercentage(this.percentUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Trailblazer;
