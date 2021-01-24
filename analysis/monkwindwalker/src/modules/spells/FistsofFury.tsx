import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

// Inspired by the penance bolt counter module from Discipline Priest

const FISTS_OF_FURY_MINIMUM_TICK_TIME = 100; // This is to check that additional ticks aren't just hitting secondary targets

class FistsofFury extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  previousTickTimestamp = 0;
  fistsTicks = 0;

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_DAMAGE), this.onFistsDamage);
  }

  isNewFistsTick(timestamp: number) {
    return !this.previousTickTimestamp || (timestamp - this.previousTickTimestamp) > FISTS_OF_FURY_MINIMUM_TICK_TIME;
  }

  onFistsDamage(event: DamageEvent) {
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
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<span> You are cancelling your <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> casts early and losing ticks </span>)
      .icon(SPELLS.FISTS_OF_FURY_CAST.icon).actual(t({
      id: "monk.windwalker.suggestions.fistOfFury.avgTicksPerCast",
      message: `${actual.toFixed(2)} average ticks on each Fists of Fury cast`
    }))
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
