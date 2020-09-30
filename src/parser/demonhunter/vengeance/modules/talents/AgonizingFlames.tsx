import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';

const PERCENT_BUFF = 0.20;
const DAMAGE_SPELLS = [SPELLS.IMMOLATION_AURA_FIRST_STRIKE, SPELLS.IMMOLATION_AURA_BUFF];

//WCL: https://www.warcraftlogs.com/reports/JxyY7HCDcjqMA9tf/#fight=1&source=15
class AgonizingFlames extends Analyzer {

  damage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AGONIZING_FLAMES_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS), this.onImmoAuraDamage);
  }

  onImmoAuraDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, PERCENT_BUFF);
  }

  statistic() {
    return (
      <TalentStatisticBox
        label={undefined} // TODO replace with Statistic
        icon={undefined}
        talent={SPELLS.AGONIZING_FLAMES_TALENT.id}
        position={STATISTIC_ORDER.CORE(9)}
        value={this.owner.formatItemDamageDone(this.damage)}
        tooltip={<>This shows the extra dps that the talent provides.<br /><strong>Total extra damage:</strong> {formatNumber(this.damage)}</>}
      />
    );
  }
}

export default AgonizingFlames;
