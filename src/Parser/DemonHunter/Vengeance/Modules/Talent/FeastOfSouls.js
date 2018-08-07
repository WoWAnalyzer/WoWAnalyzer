import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import { formatNumber } from 'common/format';

//WCL: https://www.warcraftlogs.com/reports/7DNACRhnaKzBfHLM/#fight=1&source=19
class FeastOfSouls extends Analyzer {

  heal = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEAST_OF_SOULS_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.FEAST_OF_SOULS_HEAL.id) {
      return;
    }
    this.heal += event.amount;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FEAST_OF_SOULS_TALENT.id} />}
        value={`${this.owner.formatItemHealingDone(this.heal)}`}
        label="Feast of Souls"
        tooltip={`This shows the extra hps that the talent provides.<br/>
                  <b>Total extra healing:</b> ${formatNumber(this.heal)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default FeastOfSouls;
