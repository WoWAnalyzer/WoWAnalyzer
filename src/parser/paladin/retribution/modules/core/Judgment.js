import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const JUDGMENT_DURATION = 15000;

const HOLY_POWER_ATTACKS = [SPELLS.TEMPLARS_VERDICT_DAMAGE.id, SPELLS.DIVINE_STORM_DAMAGE.id, SPELLS.JUSTICARS_VENGEANCE_TALENT.id];

class Judgment extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  templarsVerdictConsumptions = 0;
  divineStormConsumptions = 0;
  justicarsVengeanceConsumptions = 0;
  judgmentsApplied = 0;
  judgmentsOverwritten = 0;
  judgmentTargets = [];

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.JUDGMENT_DEBUFF.id) {
      return;
    }
    // The event doesn't specify instance on the first target of that type
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    this.judgmentsApplied += 1;
    const judgmentTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    this.judgmentTargets.push(judgmentTarget);
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.JUDGMENT_DEBUFF.id) {
      return;
    }
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    this.judgmentsOverwritten += 1;
    this.judgmentTargets.forEach((judgmentTarget, index) => {
      if (judgmentTarget.targetID === event.targetID && judgmentTarget.targetInstance === targetInstance) {
        judgmentTarget.timestamp = event.timestamp;
      }
    });
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!HOLY_POWER_ATTACKS.includes(spellId)) {
      return;
    }
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    this.judgmentTargets.forEach((judgmentTarget, index) => {
      // remove expired judgments
      const expirationTimestamp = judgmentTarget.timestamp + JUDGMENT_DURATION;
      if (expirationTimestamp < event.timestamp) {
        this.judgmentTargets.splice(index, 1);
      }
      if (judgmentTarget.targetID === event.targetID && judgmentTarget.targetInstance === targetInstance) {
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
        this.judgmentTargets.splice(index, 1);
      }
    });
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
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.JUDGMENT_DEBUFF.id} />}
        value={`${formatPercentage(this.percentageJudgmentsConsumed)}%`}
        label="Judgments Consumed"
        tooltip={`
          Judgments Applied: ${this.judgmentsApplied}<br>
          Templars Verdicts Consumptions: ${this.templarsVerdictConsumptions}<br>
          Divine Storm Consumptions: ${this.divineStormConsumptions}
          ${justicarsVengeanceText}<br>
          Judgments Overwritten: ${this.judgmentsOverwritten}`}
      />
    );
  }
}

export default Judgment;
