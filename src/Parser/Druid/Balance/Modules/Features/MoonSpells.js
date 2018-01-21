import React from 'react';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

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

  get percentageCasted(){
    return this.totalCasts / this.availableCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentageCasted,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.85,
      },
      style: 'percentage',
    };
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
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default MoonSpells;
