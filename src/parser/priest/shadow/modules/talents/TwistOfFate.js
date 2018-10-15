import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'interface/others/SmallStatisticBox';

class TwistOfFate extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIST_OF_FATE_TALENT_SHADOW.id);
  }

  statistic() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.TWIST_OF_FATE_BUFF.id) / this.owner.fightDuration;
    return (
      <SmallStatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.TWIST_OF_FATE_BUFF.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="Twist of Fate uptime"
      />
    );
  }
}

export default TwistOfFate;
