import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const HOLY_AVENGER_HASTE_INCREASE = 0.3;
const HOLY_AVENGER_HOLY_SHOCK_HEALING_INCREASE = 0.3;

/**
 * Calculating Holy Avenger healing contribution is hard.
 *
 * What this does is add 30% of all effective healing and 30% of Holy Shock effective healing for the total healing contributed by Holy Avenger. There is no checking for GCDs missed or whatever since the assumption is that you still cast 30% more spells than you normally would, and normally you'd also have missed GCDs.
 *
 * This healing gain from the Haste is kinda undervalued since Haste gains are calculated in-game with <code>CurrentHaste * (1 + HasteBonus) + HasteBonus</code>. Here all I include is the absolute Haste bonus, not the relative bonus since it's hard to calculate.
 *
 * This statistic can see high numbers if Holy Avenger is paired with Avenging Wrath and/or AoS Aura Masatery. **This is perfectly right.** Those spells increase the ST/cleave healing you do and work nicely with a Haste increaser that increases the amount of heals you can do in that short period of time. But stacking HA with AW/AM may still not be best when you look at the overall fight, as spread out cooldowns often still provide more effective healing.
 */
class HolyAvenger extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  regularHealing = 0;
  holyShockHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id);
  }

  on_byPlayer_heal(event) {
    if (this.combatants.selected.hasBuff(SPELLS.HOLY_AVENGER_TALENT.id, event.timestamp)) {
      const effectiveHealing = (event.amount + (event.absorbed || 0));
      this.regularHealing += effectiveHealing - effectiveHealing / (1 + HOLY_AVENGER_HASTE_INCREASE);

      const spellId = event.ability.guid;
      if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
        this.holyShockHealing += calculateEffectiveHealing(event, HOLY_AVENGER_HOLY_SHOCK_HEALING_INCREASE);
      }
    }
  }
  on_beacon_heal(event) {
    if (this.combatants.selected.hasBuff(SPELLS.HOLY_AVENGER_TALENT.id, event.originalHeal.timestamp)) {
      const effectiveHealing = (event.amount + (event.absorbed || 0));
      this.regularHealing += effectiveHealing - effectiveHealing / (1 + HOLY_AVENGER_HASTE_INCREASE);

      const spellId = event.originalHeal.ability.guid;
      if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
        this.holyShockHealing += calculateEffectiveHealing(event, HOLY_AVENGER_HOLY_SHOCK_HEALING_INCREASE);
      }
    }
  }

  statistic() {
    const totalHealing = this.regularHealing + this.holyShockHealing;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_AVENGER_TALENT.id} />}
        value={`≈${formatNumber(totalHealing / this.owner.fightDuration * 1000)} HPS`}
        label="Estimated healing"
        tooltip={`
          Calculating Holy Avenger healing contribution is hard.<br /><br />

          What this does is add 30% of all effective healing and 30% of Holy Shock effective healing for the total healing contributed by Holy Avenger. There is no checking for GCDs missed or whatever since the assumption is that you still cast 30% more spells than you normally would, and normally you'd also have missed GCDs.<br /><br />

          This healing gain from the Haste is kinda undervalued since Haste gains are calculated in-game with <code>CurrentHaste * (1 + HasteBonus) + HasteBonus</code>. Here all I include is the absolute Haste bonus, not the relative bonus since it's very hard to calculate.<br /><br />

          This statistic can see high numbers if Holy Avenger is paired with Avenging Wrath and/or AoS Aura Masatery. **This is perfectly right.** Those spells increase the ST/cleave healing you do and work nicely with a Haste increaser that increases the amount of heals you can do in that short period of time. But stacking HA with AW/AM may still not be best when you look at the overall fight, as spread out cooldowns often still provide more effective healing.
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(75);
}

export default HolyAvenger;
