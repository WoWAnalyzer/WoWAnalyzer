import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import StatisticBox from 'parser/ui/StatisticBox';
import React from 'react';

import * as SPELLS from '../../SPELLS';

class PrayerOfHealing extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  get castCount() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_HEALING).casts;
  }

  get healCount() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_HEALING).healingHits;
  }

  get averageHits() {
    const castCount = this.castCount === 0 ? 1 : this.castCount;
    return this.healCount / castCount;
  }

  get effectiveHealing() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_HEALING).healingEffective;
  }

  get overhealing() {
    return this.abilityTracker.getAbility(SPELLS.PRAYER_OF_HEALING).healingOverheal;
  }

  get circleOfHealingThreshold() {
    return {
      actual: this.castCount === 0 ? 5 : this.averageHits,
      isLessThan: {
        minor: 3,
        average: 2,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (this.castCount === 0) {
      return null;
    }
    return (
      <StatisticBox
        icon={<SpellLink id={SPELLS.PRAYER_OF_HEALING} />}
        value={<ItemHealingDone amount={this.effectiveHealing} />}
        tooltip={
          <>
            Healing Done: {formatNumber(this.effectiveHealing)} (
            {formatPercentage(this.overhealing / (this.overhealing + this.effectiveHealing))}% OH)
            <br />
            Average targets hit: {this.averageHits}
            <br />
            Total Casts: {this.castCount}
            <br />
            Total Hits: {this.healCount}
          </>
        }
      />
    );
  }

  suggestions(when: When) {
    when(this.circleOfHealingThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should not cast <SpellLink id={SPELLS.PRAYER_OF_HEALING} /> when it would hit less
          than 3 targets.
        </>,
      )
        .icon('spell_holy_prayerofhealing02')
        .actual(
          <>
            You hit an average of {this.averageHits} targets with{' '}
            <SpellLink id={SPELLS.PRAYER_OF_HEALING} />.
          </>,
        )
        .recommended(`You should try to hit 5 targets every time you cast CoH`),
    );
  }
}

export default PrayerOfHealing;
