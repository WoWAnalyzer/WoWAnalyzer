import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Combatants from 'Parser/Core/Modules/Combatants';

class Overhealing extends Module {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
  };

  getRawHealing(ability) {
    return ability.healingEffective + ability.healingAbsorbed + ability.healingOverheal;
  }
  getOverhealingPercentage(ability) {
    return ability.healingOverheal / this.getRawHealing(ability);
  }

  suggestions(when) {
    const hasSoulOfTheHighlord = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    const hasDivinePurpose = hasSoulOfTheHighlord || this.combatants.selected.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);

    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const lightOfDawnHeal = getAbility(SPELLS.LIGHT_OF_DAWN_HEAL.id);
    const holyShock = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);
    const bestowFaith = getAbility(SPELLS.BESTOW_FAITH_TALENT.id);

    const recommendedLodOverhealing = hasDivinePurpose ? 0.45 : 0.4;
    when(this.getOverhealingPercentage(lightOfDawnHeal)).isGreaterThan(recommendedLodOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Save it for when people are missing health.</span>)
          .icon(SPELLS.LIGHT_OF_DAWN_CAST.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });

    const recommendedHsOverhealing = hasDivinePurpose ? 0.4 : 0.35;
    when(this.getOverhealingPercentage(holyShock)).isGreaterThan(recommendedHsOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} />. Save it for when people are missing health.</span>)
          .icon(SPELLS.HOLY_SHOCK_HEAL.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });

    const recommendedFolOverhealing = 0.25;
    when(this.getOverhealingPercentage(flashOfLight)).isGreaterThan(recommendedFolOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} />. If Flash of Light would overheal it is generally advisable to cast a <SpellLink id={SPELLS.HOLY_LIGHT.id} /> instead.</span>)
          .icon(SPELLS.FLASH_OF_LIGHT.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.25);
      });

    const recommendedBfOverhealing = 0.4;
    when(this.getOverhealingPercentage(bestowFaith)).isGreaterThan(recommendedBfOverhealing)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to avoid overhealing with <SpellLink id={SPELLS.BESTOW_FAITH_TALENT.id} />. Cast it just before someone is about to take damage and consider casting it on targets other than tanks.</span>)
          .icon(SPELLS.BESTOW_FAITH_TALENT.icon)
          .actual(`${formatPercentage(actual)}% overhealing`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });
  }
}

export default Overhealing;
