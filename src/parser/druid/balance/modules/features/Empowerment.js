import React from 'react';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import StatisticBox from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

// Abstract class used for lunar & solar empowerments.
class Empowerment extends Analyzer {
  empowermentBuff = null;
  empoweredSpell = null;
  empowermentPrefix = null;
  spellGenerateAmount = 0;
  icon = null;
  resource = RESOURCE_TYPES.ASTRAL_POWER;
  wasted = 0;
  generated = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARSURGE_MOONKIN), this.onCast);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(this.empowermentBuff), this.onApplyBuff);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(this.empowermentBuff), this.onApplyBuffStack);
  }

  onCast(event) {
    const buff = this.selectedCombatant.getBuff(this.empowermentBuff.id);
    if (!buff) {
      return;
    }
    if (buff.stacks < 3) { // Did not overcap
      return;
    }
    this.wasted += 1;
    this.generated += 1;
  }

  onApplyBuff(event) {
    this.generated += 1;
  }

  onApplyBuffStack(event) {
    this.generated += 1;
  }

  get wastedPercentage() {
    return this.wasted / this.generated;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercentage,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsInverted() {
    return {
      actual: this.wastedPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsInverted).addSuggestion((suggest, actual, recommended) => suggest(<>You overcapped {this.wasted} {this.empowermentPrefix} Empowerments by casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> while already at 3 stacks. Try to always spend your empowerments before casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> if you are not going to overcap Astral Power.</>)
        .icon(this.icon)
        .actual(i18n._(t('druid.balance.suggestions.empowerment.overcapped')`${formatPercentage(actual)}% overcapped ${this.empowermentPrefix} Empowerments`))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon={this.icon} />}
        value={`${formatPercentage(this.wastedPercentage)} %`}
        label={`Overcapped ${this.empowermentPrefix} Empowerments`}
        tooltip={`${this.wasted} out of ${this.generated} ${this.empowermentPrefix} Empowerments wasted. ${this.empowermentPrefix} Empowerment overcapping should never occur when it is possible to cast a ${this.empoweredSpell.name} without overcapping Astral Power.`}
      />
    );
  }
}

export default Empowerment;
