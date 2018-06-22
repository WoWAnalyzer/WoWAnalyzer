import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

//TODO: Needs updating for BFA

class Judgment extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };
  judgmentsApplied = 0;
  judgmentsConsumed = 0;

  on_byPlayer_cast(event) {
    const enemy = this.enemies.getEntity(event);
    const spellId = event.ability.guid;

    if (!enemy) {
      return;
    }
    if (spellId === SPELLS.TEMPLARS_VERDICT.id ||
      spellId === SPELLS.DIVINE_STORM.id ||
      spellId === SPELLS.JUSTICARS_VENGEANCE_TALENT.id) {
      if (!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id)) {
        return;
      }
      this.judgmentsConsumed++;
    }
  }

  get percentageJudgmentsWasted() {
    return (this.judgmentsApplied - this.judgmentsConsumed) / this.judgmentsApplied;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.percentageJudgmentsWasted,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You're spending Holy Power outisde of the <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuff. It is optimal to only spend Holy Power while the enemy is debuffed with <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />.</React.Fragment>)
        .icon(SPELLS.JUDGMENT_DEBUFF.icon)
        .actual(`${formatNumber(this.spenderOutsideJudgment)} Holy Power spenders (${formatPercentage(1 - actual)}%) used outside of Judgment`)
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`);
    });
  }

  statistic() {
    const buffedJudgmentPercent = 1 - (this.spenderOutsideJudgment / this.totalSpender);
    const spendersInsideJudgment = this.totalSpender - this.spenderOutsideJudgment;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.JUDGMENT_DEBUFF.id} />}
        value={`${formatPercentage(buffedJudgmentPercent)}%`}
        label="Spenders inside Judgment"
        tooltip={`${spendersInsideJudgment} spenders`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default Judgment;
