import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class Judgment extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  templarsVerdictConsumptions = 0;
  divineStormConsumptions = 0;
  justicarsVengeanceConsumptions = 0;
  judgmentsApplied = 0;

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.JUDGMENT_DEBUFF.id) {
      return;
    }
    this.judgmentsApplied += 1;
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    const spellId = event.ability.guid;

    if (!enemy) {
      return;
    }
    if (!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    switch (spellId) {
      case SPELLS.TEMPLARS_VERDICT_DAMAGE.id:
        this.templarsVerdictConsumptions += 1;
        break;
      case SPELLS.DIVINE_STORM_DAMAGE.id:
        this.divineStormConsumptions += 1;
        break;
      case SPELLS.JUSTICARS_VENGEANCE_TALENT.id:
        this.justicarsVengeanceConsumptions += 1;
        break;
      default:
        break;
    }
  }

  get judgmentsConsumed() {
    return this.templarsVerdictConsumptions + this.divineStormConsumptions + this.justicarsVengeanceConsumptions;
  }

  get percentageJudgmentsConsumed() {
    return this.judgmentsConsumed / this.judgmentsApplied;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentageJudgmentsConsumed,
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
      return suggest(<>You're not consuming all your <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs.</>)
        .icon(SPELLS.JUDGMENT_DEBUFF.icon)
        .actual(`${formatPercentage(this.percentageJudgmentsConsumed)}% Judgments consumed`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    const justicarsVengeanceText = this.selectedCombatant.hasTalent(SPELLS.JUSTICARS_VENGEANCE_TALENT.id) ? `<br>Justicars Vengeance consumptions: ${this.justicarsVengeanceConsumptions}` : ``; 
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.JUDGMENT_DEBUFF.id} />}
        value={`${formatPercentage(this.percentageJudgmentsConsumed)}%`}
        label="Judgments Consumed"
        tooltip={`
          Judgments Applied: ${this.judgmentsApplied}<br>
          Templars Verdicts consumptions: ${this.templarsVerdictConsumptions}<br>
          Divine Storm consumptions: ${this.divineStormConsumptions}
          ${justicarsVengeanceText}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Judgment;
