import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Wrapper from 'common/Wrapper';

class TouchOfKarma extends Analyzer {
	static dependencies = {
    healingDone: HealingDone,
  };
  totalPossibleAbsorb = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TOUCH_OF_KARMA_CAST.id !== spellId){
      return;
    }
    this.totalPossibleAbsorb += event.maxHitPoints * 0.5;
  }

  get suggestionThresholds() {
    const absorbUsed = this.healingDone.byAbility(SPELLS.TOUCH_OF_KARMA_CAST.id).effective / this.totalPossibleAbsorb;
    return {
      actual: absorbUsed,
      isLessThan: {
        minor: 0.8,
        average: 0.65,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const absorbUsed = this.healingDone.byAbility(SPELLS.TOUCH_OF_KARMA_CAST.id).effective / this.totalPossibleAbsorb;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper> You consumed a low amount of your total <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> absorb. It's best used when you can take enough damage to consume most of the absorb. Getting full absorb usage shouldn't be expected on lower difficulty encounters </Wrapper>)
        .icon(SPELLS.TOUCH_OF_KARMA_CAST.icon)
        .actual(`${formatPercentage(absorbUsed)}% Touch of Karma absorb used`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    const absorbUsed = this.healingDone.byAbility(SPELLS.TOUCH_OF_KARMA_CAST.id).effective / this.totalPossibleAbsorb;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TOUCH_OF_KARMA_CAST.id} />}
        value={`${formatPercentage(absorbUsed)}%`}
        label={`Touch of Karma Absorb used`}
        tooltip={`This does not account for possible absorbs from missed Touch of Karma casts`}
        />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default TouchOfKarma;
