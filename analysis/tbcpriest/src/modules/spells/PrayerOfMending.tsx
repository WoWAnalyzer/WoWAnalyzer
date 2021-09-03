import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticBox from 'parser/ui/StatisticBox';
import React from 'react';

import * as SPELLS from '../../SPELLS';

class PrayerOfMending extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  currentStacks = 0;
  completelyWastedCasts = 0;
  perfectCasts = 0;

  get castCount() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_MENDING).casts;
  }

  get healCount() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_MENDING_HEAL).healingHits;
  }

  get wastedStacks() {
    return this.castCount * 5 - this.healCount;
  }

  get effectiveHealing() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_MENDING_HEAL).healingEffective;
  }

  get overhealing() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_MENDING_HEAL).healingOverheal;
  }

  get prayerOfMendingThreshold() {
    return {
      actual: this.completelyWastedCasts,
      isGreaterThan: {
        minor: 1,
        average: 5,
        major: 10,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([{ id: SPELLS.PRAYER_OF_MENDING }]),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([{ id: SPELLS.PRAYER_OF_MENDING_HEAL }]),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    if (this.currentStacks === 5) {
      this.completelyWastedCasts += 1;
    }
    if (this.currentStacks === 0) {
      this.perfectCasts += 1;
    }

    this.currentStacks = 5;
  }

  onHeal(event: HealEvent) {
    this.currentStacks -= 1;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellLink id={SPELLS.PRAYER_OF_MENDING} />}
        value={<ItemHealingDone amount={this.effectiveHealing} />}
        tooltip={
          <>
            Healing Done: {formatNumber(this.effectiveHealing)} (
            {formatPercentage(this.overhealing / (this.overhealing + this.effectiveHealing))}% OH)
            <br />
            Overwritten Stacks: {this.wastedStacks}
            <br />
            Completely Wasted Casts: {this.completelyWastedCasts}
            <br />
            Perfect Casts: {this.perfectCasts}
            <br />
            Total Casts: {this.castCount}
          </>
        }
      />
    );
  }

  suggestions(when: When) {
    when(this.prayerOfMendingThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should not cast <SpellLink id={SPELLS.PRAYER_OF_MENDING} /> when there is already an
          active prayer of mending with 5 stacks.
        </>,
      )
        .icon('spell_holy_prayerofmendingtga')
        .actual(
          <>
            You overwrote a 5 stack of <SpellLink id={SPELLS.PRAYER_OF_MENDING} /> {actual} times.
          </>,
        )
        .recommended(
          `You can't have more than one prayer of mending active at a time, this isn't retail!`,
        ),
    );
  }
}

export default PrayerOfMending;
