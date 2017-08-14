import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class FilledCastRatio extends Module {
  statistic() {
    const abilityTracker = this.owner.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const flashOfLight = getAbility(SPELLS.FLASH_OF_LIGHT.id);
    const holyLight = getAbility(SPELLS.HOLY_LIGHT.id);

    const iolFlashOfLights = flashOfLight.healingIolHits || 0;
    const iolHolyLights = holyLight.healingIolHits || 0;

    const flashOfLightHeals = flashOfLight.casts || 0;
    const holyLightHeals = holyLight.casts || 0;
    const fillerFlashOfLights = flashOfLightHeals - iolFlashOfLights;
    const fillerHolyLights = holyLightHeals - iolHolyLights;
    const totalFillers = fillerFlashOfLights + fillerHolyLights;
    const fillerCastRatio = fillerFlashOfLights / totalFillers;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLASH_OF_LIGHT.id} />}
        value={`${formatPercentage(fillerCastRatio)} %`}
        label="Filler cast ratio"
        tooltip={`The ratio at which you cast Flash of Lights versus Holy Lights. You cast ${fillerFlashOfLights} filler Flash of Lights and ${fillerHolyLights} filler Holy Lights.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(42);
}

export default FilledCastRatio;
