import React from 'react';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class MoonSpells extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };
  get availableCasts() {
    const hasRM = this.combatants.selected.hasBack(ITEMS.RADIANT_MOONLIGHT.id);
    const cooldown = hasRM ? 7.5 : 15;
    const totalFromCD = Math.floor(this.owner.fightDuration / 1000 / cooldown);
    const totalFromPull = 3;
    return totalFromCD + totalFromPull;
  }

  get totalCasts() {
    return this.abilityTracker.getAbility(SPELLS.NEW_MOON.id).casts 
         + this.abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts
         + this.abilityTracker.getAbility(SPELLS.FULL_MOON.id).casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalCasts / this.availableCasts,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {   
    const percCasted = this.totalCasts / this.availableCasts;
    when(percCasted).isLessThan(0.98)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper> Your <SpellLink id={SPELLS.NEW_MOON.id} />, <SpellLink id={SPELLS.HALF_MOON.id} /> and <SpellLink id={SPELLS.FULL_MOON.id} /> cast efficiency can be improved, try keeping yourself at low Moon charges at all times; you should (almost) never be at max (3) charges.</Wrapper>)
            .icon(SPELLS.FULL_MOON.icon)
            .actual(`${Math.round(formatPercentage(actual))}% casted`)
            .recommended(`${Math.round(formatPercentage(recommended))}% Moon spells casts is recommended`)
            .regular(0.95).major(0.9);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FULL_MOON.id} />}
        value={`${this.totalCasts}/${this.availableCasts}`}
        label="Moon spell casts"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default MoonSpells;
