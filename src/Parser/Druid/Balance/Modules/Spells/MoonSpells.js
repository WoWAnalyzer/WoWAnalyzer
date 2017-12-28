import React from 'react';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

class MoonSpells extends Analyzer {

  get availableCasts() {
    //const hasRM = combatant.hasBack(ITEMS.RADIANT_MOONLIGHT.id);
    const hasRM = false;
    const cooldown = hasRM ? 10 : 15;
    const totalFromCD = Math.floor(this.owner.fightDuration / 1000 / cooldown);
    const totalFromPull = 3;
    return totalFromCD + totalFromPull;
  }

  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;    
    const casted = abilityTracker.getAbility(SPELLS.NEW_MOON.id).casts 
                 + abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts
                 + abilityTracker.getAbility(SPELLS.FULL_MOON.id).casts;

    const percCasted = casted / this.availableCasts;

    when(percCasted).isLessThan(1)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span> Your <SpellLink id={SPELLS.NEW_MOON.id} />, <SpellLink id={SPELLS.HALF_MOON.id} /> and <SpellLink id={SPELLS.FULL_MOON.id} /> cast efficiency can be improved, try keeping yourself at low Moon charges at all times; you should (almost) never be at max (3) charges.</span>)
            .icon(SPELLS.FULL_MOON.icon)
            .actual(`${Math.round(formatPercentage(actual))}% casted`)
            .recommended(`${Math.round(formatPercentage(recommended))}% Moon spells casts is recommended`)
            .regular(recommended - 0.1).major(recommended - 0.2);
        });
  }

  statistic() {
    const abilityTracker = this.owner.modules.abilityTracker;
    const casted = abilityTracker.getAbility(SPELLS.NEW_MOON.id).casts 
                 + abilityTracker.getAbility(SPELLS.HALF_MOON.id).casts
                 + abilityTracker.getAbility(SPELLS.FULL_MOON.id).casts;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FULL_MOON.id} />}
        value={`${casted}/${this.availableCasts}`}
        label="Moon spell casts"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default MoonSpells;
