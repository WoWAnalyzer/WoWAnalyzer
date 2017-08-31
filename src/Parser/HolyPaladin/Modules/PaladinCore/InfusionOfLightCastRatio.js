import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import ManaValues from 'Parser/Core/Modules/ManaValues';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import PaladinAbilityTracker from './PaladinAbilityTracker';

class InfusionOfLightCastRatio extends Module {
  static dependencies = {
    abilityTracker: PaladinAbilityTracker,
    manaValues: ManaValues,
  };

  suggestions(when) {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIols = iolFlashOfLights + iolHolyLights;

    const iolFoLToHLCastRatio = iolFlashOfLights / totalIols;

    when(iolFoLToHLCastRatio).isLessThan(0.7)
      .addSuggestion((suggest, actual, recommended) => {
        const isLowMana = this.manaValues.lowestMana < (SPELLS.FLASH_OF_LIGHT.manaCost * 2);

        let extraSuggestion = null;
        if (isLowMana) {
          extraSuggestion = 'During this fight your mana got very low which makes being mana efficient even more important. With Infusion of Light your Flash of Light does more Healing Per Mana than Holy Light, so especially when you\'re short on mana you should focus on casting FoL instead of HL when it wouldn\'t overheal.';
        }

        return suggest(<span>Your <i>IoL FoL to HL cast ratio</i> can likely be improved. When you get an <SpellLink id={SPELLS.INFUSION_OF_LIGHT.id} /> proc try to cast <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} /> when it wouldn't overheal as it is more efficient. {extraSuggestion}</span>)
          .icon(SPELLS.INFUSION_OF_LIGHT.icon)
          .actual(`${iolFlashOfLights} Flash of Lights (${formatPercentage(iolFoLToHLCastRatio)}%) to ${iolHolyLights} Holy Lights (${formatPercentage(1 - iolFoLToHLCastRatio)}%) cast with Infusion of Light`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.3);
      });
  }
  statistic() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;
    const totalIols = iolFlashOfLights + iolHolyLights;

    const iolFoLToHLCastRatio = iolFlashOfLights / totalIols;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INFUSION_OF_LIGHT.id} />}
        value={`${formatPercentage(iolFoLToHLCastRatio)} %`}
        label="IoL FoL to HL cast ratio"
        tooltip={`The Infusion of Light Flash of Light to Infusion of Light Holy Light usage ratio is how many Flash of Lights you cast compared to Holy Lights during the Infusion of Light proc. You cast ${iolFlashOfLights} Flash of Lights and ${iolHolyLights} Holy Lights during Infusion of Light.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(40);
}

export default InfusionOfLightCastRatio;
