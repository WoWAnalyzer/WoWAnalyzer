import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

import { TWIST_OF_FATE_INCREASE } from '../../constants';

// Example log: /report/9fLF3NhHTqCBtmXy/10-Normal+Zul+-+Kill+(2:26)/7-Nospheratu
class TwistOfFate extends Analyzer {
  damage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIST_OF_FATE_TALENT_SHADOW.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TWIST_OF_FATE_BUFF.id, event.timestamp)) {
      return;
    }

    const raw = event.amount + (event.absorbed || 0);
    this.damage += raw - raw / TWIST_OF_FATE_INCREASE;
  }

  statistic() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.TWIST_OF_FATE_BUFF.id) / this.owner.fightDuration;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatPercentage(uptime)}% uptime`}
      >
        <BoringSpellValueText spell={SPELLS.TWIST_OF_FATE_BUFF}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TwistOfFate;
