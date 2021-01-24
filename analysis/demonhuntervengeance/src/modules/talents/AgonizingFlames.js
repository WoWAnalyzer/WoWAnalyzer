import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'parser/ui/TalentStatisticBox';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events from 'parser/core/Events';

const PERCENT_BUFF = 0.20;

//WCL: https://www.warcraftlogs.com/reports/JxyY7HCDcjqMA9tf/#fight=1&source=15
class AgonizingFlames extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AGONIZING_FLAMES_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE, SPELLS.IMMOLATION_AURA]), this.onDamage);
  }

  onDamage(event) {
    this.damage += calculateEffectiveDamage(event, PERCENT_BUFF);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.AGONIZING_FLAMES_TALENT.id}
        position={STATISTIC_ORDER.CORE(9)}
        value={this.owner.formatItemDamageDone(this.damage)}
        tooltip={<>This shows the extra dps that the talent provides.<br /><strong>Total extra damage:</strong> {formatNumber(this.damage)}</>}
      />
    );
  }
}

export default AgonizingFlames;
