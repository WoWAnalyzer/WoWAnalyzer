import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber, formatThousands } from 'common/format';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const DIVINITY_HEALING_INCREASE = 0.15;

class Divinity extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DIVINITY_TALENT.id);
  }

  on_byPlayer_heal(event) {
    this.parseHeal(event);
  }

  on_byPlayer_absorbed(event) {
    this.parseHeal(event);
  }

  parseHeal(event) {
    const spellId = event.ability.guid;
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }

    if (!this.combatants.selected.hasBuff(SPELLS.DIVINITY_BUFF.id, event.timestamp)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, DIVINITY_HEALING_INCREASE);
  }

  statistic() {
    //
    return this.active && (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIVINITY_TALENT.id} />}
        value={`${((this.combatants.selected.getBuffUptime(SPELLS.DIVINITY_BUFF.id) / this.owner.fightDuration) * 100).toFixed(1)} %`}
        label={(
          <dfn data-tip={`The effective healing contributed by Divinity was ${formatThousands(this.healing)} / ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} % / ${formatNumber(this.healing / this.owner.fightDuration * 1000)} HPS.`}>
            Divinity uptime
          </dfn>
        )}
      />
    );
    //
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Divinity;
