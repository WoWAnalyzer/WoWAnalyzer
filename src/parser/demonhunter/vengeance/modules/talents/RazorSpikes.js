import React from 'react';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events from 'parser/core/Events';

const PHYSICAL_DAMAGE_INCREASE = 0.15;

class RazorSpikes extends Analyzer {
//WCL: https://www.warcraftlogs.com/reports/rz6WxLbAmTgnFXQP/#fight=3&source=3

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RAZOR_SPIKES_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event) {
    // Physical
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.DEMON_SPIKES_BUFF.id, event.timestamp)) {
      this.damage += calculateEffectiveDamage(event,PHYSICAL_DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.RAZOR_SPIKES_TALENT.id}
        position={STATISTIC_ORDER.CORE(5)}
        value={this.owner.formatItemDamageDone(this.damage)}
        tooltip={<>This shows the extra dps that the talent provides.<br /><strong>Total extra damage:</strong> {formatNumber(this.damage)}</>}
      />
    );
  }
}

export default RazorSpikes;
