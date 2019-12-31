import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';

class IceLanceNoIL extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.owner.builds.NO_IL.active;
  }

  get totalIceLanceCasts() {
    return this.abilityTracker.getAbility(SPELLS.ICE_LANCE.id).casts;
  }

  get iceLanceCastsPerMinute() {
    return this.totalIceLanceCasts / (this.owner.fightDuration / 60000);
  }

  get iceLanceNoILSuggestionThresholds() {
    return {
      actual: this.iceLanceCastsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.iceLanceNoILSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.ICE_LANCE.id} /> {this.totalIceLanceCasts} times ({formatNumber(this.iceLanceCastsPerMinute)} per minute). The whole point of playing the No Ice Lance Build is to never cast Ice Lance unless you are moving and are not able to cast anything else. If you are only casting Ice Lance while moving and your total Ice Lance casts are still high, then you are likely moving far too much.</>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(`${formatNumber(this.iceLanceCastsPerMinute)} casts per minute`)
          .recommended(`<${formatNumber(recommended)} is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={'This includes the total number of times you cast Ice Lance throughout the fight and the average casts per minute. You should aim to keep these numbers as low as possible and only cast Ice Lance when you are moving and are unable to cast anything else. If you are only casting Ice Lance while moving and these numbers are still high, then you are likely moving too much.'}
      >
        <BoringSpellValueText spell={SPELLS.ICE_LANCE}>
          {this.totalIceLanceCasts} <small>Total Casts</small><br />
          {this.iceLanceCastsPerMinute.toFixed(2)} <small>Average casts per minute</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceLanceNoIL;
