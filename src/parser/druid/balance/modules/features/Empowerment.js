import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { t } from '@lingui/macro';
import BoringValue from 'interface/statistics/components/BoringValueText';
import SpellIcon from 'common/SpellIcon';

// Abstract class used for lunar & solar empowerments.
class Empowerment extends Analyzer {
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

  empowermentBuff = null;
  empoweredSpell = null;
  empowermentPrefix = null;
  spellGenerateAmount = 0;
  icon = null;
  resource = RESOURCE_TYPES.ASTRAL_POWER;
  wasted = 0;
  generated = 0;

  constructor(options) {
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

  suggestions(when) {
    when(this.suggestionThresholdsInverted).addSuggestion((suggest, actual, recommended) => suggest(<>You overcapped {this.wasted} {this.empowermentPrefix} Empowerments by casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> while already at 3 stacks. Try to always spend your empowerments before casting <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> if you are not going to overcap Astral Power.</>)
      .icon(this.icon)
      .actual(t({
      id: "druid.balance.suggestions.empowerment.overcapped",
      message: `${formatPercentage(actual)}% overcapped ${this.empowermentPrefix} Empowerments`
    }))
      .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`${this.wasted} out of ${this.generated} ${this.empowermentPrefix} Empowerments wasted. ${this.empowermentPrefix} Empowerment overcapping should never occur when it is possible to cast a ${this.empoweredSpell.name} without overcapping Astral Power.`}
      >
        <BoringValue label={<>Overcapped <SpellIcon id={this.empoweredSpell.id} /> {this.empowermentPrefix} Empowerments </>}>
          <>
            {formatPercentage(this.wastedPercentage)} % <small>wasted</small>
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Empowerment;
