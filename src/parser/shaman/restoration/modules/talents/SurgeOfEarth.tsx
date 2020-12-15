import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t, Trans } from '@lingui/macro';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

// Could maybe use some more advanced analysis
// Removes stacks of Earth Shield but doesn't log that it did
// Probably not relevant though until the legendary so why bother
class SurgeOfEarth extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilityTracker: RestorationAbilityTracker,
  };
  healing = 0;

  protected cooldownThroughputTracker!: CooldownThroughputTracker;
  protected abilityTracker!: RestorationAbilityTracker;
  maxTargets = 3;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SURGE_OF_EARTH_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_EARTH_HEAL), this._onHeal);
  }

  _onHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  get feeding() {
    return this.cooldownThroughputTracker.getIndirectHealing(SPELLS.SURGE_OF_EARTH_HEAL.id);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.SURGE_OF_EARTH_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.feeding))} %`}
      />
    );
  }

  get averageHitsPerCast() {
    const surgeCast = this.abilityTracker.getAbility(SPELLS.SURGE_OF_EARTH_TALENT.id);
    const surgeHeal = this.abilityTracker.getAbility(SPELLS.SURGE_OF_EARTH_HEAL.id);
    const casts = surgeCast.casts;
    const hits = surgeHeal.healingHits;
    return hits / casts || 0;
  }

  get numberOfCasts() {
    return this.abilityTracker.getAbility(SPELLS.SURGE_OF_EARTH_TALENT.id).casts;
  }

  suggestions(when: When) {
    const suggestionThreshold = this.suggestionThreshold;
    when(suggestionThreshold.actual).isLessThan(suggestionThreshold.isLessThan.minor)
      .addSuggestion((suggest, _actual, _recommended) => suggest(<Trans id="shaman.restoration.suggestions.aoeTargets.label">Try to always cast <SpellLink id={SPELLS.SURGE_OF_EARTH_TALENT.id} /> on groups of people, so that it heals all {this.maxTargets} potential targets.</Trans>)
          .icon(SPELLS.SURGE_OF_EARTH_TALENT.icon)
          .actual(`${suggestionThreshold.actual.toFixed(2)} ${t({
      id: "shaman.restoration.suggestions.aoeTargets.averageTargets",
      message: `average targets healed`
    })}`)
          .recommended(`>${suggestionThreshold.isLessThan.minor.toFixed(2)} ${t({
      id: "shaman.restoration.suggestions.aoeTargets.averageTargets",
      message: `average targets healed`
    })}`)
          .regular(suggestionThreshold.isLessThan.average).major(suggestionThreshold.isLessThan.average));
  }

  get suggestionThreshold() {
    return {
      actual: this.averageHitsPerCast,
      isLessThan: {
        minor: 2.6,
        average: 2.2,
        major: 1.9,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }
}

export default SurgeOfEarth;
