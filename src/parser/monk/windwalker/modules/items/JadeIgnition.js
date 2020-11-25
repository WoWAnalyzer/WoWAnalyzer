import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import Events from 'parser/core/Events';

const MAX_STACKS = 30;

class JadeIgnition extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  totalStacks = 0;
  currentStacks = 0;
  stacksWasted = 0;
  damage = 0;
  buffedCast = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.JADE_IGNITION.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.JADE_IGNITION_BUFF), this.applyBuff);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.JADE_IGNITION_BUFF), this.applyBuffStack);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_CAST), this.castFistsOfFury);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK), this.castSpinningCraneKick);
  }

  applyBuff() {
    this.totalStacks += 1;
    this.currentStacks += 1;
  }

  applyBuffStack() {
    this.totalStacks += 1;
    this.currentStacks += 1;
   }

  castFistsOfFury() {
    if (this.currentStacks === MAX_STACKS) {
      this.stacksWasted += 1;
    }
  }

  castSpinningCraneKick() {
    if (this.currentStacks > 0) {
      this.buffedCast = true;
      this.currentStacks = 0;
    }
  }

  get damageDone () {
    return this.abilityTracker.getAbility(SPELLS.JADE_IGNITION_DAMAGE.id).damageEffective;
  }

  get stackUsage() {
    return 1 - (this.stacksWasted / this.totalStacks);
  }

  get suggestionThresholds() {
    return {
      actual: this.stackUsage,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.JADE_IGNITION}>
          <ItemDamageDone amount={this.damageDone} />
					<br />
					{formatPercentage(this.stackUsage, 0)}% <small>Stacks used</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      suggest(<Trans> You wasted your <SpellLink id={SPELLS.JADE_IGNITION_BUFF.id}/> stacks by using Fists of Fury at full stacks</Trans>)
        .icon(SPELLS.JADE_IGNITION.icon)
        .actual(`${formatPercentage(actual, 0)}% Stacks used`)
        .recommended(`${formatPercentage(recommended, 0)}% Stacks used is recommended`)
    });
  }
}

export default JadeIgnition;
