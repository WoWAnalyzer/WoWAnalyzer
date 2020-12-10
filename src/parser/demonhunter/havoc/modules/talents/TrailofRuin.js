import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatThousands } from 'common/format';

/**
 * Example Report: https://www.warcraftlogs.com/reports/RMPgqbz1BxpG9X8H/#fight=2&source=10
 */

class TrailofRuin extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_RUIN_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TRAIL_OF_RUIN_DAMAGE), this.trailOfRuinDot);
  }

  trailOfRuinDot(event) {
    this.damage += event.amount;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.TRAIL_OF_RUIN_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(6)}
        value={this.owner.formatItemDamageDone(this.damage)}
        tooltip={`${formatThousands(this.damage)} Total damage`}
      />
    );
  }
}

export default TrailofRuin;
