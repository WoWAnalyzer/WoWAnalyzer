import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const TWIST_OF_FATE_INCREASE = 1.1;

// Example log: /report/9fLF3NhHTqCBtmXy/10-Normal+Zul+-+Kill+(2:26)/7-Nospheratu
class TwistOfFate extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIST_OF_FATE_TALENT_SHADOW.id);
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    const raw = event.amount + (event.absorbed || 0);
    this.damage += raw - raw / TWIST_OF_FATE_INCREASE;
  }

  statistic() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.TWIST_OF_FATE_BUFF.id) / this.owner.fightDuration;
    return (
      <TalentStatisticBox
        talent={SPELLS.TWIST_OF_FATE_TALENT_SHADOW.id}
        value={<ItemDamageDone amount={this.damage} />}
        tooltip={`${formatPercentage(uptime)}% uptime`}
        position={STATISTIC_ORDER.CORE(1)}
      />
    );
  }
}

export default TwistOfFate;
