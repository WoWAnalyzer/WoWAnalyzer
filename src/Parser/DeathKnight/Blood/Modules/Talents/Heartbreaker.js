import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const RP_RESOURCE_ID = 6;

class Heartbreaker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rpGains = [];
  hsCasts = 0;
  deathStrikeCost = 45;

  on_initialized() {
    if (this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id)) {
      this.deathStrikeCost -= 5;
    }
    this.active = this.combatants.selected.hasTalent(SPELLS.HEARTBREAKER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.HEART_STRIKE.id) {
      return;
    }
    this.hsCasts += 1;
  }

  on_energize(event) {
    if (event.ability.guid !== SPELLS.HEARTBREAKER.id || event.resourceChangeType !== RP_RESOURCE_ID) {
      return;
    }
    this.rpGains.push(event.resourceChange);
  }

  get totalRPGained() {
    return this.rpGains.reduce((a, b) => a + b, 0);
  }

  get averageHearStrikeHits() {
    return (this.rpGains.length / this.hsCasts).toFixed(2);
  }

  get averageHitSuggestionThresholds() {
    return {
      actual: this.averageHearStrikeHits,
      isLessThan: {
        minor: 4,
        average: 2.5,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.averageHitSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment><SpellLink id={SPELLS.HEARTBREAKER_TALENT.id} /> relies heavily on the amount of targets you can hit with <SpellLink id={SPELLS.HEART_STRIKE.id} /> to perform on par with <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} />. Consider picking <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} /> if you can't hit reliable multiple (4+) targets.</React.Fragment>)
            .icon(SPELLS.HEARTBREAKER_TALENT.icon)
            .actual(`on average ${actual} targets hit with Heart Strike`)
            .recommended(`>${recommended} is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEARTBREAKER_TALENT.id} />}
        value={`${this.totalRPGained} PR`}
        label="gained"
        tooltip={`
          Resulting in about ${Math.floor(this.totalRPGained / this.deathStrikeCost)} extra Death Strikes.<br/>
          Your Heart Strike hit on average ${this.averageHearStrikeHits} targets.
        `}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default Heartbreaker;
