import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';

/**
 * Trailblazer increases your movement speed by 30% whenever you have not
 * attacked for 3 seconds.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */
class Trailblazer extends Analyzer {

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.TRAILBLAZER_TALENT.id);
  }

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Trailblazer
    return this.selectedCombatant.getBuffUptime(SPELLS.TRAILBLAZER_BUFF.id) /
      this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={'TALENTS'}
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
