import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class Judgment extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  templarsVerdictConsumptions = 0;
  divineStormConsumptions = 0;
  justicarsVengeanceConsumptions = 0;
  executionSentenceConsumptions = 0;
  judgmentsApplied = 0;
  wasteHP = false;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST), this.onJudgmentCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_HP_ENERGIZE), this.onJudgmentEnergize);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_DEBUFF), this.onJudgmentDebuff);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TEMPLARS_VERDICT_DAMAGE), this.onTemplarsVerdictDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_STORM_DAMAGE), this.onDivineStormDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.JUSTICARS_VENGEANCE_TALENT), this.onJusticarsVengeanceDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EXECUTION_SENTENCE_TALENT), this.onExecutionSentenceDamage);
  }

  onJudgmentDebuff(event) {
    this.judgmentsApplied += 1;
  }

  onJudgmentEnergize(event) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onJudgmentCast(event) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Judgment was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }

  onTemplarsVerdictDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    this.templarsVerdictConsumptions += 1;

  }

  onDivineStormDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    this.divineStormConsumptions += 1;
  }

  onJusticarsVengeanceDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    this.justicarsVengeanceConsumptions += 1;
  }

  onExecutionSentenceDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (!enemy.hasBuff(SPELLS.JUDGMENT_DEBUFF.id, null, 250)) {
      return;
    }
    this.executionSentenceConsumptions += 1;

  }


  get judgmentsConsumed() {
    return this.templarsVerdictConsumptions + this.divineStormConsumptions + this.justicarsVengeanceConsumptions + this.executionSentenceConsumptions;
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You're not consuming all your <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> debuffs.</>)
        .icon(SPELLS.JUDGMENT_DEBUFF.icon)
        .actual(i18n._(t('paladin.retribution.suggestions.judgement.consumed')`${formatPercentage(this.percentageJudgmentsConsumed)}% Judgments consumed`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const hasJV = this.selectedCombatant.hasTalent(SPELLS.JUSTICARS_VENGEANCE_TALENT.id);
    const hasES = this.selectedCombatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id);
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.JUDGMENT_DEBUFF.id} />}
        value={`${formatPercentage(this.percentageJudgmentsConsumed)}%`}
        label="Judgments Consumed"
        tooltip={(
          <>
            Judgments Applied: {this.judgmentsApplied}<br />
            Templars Verdicts consumptions: {this.templarsVerdictConsumptions}<br />
            Divine Storm consumptions: {this.divineStormConsumptions}
            {hasJV && <><br />Justicars Vengeance consumptions: {this.justicarsVengeanceConsumptions}</>}
            {hasES && <><br />Execution Sentence consumptions: {this.executionSentenceConsumptions}</>}
          </>
        )}
      />
    );
  }
}

export default Judgment;
