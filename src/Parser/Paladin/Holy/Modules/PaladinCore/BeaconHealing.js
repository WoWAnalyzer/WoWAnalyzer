import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Abilities from '../Features/Abilities';
import PaladinAbilityTracker from '../PaladinCore/PaladinAbilityTracker';

class BeaconHealing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: PaladinAbilityTracker,
  };

  get totalHealsOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = spellId => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    Abilities.ABILITIES
      .filter(ability => ability.isActive === undefined || ability.isActive(this.combatants.selected))
      .filter(ability => ability.category !== Abilities.SPELL_CATEGORIES.ITEMS)
      .forEach((ability) => {
        const castCount = getCastCount(ability.spell.id);
        casts += castCount.healingHits || 0;
        castsOnBeacon += castCount.healingBeaconHits || 0;
      });

    return castsOnBeacon / casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalHealsOnBeaconPercentage,
      isGreaterThan: true,
      minor: 0.2,
      average: 0.25,
      major: 0.35,
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds.actual).isGreaterThan(this.suggestionThresholds.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You cast a lot of direct heals on beacon targets. Direct healing beacon targets is inefficient. Try to only cast on beacon targets when they would otherwise die.')
          .icon('ability_paladin_beaconoflight')
          .actual(`${formatPercentage(actual)}% of all your healing spell casts were on a beacon target`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.average).major(this.suggestionThresholds.major);
      });
  }
  statistic() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const totalFolsAndHls = flashOfLightHeals + holyLightHeals;

    const beaconFlashOfLights = flashOfLight.healingBeaconHits || 0;
    const beaconHolyLights = holyLight.healingBeaconHits || 0;
    const totalFolsAndHlsOnBeacon = beaconFlashOfLights + beaconHolyLights;
    const totalHealsOnBeaconPercentage = this.totalHealsOnBeaconPercentage;

    return (
      <StatisticBox
        icon={<SpellIcon id={this.combatants.selected.lv100Talent} />}
        value={`${formatPercentage(totalFolsAndHlsOnBeacon / totalFolsAndHls)} %`}
        label="FoL/HL cast on beacon"
        tooltip={`The amount of Flash of Lights and Holy Lights cast on beacon targets. You cast ${beaconFlashOfLights} Flash of Lights and ${beaconHolyLights} Holy Lights on beacon targets.<br /><br />
            Your total heals on beacons was <b>${formatPercentage(totalHealsOnBeaconPercentage)}%</b> (this includes spell other than FoL and HL).`}
      />
);
}
  statisticOrder = STATISTIC_ORDER.CORE(50);
}

export default BeaconHealing;
