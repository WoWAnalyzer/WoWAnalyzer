import React from 'react';

import { t } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import WoundTracker from './WoundTracker';

class ScourgeStrikeEfficiency extends Analyzer {
  static dependencies = {
    woundTracker: WoundTracker,
  };

  protected woundTracker!: WoundTracker;

  constructor(options: Options) {
    super(options);
    this.activeSpell = this.selectedCombatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id) ? SPELLS.CLAWING_SHADOWS_TALENT : SPELLS.SCOURGE_STRIKE;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell), this.onCast);
  }

  activeSpell: Spell;
  totalCasts = 0;
  zeroWoundCasts = 0;

  onCast(event: CastEvent) {
    this.totalCasts += 1;
    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    if (this.woundTracker.targets[targetString]) {
      const currentTargetWounds = this.woundTracker.targets[targetString];
      if (currentTargetWounds < 1) {
        this.zeroWoundCasts += 1;
      }
    } else {
      this.zeroWoundCasts += 1;
    }
  }

  get strikeEfficiency() {
    return 1 - (this.zeroWoundCasts / this.totalCasts);
  }

  get suggestionThresholds() {
    return {
      actual: this.strikeEfficiency,
      isLessThan: {
        minor: .80,
        average: .70,
        major: .60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You are casting <SpellLink id={this.activeSpell.id} /> too often. When spending runes remember to cast <SpellLink id={this.activeSpell.id} /> instead on targets with no stacks of <SpellLink id={this.activeSpell.id} /></>)
        .icon(this.activeSpell.icon)
        .actual(t({
      id: "deathknight.unholy.suggestions.scourgeStrike.efficiency",
      message: `${formatPercentage(actual)}% of ${this.activeSpell.name} were used with Wounds on the target`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.zeroWoundCasts} out of ${this.totalCasts} ${this.activeSpell.name} were used with no Festering Wounds on the target.`}
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SCOURGE_STRIKE}>
          <>
            {formatPercentage(this.strikeEfficiency)}% <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScourgeStrikeEfficiency;
