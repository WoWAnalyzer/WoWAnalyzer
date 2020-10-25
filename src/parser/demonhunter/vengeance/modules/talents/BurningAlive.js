import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events from 'parser/core/Events';

//WCL: https://www.warcraftlogs.com/reports/JxyY7HCDcjqMA9tf/#fight=1&source=15
class BurningAlive extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BURNING_ALIVE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIERY_BRAND_DOT), this.onDamage);
  }

  onDamage(event) {
    this.damage += event.amount;
  }
  
  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BURNING_ALIVE_TALENT.id}
        position={STATISTIC_ORDER.CORE(10)}
        value={this.owner.formatItemDamageDone(this.damage)}
        tooltip={<>This shows the extra dps that the talent provides.<br /><strong>Total extra damage:</strong> {formatNumber(this.damage)}</>}
      />
    );
  }
}

export default BurningAlive;
