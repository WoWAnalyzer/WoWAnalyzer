import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/HealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

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
    this.totalPossibleAbsorb += event.maxHitPoints * (this.selectedCombatant.hasTalent(SPELLS.GOOD_KARMA_TALENT.id) ? 1 : 0.5);
  }

  get absorbUsed() {
    return this.healingDone.byAbility(SPELLS.TOUCH_OF_KARMA_CAST.id).effective / this.totalPossibleAbsorb;
  }

  get suggestionThresholds() {
    return {
      actual: this.absorbUsed,
      isLessThan: {
        minor: 0.8,
        average: 0.65,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<> You consumed a low amount of your total <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> absorb. It's best used when you can take enough damage to consume most of the absorb. Getting full absorb usage shouldn't be expected on lower difficulty encounters </>)
        .icon(SPELLS.TOUCH_OF_KARMA_CAST.icon)
        .actual(`${formatPercentage(actual)}% Touch of Karma absorb used`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(2)}
        icon={<SpellIcon id={SPELLS.TOUCH_OF_KARMA_CAST.id} />}
        value={`${formatPercentage(this.absorbUsed)}%`}
        label="Touch of Karma Absorb used"
        tooltip="This does not account for possible absorbs from missed Touch of Karma casts"
      />
    );
  }
}

export default TouchOfKarma;
