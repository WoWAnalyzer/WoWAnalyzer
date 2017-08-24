import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatThousands, formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Overhealing extends Module {
  static dependencies = {
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
    const hasSoulOfTheHighlord = this.owner.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    const hasDivinePurpose = hasSoulOfTheHighlord || this.owner.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);

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
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="inv_misc_volatilewater" />}
        value={`${formatPercentage(this.healingDone.total.overheal / this.healingDone.total.raw)} %`}
        label="Overhealing"
        tooltip={`The total overhealing done recorded was ${formatThousands(this.healingDone.total.overheal)}. Overhealing can be caused by playing poorly (such as selecting the wrong targets or casting abilities at the wrong time), other healers sniping, and/or brinding too many healers.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default Overhealing;
