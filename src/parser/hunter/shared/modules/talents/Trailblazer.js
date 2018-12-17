import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

/**
 * Trailblazer increases your movement speed by 30% whenever you have not attacked for 3 seconds.
 *
 * Example log: https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */
class Trailblazer extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAILBLAZER_TALENT.id);
  }

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Trailblazer
    return this.selectedCombatant.getBuffUptime(SPELLS.TRAILBLAZER_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.TRAILBLAZER_TALENT.id}
         value={`${formatPercentage(this.percentUptime)}% uptime`}
      />
    );
  }
}

export default Trailblazer;
