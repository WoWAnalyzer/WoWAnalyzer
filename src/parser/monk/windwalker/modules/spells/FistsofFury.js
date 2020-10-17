import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

// Inspired by the penance bolt counter module from Discipline Priest

const FISTS_OF_FURY_MINIMUM_TICK_TIME = 100; // This is to check that additional ticks aren't just hitting secondary targets

class FistsofFury extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_DAMAGE), this.onFistsDamage);
  }

  previousTickTimestamp = null;
  fistsTicks = 0;

  isNewFistsTick(timestamp) {
    return !this.previousTickTimestamp || (timestamp - this.previousTickTimestamp) > FISTS_OF_FURY_MINIMUM_TICK_TIME;
  }

  onFistsDamage(event) {
    if (!this.isNewFistsTick(event.timestamp)) {
      return;
    }
    this.fistsTicks += 1;
    this.previousTickTimestamp = event.timestamp;
  }

  get averageTicks() {
    return this.fistsTicks / this.casts;
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.FISTS_OF_FURY_CAST.id).casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTicks,
      isLessThan: {
        minor: 5,
        average: 4.75,
        major: 4.5,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<span> You are cancelling your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> casts early and losing ticks </span>)
        .icon(SPELLS.FISTS_OF_FURY_CAST.icon).actual(i18n._(t('monk.windwalker.suggestions.fistOfFury.avgTicksPerCast')`${actual.toFixed(2)} average ticks on each Fists of Fury cast`))
        .recommended(`Aim to get ${recommended} ticks with each Fists of Fury cast.`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip="Fists of Fury ticks 5 times over the duration of the channel"
      >
      <BoringSpellValueText spell={SPELLS.FISTS_OF_FURY_CAST}>
        {this.averageTicks.toFixed(2)} <small>Average ticks per cast</small>
      </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FistsofFury;
